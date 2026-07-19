import { splitText } from "./chunker";
import { embeddings } from "./embeddings";
import { deleteWebsiteVectors, upsertVectors } from "./qdrant";
import { logger } from "@/core/logger";

/**
 * Synchronizes website knowledge text into vector embeddings stored in Qdrant.
 * Implements a safe replacement strategy to ensure existing vectors remain
 * active if new embedding generation or validation fails.
 *
 * PostgreSQL remains the single source of truth; Qdrant is only a retrieval index.
 * Payload stored in Qdrant contains strictly: { website_id, content }.
 */
export async function syncWebsiteKnowledge(
  websiteId: string,
  content: string
): Promise<void> {
  const startTime = Date.now();

  // STEP 1: Validate websiteId
  if (!websiteId || websiteId.trim() === "") {
    throw new Error("syncWebsiteKnowledge failed: websiteId is required.");
  }

  const cleanWebsiteId = websiteId.trim();

  // STEP 1 (continued): Validate empty/whitespace content behavior
  if (!content || content.trim() === "") {
    logger.info(`syncWebsiteKnowledge: Empty content received for websiteId: ${cleanWebsiteId}. Clearing existing vector index.`);
    try {
      await deleteWebsiteVectors(cleanWebsiteId);
      const duration = Date.now() - startTime;
      logger.info(`syncWebsiteKnowledge clear success for websiteId: ${cleanWebsiteId} (duration: ${duration}ms)`);
      return;
    } catch (error) {
      logger.error(`syncWebsiteKnowledge clear failure for websiteId: ${cleanWebsiteId}`, error);
      throw error;
    }
  }

  try {
    logger.info(`syncWebsiteKnowledge start for websiteId: ${cleanWebsiteId}`);

    // STEP 2: Generate all chunks
    const chunks = await splitText(content);
    const numChunks = chunks.length;
    logger.info(`syncWebsiteKnowledge: Generated ${numChunks} chunks for websiteId: ${cleanWebsiteId}`);

    if (numChunks === 0) {
      // Clean up index if no chunks are produced
      await deleteWebsiteVectors(cleanWebsiteId);
      const duration = Date.now() - startTime;
      logger.info(`syncWebsiteKnowledge success (0 chunks parsed) for websiteId: ${cleanWebsiteId} (duration: ${duration}ms)`);
      return;
    }

    // STEP 3: Generate all embeddings in memory (using the singleton embeddings wrapper)
    logger.info(`syncWebsiteKnowledge: Computing embeddings for ${numChunks} chunks...`);
    const embeddingVectors = await embeddings.embedDocuments(chunks);

    if (embeddingVectors.length !== numChunks) {
      throw new Error(`Embedding count mismatch: generated ${embeddingVectors.length} vectors for ${numChunks} chunks.`);
    }

    // Prepare point structures in memory
    const vectors = chunks.map((chunk, index) => {
      const id = globalThis.crypto ? globalThis.crypto.randomUUID() : require("crypto").randomUUID();
      return {
        id,
        vector: embeddingVectors[index],
        content: chunk,
      };
    });

    // STEP 4: Only after successful generation, delete existing vectors
    logger.info(`syncWebsiteKnowledge: Deleting existing vectors for websiteId: ${cleanWebsiteId}`);
    await deleteWebsiteVectors(cleanWebsiteId);

    // STEP 5: Upsert new vectors
    logger.info(`syncWebsiteKnowledge: Upserting ${numChunks} new vectors for websiteId: ${cleanWebsiteId}`);
    await upsertVectors(cleanWebsiteId, vectors);

    const duration = Date.now() - startTime;
    logger.info(`syncWebsiteKnowledge success for websiteId: ${cleanWebsiteId} (chunks: ${numChunks}, duration: ${duration}ms)`);
  } catch (error) {
    logger.error(`syncWebsiteKnowledge failure for websiteId: ${cleanWebsiteId}`, error);
    throw error;
  }
}
