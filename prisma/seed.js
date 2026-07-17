const { PrismaClient } = require("@prisma/client");
const { hash } = require("@node-rs/argon2");

const prisma = new PrismaClient();

async function main() {
  const adminDomain = "spplabs.es";
  // Secure default admin password
  const adminPassword = "spp_admin_password_2026";
  
  const hashedPassword = await hash(adminPassword, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const existing = await prisma.website.findUnique({
    where: { domain: adminDomain },
  });

  let website = existing;

  if (!existing) {
    website = await prisma.website.create({
      data: {
        domain: adminDomain,
        displayName: "SPP Labs Admin",
        passwordHash: hashedPassword,
        role: "ADMIN",
        registeredAt: new Date(),
      },
    });
    console.log("=========================================");
    console.log("Admin account successfully seeded!");
    console.log(`Domain:   ${adminDomain}`);
    console.log(`Password: ${adminPassword}`);
    console.log("=========================================");
  } else {
    console.log(`Admin account already exists: ${adminDomain}`);
  }

  // Seed default API Key for spplabs.es if not present
  const existingApiKey = await prisma.websiteApiKey.findFirst({
    where: { websiteId: website.id },
  });

  if (!existingApiKey) {
    const crypto = require("crypto");
    const rawApiKey = "spp_api_" + crypto.randomBytes(24).toString("hex");
    const hashedKey = await hash(rawApiKey, {
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await prisma.websiteApiKey.create({
      data: {
        websiteId: website.id,
        name: "Admin Default API Key",
        keyHash: hashedKey,
      },
    });

    console.log("=========================================");
    console.log("Admin API Key successfully seeded!");
    console.log(`API Key:  ${rawApiKey}`);
    console.log("Add this to your .env file as: NEXT_PUBLIC_SPP_API_KEY");
    console.log("=========================================");
  } else {
    console.log("Admin API Key already exists in database.");
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
