import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { syncGoogleCalendarEvents } from "@/lib/googleCalendar";

export async function POST(request) {
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
      // Body is optional
    }

    let targetDomain = session.domain;
    if (session.role === "ADMIN" && body.targetWebsiteDomain) {
      targetDomain = body.targetWebsiteDomain.trim().toLowerCase();
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    const syncResult = await syncGoogleCalendarEvents(website.id);

    if (!syncResult.success) {
      return NextResponse.json(
        { success: false, message: syncResult.message || syncResult.error || "Sync failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sincronización completada con éxito.",
      data: syncResult,
    });
  } catch (error) {
    console.error("[Google Sync Route] Error:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: error.message || "Failed to sync Google Calendar" },
      { status: 500 }
    );
  }
}
