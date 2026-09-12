import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  generateWelcomeContactHtml,
  generateBookingConfirmationHtml,
  generateBookingReminderHtml,
  generateGoogleReviewHtml,
} from "@/lib/emailTemplates";

let isProcessing = false;
let workerTimer = null;

/**
 * Dispatches all pending scheduled emails whose scheduledFor time has arrived.
 * Can be triggered via HTTP cron endpoint or internal background worker.
 */
export async function dispatchPendingScheduledEmails() {
  if (isProcessing) {
    return { skipped: true, reason: "Worker already in progress" };
  }

  isProcessing = true;
  const now = new Date();

  try {
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
      return { success: true, processedCount: 0, message: "No pending emails." };
    }

    let successCount = 0;
    let failedCount = 0;

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
        const customLogoUrl = config.customLogoUrl || website?.logoUrl || null;

        if (item.emailType === "WELCOME_CONTACT") {
          html = generateWelcomeContactHtml({
            recipientName: item.recipientName,
            companyName: website?.displayName,
            clientDomain: website?.domain,
            brandColor: config.brandColor,
            messageSnippet: meta.messageSnippet || "",
            customLogoUrl,
          });
        } else if (item.emailType === "BOOKING_CONFIRMATION") {
          html = generateBookingConfirmationHtml({
            recipientName: item.recipientName,
            companyName: website?.displayName,
            clientDomain: website?.domain,
            dateStr: meta.dateStr || "",
            timeStr: meta.timeStr || "",
            brandColor: config.brandColor,
            customLogoUrl,
          });
        } else if (item.emailType === "BOOKING_REMINDER") {
          html = generateBookingReminderHtml({
            recipientName: item.recipientName,
            companyName: website?.displayName,
            clientDomain: website?.domain,
            dateStr: meta.dateStr || "",
            timeStr: meta.timeStr || "",
            brandColor: config.brandColor,
            customLogoUrl,
          });
        } else if (item.emailType === "GOOGLE_REVIEW_REQUEST") {
          html = generateGoogleReviewHtml({
            recipientName: item.recipientName,
            companyName: website?.displayName,
            clientDomain: website?.domain,
            googleReviewUrl: config.googleReviewUrl || `https://${website?.domain}`,
            brandColor: config.brandColor,
            customLogoUrl,
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
        console.error(`[EmailCronWorker] Error processing email ID ${item.id}:`, err);
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

    return {
      success: true,
      processedCount: pendingEmails.length,
      successCount,
      failedCount,
    };
  } catch (error) {
    console.error("[EmailCronWorker] Error dispatching scheduled emails:", error);
    return { success: false, error: error.message };
  } finally {
    isProcessing = false;
  }
}

/**
 * Initializes the internal scheduled email background worker in Node.js runtime.
 * Runs once every intervalMs (default 60 seconds) without external crons.
 */
export function startScheduledEmailBackgroundWorker(intervalMs = 60000) {
  if (workerTimer) {
    return;
  }

  console.log(`[EmailCronWorker] Starting background email dispatcher (interval: ${intervalMs}ms)...`);

  // Run initial dispatch check shortly after startup (10s delay to allow DB connections to settle)
  setTimeout(() => {
    dispatchPendingScheduledEmails().catch((err) => {
      console.error("[EmailCronWorker] Initial startup dispatch check failed:", err);
    });
  }, 10000);

  // Set recurring interval
  workerTimer = setInterval(() => {
    dispatchPendingScheduledEmails().catch((err) => {
      console.error("[EmailCronWorker] Recurring background dispatch error:", err);
    });
  }, intervalMs);

  // Unref timer so it does not block graceful process exit
  if (typeof workerTimer.unref === "function") {
    workerTimer.unref();
  }
}
