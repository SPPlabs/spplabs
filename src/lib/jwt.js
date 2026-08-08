import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "build_time_fallback_jwt_secret_key_spplabs_production_secure";
const JWT_SECRET = new TextEncoder().encode(secretKey);

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
