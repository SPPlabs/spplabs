import { createClient } from "@clickhouse/client";
import crypto from "crypto";

const host = process.env.CLICKHOUSE_HOST || "";
const username = process.env.CLICKHOUSE_USER || "default";
const password = process.env.CLICKHOUSE_PASSWORD || "";
const database = process.env.CLICKHOUSE_DATABASE || "analytics";

let client = null;
let isMock = true;

// Temporary in-memory store for development/testing when ClickHouse is not connected
const mockEvents = [];

if (host) {
  try {
    client = createClient({
      url: host,
      username,
      password,
      database,
    });
    isMock = false;
    console.log("ClickHouse client initialized targeting:", host);
  } catch (err) {
    console.error("ClickHouse initialization failed, falling back to mock mode:", err.message);
    isMock = true;
  }
} else {
  console.log("No CLICKHOUSE_HOST defined. ClickHouse is running in MOCK mode.");
}

export async function clickhouseQuery(sql, params = {}) {
  if (isMock) {
    console.log("[Mock ClickHouse Query]:", sql, "Params:", params);
    // Return standard mock query results depending on the query target to make the dashboard render correctly!
    return mockQueryHandler(sql, params);
  }
  
  try {
    const resultSet = await client.query({
      query: sql,
      query_params: params,
      format: "JSONEachRow",
    });
    return await resultSet.json();
  } catch (err) {
    console.error("ClickHouse query error:", err);
    throw err;
  }
}

export async function clickhouseInsert(table, values) {
  if (isMock) {
    console.log(`[Mock ClickHouse Insert] Table: ${table}, Values Count: ${values.length}`);
    // Save to in-memory array for retrieval
    const now = new Date();
    values.forEach(v => {
      mockEvents.push({
        ...v,
        event_time: v.event_time ? new Date(v.event_time) : now,
        duration_ms: Number(v.duration_ms || 0),
        scroll_percent: Number(v.scroll_percent || 0),
        screen_width: Number(v.screen_width || 0),
        screen_height: Number(v.screen_height || 0),
        conversion: Number(v.conversion || 0),
      });
    });
    return;
  }

  try {
    await client.insert({
      table,
      values,
      format: "JSONEachRow",
    });
  } catch (err) {
    console.error("ClickHouse insert error:", err);
    throw err;
  }
}

// Helper to return simulated dashboard metrics when ClickHouse is offline
function mockQueryHandler(sql, params) {
  const query = sql.toLowerCase();
  const website_id = params.website_id || "";

  // If no mock events exist, pre-populate a few to make the dashboard look beautiful immediately!
  const existingCount = mockEvents.filter(e => e.website_id === website_id).length;
  if (existingCount === 0) {
    const mockSeed = generateMockSeedEvents(website_id);
    mockEvents.push(...mockSeed);
  }

  const activeEvents = mockEvents.filter(e => e.website_id === website_id);

  // 1. Overview aggregates (Unique Visitors, Sessions, Page views, Bounce rate, session duration)
  if (query.includes("uniq(visitor_id)") && query.includes("uniq(session_id)")) {
    const pageviews = activeEvents.length;
    const uniqueVisitors = new Set(activeEvents.map(e => e.visitor_id)).size;
    const sessions = new Set(activeEvents.map(e => e.session_id)).size;
    
    // Average duration
    const totalDuration = activeEvents.reduce((acc, curr) => acc + (curr.duration_ms || 0), 0);
    const avgDuration = sessions > 0 ? Math.round(totalDuration / 1000 / sessions) : 0;
    
    // Bounce rate: sessions with only 1 page view
    const sessionPageCounts = {};
    activeEvents.forEach(e => {
      sessionPageCounts[e.session_id] = (sessionPageCounts[e.session_id] || 0) + 1;
    });
    const bounceSessions = Object.values(sessionPageCounts).filter(c => c === 1).length;
    const bounceRate = sessions > 0 ? Math.round((bounceSessions / sessions) * 100) : 0;

    return [{
      visitors: pageviews,
      unique_visitors: uniqueVisitors,
      sessions: sessions,
      avg_duration: avgDuration,
      bounce_rate: bounceRate,
    }];
  }

  // 2. Real-time active visitors (last 5 minutes)
  if (query.includes("event_time") && query.includes("interval 5 minute")) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeRightNow = new Set(activeEvents.filter(e => e.event_time >= fiveMinAgo).map(e => e.visitor_id)).size;
    return [{ active_visitors: Math.max(activeRightNow, 2) }]; // Default to at least 2 active users
  }

  // 3. Top pages
  if (query.includes("page_url") && query.includes("group by page_url")) {
    const pageCounts = {};
    activeEvents.forEach(e => {
      if (e.event_type === "page_view") {
        pageCounts[e.page_url] = (pageCounts[e.page_url] || 0) + 1;
      }
    });
    return Object.entries(pageCounts)
      .map(([page_url, count]) => ({ page_url, count }))
      .sort((a, b) => b.count - a.count);
  }

  // 4. Traffic sources / referrers
  if (query.includes("referrer") && query.includes("group by referrer")) {
    const referrerCounts = {};
    activeEvents.forEach(e => {
      const ref = e.referrer || "Direct / None";
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });
    return Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count);
  }

  // 5. Devices
  if (query.includes("device_type") && query.includes("group by device_type")) {
    const deviceCounts = {};
    activeEvents.forEach(e => {
      const dev = e.device_type || "Desktop";
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
    });
    return Object.entries(deviceCounts).map(([device_type, count]) => ({ device_type, count }));
  }

  // 6. Browsers
  if (query.includes("browser") && query.includes("group by browser")) {
    const browserCounts = {};
    activeEvents.forEach(e => {
      const br = e.browser || "Chrome";
      browserCounts[br] = (browserCounts[br] || 0) + 1;
    });
    return Object.entries(browserCounts).map(([browser, count]) => ({ browser, count }));
  }

  // 7. Countries
  if (query.includes("country") && query.includes("group by country")) {
    const countryCounts = {};
    activeEvents.forEach(e => {
      const co = e.country || "Spain";
      countryCounts[co] = (countryCounts[co] || 0) + 1;
    });
    return Object.entries(countryCounts).map(([country, count]) => ({ country, count }));
  }

  // 8. Conversions
  if (query.includes("event_type") && query.includes("group by event_type")) {
    const typeCounts = {};
    activeEvents.forEach(e => {
      typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([event_type, count]) => ({ event_type, count }));
  }

  // 9. Traffic trends over time (Daily)
  if (query.includes("toyyyy-mm-dd")) {
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days[dateStr] = 0;
    }

    activeEvents.forEach(e => {
      const dateStr = e.event_time.toISOString().split("T")[0];
      if (dateStr in days) {
        days[dateStr]++;
      }
    });

    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }

  return [];
}

// Generate pre-populated metrics data to simulate dashboard history instantly
function generateMockSeedEvents(website_id) {
  const seeds = [];
  const visitorIds = Array.from({ length: 42 }, () => crypto.randomUUID());
  const sessionIds = Array.from({ length: 80 }, () => crypto.randomUUID());
  
  const pages = ["/", "/services", "/bookings", "/contacts", "/pricing", "/about"];
  const referrers = ["Direct / None", "https://google.com", "https://github.com", "https://twitter.com", "https://linkedin.com"];
  const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
  const devices = ["Desktop", "Mobile", "Tablet"];
  const countries = ["Spain", "United States", "United Kingdom", "Germany", "France", "Italy"];
  const utms = ["google", "linkedin", "newsletter", "twitter"];

  const now = Date.now();

  for (let i = 0; i < 250; i++) {
    const visitor_id = visitorIds[Math.floor(Math.random() * visitorIds.length)];
    const session_id = sessionIds[Math.floor(Math.random() * sessionIds.length)];
    
    // Distribute events over the last 7 days
    const eventTime = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const eventType = Math.random() > 0.3 ? "page_view" : (Math.random() > 0.5 ? "button_click" : "form_submit");

    seeds.push({
      website_id,
      event_time: eventTime,
      visitor_id,
      session_id,
      event_type: eventType,
      page_url: pages[Math.floor(Math.random() * pages.length)],
      page_title: "Mock Title",
      referrer: referrers[Math.floor(Math.random() * referrers.length)],
      utm_source: Math.random() > 0.7 ? utms[Math.floor(Math.random() * utms.length)] : "",
      utm_medium: Math.random() > 0.7 ? "cpc" : "",
      utm_campaign: Math.random() > 0.7 ? "promo_2026" : "",
      utm_term: "",
      utm_content: "",
      country: countries[Math.floor(Math.random() * countries.length)],
      region: "Madrid",
      city: "Madrid",
      device_type: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: Math.random() > 0.5 ? "Windows" : "macOS",
      screen_width: Math.random() > 0.5 ? 1920 : 390,
      screen_height: Math.random() > 0.5 ? 1080 : 844,
      duration_ms: Math.floor(Math.random() * 45000) + 5000,
      scroll_percent: Math.floor(Math.random() * 100),
      button_name: eventType === "button_click" ? "Try Free Today" : "",
      form_name: eventType === "form_submit" ? "Landing Page Ingestion" : "",
      booking_id: "",
      conversion: eventType === "form_submit" ? 1 : 0,
      ip_hash: "mock_ip_hash_string_3874982374982374",
    });
  }

  return seeds;
}
