import { NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/crypto";
import { prisma, withRLS } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, x-website-domain",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function jsonResponse(data, init = {}) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...corsHeaders, ...(init.headers || {}) },
  });
}

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // 1. Extract API Key and Domain
    const apiKeyHeader = request.headers.get("x-api-key") || "";
    const authHeader = request.headers.get("authorization") || "";
    let apiKey = apiKeyHeader;
    
    if (!apiKey && authHeader.startsWith("Bearer ")) {
      apiKey = authHeader.substring(7);
    }
    
    if (!apiKey) {
      apiKey = body.apiKey || body.api_key || "";
    }

    const domain = (request.headers.get("x-website-domain") || body.domain || "").trim().toLowerCase();

    // Booking fields
    const { name, phone, email, message, date, time } = body;

    // Validate inputs
    if (!domain) {
      return jsonResponse(
        { error: "Bad Request", message: "Website domain is required (header: x-website-domain or body: domain)" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return jsonResponse(
        { error: "Unauthorized", message: "API key is required" },
        { status: 401 }
      );
    }

    if (!name || !email || !date || !time) {
      return jsonResponse(
        { error: "Bad Request", message: "name, email, date, and time are required" },
        { status: 400 }
      );
    }

    // 2. Look up the website by domain
    const website = await prisma.website.findUnique({
      where: { domain },
      include: { apiKeys: true },
    });

    if (!website) {
      return jsonResponse(
        { error: "Unauthorized", message: "Domain is not registered" },
        { status: 401 }
      );
    }

    // 3. Verify API key
    let activeKey = null;
    for (const keyRecord of website.apiKeys) {
      // Skip if key is expired
      if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
        continue;
      }
      
      const isMatch = await verifyApiKey(apiKey, keyRecord.keyHash);
      if (isMatch) {
        activeKey = keyRecord;
        break;
      }
    }

    if (!activeKey) {
      return jsonResponse(
        { error: "Unauthorized", message: "Invalid API key" },
        { status: 401 }
      );
    }

    // 4. Save booking
    // date will be parsed as a Date object; time will be saved as string
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return jsonResponse(
        { error: "Bad Request", message: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Enforce booking date within current month or next month
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);

    if (parsedDate < todayDate || parsedDate > endOfNextMonth) {
      return jsonResponse(
        { error: "Bad Request", message: "Bookings can only be made for dates within the current month and next month." },
        { status: 400 }
      );
    }

    const db = withRLS(website.id);

    const booking = await db.booking.create({
      data: {
        websiteId: website.id,
        date: parsedDate,
        time: time.trim(),
        name: name.trim(),
        phone: (phone || "").trim(),
        email: email.trim().toLowerCase(),
        message: (message || "").trim(),
        status: "PENDING",
      },
    });

    // 5. Update API Key last used timestamp (asynchronously)
    prisma.websiteApiKey
      .update({
        where: { id: activeKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((e) => console.error("Failed to update API key lastUsedAt:", e));

    // 6. Asynchronously dispatch confirmation and schedule reminders + review requests
    (async () => {
      try {
        const emailConfig = await prisma.websiteEmailConfig.findUnique({
          where: { websiteId: website.id },
        });

        const companyName = website.displayName || "Atención al Cliente";
        const brandColor = emailConfig?.brandColor || "#0284c7";
        const dateStr = parsedDate.toLocaleDateString("es-ES", { dateStyle: "long" });
        const timeStr = time.trim();

        const { sendEmail } = await import("@/lib/email");
        const { generateBookingConfirmationHtml } = await import("@/lib/emailTemplates");

        // A. Immediate Booking Confirmation
        if (!emailConfig || emailConfig.enableBookingConfirm) {
          const html = generateBookingConfirmationHtml({
            recipientName: name.trim(),
            companyName,
            clientDomain: website.domain,
            dateStr,
            timeStr,
            brandColor,
          });

          const sendRes = await sendEmail({
            to: email.trim().toLowerCase(),
            subject: `Confirmación de cita - ${companyName} (${dateStr} a las ${timeStr})`,
            html,
            senderName: emailConfig?.senderName || companyName,
            replyTo: emailConfig?.replyToEmail || undefined,
            clientDomain: website.domain,
          });

          await prisma.scheduledEmail.create({
            data: {
              websiteId: website.id,
              recipientEmail: email.trim().toLowerCase(),
              recipientName: name.trim(),
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

        // B. Schedule Reminder (e.g. 24h before appointment)
        if (!emailConfig || emailConfig.enableBookingReminder) {
          const [hours, minutes] = (time.trim() || "09:00").split(":").map(Number);
          const appointmentDateTime = new Date(parsedDate);
          appointmentDateTime.setHours(hours || 9, minutes || 0, 0, 0);

          const reminderHoursBefore = emailConfig?.reminderHoursBefore || 24;
          const reminderScheduledDate = new Date(appointmentDateTime.getTime() - reminderHoursBefore * 60 * 60 * 1000);

          if (reminderScheduledDate > new Date()) {
            await prisma.scheduledEmail.create({
              data: {
                websiteId: website.id,
                recipientEmail: email.trim().toLowerCase(),
                recipientName: name.trim(),
                subject: `Recordatorio de tu cita mañana en ${companyName}`,
                emailType: "BOOKING_REMINDER",
                status: "PENDING",
                scheduledFor: reminderScheduledDate,
                metadata: { bookingId: booking.id, dateStr, timeStr },
              },
            });
          }
        }

        // C. Schedule Google Review Booster for Booking (e.g. 2h after appointment)
        const isBookingReviewEnabled = emailConfig ? (emailConfig.enableBookingReviewRequest !== undefined ? emailConfig.enableBookingReviewRequest : emailConfig.enableReviewRequest) : true;
        if (isBookingReviewEnabled) {
          const [hours, minutes] = (time.trim() || "09:00").split(":").map(Number);
          const appointmentDateTime = new Date(parsedDate);
          appointmentDateTime.setHours(hours || 9, minutes || 0, 0, 0);

          const reviewDelayHours = emailConfig?.bookingReviewDelayHours || emailConfig?.reviewDelayHours || 2;
          const reviewScheduledDate = new Date(appointmentDateTime.getTime() + reviewDelayHours * 60 * 60 * 1000);

          await prisma.scheduledEmail.create({
            data: {
              websiteId: website.id,
              recipientEmail: email.trim().toLowerCase(),
              recipientName: name.trim(),
              subject: `¿Qué tal fue tu experiencia en ${companyName}? ⭐`,
              emailType: "GOOGLE_REVIEW_REQUEST",
              status: "PENDING",
              scheduledFor: reviewScheduledDate,
              metadata: { bookingId: booking.id, source: "booking" },
            },
          });
        }
      } catch (err) {
        console.error("Async booking email & scheduling error:", err);
      }
    })();

    return jsonResponse({
      success: true,
      message: "Booking requested successfully",
      id: booking.id,
    });
  } catch (error) {
    console.error("Public bookings API error:", error);
    return jsonResponse(
      { error: "Internal Server Error", message: "Failed to request booking" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const domain = (url.searchParams.get("domain") || request.headers.get("x-website-domain") || "").trim().toLowerCase();

    if (!domain) {
      return jsonResponse(
        { error: "Bad Request", message: "Website domain is required" },
        { status: 400 }
      );
    }

    const website = await prisma.website.findUnique({
      where: { domain },
    });

    if (!website) {
      return jsonResponse(
        { error: "NotFound", message: "Domain is not registered" },
        { status: 404 }
      );
    }

    const db = withRLS(website.id);

    const bookings = await db.booking.findMany({
      where: {
        websiteId: website.id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: {
        date: true,
        time: true,
      },
    });

    const occupied = bookings.map((b) => ({
      date: b.date.toISOString().split("T")[0],
      time: b.time,
    }));

    return jsonResponse({
      success: true,
      occupied,
    });
  } catch (error) {
    console.error("GET bookings occupied slots error:", error);
    return jsonResponse(
      { error: "Internal Server Error", message: "Failed to retrieve bookings" },
      { status: 500 }
    );
  }
}

