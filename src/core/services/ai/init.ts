import { validateConfig } from "../../config";
import { createCollectionIfNeeded } from "./qdrant";
import { logger } from "@/core/logger";

let isInitialized = false;

/**
 * Initializes the AI infrastructure services.
 * Startup remains as fast as possible:
 * 1. Validates environment configurations.
 * 2. Connects to Qdrant and asserts the target collection exists (creating if missing).
 * DOES NOT preload the local embeddings model.
 * DOES NOT contact the vLLM server.
 */
export async function initializeAI(): Promise<void> {
  if (isInitialized) {
    logger.info("AI Infrastructure is already initialized.");
    return;
  }

  logger.info("Initializing AI Infrastructure...");
  try {
    // 1. Validate environment configurations (raises error if missing required keys)
    validateConfig();

    // 2. Connect to Qdrant and verify/create the collection
    await createCollectionIfNeeded();

    isInitialized = true;
    logger.info("AI Infrastructure initialized successfully.");
  } catch (error) {
    logger.error("Failed to initialize AI Infrastructure:", error);
    throw error;
  }
}
