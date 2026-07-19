export interface VectorPayload {
  website_id: string;
  content: string;
}

export interface VectorPoint {
  id: string; // Must be a valid UUID
  vector: number[];
  payload: VectorPayload;
}

export interface ChunkerResult {
  content: string;
  metadata: {
    website_id: string;
  };
}
