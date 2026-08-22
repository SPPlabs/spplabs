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
    if (!session || !session.websiteId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const now = new Date();

    // Update lastActiveAt timestamp in PostgreSQL
    await prisma.website.update({
      where: { id: session.websiteId },
      data: { lastActiveAt: now },
    });

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
