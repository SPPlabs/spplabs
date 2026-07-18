import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Returns a Prisma client with RLS context set for the given websiteId.
 * 
 * This uses PostgreSQL session variables (SET LOCAL) to pass the current
 * tenant ID to RLS policies. The SET is scoped to the transaction, so
 * it doesn't leak between requests.
 * 
 * Usage:
 *   const rlsClient = withRLS(websiteId);
 *   const contacts = await rlsClient.contactForm.findMany();
 *   // Only returns contacts for the given websiteId
 * 
 * For admin operations that need to bypass RLS, use the standard `prisma` client directly.
 * Prisma connects as the database owner (superuser/table owner), so RLS policies
 * that use `USING (true)` for the table owner will apply.
 * 
 * NOTE: RLS policies use current_setting('app.current_website_id', true).
 * When this setting is not set (empty string), the policies deny access.
 * The standard `prisma` client should be used for admin/cross-tenant queries
 * since the database owner (the role Prisma connects as) should be the table owner
 * and RLS policies should be configured to allow the owner full access.
 */
export function withRLS(websiteId) {
  if (!websiteId) {
    throw new Error("withRLS requires a websiteId");
  }

  return prisma.$extends({
    query: {
      $allOperations: async ({ args, query, operation }) => {
        // Wrap the query in a transaction that sets the RLS context
        const [, result] = await prisma.$transaction([
          prisma.$executeRawUnsafe(
            `SET LOCAL app.current_website_id = '${websiteId.replace(/'/g, "''")}'`
          ),
          // Execute the original query within the same transaction
          query(args),
        ]);
        return result;
      },
    },
  });
}
