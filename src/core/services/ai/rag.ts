import { searchVectors } from "./qdrant";
import { embeddings } from "./embeddings";
import { logger } from "@/core/logger";

/**
 * Retrieves the matching text contents from Qdrant for a given query, strictly isolated to the specified websiteId.
 */
export async function retrieveContext(
  websiteId: string,
  query: string,
  limit: number = 5
): Promise<string[]> {
  if (!websiteId || websiteId.trim() === "") {
    throw new Error("retrieveContext requires a valid websiteId");
  }

  try {
    logger.info(`Retrieving context for website: ${websiteId}`);
    
    // 1. Generate query embedding (executed lazily)
    const queryVector = await embeddings.embedQuery(query);

    // 2. Query Qdrant with tenant filter
    const matches = await searchVectors(websiteId, queryVector, limit);

    return matches.map((m) => m.content);
  } catch (error) {
    logger.error(`Error retrieving context for websiteId ${websiteId}:`, error);
    throw error;
  }
}

/**
 * Combines retrieved context text chunks into a unified string block for system prompt formatting.
 */
export function buildContext(contexts: string[]): string {
  if (contexts.length === 0) {
    return "";
  }
  return contexts.join("\n\n");
}
