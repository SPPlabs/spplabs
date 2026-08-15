import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  generateWelcomeContactHtml,
  generateBookingConfirmationHtml,
  generateBookingReminderHtml,
  generateGoogleReviewHtml,
} from "@/lib/emailTemplates";

export async function GET(request) {
  return handleCronDispatch(request);
}

export async function POST(request) {
  return handleCronDispatch(request);
}

async function handleCronDispatch(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const secretParam = searchParams.get("secret");

    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret && expectedSecret.trim() !== "") {
      const isAuthValid =
        secretParam === expectedSecret ||
        authHeader === `Bearer ${expectedSecret}`;
      if (!isAuthValid) {
        return NextResponse.json({ error: "Unauthorized", message: "Invalid cron secret" }, { status: 401 });
      }
    }

    const now = new Date();

    // 1. Fetch pending emails scheduled for now or past
    const pendingEmails = await prisma.scheduledEmail.findMany({
      where: {
        status: "PENDING",
        scheduledFor: { lte: now },
      },
      include: {
        website: {
          include: { emailConfig: true },
        },
      },
      take: 50,
      orderBy: { scheduledFor: "asc" },
    });

    if (pendingEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending emails to dispatch.",
        processedCount: 0,
      });
    }

    let successCount = 0;
    let failedCount = 0;

    // 2. Process each email
    for (const item of pendingEmails) {
      try {
        const website = item.website;
        const config = website?.emailConfig || {
          senderName: website?.displayName || "Atención al Cliente",
          brandColor: "#0284c7",
          googleReviewUrl: null,
        };

        let html = "";
        const meta = (item.metadata && typeof item.metadata === "object") ? item.metadata : {};

        if (item.emailType === "WELCOME_CONTACT") {
          html = generateWelcomeContactHtml({
            recipientName: item.recipientName,
            companyName: website?.displayName,
            clientDomain: website?.domain,
            brandColor: config.brandColor,
            messageSnippet: meta.messageSnippet || "",
          });
        } else if (item.emailType === "BOOKING_CONFIRMATION") {
          html = generateBookingConfirmationHtml({
            recipientName: item.recipientName,
            companyName: website?.displayName,
            clientDomain: website?.domain,
            dateStr: meta.dateStr || "",
            timeStr: meta.timeStr || "",
            brandColor: config.brandColor,
          });
        } else if (item.emailType === "BOOKING_REMINDER") {
          html = generateBookingReminderHtml({
            recipientName: item.recipientName,
            companyName: website?.displayName,
            clientDomain: website?.domain,
            dateStr: meta.dateStr || "",
            timeStr: meta.timeStr || "",
            brandColor: config.brandColor,
          });
        } else if (item.emailType === "GOOGLE_REVIEW_REQUEST") {
          html = generateGoogleReviewHtml({
            recipientName: item.recipientName,
            companyName: website?.displayName,
            clientDomain: website?.domain,
            googleReviewUrl: config.googleReviewUrl || `https://${website?.domain}`,
            brandColor: config.brandColor,
          });
        }

        if (!html) {
          throw new Error(`Unknown or unhandled email template type: ${item.emailType}`);
        }

        const result = await sendEmail({
          to: item.recipientEmail,
          subject: item.subject,
          html,
          senderName: config.senderName || website?.displayName,
          replyTo: config.replyToEmail || undefined,
          clientDomain: website?.domain,
        });

        if (result.success) {
          await prisma.scheduledEmail.update({
            where: { id: item.id },
            data: {
              status: "SENT",
              sentAt: new Date(),
              error: null,
            },
          });
          successCount++;
        } else {
          await prisma.scheduledEmail.update({
            where: { id: item.id },
            data: {
              status: "FAILED",
              error: result.error || "Failed to deliver",
            },
          });
          failedCount++;
        }
      } catch (err) {
        console.error(`Error processing email ID ${item.id}:`, err);
        await prisma.scheduledEmail.update({
          where: { id: item.id },
          data: {
            status: "FAILED",
            error: err.message || "Execution exception",
          },
        });
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: pendingEmails.length,
      successCount,
      failedCount,
    });
  } catch (error) {
    console.error("Cron scheduled-emails error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}
