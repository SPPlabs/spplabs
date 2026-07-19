import { syncWebsiteKnowledge } from "../ingestion";
import { searchVectors, createCollectionIfNeeded, deleteWebsiteVectors } from "../qdrant";
import { embeddings } from "../embeddings";
import { logger } from "@/core/logger";

async function runIngestionTests() {
  logger.info("=== STARTING KNOWLEDGE INGESTION PIPELINE MANUAL VERIFICATION ===");

  const testWebsiteId = "99999999-9999-9999-9999-999999999999";
  
  // 0. Setup Qdrant collection
  try {
    await createCollectionIfNeeded();
    // Clear out any pre-existing vectors for safety
    await deleteWebsiteVectors(testWebsiteId);
  } catch (error) {
    logger.error("Test setup failed:", error);
    process.exit(1);
  }

  // 1. First Sync: "old knowledge"
  try {
    logger.info("1. Syncing initial 'old knowledge' content...");
    const oldContent = "Old knowledge text: Our company offers high-quality React web applications. Support hours are Monday to Friday, 9:00 AM to 5:00 PM.";
    
    await syncWebsiteKnowledge(testWebsiteId, oldContent);
    logger.info("First sync completed.");
  } catch (error) {
    logger.error("First sync failed:", error);
    process.exit(1);
  }

  // 2. Confirm Vectors Exist
  let initialSearchVector: number[];
  try {
    logger.info("2. Verifying initial vectors exist in Qdrant...");
    initialSearchVector = await embeddings.embedQuery("What are the support hours?");
    
    const results = await searchVectors(testWebsiteId, initialSearchVector, 3);
    logger.info(`Initial verification search returned ${results.length} matches.`);
    if (results.length === 0) {
      throw new Error("No vectors found after initial knowledge sync.");
    }
    
    const matchedContent = results.map(r => r.content).join(" ");
    logger.info("Initial matches verified successfully.");
    if (!matchedContent.includes("Monday to Friday")) {
      throw new Error("Vector matches did not contain expected content: 'Monday to Friday'.");
    }
  } catch (error) {
    logger.error("Initial vector verification failed:", error);
    process.exit(1);
  }

  // 3. Second Sync: "new knowledge"
  try {
    logger.info("3. Syncing updated 'new knowledge' content...");
    const newContent = "New knowledge text: We design NextJS systems and chatbots. Support hours are now 24/7 through AI assistants.";
    
    await syncWebsiteKnowledge(testWebsiteId, newContent);
    logger.info("Second sync completed.");
  } catch (error) {
    logger.error("Second sync failed:", error);
    process.exit(1);
  }

  // 4. Confirm Old Deleted and New Exist
  try {
    logger.info("4. Verifying old vectors are replaced by new vectors...");
    const results = await searchVectors(testWebsiteId, initialSearchVector, 3);
    logger.info(`Search after update returned ${results.length} matches.`);
    
    if (results.length === 0) {
      throw new Error("No vectors found after updated knowledge sync.");
    }

    const matchedContent = results.map(r => r.content).join(" ");
    logger.info("Content comparison verified successfully.");

    if (matchedContent.includes("Monday to Friday")) {
      throw new Error("Stale vector content detected! 'Monday to Friday' should have been deleted.");
    }
    if (!matchedContent.includes("24/7")) {
      throw new Error("Updated vector content missing! '24/7' not found.");
    }
    logger.info("Safe replacement verify complete.");
  } catch (error) {
    logger.error("Updated vector verification failed:", error);
    process.exit(1);
  }

  // 5. Test Empty Content Sync
  try {
    logger.info("5. Testing empty content sync (clear knowledge base)...");
    await syncWebsiteKnowledge(testWebsiteId, "");
    logger.info("Empty sync completed.");

    const results = await searchVectors(testWebsiteId, initialSearchVector, 3);
    logger.info(`Search after clear sync returned ${results.length} matches.`);
    if (results.length > 0) {
      throw new Error("Vector clear failed: vectors still exist for websiteId.");
    }
    logger.info("Empty content clearing verify complete.");
  } catch (error) {
    logger.error("Empty content sync verification failed:", error);
    process.exit(1);
  }

  // 6. Cleanup
  try {
    logger.info("6. Cleaning up Qdrant database test data...");
    await deleteWebsiteVectors(testWebsiteId);
    logger.info("Cleanup complete.");
  } catch (error) {
    logger.error("Test cleanup failed:", error);
    process.exit(1);
  }

  logger.info("=== KNOWLEDGE INGESTION PIPELINE VERIFICATION PASSED SUCCESSFULLY ===");
}

runIngestionTests().catch((err) => {
  logger.error("Test execution failed:", err);
  process.exit(1);
});
