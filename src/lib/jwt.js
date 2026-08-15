import { SignJWT, jwtVerify } from "jose";

let cachedSecretKey = null;

function getJwtSecret() {
  if (cachedSecretKey) return cachedSecretKey;

  const envSecret = process.env.JWT_SECRET;
  if (!envSecret || envSecret.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing or empty in production! " +
        "Please generate a secure 64+ character random string in your .env file."
      );
    }
    // Development-only fallback with clear warning
    console.warn("[SECURITY WARNING] JWT_SECRET is not defined. Using development-only fallback key. Set JWT_SECRET in .env for production.");
    cachedSecretKey = new TextEncoder().encode("dev_only_insecure_jwt_secret_key_spplabs_change_in_production");
    return cachedSecretKey;
  }

  cachedSecretKey = new TextEncoder().encode(envSecret.trim());
  return cachedSecretKey;
}

/**
 * Signs a payload and returns a signed JWT token.
 * Default expiration is 24 hours.
 */
export async function signJWT(payload, expiry = "24h") {
  const secret = getJwtSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(secret);
}

/**
 * Verifies a JWT token and returns the decoded payload, or null if invalid/expired.
 */
export async function verifyJWT(token) {
  if (!token) return null;
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

