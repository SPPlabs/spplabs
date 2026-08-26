import { hash, verify } from "@node-rs/argon2";
import crypto, { randomBytes } from "crypto";

/**
 * Pre-computed Argon2id hash with identical parameters (m=65536, t=3, p=4)
 * used for timing-safe password verification when accounts do not exist.
 */
export const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$LLLmVoH8b2mB9qWg0TwVqQ$nZP5/Vk87fM6TBCEGySE1XJSQeYTXtqheMKyJHFjGn0";

/**
 * Hashes a plaintext password using Argon2id.
 * Used exclusively for human passwords (login / signup).
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
 * Hashes a raw API key using fast SHA-256 with a type prefix.
 * High-entropy API keys (192 bits) are mathematically immune to brute-force,
 * making sub-millisecond, zero-memory SHA-256 the optimal industry standard.
 */
export function hashApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("API key is required for hashing");
  }
  const digest = crypto.createHash("sha256").update(apiKey.trim()).digest("hex");
  return `sha256:${digest}`;
}

/**
 * Helper to check whether a stored API key hash was created with legacy Argon2id.
 */
export function isLegacyApiKeyHash(storedHash) {
  return typeof storedHash === "string" && storedHash.startsWith("$argon2id$");
}

/**
 * Verifies a raw API key against a stored hash.
 * Supports modern SHA-256 hashes (constant-time comparison) and legacy Argon2id hashes (with backwards compatibility).
 */
export async function verifyApiKey(apiKey, hashedApiKey) {
  if (!apiKey || !hashedApiKey) return false;

  const cleanApiKey = apiKey.trim();

  // 1. Backwards compatibility for legacy Argon2id hashes
  if (isLegacyApiKeyHash(hashedApiKey)) {
    try {
      return await verify(hashedApiKey, cleanApiKey);
    } catch {
      return false;
    }
  }

  // 2. Modern SHA-256 verification with timing attack protection
  try {
    const cleanStoredHash = hashedApiKey.startsWith("sha256:")
      ? hashedApiKey.slice(7)
      : hashedApiKey;

    const inputHash = crypto.createHash("sha256").update(cleanApiKey).digest("hex");

    if (inputHash.length !== cleanStoredHash.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(inputHash, "utf8"),
      Buffer.from(cleanStoredHash, "utf8")
    );
  } catch {
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

