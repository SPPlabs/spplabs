import { NextRequest } from "next/server";
import { prisma, withRLS } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/crypto";
import { retrieveContext, buildContext, generateChatCompletion, ragPromptTemplate } from "@/core/services/ai";
import { logger } from "@/core/logger";

const corsHeadersDefault = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

/**
 * Standard Next Response JSON Helper.
 */
function jsonResponse(data: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeadersDefault,
      ...headers,
    },
  });
}

/**
 * Regular expression to quickly validate UUID string syntax.
 */
function isValidUuid(val: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val);
}

/**
 * Persists and updates the monthly AI token usage aggregation in PostgreSQL.
 * Aggregates all completions in a single row per website/client/month.
 */
import { clickhouseInsert } from "@/lib/clickhouse";

async function saveTokenUsage(
  websiteId: string,
  domain: string,
  promptTokens: number,
  completionTokens: number
): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed month
  const totalTokens = promptTokens + completionTokens;

  try {
    const db = withRLS(websiteId);
    await db.aiUsageMonthly.upsert({
      where: {
        websiteId_year_month: {
          websiteId,
          year,
          month,
        },
      },
      update: {
        promptTokens: { increment: BigInt(promptTokens) },
        completionTokens: { increment: BigInt(completionTokens) },
        totalTokens: { increment: BigInt(totalTokens) },
      },
      create: {
        websiteId,
        year,
        month,
        promptTokens: BigInt(promptTokens),
        completionTokens: BigInt(completionTokens),
        totalTokens: BigInt(totalTokens),
      },
    });

    // Also record event to ClickHouse for timeframe queries
    await clickhouseInsert("analytics_events", [{
      website_id: domain,
      event_time: now.toISOString().replace("T", " ").replace("Z", ""),
      visitor_id: globalThis.crypto ? globalThis.crypto.randomUUID() : require("crypto").randomUUID(),
      session_id: globalThis.crypto ? globalThis.crypto.randomUUID() : require("crypto").randomUUID(),
      event_type: "ai_chat_token",
      page_url: "/api/chat",
      page_title: "RAG Chatbot Execution",
      referrer: "Internal AI Engine",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_term: "",
      utm_content: "",
      country: "System",
      region: "Internal",
      city: "Server",
      device_type: "API",
      browser: "Node",
      os: "Server",
      screen_width: promptTokens,
      screen_height: completionTokens,
      duration_ms: promptTokens,
      scroll_percent: completionTokens,
      button_name: "chat_completion",
      form_name: "rag_chatbot",
      booking_id: "",
      conversion: totalTokens,
      ip_hash: "system_ai_execution",
    }]).catch(err => logger.error("ClickHouse ai_chat_token insert warning:", err));

  } catch (error) {
    logger.error(`Failed to update AiUsageMonthly for websiteId: ${websiteId}`, error);
  }
}

/**
 * Handles CORS Preflight OPTIONS requests.
 */
export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = { ...corsHeadersDefault };

  if (origin) {
    // In preflight, we echo the origin if it matches the request format
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return new Response(null, {
    status: 204,
    headers,
  });
}

/**
 * Handles incoming Chatbot completions.
 * Enforces API key verification, multi-tenant isolation, RAG context injection, and streaming outputs.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const startTime = Date.now();
  
  // CORS Origin Extraction
  const origin = request.headers.get("origin");
  let corsHeaders: Record<string, string> = {};

  // 1. Parse JSON Payload
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400, corsHeaders);
  }

  const { website_id: clientWebsiteId, message } = body;

  // 2. Validate Inputs
  if (!clientWebsiteId || typeof clientWebsiteId !== "string" || clientWebsiteId.trim() === "") {
    return jsonResponse({ error: "Bad Request", message: "website_id is required in the body." }, 400, corsHeaders);
  }

  if (!message || typeof message !== "string" || message.trim() === "") {
    return jsonResponse({ error: "Bad Request", message: "message is required in the body." }, 400, corsHeaders);
  }

  // 3. Validate and Extract Bearer API Key from Authorization Header
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized", message: "API key is required in Authorization header." }, 401, corsHeaders);
  }

  const apiKey = authHeader.substring(7).trim();
  if (!apiKey) {
    return jsonResponse({ error: "Unauthorized", message: "API key is required in Authorization header." }, 401, corsHeaders);
  }

  try {
    // 4. Look up Website by Domain (or UUID if provided)
    const targetDomain = clientWebsiteId.trim().toLowerCase();
    const website = await prisma.website.findFirst({
      where: {
        OR: [
          { domain: targetDomain },
          { id: isValidUuid(targetDomain) ? targetDomain : undefined },
        ],
      },
      include: {
        apiKeys: true,
      },
    });

    if (!website) {
      return jsonResponse({ error: "Not Found", message: "website/account not found." }, 404, corsHeaders);
    }

    // 5. Verify the API Key against the retrieved website's keys
    let isAuthenticated = false;
    let authenticatedKeyRecord: any = null;

    for (const keyRecord of website.apiKeys) {
      // Skip expired keys
      if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
        continue;
      }

      const isMatch = await verifyApiKey(apiKey, keyRecord.keyHash);
      if (isMatch) {
        isAuthenticated = true;
        authenticatedKeyRecord = keyRecord;
        break;
      }
    }

    // 6. If authentication fails, reject immediately to prevent DoS/timing attacks.
    if (!isAuthenticated) {
      return jsonResponse({ error: "Unauthorized", message: "invalid API key." }, 401, corsHeaders);
    }

    // Update API Key lastUsedAt asynchronously
    const db = withRLS(website.id);
    db.websiteApiKey
      .update({
        where: { id: authenticatedKeyRecord.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((e: unknown) => logger.error("Failed to update API key lastUsedAt:", e));

    // 7. CORS origin checks (after verification of the credentials)
    if (origin) {
      let isOriginAllowed = false;
      try {
        const originUrl = new URL(origin);
        const originHostname = originUrl.hostname.toLowerCase();
        const websiteDomain = website.domain.toLowerCase();

        if (
          originHostname === websiteDomain ||
          originHostname === `www.${websiteDomain}` ||
          (process.env.NODE_ENV === "development" && originHostname === "localhost")
        ) {
          isOriginAllowed = true;
        }
      } catch {
        // Invalid origin
      }

      if (!isOriginAllowed) {
        return jsonResponse({ error: "Forbidden", message: "CORS origin not allowed." }, 403, corsHeaders);
      }

      corsHeaders = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      };
    }


    // TODO: [Future Rate Limiting Insertion Point]
    // Insert rate limiting execution here utilizing the authenticated website.id.
    // Order: Authentication -> Rate Limiting -> RAG Retrieval -> LLM Generation -> Token Tracking.
    // 8. RAG context retrieval (strictly isolated by the validated website.id)
    const rawContexts = await retrieveContext(website.id, message);
    const context = buildContext(rawContexts);

    // Record Visitor Message into PostgreSQL using withRLS
    let conversationId = body.conversation_id || body.conversationId;
    const visitorId = body.visitor_id || body.visitorId || "visitor_" + Date.now();
    const rlsDb = withRLS(website.id);

    let activeConversation = null;
    if (conversationId && isValidUuid(conversationId)) {
      try {
        activeConversation = await rlsDb.chatConversation.findUnique({
          where: { id: conversationId },
        });
      } catch (e) {
        logger.warn("Conversation lookup warning:", e);
      }
    }

    if (!activeConversation) {
      try {
        activeConversation = await rlsDb.chatConversation.create({
          data: {
            websiteId: website.id,
            visitorId: visitorId,
            visitorName: body.visitor_name || body.visitorName || null,
            visitorEmail: body.visitor_email || body.visitorEmail || null,
            status: "ACTIVE",
          },
        });
        conversationId = activeConversation.id;
      } catch (e) {
        logger.error("Failed to create ChatConversation:", e);
      }
    }

    if (activeConversation) {
      try {
        await rlsDb.chatMessage.create({
          data: {
            conversationId: activeConversation.id,
            sender: "VISITOR",
            content: message.trim(),
            tokens: 0,
          },
        });
      } catch (e) {
        logger.error("Failed to save VISITOR message:", e);
      }
    }

    // 9. Prompt formatting
    const formattedPrompt = await ragPromptTemplate.formatMessages({
      context,
      history: [], // No history support in this phase
      question: message,
    });

    const messages = formattedPrompt.map((m) => {
      const type = m.getType();
      let role: "system" | "user" | "assistant" = "user";
      if (type === "system") {
        role = "system";
      } else if (type === "ai") {
        role = "assistant";
      }
      return {
        role,
        content: m.content as string,
      };
    });

    // 10. Streaming LLM generation
    const stream = await generateChatCompletion({
      messages,
      stream: true,
      temperature: 0.2,
    });

    // 11. Stream Response construction
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullCompletionText = "";
        let promptTokens = 0;
        let completionTokens = 0;
        let usageSource: "vllm" | "estimated" = "vllm";

        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullCompletionText += text;
              controller.enqueue(encoder.encode(text));
            }

            // Capture usage stats if returned in chunks
            if (chunk.usage) {
              promptTokens = chunk.usage.prompt_tokens;
              completionTokens = chunk.usage.completion_tokens;
              usageSource = "vllm";
            }
          }
        } catch (streamError) {
          logger.error("Error processing completion stream chunks:", streamError);
        } finally {
          try {
            // Fallback token counter if usage statistics were not returned (e.g. stream aborted or vLLM omitted them)
            if (promptTokens === 0) {
              try {
                const { getEncoding } = await import("js-tiktoken");
                const encoding = getEncoding("cl100k_base");

                // Estimate input (prompt) tokens
                let estimatedInput = 0;
                for (const msg of messages) {
                  estimatedInput += encoding.encode(msg.content).length + 4;
                }
                estimatedInput += 3; // conversation overhead

                // Estimate output (response) tokens
                const estimatedOutput = encoding.encode(fullCompletionText).length;

                promptTokens = estimatedInput;
                completionTokens = estimatedOutput;
                usageSource = "estimated";
              } catch (estimateError) {
                logger.error("Token estimation fallback failed:", estimateError);
                // Safe non-zero fallback values to prevent crashes and ensure database metrics collection
                promptTokens = 1;
                completionTokens = 1;
                usageSource = "estimated";
              }
            }

            // Persist AI Response Message in ChatConversation
            if (activeConversation && fullCompletionText.trim()) {
              await rlsDb.chatMessage.create({
                data: {
                  conversationId: activeConversation.id,
                  sender: "BOT",
                  content: fullCompletionText.trim(),
                  tokens: promptTokens + completionTokens,
                },
              }).catch((e: unknown) => logger.error("Failed to save BOT message:", e));

              await rlsDb.chatConversation.update({
                where: { id: activeConversation.id },
                data: { lastMessageAt: new Date() },
              }).catch((e: unknown) => logger.error("Failed to update lastMessageAt:", e));
            }

            // Persist token usage in monthly aggregate database & ClickHouse
            await saveTokenUsage(website.id, website.domain, promptTokens, completionTokens);

            const duration = Date.now() - startTime;
            logger.info(`Chat endpoint success for websiteId: ${website.id} (prompt_tokens: ${promptTokens}, completion_tokens: ${completionTokens}, source: ${usageSource}, duration: ${duration}ms)`);
          } catch (usageError) {
            logger.error("Failed to estimate or save token usage stats in finally block:", usageError);
          }

          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        ...corsHeaders,
      },
    });

  } catch (error) {
    logger.error("Chat endpoint error:", error);
    return jsonResponse({ error: "Internal Server Error", message: "Failed to process chat request." }, 500, corsHeaders);
  }
}
