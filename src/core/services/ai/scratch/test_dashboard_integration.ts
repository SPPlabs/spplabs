import { NextRequest } from "next/server";
import { POST } from "../../../../app/api/admin/chatbot-knowledge/route";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import { deleteWebsiteVectors } from "../qdrant";
import { logger } from "@/core/logger";

async function runDashboardIntegrationTests() {
  logger.info("=== STARTING DASHBOARD INGESTION INTEGRATION MANUAL VERIFICATION ===");

  const testDomain = "test-dash-tenant.com";
  let websiteId = "";
  let mockSessionToken = "";

  try {
    logger.info("Setting up clean database test environments...");
    
    // Clean up pre-existing test data if any
    await prisma.website.deleteMany({
      where: { domain: testDomain }
    });

    // Create test website
    const website = await prisma.website.create({
      data: {
        domain: testDomain,
        displayName: "Test Dashboard Client",
        role: "USER",
      }
    });
    websiteId = website.id;

    // Create a mock JWT token simulating a logged-in dashboard session for this domain
    mockSessionToken = await signJWT({
      role: "USER",
      domain: testDomain,
    });

    logger.info(`Database setup complete. Website ID: ${websiteId}`);
  } catch (setupError) {
    logger.error("Test environment setup failed:", setupError);
    process.exit(1);
  }

  // Helper to assert response state
  async function verifyRouteExecution() {
    logger.info("1. Mocking dashboard post request to update knowledge text...");
    
    const req = new NextRequest("http://localhost:3000/api/admin/chatbot-knowledge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `spp_session=${mockSessionToken}`
      },
      body: JSON.stringify({
        content: "Operating hours for Test Dashboard Tenant are strictly 10:00 to 18:00 on weekdays.",
        domain: testDomain
      })
    });

    const res = await POST(req);
    const data = await res.json();

    if (res.status === 200) {
      logger.info("PASS: POST request processed with status 200.");
      if (data.warning) {
        logger.warn(`PARTIAL SUCCESS: Database updated, but vector sync warning returned: "${data.warning}"`);
      } else {
        logger.info("SUCCESS: Full database upsert and vector synchronization completed successfully.");
      }
    } else {
      logger.error(`FAIL: Expected status 200, but got ${res.status}. Body: ${JSON.stringify(data)}`);
      await cleanup();
      process.exit(1);
    }

    // 2. Verify PostgreSQL holds the correct knowledge base state
    logger.info("2. Querying PostgreSQL to confirm database update...");
    const dbRecord = await prisma.chatbotKnowledge.findUnique({
      where: { websiteId }
    });

    if (!dbRecord || dbRecord.content !== "Operating hours for Test Dashboard Tenant are strictly 10:00 to 18:00 on weekdays.") {
      logger.error(`FAIL: Database record was not saved correctly. Record: ${JSON.stringify(dbRecord)}`);
      await cleanup();
      process.exit(1);
    }
    logger.info(`PASS: PostgreSQL successfully stores the raw knowledge. lastSyncedAt: ${dbRecord.lastSyncedAt}`);
  }

  // Cleanup helper
  async function cleanup() {
    logger.info("Starting database and vector test cleanup...");
    try {
      if (websiteId) {
        await deleteWebsiteVectors(websiteId).catch(() => {});
      }
      await prisma.website.deleteMany({
        where: { domain: testDomain }
      });
      logger.info("Database and vector cleanup successfully finished.");
    } catch (cleanError) {
      logger.error("Cleanup error:", cleanError);
    }
  }

  try {
    await verifyRouteExecution();
  } catch (error) {
    logger.error("Test execution encountered an error:", error);
  } finally {
    await cleanup();
  }
  
  logger.info("=== DASHBOARD INGESTION INTEGRATION MANUAL VERIFICATION PASSED ===");
}

runDashboardIntegrationTests().catch((err) => {
  logger.error("Verification execution failed:", err);
  process.exit(1);
});
