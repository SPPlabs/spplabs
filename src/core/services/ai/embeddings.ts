import { Embeddings, EmbeddingsParams } from "@langchain/core/embeddings";
import { env, pipeline } from "@huggingface/transformers";
import path from "path";
import { aiConfig } from "./config";
import { logger } from "@/core/logger";

// Configure @huggingface/transformers to cache model weights locally and prevent redundant checks.
env.allowLocalModels = false; // Look up model on Hugging Face hub if not cached locally, but cache it once loaded.
env.cacheDir = path.resolve(process.cwd(), ".cache/transformers");

export class BgeM3Embeddings extends Embeddings {
  private static instance: BgeM3Embeddings | null = null;
  private extractor: any = null; // pipeline feature extraction instance
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private readonly modelName: string;

  private constructor(modelName: string, params?: EmbeddingsParams) {
    super(params ?? {});
    this.modelName = modelName;
  }

  /**
   * Retrieves the global singleton embeddings instance.
   * Does NOT initialize the underlying model.
   */
  public static getInstance(modelName: string = aiConfig.embeddingModel): BgeM3Embeddings {
    if (!BgeM3Embeddings.instance) {
      BgeM3Embeddings.instance = new BgeM3Embeddings(modelName);
    }
    return BgeM3Embeddings.instance;
  }

  /**
   * Internal lazy initializer that loads the model weights once.
   * Invoked on the first request to generate embeddings.
   */
  private async init(): Promise<void> {
    if (this.extractor) return;

    if (this.isInitializing) {
      return this.initPromise || Promise.resolve();
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      logger.info(`Lazy-loading embedding model pipeline: ${this.modelName} (this will download model on first run if not cached)...`);
      try {
        this.extractor = await pipeline("feature-extraction", this.modelName);
        logger.info("Embedding model loaded successfully.");
      } catch (error) {
        logger.error(`Failed to lazy-load embedding model: ${this.modelName}`, error);
        throw error;
      } finally {
        this.isInitializing = false;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  /**
   * Embeds a list of document strings.
   * Executes lazy initialization.
   */
  async embedDocuments(documents: string[]): Promise<number[][]> {
    await this.init();
    const results: number[][] = [];
    
    // Process documents sequentially to manage CPU utilization and avoid container memory exhaustion.
    for (const doc of documents) {
      const output = await this.extractor(doc, { pooling: "cls", normalize: true });
      results.push(Array.from(output.data));
    }
    return results;
  }

  /**
   * Embeds a single query string.
   * Executes lazy initialization.
   */
  async embedQuery(text: string): Promise<number[]> {
    await this.init();
    const output = await this.extractor(text, { pooling: "cls", normalize: true });
    return Array.from(output.data);
  }
}

/**
 * Lazy singleton instance export.
 * Importing this file does NOT initialize the model weights.
 */
export const embeddings = BgeM3Embeddings.getInstance();
