const { createClient } = require("@clickhouse/client");

const host = process.env.CLICKHOUSE_HOST;
const username = process.env.CLICKHOUSE_USER || "default";
const password = process.env.CLICKHOUSE_PASSWORD || "";
const database = process.env.CLICKHOUSE_DATABASE || "analytics";

if (!host) {
  console.log("No CLICKHOUSE_HOST defined. Skipping ClickHouse database setup.");
  process.exit(0);
}

async function setup() {
  const client = createClient({
    url: host,
    username,
    password,
  });

  try {
    console.log("Connecting to ClickHouse at:", host);
    
    // 1. Create database
    await client.exec({
      query: `CREATE DATABASE IF NOT EXISTS ${database}`,
    });
    console.log(`Database '${database}' verified/created.`);

    // 2. Create events table
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
    console.log("Table 'analytics_events' verified/created successfully.");
  } catch (err) {
    console.error("Error setting up ClickHouse:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setup();
