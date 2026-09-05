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

    const cfg = website.emailConfig;
    const defaultData = {
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
    };

    const responseData = cfg
      ? {
          ...cfg,
          senderName: cfg.senderName || website.displayName || "Atención al Cliente",
          replyToEmail: cfg.replyToEmail || "",
          googleReviewUrl: cfg.googleReviewUrl || "",
          enableWelcomeEmail: cfg.enableWelcomeEmail ?? true,
          enableBookingConfirm: cfg.enableBookingConfirm ?? true,
          enableBookingReminder: cfg.enableBookingReminder ?? true,
          reminderHoursBefore: cfg.reminderHoursBefore ?? 24,
          enableReviewRequest: cfg.enableBookingReviewRequest ?? cfg.enableReviewRequest ?? true,
          reviewDelayHours: cfg.bookingReviewDelayHours ?? cfg.reviewDelayHours ?? 2,
          enableBookingReviewRequest: cfg.enableBookingReviewRequest ?? cfg.enableReviewRequest ?? true,
          bookingReviewDelayHours: cfg.bookingReviewDelayHours ?? cfg.reviewDelayHours ?? 2,
          enableContactReviewRequest: cfg.enableContactReviewRequest ?? false,
          contactReviewDelayHours: cfg.contactReviewDelayHours ?? 24,
          brandColor: cfg.brandColor || "#0284c7",
          customLogoUrl: cfg.customLogoUrl || "",
        }
      : defaultData;

    return NextResponse.json({
      success: true,
      data: responseData,
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

    const isBookingReviewEnabled = (enableBookingReviewRequest !== undefined && enableBookingReviewRequest !== null)
      ? Boolean(enableBookingReviewRequest)
      : ((enableReviewRequest !== undefined && enableReviewRequest !== null)
          ? Boolean(enableReviewRequest)
          : true);

    const bookingDelay = (bookingReviewDelayHours !== undefined && bookingReviewDelayHours !== null && !isNaN(Number(bookingReviewDelayHours)))
      ? Number(bookingReviewDelayHours)
      : ((reviewDelayHours !== undefined && reviewDelayHours !== null && !isNaN(Number(reviewDelayHours)))
          ? Number(reviewDelayHours)
          : 2);

    const isContactReviewEnabled = (enableContactReviewRequest !== undefined && enableContactReviewRequest !== null)
      ? Boolean(enableContactReviewRequest)
      : false;

    const contactDelay = (contactReviewDelayHours !== undefined && contactReviewDelayHours !== null && !isNaN(Number(contactReviewDelayHours)))
      ? Number(contactReviewDelayHours)
      : 24;

    const reminderHours = (reminderHoursBefore !== undefined && reminderHoursBefore !== null && !isNaN(Number(reminderHoursBefore)))
      ? Number(reminderHoursBefore)
      : 24;

    const baseData = {
      senderName: senderName?.trim() || website.displayName,
      replyToEmail: replyToEmail?.trim() || null,
      googleReviewUrl: googleReviewUrl?.trim() || null,
      enableWelcomeEmail: enableWelcomeEmail !== undefined && enableWelcomeEmail !== null ? Boolean(enableWelcomeEmail) : true,
      enableBookingConfirm: enableBookingConfirm !== undefined && enableBookingConfirm !== null ? Boolean(enableBookingConfirm) : true,
      enableBookingReminder: enableBookingReminder !== undefined && enableBookingReminder !== null ? Boolean(enableBookingReminder) : true,
      reminderHoursBefore: reminderHours,
      enableReviewRequest: isBookingReviewEnabled,
      reviewDelayHours: bookingDelay,
      enableBookingReviewRequest: isBookingReviewEnabled,
      bookingReviewDelayHours: bookingDelay,
      enableContactReviewRequest: isContactReviewEnabled,
      contactReviewDelayHours: contactDelay,
      brandColor: brandColor?.trim() || "#0284c7",
    };

    const updateData = { ...baseData };
    if (customLogoUrl !== undefined) {
      updateData.customLogoUrl = customLogoUrl && customLogoUrl.trim() ? customLogoUrl.trim() : null;
    }

    const updatedConfig = await prisma.websiteEmailConfig.upsert({
      where: { websiteId: website.id },
      create: {
        websiteId: website.id,
        ...baseData,
        customLogoUrl: customLogoUrl && customLogoUrl.trim() ? customLogoUrl.trim() : null,
      },
      update: updateData,
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
