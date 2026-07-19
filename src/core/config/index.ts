import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

let parsedConfig: {
  ai: {
    vllmUrl: string;
    vllmModel: string;
    qdrantUrl: string;
    collectionName: string;
    embeddingModel: string;
    chunkSize: number;
    chunkOverlap: number;
  };
  databaseUrl: string;
} | null = null;

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`CRITICAL CONFIGURATION ERROR: Required environment variable "${key}" is missing or empty.`);
  }
  return value.trim();
}

function getOptionalEnv(key: string, defaultValue: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    return defaultValue;
  }
  return value.trim();
}

function getRequiredEnvInt(key: string): number {
  const valueStr = getRequiredEnv(key);
  const parsed = parseInt(valueStr, 10);
  if (isNaN(parsed)) {
    throw new Error(`CRITICAL CONFIGURATION ERROR: Environment variable "${key}" must be a valid integer, but got "${valueStr}".`);
  }
  return parsed;
}

/**
 * Validates and parses all required environment variables.
 * Throws a detailed error if any required configurations are missing or invalid.
 */
export function validateConfig(): void {
  if (parsedConfig) return;
  try {
    parsedConfig = {
      ai: {
        vllmUrl: getRequiredEnv("AI_VLLM_URL"),
        vllmModel: getOptionalEnv("VLLM_MODEL", "qwen3-4b"),
        qdrantUrl: getRequiredEnv("AI_QDRANT_URL"),
        collectionName: getRequiredEnv("AI_COLLECTION_NAME"),
        embeddingModel: getRequiredEnv("EMBEDDING_MODEL"),
        chunkSize: getRequiredEnvInt("CHUNK_SIZE"),
        chunkOverlap: getRequiredEnvInt("CHUNK_OVERLAP"),
      },
      databaseUrl: getRequiredEnv("DATABASE_URL"),
    };
  } catch (error) {
    console.error("AI Infrastructure Configuration Validation Failed!");
    throw error;
  }
}


/**
 * Global configuration object accessing parsed environment values.
 * Accessing these properties triggers configuration validation if not done already.
 */
export const config = {
  get ai() {
    validateConfig();
    return parsedConfig!.ai;
  },
  get databaseUrl() {
    validateConfig();
    return parsedConfig!.databaseUrl;
  }
};
