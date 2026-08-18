/**
 * Updates the website account displayName in the database.
 * 
 * Usage:
 *   node prisma/update-account-name.js
 *   TARGET_DOMAIN="spplabs.es" NEW_NAME="SPP Labs" node prisma/update-account-name.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const domain = process.env.TARGET_DOMAIN || "spplabs.es";
  const newName = process.env.NEW_NAME || "SPP Labs";

  console.log(`Updating displayName for ${domain} to "${newName}"...`);

  const website = await prisma.website.findUnique({
    where: { domain },
  });

  if (!website) {
    console.error(`ERROR: Website with domain ${domain} not found.`);
    process.exit(1);
  }

  const updated = await prisma.website.update({
    where: { id: website.id },
    data: { displayName: newName },
  });

  console.log(`✅ Updated account name for ${updated.domain}: "${updated.displayName}"`);
}

main()
  .catch((e) => {
    console.error("Failed to update account name:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
