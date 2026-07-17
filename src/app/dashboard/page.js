import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage(props) {
  // Await searchParams as they are a Promise in Next.js 15+
  const searchParams = await props.searchParams;
  const impersonateDomain = searchParams?.domain;

  // 1. Get session token from HttpOnly cookies
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("spp_session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // 2. Verify JWT token
  const session = await verifyJWT(sessionToken);
  if (!session) {
    redirect("/login");
  }

  // 3. Resolve which website's telemetry to display
  let targetDomain = session.domain;
  
  // Allow Admin to impersonate other client domains
  if (session.role === "ADMIN" && impersonateDomain) {
    targetDomain = impersonateDomain.trim().toLowerCase();
  }

  // Fetch target website details
  const currentWebsite = await prisma.website.findUnique({
    where: { domain: targetDomain },
  });

  if (!currentWebsite) {
    // If target domain does not exist, fallback to logged in user's dashboard
    if (session.role === "ADMIN") {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  }

  // 4. Fetch telemetry records for the target website
  const contactForms = await prisma.contactForm.findMany({
    where: { websiteId: currentWebsite.id },
    orderBy: { createdAt: "desc" },
  });

  const bookings = await prisma.booking.findMany({
    where: { websiteId: currentWebsite.id },
    orderBy: [
      { date: "desc" },
      { time: "desc" }
    ],
  });

  // Fetch API Key metadata (exclude hashes for security)
  const apiKeys = await prisma.websiteApiKey.findMany({
    where: { websiteId: currentWebsite.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
    }
  });

  // 5. If Admin, fetch the list of all websites to populate the directory
  let allWebsites = [];
  if (session.role === "ADMIN") {
    allWebsites = await prisma.website.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // Serialize BigInt or Date types if needed, though Next.js Server Components serialize Dates well.
  // Standard Dates are serialized cleanly. We don't have BigInts in this payload.

  return (
    <DashboardClient
      session={session}
      allWebsites={allWebsites}
      currentWebsite={currentWebsite}
      contactForms={contactForms}
      bookings={bookings}
      apiKeys={apiKeys}
    />
  );
}
