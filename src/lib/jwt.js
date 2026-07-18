import { SignJWT, jwtVerify } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. " +
    "Generate a cryptographically random 64+ character string and set it in your .env file."
  );
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Signs a payload and returns a signed JWT token.
 * Default expiration is 24 hours.
 */
export async function signJWT(payload, expiry = "24h") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token and returns the decoded payload, or null if invalid/expired.
 */
export async function verifyJWT(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}
