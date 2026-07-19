import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEncoding } from "js-tiktoken";
import { aiConfig } from "./config";
import { logger } from "@/core/logger";

let tiktokenEncoding: ReturnType<typeof getEncoding> | null = null;

function getTiktokenEncoding(): ReturnType<typeof getEncoding> {
  if (!tiktokenEncoding) {
    logger.info("Initializing tiktoken cl100k_base encoding for chunker...");
    tiktokenEncoding = getEncoding("cl100k_base");
  }
  return tiktokenEncoding;
}

/**
 * Splits text into chunks based on tokens using RecursiveCharacterTextSplitter and tiktoken.
 * Uses configuration values from env variables (CHUNK_SIZE and CHUNK_OVERLAP).
 */
export async function splitText(
  text: string,
  chunkSize: number = aiConfig.chunkSize,
  chunkOverlap: number = aiConfig.chunkOverlap
): Promise<string[]> {
  try {
    const encoding = getTiktokenEncoding();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      lengthFunction: (t) => encoding.encode(t).length,
    });

    return await splitter.splitText(text);
  } catch (error) {
    logger.error("Failed to split text into chunks:", error);
    throw error;
  }
}
