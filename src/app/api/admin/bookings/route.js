import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

// PATCH: Accept/Reject Booking
export async function PATCH(request) {
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
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { bookingId, status } = body;
    if (!bookingId || !status) {
      return NextResponse.json({ error: "Bad Request", message: "bookingId and status are required" }, { status: 400 });
    }

    if (!["CONFIRMED", "CANCELLED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Bad Request", message: "Invalid status value" }, { status: 400 });
    }

    // Lookup booking and ensure the tenant owns it
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { website: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "NotFound", message: "Booking not found" }, { status: 404 });
    }

    // Enforce permission: user domain must match booking's website domain (or be ADMIN)
    if (booking.website.domain !== session.domain && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden", message: "Access denied" }, { status: 403 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("PATCH booking status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Hard Delete Booking
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

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Bad Request", message: "Booking ID is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { website: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "NotFound", message: "Booking not found" }, { status: 404 });
    }

    // Enforce permissions
    if (booking.website.domain !== session.domain && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden", message: "Access denied" }, { status: 403 });
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Booking successfully hard deleted" });
  } catch (error) {
    console.error("DELETE booking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
