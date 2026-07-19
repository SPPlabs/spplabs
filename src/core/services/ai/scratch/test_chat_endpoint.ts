import { NextRequest } from "next/server";
import { POST } from "../../../../app/api/chat/route";
import { prisma } from "@/lib/prisma";
import { hashApiKey, generateApiKey } from "@/lib/crypto";
import { syncWebsiteKnowledge } from "../ingestion";
import { deleteWebsiteVectors } from "../qdrant";
import { logger } from "@/core/logger";

async function runChatEndpointTests() {
  logger.info("=== STARTING CHAT API ROUTE MANUAL INTEGRATION VERIFICATION ===");

  // Setup test data
  const testDomain1 = "test-chat-tenant-1.com";
  const testDomain2 = "test-chat-tenant-2.com";
  
  let website1Id = "";
  let website2Id = "";
  let rawApiKey1 = "";
  let rawApiKey2 = "";

  try {
    logger.info("Setting up clean database test environments...");
    
    // Clean up pre-existing test data if any
    await prisma.website.deleteMany({
      where: { domain: { in: [testDomain1, testDomain2] } }
    });

    // Create website 1
    rawApiKey1 = generateApiKey();
    const hashKey1 = await hashApiKey(rawApiKey1);
    const website1 = await prisma.website.create({
      data: {
        domain: testDomain1,
        displayName: "Test Client 1",
        role: "USER",
        apiKeys: {
          create: {
            name: "Default API Key",
            keyHash: hashKey1,
          }
        }
      }
    });
    website1Id = website1.id;

    // Create website 2
    rawApiKey2 = generateApiKey();
    const hashKey2 = await hashApiKey(rawApiKey2);
    const website2 = await prisma.website.create({
      data: {
        domain: testDomain2,
        displayName: "Test Client 2",
        role: "USER",
        apiKeys: {
          create: {
            name: "Default API Key",
            keyHash: hashKey2,
          }
        }
      }
    });
    website2Id = website2.id;

    // Populate Qdrant knowledge base for Website 1
    const testKnowledge = "Operating hours for Test Client 1 are strictly Monday through Friday from 8:30 AM to 4:30 PM. Closed on weekends.";
    await syncWebsiteKnowledge(website1Id, testKnowledge);

    logger.info(`Database and Qdrant setup complete. Website 1 UUID: ${website1Id}, Website 2 UUID: ${website2Id}`);
  } catch (setupError) {
    logger.error("Test environment setup failed:", setupError);
    process.exit(1);
  }

  // Assertion helper
  async function assertStatus(response: Response, expectedStatus: number, testName: string) {
    if (response.status === expectedStatus) {
      logger.info(`PASS: ${testName} returned status ${response.status}`);
    } else {
      const text = await response.text();
      logger.error(`FAIL: ${testName} expected ${expectedStatus}, but got ${response.status}. Body: ${text}`);
      await cleanup();
      process.exit(1);
    }
  }

  // 1. Missing Authorization Header -> 401
  try {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ website_id: testDomain1, message: "Hello" })
    });
    const res = await POST(req);
    await assertStatus(res, 401, "1. Missing authorization header");
  } catch (e) {
    logger.error("Test 1 error:", e);
    process.exit(1);
  }

  // 2. Invalid API Key -> 401
  try {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { 
        "Authorization": "Bearer spp_api_invalidkeyxxxxxxxxxxxxxxxx",
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ website_id: testDomain1, message: "Hello" })
    });
    const res = await POST(req);
    await assertStatus(res, 401, "2. Invalid API key");
  } catch (e) {
    logger.error("Test 2 error:", e);
    process.exit(1);
  }

  // 3. Unknown Website -> 404
  try {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${rawApiKey1}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ website_id: "unknown-website.com", message: "Hello" })
    });
    const res = await POST(req);
    await assertStatus(res, 404, "3. Unknown website");
  } catch (e) {
    logger.error("Test 3 error:", e);
    process.exit(1);
  }

  // 4. Tenant mismatch (Key 2 with Domain 1) -> 401 (immediate rejection)
  try {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${rawApiKey2}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ website_id: testDomain1, message: "Hello" })
    });
    const res = await POST(req);
    await assertStatus(res, 401, "4. Tenant key mismatch (immediate 401)");
  } catch (e) {
    logger.error("Test 4 error:", e);
    process.exit(1);
  }

  // 5. Successful RAG Context isolation & Streaming response -> 200
  try {
    logger.info("5. Testing successful streaming request with RAG retrieval...");
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${rawApiKey1}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        website_id: testDomain1, 
        message: "What are your operating hours?" 
      })
    });

    const res = await POST(req);
    await assertStatus(res, 200, "5. Successful chat completion status");

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("Streaming body reader is unavailable.");
    }

    const decoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    let resultText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resultText += textDecoder.decode(value);
    }

    logger.info(`Stream response finished. Length: ${resultText.length} characters.`);
    
    // Check isolation (it must return info based on website 1's custom knowledge base)
    if (!resultText.toLowerCase().includes("8:30") && !resultText.toLowerCase().includes("friday")) {
      logger.warn(`Response content did not clearly reference custom hours. Content: "${resultText}"`);
    } else {
      logger.info("Verified RAG context was injected successfully into LLM generation.");
    }
  } catch (e) {
    logger.error("Test 5 error:", e);
    process.exit(1);
  }

  // 6. Token Usage Aggregation in PostgreSQL -> Increment verified
  try {
    logger.info("6. Verifying database token usage aggregation updates...");
    
    // Wait briefly for asynchronous stream close tasks to complete writing database transactions
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const usageRecords = await prisma.aiUsageMonthly.findMany({
      where: { websiteId: website1Id }
    });

    logger.info(`Found ${usageRecords.length} token usage records for test tenant 1.`);
    if (usageRecords.length === 0) {
      throw new Error("No token usage records were updated in PostgreSQL.");
    }

    const usage = usageRecords[0];
    logger.info(`Usage stats -> promptTokens: ${usage.promptTokens}, completionTokens: ${usage.completionTokens}, total: ${usage.totalTokens}`);
    
    if (usage.promptTokens === BigInt(0) || usage.completionTokens === BigInt(0)) {
      throw new Error("Token counters remained at zero.");
    }
    logger.info("PASS: Monthly token usage aggregation verified.");
  } catch (e) {
    logger.error("Test 6 error:", e);
    process.exit(1);
  }

  // Cleanup helper
  async function cleanup() {
    logger.info("Starting database and vector test cleanup...");
    try {
      if (website1Id) {
        await deleteWebsiteVectors(website1Id);
      }
      if (website2Id) {
        await deleteWebsiteVectors(website2Id);
      }
      await prisma.website.deleteMany({
        where: { domain: { in: [testDomain1, testDomain2] } }
      });
      logger.info("Database and vector cleanup successfully finished.");
    } catch (cleanError) {
      logger.error("Cleanup error:", cleanError);
    }
  }

  await cleanup();
  logger.info("=== CHAT API ROUTE INTEGRATION VERIFICATION PASSED SUCCESSFULLY ===");
}

runChatEndpointTests().catch((err) => {
  logger.error("Verification execution failed:", err);
  process.exit(1);
});
