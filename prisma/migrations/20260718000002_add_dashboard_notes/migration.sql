-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('NOTE', 'CLIENT', 'STAFF');

-- CreateTable
CREATE TABLE "dashboard_notes" (
    "id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "type" "NoteType" NOT NULL DEFAULT 'NOTE',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "tag" TEXT,
    "color" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dashboard_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dashboard_notes_website_id_idx" ON "dashboard_notes"("website_id");

-- CreateIndex
CREATE INDEX "dashboard_notes_pinned_updated_at_idx" ON "dashboard_notes"("pinned", "updated_at");

-- AddForeignKey
ALTER TABLE "dashboard_notes" ADD CONSTRAINT "dashboard_notes_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE "dashboard_notes" ENABLE ROW LEVEL SECURITY;

-- Create Tenant Isolation Policy
CREATE POLICY "tenant_isolation" ON "dashboard_notes"
  FOR ALL
  USING ("website_id"::text = current_setting('app.current_website_id', true))
  WITH CHECK ("website_id"::text = current_setting('app.current_website_id', true));
