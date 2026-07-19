import { QdrantClient } from "@qdrant/js-client-rest";
import { aiConfig } from "./config";
import { logger } from "@/core/logger";

let qdrantClientInstance: QdrantClient | null = null;

/**
 * Retrieves the global singleton Qdrant client instance.
 */
export function getClient(): QdrantClient {
  if (!qdrantClientInstance) {
    logger.info(`Connecting to Qdrant at: ${aiConfig.qdrantUrl}`);
    qdrantClientInstance = new QdrantClient({
      url: aiConfig.qdrantUrl,
    });
  }
  return qdrantClientInstance;
}

/**
 * Verifies if the specified collection exists in Qdrant, creating it if it does not.
 * Metric: Cosine
 * Size: 1024 (BAAI/bge-m3 default dimension)
 */
export async function createCollectionIfNeeded(): Promise<void> {
  const client = getClient();
  const collectionName = aiConfig.collectionName;

  try {
    logger.info(`Checking if Qdrant collection "${collectionName}" exists...`);
    const collections = await client.getCollections();
    const exists = collections.collections.some((c) => c.name === collectionName);

    if (!exists) {
      logger.info(`Collection "${collectionName}" does not exist. Creating collection...`);
      await client.createCollection(collectionName, {
        vectors: {
          size: 1024,
          distance: "Cosine",
        },
      });
      logger.info(`Qdrant collection "${collectionName}" created successfully.`);
    } else {
      logger.info(`Qdrant collection "${collectionName}" already exists.`);
    }

    // Ensure payload index exists on website_id for optimal O(1) multi-tenant retrieval performance
    try {
      await client.createPayloadIndex(collectionName, {
        field_name: "website_id",
        field_schema: "keyword",
      });
      logger.info(`Payload index on "website_id" asserted successfully for collection "${collectionName}".`);
    } catch (indexError) {
      // Suppress error if the index already exists or is already being built
      logger.info(`Payload index check on website_id completed for collection "${collectionName}".`);
    }
  } catch (error) {
    logger.error(`Error verifying or creating collection "${collectionName}":`, error);
    throw error;
  }
}

/**
 * Deletes all vectors belonging to a specific website_id.
 */
export async function deleteWebsiteVectors(websiteId: string): Promise<void> {
  if (!websiteId || websiteId.trim() === "") {
    throw new Error("Cannot delete vectors: websiteId is required.");
  }

  const client = getClient();
  const collectionName = aiConfig.collectionName;

  try {
    logger.info(`Deleting Qdrant points for websiteId: ${websiteId}`);
    await client.delete(collectionName, {
      filter: {
        must: [
          {
            key: "website_id",
            match: { value: websiteId },
          },
        ],
      },
    });
    logger.info(`Successfully deleted Qdrant points for websiteId: ${websiteId}`);
  } catch (error) {
    logger.error(`Failed to delete Qdrant points for websiteId: ${websiteId}:`, error);
    throw error;
  }
}

/**
 * Upserts a set of vectors. Each vector contains only website_id and content in the payload.
 */
export async function upsertVectors(
  websiteId: string,
  chunks: { id: string; vector: number[]; content: string }[]
): Promise<void> {
  if (!websiteId || websiteId.trim() === "") {
    throw new Error("Cannot upsert vectors: websiteId is required.");
  }
  if (chunks.length === 0) return;

  const client = getClient();
  const collectionName = aiConfig.collectionName;

  try {
    logger.info(`Upserting ${chunks.length} vectors for websiteId: ${websiteId}`);
    const points = chunks.map((chunk) => ({
      id: chunk.id,
      vector: chunk.vector,
      payload: {
        website_id: websiteId,
        content: chunk.content,
      },
    }));

    await client.upsert(collectionName, {
      wait: true,
      points,
    });
    logger.info(`Successfully upserted ${chunks.length} vectors for websiteId: ${websiteId}`);
  } catch (error) {
    logger.error(`Failed to upsert vectors for websiteId: ${websiteId}:`, error);
    throw error;
  }
}

/**
 * Searches the collection, strictly filtering by the provided website_id.
 * Never performs searches without website_id filter.
 */
export async function searchVectors(
  websiteId: string,
  queryVector: number[],
  limit: number
): Promise<{ content: string; score: number }[]> {
  if (!websiteId || websiteId.trim() === "") {
    throw new Error("Cannot search vectors: websiteId is required.");
  }

  const client = getClient();
  const collectionName = aiConfig.collectionName;

  try {
    logger.info(`Searching vectors for websiteId: ${websiteId} (limit: ${limit})`);
    const results = await client.search(collectionName, {
      vector: queryVector,
      filter: {
        must: [
          {
            key: "website_id",
            match: { value: websiteId },
          },
        ],
      },
      limit,
      with_payload: true,
    });

    return results.map((r) => ({
      content: (r.payload?.content as string) || "",
      score: r.score,
    }));
  } catch (error) {
    logger.error(`Failed to search vectors for websiteId: ${websiteId}:`, error);
    throw error;
  }
}
