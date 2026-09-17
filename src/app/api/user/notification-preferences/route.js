import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import {
  getUserNotificationPreferences,
  saveUserNotificationPreferences,
} from "@/lib/userNotifications";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spp_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized", message: "Missing session" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session || !session.domain) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedDomain = searchParams.get("domain")?.trim().toLowerCase();

    let targetDomain = session.domain;
    if (session.role === "ADMIN" && requestedDomain) {
      targetDomain = requestedDomain;
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
      select: { id: true, domain: true, displayName: true },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    const preferences = await getUserNotificationPreferences(website.id);

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("GET notification-preferences error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spp_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized", message: "Missing session" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session || !session.domain) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const {
      domain: requestedDomain,
      enabled,
      notificationEmail,
      notifyContacts,
      notifyBookings,
      notifyAiChats,
      notifySppAnnouncements,
      notifyMonthlyReport,
      notifyGeneralSummary,
    } = body;

    let targetDomain = session.domain;
    if (session.role === "ADMIN" && requestedDomain) {
      targetDomain = requestedDomain.trim().toLowerCase();
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
      select: { id: true, domain: true, displayName: true },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    const trimmedEmail = typeof notificationEmail === "string" ? notificationEmail.trim() : "";
    if (enabled && trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { error: "BadRequest", message: "El formato del correo electrónico no es válido." },
          { status: 400 }
        );
      }
    }

    const updated = await saveUserNotificationPreferences(website.id, {
      enabled,
      notificationEmail: trimmedEmail,
      notifyContacts,
      notifyBookings,
      notifyAiChats,
      notifySppAnnouncements,
      notifyMonthlyReport,
      notifyGeneralSummary,
    });

    return NextResponse.json({
      success: true,
      message: "Preferencias de notificaciones actualizadas correctamente.",
      data: updated,
    });
  } catch (error) {
    console.error("POST notification-preferences error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}
