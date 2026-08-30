import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncGoogleCalendarEvents } from "@/lib/googleCalendar";

export async function POST(request) {
  try {
    const channelId = request.headers.get("x-goog-channel-id");
    const resourceState = request.headers.get("x-goog-resource-state"); // "sync" or "exists"

    // If it's the initial "sync" handshake notification from Google, acknowledge with 200
    if (resourceState === "sync") {
      return new NextResponse(null, { status: 200 });
    }

    if (channelId) {
      const connection = await prisma.googleCalendarConnection.findFirst({
        where: { channelId },
      });

      if (connection) {
        // Run incremental sync in background
        syncGoogleCalendarEvents(connection.websiteId).catch((err) =>
          console.error("[Google Webhook] Incremental sync failed for website:", connection.websiteId, err)
        );
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[Google Webhook] Error processing notification:", error);
    return new NextResponse(null, { status: 200 }); // Always 200 to prevent Google retry storms
  }
}
