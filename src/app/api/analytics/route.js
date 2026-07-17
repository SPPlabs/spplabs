import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/crypto";
import { clickhouseInsert } from "@/lib/clickhouse";
import crypto from "crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, x-website-domain",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function jsonResponse(data, init = {}) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...corsHeaders, ...(init.headers || {}) },
  });
}

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // 1. Authenticate domain and API key
    const domain = (request.headers.get("x-website-domain") || body.website_id || body.domain || "").trim().toLowerCase();
    const apiKeyHeader = request.headers.get("x-api-key") || "";
    const authHeader = request.headers.get("authorization") || "";
    let apiKey = apiKeyHeader;

    if (!apiKey && authHeader.startsWith("Bearer ")) {
      apiKey = authHeader.substring(7);
    }
    if (!apiKey) {
      apiKey = body.apiKey || body.api_key || "";
    }

    if (!domain) {
      return jsonResponse(
        { error: "Bad Request", message: "website_id or domain is required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return jsonResponse(
        { error: "Unauthorized", message: "API Key is required" },
        { status: 401 }
      );
    }

    // Look up domain in PostgreSQL
    const website = await prisma.website.findUnique({
      where: { domain },
      include: { apiKeys: true },
    });

    if (!website) {
      return jsonResponse(
        { error: "Unauthorized", message: "Domain is not registered" },
        { status: 401 }
      );
    }

    // Verify key
    let activeKey = null;
    for (const keyRecord of website.apiKeys) {
      if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
        continue;
      }
      const isMatch = await verifyApiKey(apiKey, keyRecord.keyHash);
      if (isMatch) {
        activeKey = keyRecord;
        break;
      }
    }

    if (!activeKey) {
      return jsonResponse(
        { error: "Unauthorized", message: "Invalid API Key" },
        { status: 401 }
      );
    }

    // 2. Parse User-Agent for OS, Browser, Device
    const userAgent = request.headers.get("user-agent") || "";
    const uaInfo = parseUserAgent(userAgent);

    // 3. Get IP Address and Hash it
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const cleanIp = ip.split(",")[0].trim();
    const ipHash = crypto.createHash("sha256").update(cleanIp).digest("hex");

    // 4. Resolve Geo headers (standard for Vercel/proxies or fallback)
    const country = request.headers.get("x-vercel-ip-country") || body.country || "Spain";
    const region = request.headers.get("x-vercel-ip-country-region") || body.region || "Madrid";
    const city = request.headers.get("x-vercel-ip-city") || body.city || "Madrid";

    // 5. Structure ClickHouse Row values
    const eventTime = body.timestamp ? new Date(body.timestamp) : new Date();

    const eventRow = {
      website_id: domain,
      event_time: eventTime.toISOString().replace("T", " ").replace("Z", ""), // ClickHouse format
      visitor_id: body.visitor_id || crypto.randomUUID(),
      session_id: body.session_id || crypto.randomUUID(),
      event_type: body.event_type || "page_view",
      page_url: body.page_url || "/",
      page_title: body.page_title || "",
      referrer: body.referrer || "",
      utm_source: body.utm_source || "",
      utm_medium: body.utm_medium || "",
      utm_campaign: body.utm_campaign || "",
      utm_term: body.utm_term || "",
      utm_content: body.utm_content || "",
      country,
      region,
      city,
      device_type: uaInfo.device,
      browser: uaInfo.browser,
      os: uaInfo.os,
      screen_width: Number(body.screen_width || 0),
      screen_height: Number(body.screen_height || 0),
      duration_ms: Number(body.duration_ms || 0),
      scroll_percent: Number(body.scroll_percent || 0),
      button_name: body.button_name || "",
      form_name: body.form_name || "",
      booking_id: body.booking_id || "",
      conversion: Number(body.conversion || 0),
      ip_hash: ipHash,
    };

    // Write to ClickHouse
    await clickhouseInsert("analytics_events", [eventRow]);

    // Async update lastUsedAt on PostgreSQL (non-blocking)
    prisma.websiteApiKey
      .update({
        where: { id: activeKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((e) => console.error("Failed to update API key lastUsedAt:", e));

    return jsonResponse({
      success: true,
      message: "Event logged successfully",
      visitor_id: eventRow.visitor_id,
      session_id: eventRow.session_id,
    });
  } catch (error) {
    console.error("Public analytics API ingestion error:", error);
    return jsonResponse(
      { error: "Internal Server Error", message: "Failed to log event" },
      { status: 500 }
    );
  }
}

// User-Agent parser helper
function parseUserAgent(userAgent) {
  if (!userAgent) return { device: "Desktop", browser: "Unknown", os: "Unknown" };

  const ua = userAgent.toLowerCase();

  // 1. Device Type
  let device = "Desktop";
  if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone")) {
    device = "Mobile";
  } else if (ua.includes("tablet") || ua.includes("ipad") || ua.includes("playbook")) {
    device = "Tablet";
  }

  // 2. Browser
  let browser = "Chrome";
  if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("chrome") && !ua.includes("chromium") && !ua.includes("edg")) {
    browser = "Chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")) {
    browser = "Safari";
  } else if (ua.includes("edg")) {
    browser = "Edge";
  } else if (ua.includes("opera") || ua.includes("opr")) {
    browser = "Opera";
  }

  // 3. OS
  let os = "Unknown";
  if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("macintosh") || ua.includes("mac os")) {
    os = "macOS";
  } else if (ua.includes("android")) {
    os = "Android";
  } else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    os = "iOS";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  return { device, browser, os };
}
