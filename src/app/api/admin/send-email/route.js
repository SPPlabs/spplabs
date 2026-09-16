import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { sendEmail } from "@/lib/email";
import {
  generateWelcomeContactHtml,
  generateBookingConfirmationHtml,
  generateBookingReminderHtml,
  generateGoogleReviewHtml,
  generateCustomEmailHtml,
} from "@/lib/emailTemplates";

// Extract valid, normalized unique emails from string or array
function extractEmails(input) {
  if (!input) return [];
  let rawList = [];
  if (Array.isArray(input)) {
    rawList = input;
  } else if (typeof input === "string") {
    rawList = input.split(/[\s,;]+/);
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const uniqueMap = new Map();

  for (const item of rawList) {
    if (typeof item !== "string") continue;
    const clean = item.trim().toLowerCase();
    if (clean && emailRegex.test(clean)) {
      if (!uniqueMap.has(clean)) {
        uniqueMap.set(clean, clean);
      }
    }
  }

  return Array.from(uniqueMap.values());
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
      recipients,
      timing = "instant", // "instant" | "scheduled"
      scheduledFor, // ISO Date string if timing === "scheduled"
      templateType = "CUSTOM", // "WELCOME_CONTACT" | "BOOKING_REMINDER" | "GOOGLE_REVIEW_REQUEST" | "BOOKING_CONFIRMATION" | "CUSTOM"
      subject,
      recipientName,
      messageBody,
      dateStr,
      timeStr,
      googleReviewUrl,
      ctaText,
      ctaUrl,
      badgeText,
    } = body;

    // 1. Resolve Target Domain
    let targetDomain = session.domain;
    if (session.role === "ADMIN" && domain) {
      targetDomain = domain.trim().toLowerCase();
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
      include: { emailConfig: true },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    const config = website.emailConfig || {
      senderName: website.displayName || "Atención al Cliente",
      brandColor: "#0284c7",
      googleReviewUrl: null,
      customLogoUrl: null,
    };

    // 2. Validate Recipients
    const validRecipients = extractEmails(recipients);
    if (validRecipients.length === 0) {
      return NextResponse.json({
        error: "BadRequest",
        message: "Debes especificar al menos una dirección de correo electrónico válida.",
      }, { status: 400 });
    }

    if (validRecipients.length > 500) {
      return NextResponse.json({
        error: "BadRequest",
        message: "El límite máximo por envío es de 500 destinatarios.",
      }, { status: 400 });
    }

    // 3. Validate Scheduling (if applicable)
    let scheduledDate = new Date();
    const isScheduled = timing === "scheduled";

    if (isScheduled) {
      if (!scheduledFor) {
        return NextResponse.json({
          error: "BadRequest",
          message: "Debes seleccionar una fecha y hora para el envío programado.",
        }, { status: 400 });
      }
      scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json({
          error: "BadRequest",
          message: "La fecha y hora programada no es válida.",
        }, { status: 400 });
      }
      if (scheduledDate.getTime() < Date.now() + 30000) {
        return NextResponse.json({
          error: "BadRequest",
          message: "La fecha y hora programada debe ser en el futuro.",
        }, { status: 400 });
      }
    }

    // 4. Resolve Template & Subject
    const customLogoUrl = config.customLogoUrl || website.logoUrl || null;
    let defaultSubject = "Comunicado Oficial";
    let dbEmailType = "WELCOME_CONTACT";

    if (templateType === "WELCOME_CONTACT") {
      defaultSubject = `¡Te damos la bienvenida a ${website.displayName}!`;
      dbEmailType = "WELCOME_CONTACT";
    } else if (templateType === "BOOKING_CONFIRMATION") {
      defaultSubject = `Confirmación de cita en ${website.displayName}`;
      dbEmailType = "BOOKING_CONFIRMATION";
    } else if (templateType === "BOOKING_REMINDER") {
      defaultSubject = `Recordatorio de tu cita en ${website.displayName}`;
      dbEmailType = "BOOKING_REMINDER";
    } else if (templateType === "GOOGLE_REVIEW_REQUEST") {
      defaultSubject = `¿Qué tal fue tu experiencia con ${website.displayName}? ⭐⭐⭐⭐⭐`;
      dbEmailType = "GOOGLE_REVIEW_REQUEST";
    } else {
      defaultSubject = `Novedades importantes de ${website.displayName}`;
      dbEmailType = "WELCOME_CONTACT"; // Mapped to existing DB enum with isCustom metadata
    }

    const finalSubject = subject && subject.trim() !== "" ? subject.trim() : defaultSubject;

    // Helper to generate HTML for a specific recipient
    const buildHtml = (rEmail) => {
      const displayName = recipientName?.trim() || rEmail.split("@")[0];

      if (templateType === "WELCOME_CONTACT") {
        return generateWelcomeContactHtml({
          recipientName: displayName,
          companyName: website.displayName,
          clientDomain: website.domain,
          brandColor: config.brandColor,
          messageSnippet: messageBody?.trim() || "",
          customLogoUrl,
        });
      }

      if (templateType === "BOOKING_CONFIRMATION") {
        return generateBookingConfirmationHtml({
          recipientName: displayName,
          companyName: website.displayName,
          clientDomain: website.domain,
          dateStr: dateStr?.trim() || "Fecha acordada",
          timeStr: timeStr?.trim() || "Horario convenido",
          brandColor: config.brandColor,
          customLogoUrl,
        });
      }

      if (templateType === "BOOKING_REMINDER") {
        return generateBookingReminderHtml({
          recipientName: displayName,
          companyName: website.displayName,
          clientDomain: website.domain,
          dateStr: dateStr?.trim() || "Mañana",
          timeStr: timeStr?.trim() || "Horario convenido",
          brandColor: config.brandColor,
          customLogoUrl,
        });
      }

      if (templateType === "GOOGLE_REVIEW_REQUEST") {
        return generateGoogleReviewHtml({
          recipientName: displayName,
          companyName: website.displayName,
          clientDomain: website.domain,
          googleReviewUrl: googleReviewUrl?.trim() || config.googleReviewUrl || `https://${website.domain}`,
          brandColor: config.brandColor,
          customLogoUrl,
        });
      }

      // CUSTOM
      return generateCustomEmailHtml({
        recipientName: displayName,
        companyName: website.displayName,
        clientDomain: website.domain,
        brandColor: config.brandColor,
        customLogoUrl,
        subject: finalSubject,
        messageBody: messageBody?.trim() || "",
        ctaText: ctaText?.trim() || null,
        ctaUrl: ctaUrl?.trim() || null,
        badgeText: badgeText?.trim() || "Comunicado Oficial",
      });
    };

    // 5. Dispatch or Schedule
    let sentCount = 0;
    let scheduledCount = 0;
    let failedCount = 0;
    const errors = [];

    if (isScheduled) {
      // Create pending scheduled records
      const createPromises = validRecipients.map(async (recipientEmail) => {
        const compiledHtml = buildHtml(recipientEmail);
        const displayName = recipientName?.trim() || recipientEmail.split("@")[0];

        return prisma.scheduledEmail.create({
          data: {
            websiteId: website.id,
            recipientEmail,
            recipientName: displayName,
            subject: finalSubject,
            emailType: dbEmailType,
            status: "PENDING",
            scheduledFor: scheduledDate,
            metadata: {
              timing: "scheduled",
              templateType,
              isCustom: templateType === "CUSTOM",
              customHtml: compiledHtml,
              messageBody: messageBody || null,
              dateStr: dateStr || null,
              timeStr: timeStr || null,
              ctaText: ctaText || null,
              ctaUrl: ctaUrl || null,
              badgeText: badgeText || null,
            },
          },
        });
      });

      await Promise.all(createPromises);
      scheduledCount = validRecipients.length;

      return NextResponse.json({
        success: true,
        timing: "scheduled",
        scheduledFor: scheduledDate.toISOString(),
        totalRecipients: validRecipients.length,
        scheduledCount,
        message: validRecipients.length === 1
          ? `Correo programado con éxito para el ${scheduledDate.toLocaleDateString("es-ES")} a las ${scheduledDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}.`
          : `${scheduledCount} correos programados con éxito para el ${scheduledDate.toLocaleDateString("es-ES")} a las ${scheduledDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}.`,
      });
    }

    // Instant Sending
    for (const recipientEmail of validRecipients) {
      const compiledHtml = buildHtml(recipientEmail);
      const displayName = recipientName?.trim() || recipientEmail.split("@")[0];

      try {
        const sendResult = await sendEmail({
          to: recipientEmail,
          subject: finalSubject,
          html: compiledHtml,
          senderName: config.senderName || website.displayName,
          replyTo: config.replyToEmail || undefined,
          clientDomain: website.domain,
        });

        const isSuccess = Boolean(sendResult.success);

        await prisma.scheduledEmail.create({
          data: {
            websiteId: website.id,
            recipientEmail,
            recipientName: displayName,
            subject: finalSubject,
            emailType: dbEmailType,
            status: isSuccess ? "SENT" : "FAILED",
            scheduledFor: new Date(),
            sentAt: isSuccess ? new Date() : null,
            error: isSuccess ? null : (sendResult.error || "Delivery failed"),
            metadata: {
              timing: "instant",
              templateType,
              isCustom: templateType === "CUSTOM",
              sendResult,
              customHtml: compiledHtml,
            },
          },
        });

        if (isSuccess) {
          sentCount++;
        } else {
          failedCount++;
          errors.push({ recipient: recipientEmail, error: sendResult.error });
        }
      } catch (err) {
        console.error(`Error sending email to ${recipientEmail}:`, err);
        failedCount++;
        errors.push({ recipient: recipientEmail, error: err.message });

        await prisma.scheduledEmail.create({
          data: {
            websiteId: website.id,
            recipientEmail,
            recipientName: displayName,
            subject: finalSubject,
            emailType: dbEmailType,
            status: "FAILED",
            scheduledFor: new Date(),
            sentAt: null,
            error: err.message || "Unknown error",
            metadata: { timing: "instant", templateType, isCustom: templateType === "CUSTOM" },
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: sentCount > 0 || failedCount === 0,
      timing: "instant",
      totalRecipients: validRecipients.length,
      sentCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: validRecipients.length === 1
        ? (sentCount > 0 ? `Correo enviado con éxito a ${validRecipients[0]}.` : `No se pudo entregar el correo a ${validRecipients[0]}.`)
        : `${sentCount} de ${validRecipients.length} correos enviados con éxito.${failedCount > 0 ? ` (${failedCount} fallaron)` : ""}`,
    });
  } catch (error) {
    console.error("POST /api/admin/send-email exception:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}
