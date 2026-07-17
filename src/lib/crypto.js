import { hash, verify } from "@node-rs/argon2";
import { randomBytes } from "crypto";

/**
 * Hashes a plaintext password using Argon2id.
 */
export async function hashPassword(password) {
  return hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verifies a plaintext password against an Argon2id hash.
 */
export async function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  try {
    return await verify(hashedPassword, password);
  } catch (e) {
    return false;
  }
}

/**
 * Hashes a raw API key using Argon2id.
 */
export async function hashApiKey(apiKey) {
  return hash(apiKey, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verifies a raw API key against an Argon2id hash.
 */
export async function verifyApiKey(apiKey, hashedApiKey) {
  if (!apiKey || !hashedApiKey) return false;
  try {
    return await verify(hashedApiKey, apiKey);
  } catch (e) {
    return false;
  }
}

/**
 * Generates a random secure token with the `spp_token_` prefix.
 */
export function generateToken() {
  return "spp_token_" + randomBytes(20).toString("hex");
}

/**
 * Generates a random secure API key with the `spp_api_` prefix.
 */
export function generateApiKey() {
  return "spp_api_" + randomBytes(24).toString("hex");
}
