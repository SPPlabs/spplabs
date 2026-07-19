import { config } from "../../config";

export const aiConfig = {
  get vllmUrl(): string {
    return config.ai.vllmUrl;
  },
  get qdrantUrl(): string {
    return config.ai.qdrantUrl;
  },
  get collectionName(): string {
    return config.ai.collectionName;
  },
  get embeddingModel(): string {
    return config.ai.embeddingModel;
  },
  get chunkSize(): number {
    return config.ai.chunkSize;
  },
  get chunkOverlap(): number {
    return config.ai.chunkOverlap;
  }
};
