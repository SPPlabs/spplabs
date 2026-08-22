import maxmind from "maxmind";
import path from "path";
import fs from "fs";

let lookupInstance = null;
let lookupInitialized = false;
let activeDbPath = null;

/**
 * Searches for a valid .mmdb file given a specific path or search directory.
 */
function findMmdbFile(candidate) {
  if (!candidate) return null;

  try {
    if (!fs.existsSync(candidate)) return null;

    const stat = fs.statSync(candidate);
    if (stat.isFile() && candidate.endsWith(".mmdb")) {
      return candidate;
    }

    if (stat.isDirectory()) {
      const files = fs.readdirSync(candidate);
      // Prefer dbip-city-lite files first, then any .mmdb file (sorted descending by name for latest version)
      const mmdbFiles = files
        .filter((f) => f.endsWith(".mmdb"))
        .sort((a, b) => b.localeCompare(a));

      if (mmdbFiles.length > 0) {
        return path.join(candidate, mmdbFiles[0]);
      }
    }
  } catch (err) {
    console.warn(`[GeoIP] Error checking candidate path "${candidate}":`, err.message);
  }

  return null;
}

/**
 * Resolves the active .mmdb file location.
 */
function resolveDbPath() {
  const candidatePaths = [
    process.env.GEOIP_DB_PATH,
    "/opt/geoip/dbip/dbip-city-lite-2026-08.mmdb",
    "/opt/geoip/dbip",
    "/app/data/geoip",
    path.join(process.cwd(), "data", "geoip"),
    path.join(process.cwd(), "data"),
  ];

  for (const candidate of candidatePaths) {
    const found = findMmdbFile(candidate);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Singleton getter for the MaxMind / DB-IP database reader instance.
 */
export async function getGeoLookup() {
  if (lookupInitialized) {
    return lookupInstance;
  }

  const dbPath = resolveDbPath();
  if (!dbPath) {
    if (!lookupInitialized) {
      console.warn("[GeoIP] No .mmdb database found in configured paths. Local geo fallback disabled.");
      lookupInitialized = true;
    }
    return null;
  }

  try {
    activeDbPath = dbPath;
    lookupInstance = await maxmind.open(dbPath, {
      watchForUpdates: true,
      watchForUpdatesNonPersistent: true,
    });
    lookupInitialized = true;
    console.log(`[GeoIP] Successfully loaded DB-IP / MaxMind database from: ${dbPath}`);
    return lookupInstance;
  } catch (err) {
    console.error(`[GeoIP] Failed to open database at "${dbPath}":`, err.message);
    lookupInitialized = true;
    return null;
  }
}

/**
 * Checks if an IP address is a private, loopback, or local address.
 */
export function isPrivateIp(ip) {
  if (!ip) return true;
  const clean = ip.trim();

  if (
    clean === "127.0.0.1" ||
    clean === "::1" ||
    clean === "localhost" ||
    clean === "0.0.0.0"
  ) {
    return true;
  }

  // IPv4 Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
  if (
    clean.startsWith("10.") ||
    clean.startsWith("192.168.") ||
    clean.startsWith("169.254.")
  ) {
    return true;
  }

  if (clean.startsWith("172.")) {
    const parts = clean.split(".");
    if (parts.length >= 2) {
      const secondOctet = parseInt(parts[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) return true;
    }
  }

  // IPv6 Private / Link-Local ranges: fc00::/7 (ULA), fe80::/10 (Link-Local)
  const lower = clean.toLowerCase();
  if (lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80")) {
    return true;
  }

  return false;
}

/**
 * Resolves geolocation data for a given IP address.
 * Prioritizes Spanish names with fallback to English, country codes, and city names.
 */
export async function resolveIpGeo(ip) {
  if (isPrivateIp(ip)) {
    return {
      country: "Local",
      region: "Development",
      city: "Localhost",
      countryCode: "LOCAL",
    };
  }

  const reader = await getGeoLookup();
  if (!reader) {
    return {
      country: "Unknown",
      region: "Unknown",
      city: "Unknown",
      countryCode: "Unknown",
    };
  }

  try {
    const record = reader.get(ip);
    if (!record) {
      return {
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
        countryCode: "Unknown",
      };
    }

    // Country resolution (Spanish -> English -> Name -> ISO Code)
    const country =
      record.country?.names?.es ||
      record.country?.names?.en ||
      record.country?.name ||
      record.registered_country?.names?.es ||
      record.registered_country?.names?.en ||
      record.country?.iso_code ||
      "Unknown";

    const countryCode =
      record.country?.iso_code ||
      record.registered_country?.iso_code ||
      "Unknown";

    // Region / Autonomous community resolution (Spanish -> English -> Name)
    const region =
      record.subdivisions?.[0]?.names?.es ||
      record.subdivisions?.[0]?.names?.en ||
      record.subdivisions?.[0]?.name ||
      "Unknown";

    // City resolution (Spanish -> English -> Name)
    const city =
      record.city?.names?.es ||
      record.city?.names?.en ||
      record.city?.name ||
      "Unknown";

    return {
      country,
      countryCode,
      region,
      city,
      latitude: record.location?.latitude || null,
      longitude: record.location?.longitude || null,
    };
  } catch (err) {
    console.error(`[GeoIP] Error resolving IP ${ip}:`, err.message);
    return {
      country: "Unknown",
      region: "Unknown",
      city: "Unknown",
      countryCode: "Unknown",
    };
  }
}
