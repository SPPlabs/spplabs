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

    const previousStatus = booking.status;
    const newStatus = status;

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

    // A. If booking is ACCEPTED / CONFIRMED: Dispatch confirmation & schedule reminder + review request
    if (previousStatus !== "CONFIRMED" && newStatus === "CONFIRMED") {
      (async () => {
        try {
          const emailConfig = await prisma.websiteEmailConfig.findUnique({
            where: { websiteId: booking.websiteId },
          });

          const companyName = booking.website.displayName || "Atención al Cliente";
          const brandColor = emailConfig?.brandColor || "#0284c7";
          const parsedDate = new Date(booking.date);
          const dateStr = parsedDate.toLocaleDateString("es-ES", { dateStyle: "long" });
          const timeStr = booking.time?.trim() || "09:00";
          const customLogoUrl = emailConfig?.customLogoUrl || booking.website.logoUrl || null;

          const { sendEmail } = await import("@/lib/email");
          const { generateBookingConfirmationHtml } = await import("@/lib/emailTemplates");
          const { getSpainDateTimeUtc } = await import("@/lib/dateUtils");

          // 1. Immediate Booking Confirmation
          if (!emailConfig || emailConfig.enableBookingConfirm) {
            const html = generateBookingConfirmationHtml({
              recipientName: booking.name.trim(),
              companyName,
              clientDomain: booking.website.domain,
              dateStr,
              timeStr,
              brandColor,
              customLogoUrl,
            });

            const sendRes = await sendEmail({
              to: booking.email.trim().toLowerCase(),
              subject: `Confirmación de cita - ${companyName} (${dateStr} a las ${timeStr})`,
              html,
              senderName: emailConfig?.senderName || companyName,
              replyTo: emailConfig?.replyToEmail || undefined,
              clientDomain: booking.website.domain,
            });

            await prisma.scheduledEmail.create({
              data: {
                websiteId: booking.websiteId,
                recipientEmail: booking.email.trim().toLowerCase(),
                recipientName: booking.name.trim(),
                subject: `Confirmación de cita - ${companyName}`,
                emailType: "BOOKING_CONFIRMATION",
                status: sendRes.success ? "SENT" : "FAILED",
                scheduledFor: new Date(),
                sentAt: sendRes.success ? new Date() : null,
                error: sendRes.error || null,
                metadata: { bookingId: booking.id, dateStr, timeStr },
              },
            });
          }

          // Exact appointment timestamp in UTC respecting Spain (Europe/Madrid) timezone
          const appointmentDateTime = getSpainDateTimeUtc(booking.date, timeStr);
          const now = new Date();

          // 2. Schedule Reminder (e.g. 24h before appointment)
          if (!emailConfig || emailConfig.enableBookingReminder) {
            const reminderHoursBefore = emailConfig?.reminderHoursBefore ?? 24;
            let reminderScheduledDate = new Date(appointmentDateTime.getTime() - reminderHoursBefore * 60 * 60 * 1000);

            if (reminderScheduledDate <= now) {
              const twoHoursBefore = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
              if (twoHoursBefore > now) {
                reminderScheduledDate = twoHoursBefore;
              } else {
                const thirtyMinsBefore = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);
                if (thirtyMinsBefore > now) {
                  reminderScheduledDate = thirtyMinsBefore;
                }
              }
            }

            if (reminderScheduledDate > now) {
              await prisma.scheduledEmail.create({
                data: {
                  websiteId: booking.websiteId,
                  recipientEmail: booking.email.trim().toLowerCase(),
                  recipientName: booking.name.trim(),
                  subject: `Recordatorio de tu cita en ${companyName}`,
                  emailType: "BOOKING_REMINDER",
                  status: "PENDING",
                  scheduledFor: reminderScheduledDate,
                  metadata: { bookingId: booking.id, dateStr, timeStr },
                },
              });
            }
          }

          // 3. Schedule Google Review Booster (e.g. 2h after appointment)
          const isBookingReviewEnabled = emailConfig
            ? (emailConfig.enableBookingReviewRequest ?? emailConfig.enableReviewRequest ?? true)
            : true;

          if (isBookingReviewEnabled) {
            const reviewDelayHours = emailConfig?.bookingReviewDelayHours ?? emailConfig?.reviewDelayHours ?? 2;
            const reviewScheduledDate = new Date(appointmentDateTime.getTime() + reviewDelayHours * 60 * 60 * 1000);

            await prisma.scheduledEmail.create({
              data: {
                websiteId: booking.websiteId,
                recipientEmail: booking.email.trim().toLowerCase(),
                recipientName: booking.name.trim(),
                subject: `¿Qué tal fue tu experiencia en ${companyName}? ⭐`,
                emailType: "GOOGLE_REVIEW_REQUEST",
                status: "PENDING",
                scheduledFor: reviewScheduledDate,
                metadata: { bookingId: booking.id, source: "booking" },
              },
            });
          }
        } catch (err) {
          console.error("Async booking confirmation & scheduling error on PATCH:", err);
        }
      })();
    }

    // B. If booking is CANCELLED: Cancel any pending scheduled emails for this booking
    if (newStatus === "CANCELLED") {
      (async () => {
        try {
          const pendingEmails = await prisma.scheduledEmail.findMany({
            where: {
              websiteId: booking.websiteId,
              status: "PENDING",
            },
          });

          const toCancel = pendingEmails.filter(
            (e) => e.metadata && typeof e.metadata === "object" && e.metadata.bookingId === booking.id
          );

          if (toCancel.length > 0) {
            await Promise.all(
              toCancel.map((item) =>
                prisma.scheduledEmail.update({
                  where: { id: item.id },
                  data: { status: "CANCELLED" },
                })
              )
            );
          }
        } catch (err) {
          console.error("Error cancelling pending scheduled emails for cancelled booking:", err);
        }
      })();
    }

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

    // Cancel any pending scheduled emails for this deleted booking
    (async () => {
      try {
        const pendingEmails = await prisma.scheduledEmail.findMany({
          where: { websiteId: booking.websiteId, status: "PENDING" },
        });
        const toCancel = pendingEmails.filter(
          (e) => e.metadata && typeof e.metadata === "object" && e.metadata.bookingId === booking.id
        );
        if (toCancel.length > 0) {
          await Promise.all(
            toCancel.map((item) =>
              prisma.scheduledEmail.update({
                where: { id: item.id },
                data: { status: "CANCELLED" },
              })
            )
          );
        }
      } catch (err) {
        console.error("Error cancelling pending scheduled emails on booking delete:", err);
      }
    })();

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

    const { date, time, name, phone, email, message, status, targetWebsiteDomain, sendNotifications } = body;

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

    // If sendNotifications is enabled, dispatch confirmation & schedule reminders/reviews based on emailConfig
    if (Boolean(sendNotifications)) {
      (async () => {
        try {
          const emailConfig = await prisma.websiteEmailConfig.findUnique({
            where: { websiteId: website.id },
          });

          const companyName = website.displayName || "Atención al Cliente";
          const brandColor = emailConfig?.brandColor || "#0284c7";
          const dateStr = parsedDate.toLocaleDateString("es-ES", { dateStyle: "long" });
          const timeStr = trimmedTime;
          const customLogoUrl = emailConfig?.customLogoUrl || website.logoUrl || null;

          const { sendEmail } = await import("@/lib/email");
          const { generateBookingConfirmationHtml } = await import("@/lib/emailTemplates");
          const { getSpainDateTimeUtc } = await import("@/lib/dateUtils");

          // A. Immediate Booking Confirmation
          if (!emailConfig || emailConfig.enableBookingConfirm) {
            const html = generateBookingConfirmationHtml({
              recipientName: trimmedName,
              companyName,
              clientDomain: website.domain,
              dateStr,
              timeStr,
              brandColor,
              customLogoUrl,
            });

            const sendRes = await sendEmail({
              to: trimmedEmail,
              subject: `Confirmación de cita - ${companyName} (${dateStr} a las ${timeStr})`,
              html,
              senderName: emailConfig?.senderName || companyName,
              replyTo: emailConfig?.replyToEmail || undefined,
              clientDomain: website.domain,
            });

            await prisma.scheduledEmail.create({
              data: {
                websiteId: website.id,
                recipientEmail: trimmedEmail,
                recipientName: trimmedName,
                subject: `Confirmación de cita - ${companyName}`,
                emailType: "BOOKING_CONFIRMATION",
                status: sendRes.success ? "SENT" : "FAILED",
                scheduledFor: new Date(),
                sentAt: sendRes.success ? new Date() : null,
                error: sendRes.error || null,
                metadata: { bookingId: newBooking.id, dateStr, timeStr },
              },
            });
          }

          // Exact appointment timestamp in UTC respecting Spain (Europe/Madrid)
          const appointmentDateTime = getSpainDateTimeUtc(date, trimmedTime);
          const now = new Date();

          // B. Schedule Reminder
          if (!emailConfig || emailConfig.enableBookingReminder) {
            const reminderHoursBefore = emailConfig?.reminderHoursBefore ?? 24;
            let reminderScheduledDate = new Date(appointmentDateTime.getTime() - reminderHoursBefore * 60 * 60 * 1000);

            if (reminderScheduledDate <= now) {
              const twoHoursBefore = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
              if (twoHoursBefore > now) {
                reminderScheduledDate = twoHoursBefore;
              } else {
                const thirtyMinsBefore = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);
                if (thirtyMinsBefore > now) {
                  reminderScheduledDate = thirtyMinsBefore;
                }
              }
            }

            if (reminderScheduledDate > now) {
              await prisma.scheduledEmail.create({
                data: {
                  websiteId: website.id,
                  recipientEmail: trimmedEmail,
                  recipientName: trimmedName,
                  subject: `Recordatorio de tu cita en ${companyName}`,
                  emailType: "BOOKING_REMINDER",
                  status: "PENDING",
                  scheduledFor: reminderScheduledDate,
                  metadata: { bookingId: newBooking.id, dateStr, timeStr },
                },
              });
            }
          }

          // C. Schedule Google Review Booster
          const isBookingReviewEnabled = emailConfig ? (emailConfig.enableBookingReviewRequest ?? emailConfig.enableReviewRequest ?? true) : true;
          if (isBookingReviewEnabled) {
            const reviewDelayHours = emailConfig?.bookingReviewDelayHours ?? emailConfig?.reviewDelayHours ?? 2;
            const reviewScheduledDate = new Date(appointmentDateTime.getTime() + reviewDelayHours * 60 * 60 * 1000);

            await prisma.scheduledEmail.create({
              data: {
                websiteId: website.id,
                recipientEmail: trimmedEmail,
                recipientName: trimmedName,
                subject: `¿Qué tal fue tu experiencia en ${companyName}? ⭐`,
                emailType: "GOOGLE_REVIEW_REQUEST",
                status: "PENDING",
                scheduledFor: reviewScheduledDate,
                metadata: { bookingId: newBooking.id, source: "dashboard_booking" },
              },
            });
          }
        } catch (err) {
          console.error("Dashboard booking email dispatch error:", err);
        }
      })();
    }

    return NextResponse.json({ success: true, data: newBooking });
  } catch (error) {
    console.error("POST booking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

