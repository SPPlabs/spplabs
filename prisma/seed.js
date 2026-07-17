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

  if (!existing) {
    await prisma.website.create({
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
