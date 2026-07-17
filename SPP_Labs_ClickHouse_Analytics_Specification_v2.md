# SPP Labs ClickHouse Analytics Specification (v2)

## Goal

Design a scalable multi-tenant analytics platform for SPP Labs. All
analytics are stored in ClickHouse and separated by `website_id` (the
client domain).

## Architecture

``` text
Browser
  ↓
SPP Analytics SDK
  ↓
POST https://api.spplabs.es/api/analytics
  ↓
Validation / enrichment
  ↓
ClickHouse
  ↓
Client Dashboard
```

## Database

Database: `analytics`

### Main table

`analytics_events`

### CREATE TABLE (recommended)

``` sql
CREATE TABLE analytics.analytics_events
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
ORDER BY (website_id,event_time,event_type,session_id)
TTL event_time + INTERVAL 2 YEAR DELETE;
```

## Standard event types

-   page_view
-   session_start
-   session_end
-   button_click
-   form_submit
-   booking_created
-   phone_click
-   email_click
-   whatsapp_click
-   download
-   video_start
-   video_complete
-   scroll
-   outbound_link

## API Contract

Endpoint: `POST /api/analytics`

Body example:

``` json
{
 "website_id":"restaurant.es",
 "event_type":"page_view",
 "page_url":"/services",
 "page_title":"Services",
 "visitor_id":"uuid",
 "session_id":"uuid",
 "timestamp":"2026-07-15T12:00:00Z"
}
```

Server responsibilities: - validate website_id - authenticate API key -
enrich with geo/device if needed - hash IP - insert into ClickHouse

## Authentication

Each website has its own API key stored in PostgreSQL. Backend validates
the key before writing analytics.

## Visitor IDs

Persistent cookie (1 year).

## Session IDs

New UUID after 30 minutes of inactivity.

## Automatically collected

-   page views
-   sessions
-   referrer
-   UTM parameters
-   browser
-   OS
-   device
-   viewport
-   language
-   country/region/city
-   page duration
-   scroll depth
-   button clicks
-   downloads
-   outbound links
-   forms
-   bookings

## Dashboard

Overview: - Visitors - Unique visitors - Sessions - Avg. session
duration - Bounce rate - Conversion rate

Traffic: - Sources - UTM campaigns - Referrers

Content: - Top pages - Landing pages - Exit pages

Audience: - Countries - Cities - Browsers - Devices - Operating systems

Conversions: - Forms - Bookings - Phone clicks - Email clicks - WhatsApp
clicks

Real-time: - Active visitors - Current pages

## Materialized Views (future)

-   mv_daily_pages
-   mv_daily_visitors
-   mv_hourly_visitors
-   mv_conversions

## Example Queries

Visitors:

``` sql
SELECT uniq(visitor_id)
FROM analytics_events
WHERE website_id=?;
```

Top pages:

``` sql
SELECT page_url,count()
FROM analytics_events
WHERE website_id=?
AND event_type='page_view'
GROUP BY page_url
ORDER BY count() DESC;
```

## SDK Requirements

Provide a reusable package: - AnalyticsProvider - useAnalytics() -
automatic route tracking - data-analytics attributes - batching - retry
queue - sendBeacon on unload

## Performance

-   Append-only writes
-   Batch inserts
-   Gzip payloads
-   No updates/deletes except TTL
-   Materialized views only when needed

## Privacy

-   Never store raw IPs
-   Never store passwords
-   Never store form contents
-   Hash visitor IP
-   Respect cookie consent when required

## Multi-tenancy

Every analytics query MUST filter:

``` sql
WHERE website_id = ?
```
