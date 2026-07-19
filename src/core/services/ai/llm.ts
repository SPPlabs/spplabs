import { OpenAI } from "openai";
import { aiConfig } from "./config";
import { logger } from "@/core/logger";

let openAIClientInstance: OpenAI | null = null;

/**
 * Lazily retrieves the singleton OpenAI SDK client targeting the vLLM server.
 */
function getOpenAIClient(): OpenAI {
  if (!openAIClientInstance) {
    logger.info(`Connecting OpenAI SDK client to vLLM server at: ${aiConfig.vllmUrl}`);
    openAIClientInstance = new OpenAI({
      apiKey: "EMPTY", // vLLM typically doesn't require a real API key
      baseURL: aiConfig.vllmUrl,
    });
  }
  return openAIClientInstance;
}

/**
 * Overload signature when streaming is explicitly enabled.
 */
export async function generateChatCompletion(
  params: Omit<OpenAI.Chat.ChatCompletionCreateParams, "model"> & { model?: string; stream: true }
): Promise<AsyncIterable<OpenAI.Chat.ChatCompletionChunk>>;

/**
 * Overload signature when streaming is disabled or omitted.
 */
export async function generateChatCompletion(
  params: Omit<OpenAI.Chat.ChatCompletionCreateParams, "model"> & { model?: string; stream?: false }
): Promise<OpenAI.Chat.ChatCompletion>;

/**
 * Overload signature covering both cases.
 */
export async function generateChatCompletion(
  params: Omit<OpenAI.Chat.ChatCompletionCreateParams, "model"> & { model?: string; stream?: boolean }
): Promise<OpenAI.Chat.ChatCompletion | AsyncIterable<OpenAI.Chat.ChatCompletionChunk>>;

export async function generateChatCompletion(
  params: Omit<OpenAI.Chat.ChatCompletionCreateParams, "model"> & { model?: string; stream?: boolean }
): Promise<OpenAI.Chat.ChatCompletion | AsyncIterable<OpenAI.Chat.ChatCompletionChunk>> {
  const client = getOpenAIClient();

  // Cast body to any to enable passing custom properties that vLLM/Qwen expects
  // while satisfying strict TypeScript static type checks.
  const body: any = {
    ...params,
    model: params.model || aiConfig.vllmModel,
    chat_template_kwargs: {
      enable_thinking: false,
    },
    include_reasoning: false,
  };

  try {
    logger.info(`Sending chat completion request (stream: ${!!params.stream})`);
    return await client.chat.completions.create(body);
  } catch (error) {
    logger.error("Failed to generate chat completion from vLLM:", error);
    throw error;
  }
}
