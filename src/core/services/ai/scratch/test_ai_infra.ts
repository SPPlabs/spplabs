import { config, validateConfig } from "../../../config";
import { splitText } from "../chunker";
import { embeddings, BgeM3Embeddings } from "../embeddings";
import * as qdrant from "../qdrant";
import { generateChatCompletion } from "../llm";
import { logger } from "@/core/logger";

async function runTests() {
  logger.info("=== STARTING AI INFRASTRUCTURE MANUAL VERIFICATION ===");

  // 1. Config Validation
  try {
    logger.info("1. Verifying configuration variables...");
    validateConfig();
    logger.info("Configuration is valid.");
    logger.info(`Collection name: ${config.ai.collectionName}`);
    logger.info(`Embedding model: ${config.ai.embeddingModel}`);
  } catch (error: any) {
    logger.error("Configuration validation failed:", error.message);
    process.exit(1);
  }

  // 2. Chunking
  let chunks: string[] = [];
  try {
    logger.info("2. Verifying chunking...");
    const dummyText = `This is a sample document that will be used to test our token-based chunker. `.repeat(30);
    chunks = await splitText(dummyText, 50, 10);
    logger.info(`Chunking successful. Text split into ${chunks.length} chunks.`);
    if (chunks.length === 0) {
      throw new Error("Split text resulted in 0 chunks");
    }
  } catch (error: any) {
    logger.error("Chunking verification failed:", error);
    process.exit(1);
  }

  // 3. Lazy Embedding Loading Verification
  let dummyVector: number[] = [];
  try {
    logger.info("3. Verifying lazy embedding loading...");
    const embedsInstance = embeddings as BgeM3Embeddings;
    
    // Using reflection to inspect the private extractor state for testing purposes
    const initialExtractor = (embedsInstance as any).extractor;
    logger.info(`Initial state: extractor is loaded = ${initialExtractor !== null}`);
    if (initialExtractor !== null) {
      throw new Error("Embedding model was loaded prematurely (not lazy).");
    }

    logger.info("Executing first embedding query...");
    dummyVector = await embeddings.embedQuery("Test query for lazy loading.");
    
    const postCallExtractor = (embedsInstance as any).extractor;
    logger.info(`Post-call state: extractor is loaded = ${postCallExtractor !== null}`);
    if (postCallExtractor === null) {
      throw new Error("Embedding model failed to initialize on first query.");
    }
    logger.info(`Embedding generation successful. Vector dimensions: ${dummyVector.length}`);
  } catch (error: any) {
    logger.error("Lazy embedding loading verification failed:", error);
    process.exit(1);
  }

  // 4. Qdrant CRUD
  const testWebsiteId = "00000000-0000-0000-0000-000000000000";
  try {
    logger.info("4. Verifying Qdrant CRUD operations...");
    
    // Ensure collection exists
    await qdrant.createCollectionIfNeeded();

    // Prepare point
    const testPointId = "11111111-1111-1111-1111-111111111111";
    const testChunks = [
      {
        id: testPointId,
        vector: dummyVector,
        content: "This is a test vector payload content stored in Qdrant.",
      },
    ];

    // Delete pre-existing vectors if any
    await qdrant.deleteWebsiteVectors(testWebsiteId);

    // Upsert
    logger.info("Upserting test vector...");
    await qdrant.upsertVectors(testWebsiteId, testChunks);

    // Search
    logger.info("Searching for test vector...");
    const searchResults = await qdrant.searchVectors(testWebsiteId, dummyVector, 1);
    logger.info(`Search returned ${searchResults.length} matches.`);
    if (searchResults.length === 0) {
      throw new Error("Could not find upserted test vector during search.");
    }
    logger.info("Search verify complete.");

    // Clean up
    logger.info("Cleaning up test vector...");
    await qdrant.deleteWebsiteVectors(testWebsiteId);
    
    const verifySearchAfterDelete = await qdrant.searchVectors(testWebsiteId, dummyVector, 1);
    if (verifySearchAfterDelete.length > 0) {
      throw new Error("Vector was not successfully deleted.");
    }
    logger.info("Qdrant CRUD verify successful.");
  } catch (error: any) {
    logger.error("Qdrant CRUD verification failed:", error);
    process.exit(1);
  }

  // 5. vLLM connection
  try {
    logger.info("5. Verifying vLLM Chat Completion...");
    const chatResponse = await generateChatCompletion({
      messages: [{ role: "user", content: "Say 'Success'" }],
      temperature: 0.1,
    });
    logger.info("vLLM connection successful.");
    logger.info(`Received completion response length: ${chatResponse.choices[0].message.content?.length || 0}`);
  } catch (error: any) {
    logger.error("vLLM connection verification failed:", error);
    process.exit(1);
  }

  logger.info("=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY ===");
}

runTests().catch((err) => {
  logger.error("Execution failed:", err);
  process.exit(1);
});
