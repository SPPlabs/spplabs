-- Enable Row Level Security on all tenant-scoped tables
-- RLS policies use the session variable app.current_website_id
-- to filter rows. This is a defense-in-depth measure on top of
-- the application-level filtering already in place.
--
-- The table owner (the role Prisma connects as) bypasses RLS by default,
-- so admin operations via the standard Prisma client work without restriction.
-- For tenant-scoped operations, use the withRLS(websiteId) wrapper which
-- sets the session variable before each query.

-- ============================================================
-- 1. ENABLE RLS ON ALL TENANT-SCOPED TABLES
-- ============================================================

ALTER TABLE "contact_forms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website_api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_usage_monthly" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chatbot_knowledge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "google_calendar_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website_dashboard_state" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. CREATE TENANT ISOLATION POLICIES
-- ============================================================
-- These policies restrict non-owner roles to only see/modify
-- rows belonging to their website_id. The table owner (Prisma's
-- connection role) bypasses RLS automatically.

-- Contact Forms
CREATE POLICY "tenant_isolation" ON "contact_forms"
  FOR ALL
  USING ("website_id"::text = current_setting('app.current_website_id', true))
  WITH CHECK ("website_id"::text = current_setting('app.current_website_id', true));

-- Bookings
CREATE POLICY "tenant_isolation" ON "bookings"
  FOR ALL
  USING ("website_id"::text = current_setting('app.current_website_id', true))
  WITH CHECK ("website_id"::text = current_setting('app.current_website_id', true));

-- Website API Keys
CREATE POLICY "tenant_isolation" ON "website_api_keys"
  FOR ALL
  USING ("website_id"::text = current_setting('app.current_website_id', true))
  WITH CHECK ("website_id"::text = current_setting('app.current_website_id', true));

-- Notifications (special: websiteId is nullable for global notifications)
CREATE POLICY "tenant_isolation" ON "notifications"
  FOR ALL
  USING (
    "website_id" IS NULL  -- Global notifications visible to all
    OR "website_id"::text = current_setting('app.current_website_id', true)
  )
  WITH CHECK (
    "website_id" IS NULL
    OR "website_id"::text = current_setting('app.current_website_id', true)
  );

-- Support Requests
CREATE POLICY "tenant_isolation" ON "support_requests"
  FOR ALL
  USING ("website_id"::text = current_setting('app.current_website_id', true))
  WITH CHECK ("website_id"::text = current_setting('app.current_website_id', true));

-- AI Usage Monthly
CREATE POLICY "tenant_isolation" ON "ai_usage_monthly"
  FOR ALL
  USING ("website_id"::text = current_setting('app.current_website_id', true))
  WITH CHECK ("website_id"::text = current_setting('app.current_website_id', true));

-- Chatbot Knowledge
CREATE POLICY "tenant_isolation" ON "chatbot_knowledge"
  FOR ALL
  USING ("website_id"::text = current_setting('app.current_website_id', true))
  WITH CHECK ("website_id"::text = current_setting('app.current_website_id', true));

-- Google Calendar Connections
CREATE POLICY "tenant_isolation" ON "google_calendar_connections"
  FOR ALL
  USING ("website_id"::text = current_setting('app.current_website_id', true))
  WITH CHECK ("website_id"::text = current_setting('app.current_website_id', true));

-- Website Dashboard State (uses viewer_website_id for isolation)
CREATE POLICY "tenant_isolation" ON "website_dashboard_state"
  FOR ALL
  USING ("viewer_website_id"::text = current_setting('app.current_website_id', true))
  WITH CHECK ("viewer_website_id"::text = current_setting('app.current_website_id', true));
