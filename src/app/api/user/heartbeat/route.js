import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyJWT(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const websiteId = session.id || session.websiteId;
    const domain = session.domain ? session.domain.trim().toLowerCase() : null;

    if (!websiteId && !domain) {
      return NextResponse.json({ error: "Missing website identifier in session" }, { status: 400 });
    }

    const now = new Date();

    // Update lastActiveAt in PostgreSQL (search by id or by unique domain)
    if (websiteId) {
      await prisma.website.update({
        where: { id: websiteId },
        data: { lastActiveAt: now },
      });
    } else if (domain) {
      await prisma.website.update({
        where: { domain },
        data: { lastActiveAt: now },
      });
    }

    return NextResponse.json({
      success: true,
      lastActiveAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[Heartbeat Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
