import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyJWT(sessionToken);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden", message: "Admin access required." }, { status: 403 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { title, message, targetWebsiteId } = body;
    if (!title || !message) {
      return NextResponse.json({ error: "title and message are required." }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        websiteId: targetWebsiteId ? targetWebsiteId : null, // If null, global alert
      },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Notification creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
