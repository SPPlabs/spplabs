import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spp_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized", message: "Missing session" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session) {
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
      include: { emailConfig: true },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: website.emailConfig || {
        senderName: website.displayName || "Atención al Cliente",
        replyToEmail: "",
        googleReviewUrl: "",
        enableWelcomeEmail: true,
        enableBookingConfirm: true,
        enableBookingReminder: true,
        reminderHoursBefore: 24,
        enableReviewRequest: true,
        reviewDelayHours: 2,
        enableBookingReviewRequest: true,
        bookingReviewDelayHours: 2,
        enableContactReviewRequest: false,
        contactReviewDelayHours: 24,
        brandColor: "#0284c7",
        customLogoUrl: "",
      },
    });
  } catch (error) {
    console.error("GET email-config error:", error);
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const {
      domain,
      senderName,
      replyToEmail,
      googleReviewUrl,
      enableWelcomeEmail,
      enableBookingConfirm,
      enableBookingReminder,
      reminderHoursBefore,
      enableReviewRequest,
      reviewDelayHours,
      enableBookingReviewRequest,
      bookingReviewDelayHours,
      enableContactReviewRequest,
      contactReviewDelayHours,
      brandColor,
      customLogoUrl,
    } = body;

    let targetDomain = session.domain;
    if (session.role === "ADMIN" && domain) {
      targetDomain = domain.trim().toLowerCase();
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    const isBookingReviewEnabled = enableBookingReviewRequest !== undefined ? Boolean(enableBookingReviewRequest) : (enableReviewRequest !== undefined ? Boolean(enableReviewRequest) : true);
    const bookingDelay = Number(bookingReviewDelayHours) || Number(reviewDelayHours) || 2;
    const isContactReviewEnabled = Boolean(enableContactReviewRequest);
    const contactDelay = Number(contactReviewDelayHours) || 24;

    const updatedConfig = await prisma.websiteEmailConfig.upsert({
      where: { websiteId: website.id },
      create: {
        websiteId: website.id,
        senderName: senderName?.trim() || website.displayName,
        replyToEmail: replyToEmail?.trim() || null,
        googleReviewUrl: googleReviewUrl?.trim() || null,
        enableWelcomeEmail: Boolean(enableWelcomeEmail),
        enableBookingConfirm: Boolean(enableBookingConfirm),
        enableBookingReminder: Boolean(enableBookingReminder),
        reminderHoursBefore: Number(reminderHoursBefore) || 24,
        enableReviewRequest: isBookingReviewEnabled,
        reviewDelayHours: bookingDelay,
        enableBookingReviewRequest: isBookingReviewEnabled,
        bookingReviewDelayHours: bookingDelay,
        enableContactReviewRequest: isContactReviewEnabled,
        contactReviewDelayHours: contactDelay,
        brandColor: brandColor?.trim() || "#0284c7",
        customLogoUrl: customLogoUrl?.trim() || null,
      },
      update: {
        senderName: senderName?.trim() || website.displayName,
        replyToEmail: replyToEmail?.trim() || null,
        googleReviewUrl: googleReviewUrl?.trim() || null,
        enableWelcomeEmail: Boolean(enableWelcomeEmail),
        enableBookingConfirm: Boolean(enableBookingConfirm),
        enableBookingReminder: Boolean(enableBookingReminder),
        reminderHoursBefore: Number(reminderHoursBefore) || 24,
        enableReviewRequest: isBookingReviewEnabled,
        reviewDelayHours: bookingDelay,
        enableBookingReviewRequest: isBookingReviewEnabled,
        bookingReviewDelayHours: bookingDelay,
        enableContactReviewRequest: isContactReviewEnabled,
        contactReviewDelayHours: contactDelay,
        brandColor: brandColor?.trim() || "#0284c7",
        customLogoUrl: customLogoUrl?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Configuración de email actualizada correctamente",
      data: updatedConfig,
    });
  } catch (error) {
    console.error("POST email-config error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}
