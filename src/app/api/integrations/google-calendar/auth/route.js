import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getGoogleAuthUrl } from "@/lib/googleCalendar";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await verifyJWT(sessionToken);
    if (!session || !session.domain) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const url = new URL(request.url);
    const impersonateDomain = url.searchParams.get("domain");

    let targetDomain = session.domain;
    if (session.role === "ADMIN" && impersonateDomain) {
      targetDomain = impersonateDomain.trim().toLowerCase();
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
    });

    if (!website) {
      return NextResponse.redirect(new URL("/dashboard?error=website_not_found", request.url));
    }

    const authUrl = await getGoogleAuthUrl(website.id, website.domain);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("[Google Auth Route] Error generating auth URL:", error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error.message || "auth_init_failed")}`, request.url)
    );
  }
}
