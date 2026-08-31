import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { deleteGoogleCalendarEvent } from "@/lib/googleCalendar";

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized", message: "No active session" }, { status: 401 });
    }

    const session = await verifyJWT(sessionToken);
    if (!session || !session.domain) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body optional, check url search params as fallback
    }

    const url = new URL(request.url);
    const googleEventId = body.googleEventId || url.searchParams.get("googleEventId");
    const targetWebsiteDomain = body.targetWebsiteDomain || url.searchParams.get("domain");

    if (!googleEventId) {
      return NextResponse.json(
        { error: "BadRequest", message: "googleEventId is required" },
        { status: 400 }
      );
    }

    let targetDomain = session.domain;
    if (session.role === "ADMIN" && targetWebsiteDomain) {
      targetDomain = targetWebsiteDomain.trim().toLowerCase();
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    // 1. Delete from Google Calendar API
    await deleteGoogleCalendarEvent({
      websiteId: website.id,
      googleEventId,
    });

    // 2. Delete from externalCalendarEvents local table
    await prisma.externalCalendarEvent.deleteMany({
      where: {
        websiteId: website.id,
        googleEventId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Evento eliminado de Google Calendar y de SPP Labs.",
    });
  } catch (error) {
    console.error("[Google Event Delete Route] Error:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: error.message || "Failed to delete Google Calendar event" },
      { status: 500 }
    );
  }
}
