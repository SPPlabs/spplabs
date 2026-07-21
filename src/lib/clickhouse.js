import { createClient } from "@clickhouse/client";
import crypto from "crypto";

const host = process.env.CLICKHOUSE_HOST || "";
const username = process.env.CLICKHOUSE_USER || "default";
const password = process.env.CLICKHOUSE_PASSWORD || "";
const database = process.env.CLICKHOUSE_DATABASE || "analytics";

// Validate database name to prevent SQL injection
if (database && !/^[a-zA-Z0-9_]+$/.test(database)) {
  throw new Error(
    `FATAL: CLICKHOUSE_DATABASE contains invalid characters: "${database}". ` +
    "Only alphanumeric characters and underscores are allowed."
  );
}

let client = null;
let isMock = true;
let isSetupCompleted = false;

// Temporary in-memory store for development/testing when ClickHouse is not connected
const mockEvents = [];

function createClickHouseClient() {
  try {
    const newClient = createClient({
      url: host,
      username,
      password,
      database,
      request_timeout: 30000,
      clickhouse_settings: {
        connect_timeout: 10,
        receive_timeout: 30,
        send_timeout: 30,
      },
    });
    console.log("ClickHouse client initialized targeting:", host);
    return newClient;
  } catch (err) {
    console.error("ClickHouse initialization failed:", err.message);
    return null;
  }
}

if (host) {
  client = createClickHouseClient();
  if (client) {
    isMock = false;
  }
} else {
  console.log("No CLICKHOUSE_HOST defined. ClickHouse is running in MOCK mode.");
}

// Health check and auto-reconnect
async function ensureConnection() {
  if (isMock || !host) return;

  try {
    await client.ping();
  } catch (err) {
    console.warn("[ClickHouse] Connection lost, attempting reconnect:", err.message);
    try {
      if (client) {
        await client.close().catch(() => {});
      }
      client = createClickHouseClient();
      if (client) {
        await client.ping();
        console.log("[ClickHouse] Reconnected successfully.");
        isSetupCompleted = false; // Re-verify schema on reconnect
      } else {
        throw new Error("Failed to create new client");
      }
    } catch (reconnectErr) {
      console.error("[ClickHouse] Reconnection failed:", reconnectErr.message);
      throw reconnectErr;
    }
  }
}

// Ensures ClickHouse schema exists on the first interaction (idempotent, non-blocking to runtime if database is down)
async function ensureSchema() {
  if (isSetupCompleted || isMock) return;

  try {
    console.log("[ClickHouse] Verifying database schema...");
    
    // 1. Create database (requires connecting to root/default first)
    const baseClient = createClient({
      url: host,
      username,
      password,
    });
    await baseClient.exec({
      query: `CREATE DATABASE IF NOT EXISTS ${database}`,
    });
    await baseClient.close();
    
    // 2. Create partitionable MergeTree table with a 2-year TTL
    await client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS ${database}.analytics_events
        (
          website_id String,
          event_time DateTime64(3),

          visitor_id UUID,
          session_id UUID,

          event_type LowCardinality(String),

          page_url String,
          page_title String,
          referrer String,

          utm_source String,
          utm_medium String,
          utm_campaign String,
          utm_term String,
          utm_content String,

          country LowCardinality(String),
          region LowCardinality(String),
          city LowCardinality(String),

          device_type LowCardinality(String),
          browser LowCardinality(String),
          os LowCardinality(String),

          screen_width UInt16,
          screen_height UInt16,

          duration_ms UInt32,
          scroll_percent UInt8,

          button_name String,
          form_name String,
          booking_id String,

          conversion UInt8,

          ip_hash FixedString(64)
        )
        ENGINE = MergeTree
        PARTITION BY toYYYYMM(event_time)
        ORDER BY (website_id, event_time, event_type, session_id)
        TTL event_time + INTERVAL 2 YEAR DELETE;
      `,
    });

    isSetupCompleted = true;
    console.log(`[ClickHouse] Schema successfully validated in database '${database}'.`);
  } catch (err) {
    console.error("[ClickHouse] Schema verification/migration failed:", err.message);
    // Do not crash the application, allow queries/inserts to run or try again on next interaction
  }
}

export async function clickhouseQuery(sql, params = {}) {
  if (isMock) {
    console.log("[Mock ClickHouse Query]:", sql, "Params:", params);
    return mockQueryHandler(sql, params);
  }
  
  // Ensure connection is alive and tables exist
  await ensureConnection();
  await ensureSchema();
  
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

  // Ensure connection is alive and tables exist
  await ensureConnection();
  await ensureSchema();

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

  // 8b. Spain Cities Query
  if ((query.includes("country = 'spain'") || query.includes("country = 'es'")) && query.includes("city")) {
    const cityCounts = {};
    activeEvents.filter(e => e.country === "Spain" || e.country === "ES").forEach(e => {
      const city = e.city || "Madrid";
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    return Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // 9. Traffic trends over time (Hourly/Daily/Monthly depending on query/timeframe)
  if (query.includes("tohour") || query.includes("interval 1 day") || query.includes("interval 24 hour")) {
    const hours = {};
    for (let i = 0; i < 24; i++) {
      hours[`${String(i).padStart(2, '0')}:00`] = 0;
    }
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    activeEvents.filter(e => e.event_time >= oneDayAgo).forEach(e => {
      const hr = `${String(e.event_time.getHours()).padStart(2, '0')}:00`;
      hours[hr]++;
    });
    return Object.entries(hours).map(([date, count]) => ({ date, count }));
  }

  if (query.includes("interval 30 day")) {
    const days = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days[dateStr] = 0;
    }
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    activeEvents.filter(e => e.event_time >= thirtyDaysAgo).forEach(e => {
      const dateStr = e.event_time.toISOString().split("T")[0];
      if (dateStr in days) {
        days[dateStr]++;
      }
    });
    return Object.entries(days).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));
  }

  if (query.includes("interval 12 month") || query.includes("interval 1 year") || query.includes("interval 365 day")) {
    const months = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[mStr] = 0;
    }
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    activeEvents.filter(e => e.event_time >= oneYearAgo).forEach(e => {
      const mStr = `${e.event_time.getFullYear()}-${String(e.event_time.getMonth() + 1).padStart(2, '0')}`;
      if (mStr in months) {
        months[mStr]++;
      }
    });
    return Object.entries(months).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));
  }

  // All time trend (monthly grouping over the last 12 months)
  if (query.includes("all-time") || query.includes("all time") || (!query.includes("interval 1 day") && !query.includes("interval 7 day") && !query.includes("interval 30 day"))) {
    const months = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[mStr] = 0;
    }
    activeEvents.forEach(e => {
      const mStr = `${e.event_time.getFullYear()}-${String(e.event_time.getMonth() + 1).padStart(2, '0')}`;
      if (mStr in months) {
        months[mStr]++;
      }
    });
    return Object.entries(months).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));
  }

  // Default to 7-day trend
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

  return Object.entries(days).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
}

// Generate pre-populated metrics data to simulate dashboard history instantly
function generateMockSeedEvents(website_id) {
  const seeds = [];
  const visitorIds = Array.from({ length: 150 }, () => crypto.randomUUID());
  const sessionIds = Array.from({ length: 300 }, () => crypto.randomUUID());
  
  const pages = ["/", "/services", "/bookings", "/contacts", "/pricing", "/about"];
  const referrers = ["Direct / None", "https://google.com", "https://github.com", "https://twitter.com", "https://linkedin.com"];
  const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
  const devices = ["Desktop", "Mobile", "Tablet"];
  const countries = ["Spain", "Spain", "United States", "United Kingdom", "Germany", "France", "Italy"];
  const spainCities = [
    "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Bilbao", "Alicante",
    "Vigo", "A Coruña", "Santiago de Compostela", "Granada", "Córdoba", "Valladolid", "Oviedo", "Santander",
    "San Sebastián", "Pamplona", "Toledo", "Salamanca", "Burgos", "Cádiz", "Badajoz"
  ];
  const utms = ["google", "linkedin", "newsletter", "twitter"];

  const now = Date.now();

  // Seed 1000 events spread over the last 365 days
  for (let i = 0; i < 1000; i++) {
    const visitor_id = visitorIds[Math.floor(Math.random() * visitorIds.length)];
    const session_id = sessionIds[Math.floor(Math.random() * sessionIds.length)];
    
    // Distribute events over the last 365 days
    const eventTime = new Date(now - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const eventType = Math.random() > 0.3 ? "page_view" : (Math.random() > 0.5 ? "button_click" : "form_submit");
    const country = countries[Math.floor(Math.random() * countries.length)];
    const isSpain = country === "Spain";
    const city = isSpain ? spainCities[Math.floor(Math.random() * spainCities.length)] : country;


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
      country,
      region: isSpain ? "Spain Region" : "NY State",
      city,
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

/**
 * Deletes all analytics events belonging to a specific website_id (domain or UUID).
 * Works in both Real ClickHouse and Mock mode.
 */
export async function clickhouseDeleteWebsiteEvents(website_id) {
  if (!website_id) return;
  const cleanId = String(website_id).trim().toLowerCase();

  // Mock mode deletion
  if (isMock || !host || !client) {
    for (let i = mockEvents.length - 1; i >= 0; i--) {
      if (
        String(mockEvents[i].website_id).toLowerCase() === cleanId ||
        String(mockEvents[i].website_id) === website_id
      ) {
        mockEvents.splice(i, 1);
      }
    }
    console.log(`[ClickHouse Mock] Deleted events for website_id: ${website_id}`);
    return;
  }

  // Real ClickHouse deletion
  try {
    await ensureConnection();
    await client.exec({
      query: `ALTER TABLE analytics_events DELETE WHERE website_id = {website_id: String}`,
      query_params: { website_id: cleanId },
    });
    console.log(`[ClickHouse] Deleted analytics events for website_id: ${cleanId}`);
  } catch (err) {
    console.error(`[ClickHouse] Failed to delete events for website_id ${cleanId}:`, err.message);
  }
}
