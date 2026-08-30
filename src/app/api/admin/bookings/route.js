import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma, withRLS } from "@/lib/prisma";

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

    const db = session.role === "ADMIN" ? prisma : withRLS(session.id);

    // Lookup booking and ensure the tenant owns it
    const booking = await db.booking.findUnique({
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

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // Update monthly metrics aggregate asynchronously
    import("@/lib/monthlyMetrics").then(({ updateMonthlyBookingStatus }) => {
      updateMonthlyBookingStatus(booking.websiteId, {
        date: booking.createdAt,
        fromStatus: booking.status,
        toStatus: status,
      });
    }).catch(e => console.error("Failed to update monthly booking status metric:", e));

    // Update Google Calendar event asynchronously if connected
    import("@/lib/googleCalendar").then(({ updateGoogleCalendarEvent }) => {
      updateGoogleCalendarEvent({
        websiteId: booking.websiteId,
        booking: updatedBooking,
        websiteDisplayName: booking.website?.displayName || "SPP Labs",
      });
    }).catch((e) => console.error("Failed to update Google Calendar event on PATCH:", e));

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

    const db = session.role === "ADMIN" ? prisma : withRLS(session.id);

    const booking = await db.booking.findUnique({
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

    await db.booking.delete({
      where: { id },
    });

    if (booking.googleEventId) {
      import("@/lib/googleCalendar").then(({ deleteGoogleCalendarEvent }) => {
        deleteGoogleCalendarEvent({
          websiteId: booking.websiteId,
          googleEventId: booking.googleEventId,
        });
      }).catch((e) => console.error("Failed to delete Google Calendar event on DELETE:", e));
    }

    return NextResponse.json({ success: true, message: "Booking successfully hard deleted" });
  } catch (error) {
    console.error("DELETE booking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new Booking/Event from dashboard
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
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { date, time, name, phone, email, message, status, targetWebsiteDomain } = body;

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedMessage = typeof message === "string" ? message.trim() : "";
    const trimmedTime = typeof time === "string" ? time.trim() : "";

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json({ error: "Bad Request", message: "Name must be between 2 and 100 characters" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!trimmedEmail || trimmedEmail.length > 120 || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: "Bad Request", message: "Valid email address is required (max 120 chars)" }, { status: 400 });
    }

    if (trimmedPhone) {
      const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{4,20}$/;
      if (trimmedPhone.length < 6 || trimmedPhone.length > 30 || !phoneRegex.test(trimmedPhone)) {
        return NextResponse.json({ error: "Bad Request", message: "Phone number format is invalid (6 to 30 chars)" }, { status: 400 });
      }
    }

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!trimmedTime || !timeRegex.test(trimmedTime)) {
      return NextResponse.json({ error: "Bad Request", message: "Time format must be HH:mm (e.g. 09:30, 16:00)" }, { status: 400 });
    }

    if (trimmedMessage && trimmedMessage.length > 1000) {
      return NextResponse.json({ error: "Bad Request", message: "Message cannot exceed 1,000 characters" }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: "Bad Request", message: "date is required" }, { status: 400 });
    }

    // Resolve target website
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

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Bad Request", message: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    const db = session.role === "ADMIN" ? prisma : withRLS(session.id);

    const newBooking = await db.booking.create({
      data: {
        websiteId: website.id,
        date: parsedDate,
        time: trimmedTime,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        message: trimmedMessage,
        status: status || "CONFIRMED",
      },
    });

    // Increment aggregated monthly metrics asynchronously
    import("@/lib/monthlyMetrics").then(({ incrementMonthlyBookings }) => {
      incrementMonthlyBookings(website.id, {
        date: new Date(),
        isOffHours: false,
        status: status || "CONFIRMED",
      });
    }).catch(e => console.error("Failed to increment monthly booking metrics on POST:", e));

    // Sync to Google Calendar asynchronously if connected
    import("@/lib/googleCalendar").then(({ createGoogleCalendarEvent }) => {
      createGoogleCalendarEvent({
        websiteId: website.id,
        booking: newBooking,
        websiteDisplayName: website.displayName || "SPP Labs",
      });
    }).catch((e) => console.error("Failed to create Google Calendar event on admin POST:", e));

    return NextResponse.json({ success: true, data: newBooking });
  } catch (error) {
    console.error("POST booking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

