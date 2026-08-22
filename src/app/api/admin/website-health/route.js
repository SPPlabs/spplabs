import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

// In-memory health status cache: domain -> { data, cachedAt }
const healthCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

async function checkSingleDomain(domain) {
  const cleanDomain = domain.trim().toLowerCase();
  const targetUrl = cleanDomain.startsWith("http") ? cleanDomain : `https://${cleanDomain}`;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    let res;
    try {
      // 1. Try HEAD request first for speed
      res = await fetch(targetUrl, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "SPPLabs-UptimeBot/1.0 (+https://spplabs.es)",
        },
      });
    } catch (headErr) {
      // If HEAD network failed or timed out, rethrow
      if (headErr.name === "AbortError") {
        throw new Error("Timeout (>4s)");
      }
      throw headErr;
    } finally {
      clearTimeout(timeoutId);
    }

    const latencyMs = Date.now() - startTime;
    const isOnline = res.status >= 200 && res.status < 400;

    return {
      domain: cleanDomain,
      isOnline,
      statusCode: res.status,
      latencyMs,
      error: isOnline ? null : `HTTP ${res.status}`,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    let errorMessage = err.message || "Unreachable";

    if (err.name === "AbortError" || errorMessage.includes("Timeout")) {
      errorMessage = "Timeout (>4s)";
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
      // Run checks in parallel (max 10 concurrent)
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
