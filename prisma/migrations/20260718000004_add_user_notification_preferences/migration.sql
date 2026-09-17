-- CreateTable
CREATE TABLE IF NOT EXISTS "user_notification_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "notification_email" TEXT,
    "notify_contacts" BOOLEAN NOT NULL DEFAULT true,
    "notify_bookings" BOOLEAN NOT NULL DEFAULT true,
    "notify_ai_chats" BOOLEAN NOT NULL DEFAULT false,
    "notify_spp_announcements" BOOLEAN NOT NULL DEFAULT true,
    "notify_monthly_report" BOOLEAN NOT NULL DEFAULT true,
    "notify_general_summary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_notification_preferences_website_id_key" ON "user_notification_preferences"("website_id");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_notification_preferences_website_id_fkey'
  ) THEN
    ALTER TABLE "user_notification_preferences" 
    ADD CONSTRAINT "user_notification_preferences_website_id_fkey" 
    FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
