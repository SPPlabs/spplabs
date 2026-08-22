import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

// In-memory health status cache: domain -> { data, cachedAt }
const healthCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
};

async function checkSingleDomain(domain) {
  const cleanDomain = domain.trim().toLowerCase();
  const startTime = Date.now();

  // Try HTTPS first, then fallback to HTTP if HTTPS fails
  const protocols = ["https://", "http://"];

  for (const protocol of protocols) {
    const targetUrl = cleanDomain.startsWith("http") ? cleanDomain : `${protocol}${cleanDomain}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      let res;
      try {
        res = await fetch(targetUrl, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: BROWSER_HEADERS,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const latencyMs = Date.now() - startTime;
      // Any response from 200 to 499 means the server is reachable and active
      const isOnline = res.status >= 200 && res.status < 500;

      return {
        domain: cleanDomain,
        isOnline,
        statusCode: res.status,
        latencyMs,
        error: isOnline ? null : `HTTP ${res.status}`,
        checkedAt: new Date().toISOString(),
      };
    } catch (err) {
      // If HTTPS fails and we still have HTTP to try, continue loop
      if (protocol === "https://" && !err.name.includes("AbortError")) {
        continue;
      }

      const latencyMs = Date.now() - startTime;
      let errorMessage = err.message || "Unreachable";

      if (err.name === "AbortError" || errorMessage.includes("Timeout")) {
        errorMessage = "Timeout (>8s)";
      } else if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("getaddrinfo")) {
        errorMessage = "DNS Inaccesible";
      } else if (errorMessage.includes("CERT_") || errorMessage.includes("SSL") || errorMessage.includes("certificate")) {
        errorMessage = "Error SSL";
      } else if (errorMessage.includes("ECONNREFUSED")) {
        errorMessage = "Conexión rechazada";
      }

      return {
        domain: cleanDomain,
        isOnline: false,
        statusCode: 0,
        latencyMs,
        error: errorMessage,
        checkedAt: new Date().toISOString(),
      };
    }
  }

  return {
    domain: cleanDomain,
    isOnline: false,
    statusCode: 0,
    latencyMs: Date.now() - startTime,
    error: "Inaccesible",
    checkedAt: new Date().toISOString(),
  };
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyJWT(sessionToken);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const specificDomain = searchParams.get("domain");
    const forceRefresh = searchParams.get("refresh") === "true";

    let domainsToCheck = [];

    if (specificDomain) {
      domainsToCheck = [specificDomain.trim().toLowerCase()];
    } else {
      const websites = await prisma.website.findMany({
        select: { domain: true },
      });
      domainsToCheck = websites.map((w) => w.domain);
    }

    const now = Date.now();
    const results = {};
    const domainsNeedingCheck = [];

    for (const domain of domainsToCheck) {
      const cached = healthCache.get(domain);
      if (!forceRefresh && cached && now - cached.cachedAt < CACHE_TTL_MS) {
        results[domain] = cached.data;
      } else {
        domainsNeedingCheck.push(domain);
      }
    }

    if (domainsNeedingCheck.length > 0) {
      // Check in parallel
      const checkPromises = domainsNeedingCheck.map(async (domain) => {
        const health = await checkSingleDomain(domain);
        healthCache.set(domain, { data: health, cachedAt: Date.now() });
        return { domain, health };
      });

      const freshResults = await Promise.all(checkPromises);
      freshResults.forEach(({ domain, health }) => {
        results[domain] = health;
      });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("[Website Health Check API Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
