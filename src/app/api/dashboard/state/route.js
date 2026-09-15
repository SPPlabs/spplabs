import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyJWT(sessionToken);
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, tab, bookingIds, targetDomain } = body;

    let targetWebsiteId = session.id;
    if (session.role === "ADMIN" && targetDomain && targetDomain !== session.domain) {
      const targetWebsite = await prisma.website.findUnique({
        where: { domain: targetDomain },
        select: { id: true },
      });
      if (targetWebsite) {
        targetWebsiteId = targetWebsite.id;
      }
    }

    const viewerWebsiteId = session.id;
    const now = new Date();

    let updateData = {};
    if (action === "view_tab") {
      if (tab === "analytics") {
        updateData.lastAnalyticsView = now;
      } else if (tab === "notificaciones") {
        updateData.lastNotificationView = now;
        if (session.role === "ADMIN" && session.domain === "spplabs.es") {
          updateData.lastSupportView = now;
        }
      } else if (tab === "clientes_contacts" || tab === "clientes") {
        updateData.lastContactView = now;
      } else if (tab === "ia") {
        updateData.lastConversationView = now;
      } else if (tab === "support") {
        updateData.lastSupportView = now;
      }
    } else if (action === "view_bookings" && Array.isArray(bookingIds) && bookingIds.length > 0) {
      const existing = await prisma.websiteDashboardState.findUnique({
        where: {
          viewerWebsiteId_targetWebsiteId: {
            viewerWebsiteId,
            targetWebsiteId,
          },
        },
        select: { viewedBookingIds: true },
      });

      const currentIds = new Set(existing?.viewedBookingIds || []);
      bookingIds.forEach((id) => {
        if (typeof id === "string" && id.trim()) {
          currentIds.add(id.trim());
        }
      });
      updateData.viewedBookingIds = Array.from(currentIds);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ ok: true, message: "No changes needed" });
    }

    const updatedState = await prisma.websiteDashboardState.upsert({
      where: {
        viewerWebsiteId_targetWebsiteId: {
          viewerWebsiteId,
          targetWebsiteId,
        },
      },
      create: {
        viewerWebsiteId,
        targetWebsiteId,
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({
      ok: true,
      state: {
        lastContactView: updatedState.lastContactView?.toISOString() || null,
        lastBookingView: updatedState.lastBookingView?.toISOString() || null,
        lastNotificationView: updatedState.lastNotificationView?.toISOString() || null,
        lastSupportView: updatedState.lastSupportView?.toISOString() || null,
        lastAnalyticsView: updatedState.lastAnalyticsView?.toISOString() || null,
        lastConversationView: updatedState.lastConversationView?.toISOString() || null,
        viewedBookingIds: updatedState.viewedBookingIds || [],
      },
    });
  } catch (err) {
    console.error("[Dashboard State Update Error]:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
