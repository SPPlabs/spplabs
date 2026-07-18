/**
 * Updates the admin password for spplabs.es in the database.
 * 
 * Usage:
 *   ADMIN_PASSWORD="your_new_password" node prisma/update-admin-password.js
 * 
 * Requires: .env with DATABASE_URL set, and npm ci already run.
 */

const { PrismaClient } = require("@prisma/client");
const { hash } = require("@node-rs/argon2");

const prisma = new PrismaClient();

async function main() {
  const newPassword = process.env.ADMIN_PASSWORD;
  if (!newPassword) {
    console.error("ERROR: Set ADMIN_PASSWORD environment variable first.");
    console.error("Usage: ADMIN_PASSWORD=\"your_new_password\" node prisma/update-admin-password.js");
    process.exit(1);
  }

  const hashed = await hash(newPassword, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await prisma.website.update({
    where: { domain: "spplabs.es" },
    data: { passwordHash: hashed },
  });

  console.log("✅ Admin password updated successfully for spplabs.es");
}

main()
  .catch((e) => {
    console.error("Failed to update password:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
