/**
 * Force RLS on all tenant-scoped tables in PostgreSQL.
 * 
 * Usage:
 *   node prisma/force-rls.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TABLES = [
  "contact_forms",
  "bookings",
  "website_api_keys",
  "notifications",
  "support_requests",
  "ai_usage_monthly",
  "chatbot_knowledge",
  "google_calendar_connections",
  "website_dashboard_state"
];

async function main() {
  console.log("Applying FORCE ROW LEVEL SECURITY on all tenant tables...");
  for (const table of TABLES) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);
      console.log(`✅ Forced RLS on table: "${table}"`);
    } catch (err) {
      console.error(`❌ Failed to force RLS on table "${table}":`, err.message);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
