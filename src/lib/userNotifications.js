import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { generateTenantNotificationHtml } from "@/lib/emailTemplates";

let tableEnsured = false;

/**
 * Ensures the user_notification_preferences table exists in PostgreSQL.
 */
export async function ensureNotificationPreferencesTable() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS "user_notification_preferences" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "website_id" UUID NOT NULL,
        "enabled" BOOLEAN NOT NULL DEFAULT false,
        "notification_email" TEXT,
        "notify_contacts" BOOLEAN NOT NULL DEFAULT true,
        "notify_bookings" BOOLEAN NOT NULL DEFAULT true,
        "notify_ai_chats" BOOLEAN NOT NULL DEFAULT false,
        "notify_spp_announcements" BOOLEAN NOT NULL DEFAULT true,
        "notify_monthly_report" BOOLEAN NOT NULL DEFAULT true,
        "notify_general_summary" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "user_notification_preferences_website_id_key" 
      ON "user_notification_preferences"("website_id");

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'user_notification_preferences_website_id_fkey'
        ) THEN
          ALTER TABLE "user_notification_preferences" 
          ADD CONSTRAINT "user_notification_preferences_website_id_fkey" 
          FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    tableEnsured = true;
  } catch (err) {
    // If DB is unreachable or in mock mode, ignore safely
    console.warn("Could not run ensureNotificationPreferencesTable raw SQL:", err.message);
  }
}

/**
 * Default notification preferences for a website tenant.
 */
export const DEFAULT_NOTIFICATION_PREFERENCES = {
  enabled: false, // Default is disabled per user requirements
  notificationEmail: "",
  notifyContacts: true,
  notifyBookings: true,
  notifyAiChats: false, // Default false per user example
  notifySppAnnouncements: true,
  notifyMonthlyReport: true,
  notifyGeneralSummary: true,
};

/**
 * Fetches user notification preferences for a given websiteId.
 */
export async function getUserNotificationPreferences(websiteId) {
  if (!websiteId) return DEFAULT_NOTIFICATION_PREFERENCES;
  await ensureNotificationPreferencesTable();

  try {
    const pref = await prisma.userNotificationPreference.findUnique({
      where: { websiteId },
    });

    if (!pref) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, websiteId };
    }

    return {
      enabled: pref.enabled ?? false,
      notificationEmail: pref.notificationEmail || "",
      notifyContacts: pref.notifyContacts ?? true,
      notifyBookings: pref.notifyBookings ?? true,
      notifyAiChats: pref.notifyAiChats ?? false,
      notifySppAnnouncements: pref.notifySppAnnouncements ?? true,
      notifyMonthlyReport: pref.notifyMonthlyReport ?? true,
      notifyGeneralSummary: pref.notifyGeneralSummary ?? true,
      updatedAt: pref.updatedAt,
    };
  } catch (err) {
    console.error("Error in getUserNotificationPreferences:", err);
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, websiteId };
  }
}

/**
 * Updates or creates user notification preferences for a given websiteId.
 */
export async function saveUserNotificationPreferences(websiteId, data) {
  if (!websiteId) throw new Error("websiteId is required");
  await ensureNotificationPreferencesTable();

  const trimmedEmail = typeof data.notificationEmail === "string" ? data.notificationEmail.trim().toLowerCase() : "";

  return await prisma.userNotificationPreference.upsert({
    where: { websiteId },
    create: {
      websiteId,
      enabled: Boolean(data.enabled),
      notificationEmail: trimmedEmail,
      notifyContacts: data.notifyContacts !== undefined ? Boolean(data.notifyContacts) : true,
      notifyBookings: data.notifyBookings !== undefined ? Boolean(data.notifyBookings) : true,
      notifyAiChats: data.notifyAiChats !== undefined ? Boolean(data.notifyAiChats) : false,
      notifySppAnnouncements: data.notifySppAnnouncements !== undefined ? Boolean(data.notifySppAnnouncements) : true,
      notifyMonthlyReport: data.notifyMonthlyReport !== undefined ? Boolean(data.notifyMonthlyReport) : true,
      notifyGeneralSummary: data.notifyGeneralSummary !== undefined ? Boolean(data.notifyGeneralSummary) : true,
    },
    update: {
      enabled: Boolean(data.enabled),
      notificationEmail: trimmedEmail,
      notifyContacts: data.notifyContacts !== undefined ? Boolean(data.notifyContacts) : true,
      notifyBookings: data.notifyBookings !== undefined ? Boolean(data.notifyBookings) : true,
      notifyAiChats: data.notifyAiChats !== undefined ? Boolean(data.notifyAiChats) : false,
      notifySppAnnouncements: data.notifySppAnnouncements !== undefined ? Boolean(data.notifySppAnnouncements) : true,
      notifyMonthlyReport: data.notifyMonthlyReport !== undefined ? Boolean(data.notifyMonthlyReport) : true,
      notifyGeneralSummary: data.notifyGeneralSummary !== undefined ? Boolean(data.notifyGeneralSummary) : true,
      updatedAt: new Date(),
    },
  });
}

/**
 * Dispatches an automated email notification to the tenant/owner of the website.
 * Follows all user preference filters, uses SPP Labs branding, info@spplabs.es reply-to,
 * and maintains privacy-first teaser text leading to dashboard.
 * 
 * @param {Object} options
 * @param {string} options.websiteId
 * @param {string} [options.type]
 * @param {string} [options.title]
 * @param {string} [options.message]
 * @param {string} [options.ctaText]
 * @param {string} [options.ctaUrl]
 * @param {Array<{ label: string, value: string } | string>} [options.summaryItems]
 */
export async function sendTenantNotification({
  websiteId,
  type = "general_summary", // "contact" | "booking" | "ai_chat" | "spp_announcement" | "monthly_report" | "general_summary"
  title = "",
  message = "",
  ctaText = "",
  ctaUrl = "/dashboard",
  summaryItems = [],
}) {
  try {
    if (!websiteId) return { skipped: true, reason: "No websiteId provided" };

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        userNotificationPreference: true,
        emailConfig: true,
      },
    });

    if (!website) return { skipped: true, reason: "Website not found" };

    const prefs = website.userNotificationPreference || DEFAULT_NOTIFICATION_PREFERENCES;

    // 1. Check if notifications are enabled overall
    if (!prefs.enabled) {
      return { skipped: true, reason: "Notifications disabled by tenant" };
    }

    // 2. Check granular preference filters
    if (type === "contact" && !prefs.notifyContacts) {
      return { skipped: true, reason: "Contact notifications disabled by tenant" };
    }
    if (type === "booking" && !prefs.notifyBookings) {
      return { skipped: true, reason: "Booking notifications disabled by tenant" };
    }
    if (type === "ai_chat" && !prefs.notifyAiChats) {
      return { skipped: true, reason: "AI Chat notifications disabled by tenant" };
    }
    if (type === "spp_announcement" && !prefs.notifySppAnnouncements) {
      return { skipped: true, reason: "SPP Announcements disabled by tenant" };
    }
    if (type === "monthly_report" && !prefs.notifyMonthlyReport) {
      return { skipped: true, reason: "Monthly Report notifications disabled by tenant" };
    }
    if (type === "general_summary" && !prefs.notifyGeneralSummary) {
      return { skipped: true, reason: "General summary notifications disabled by tenant" };
    }

    // 3. Resolve destination email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    let recipientEmail = prefs.notificationEmail?.trim();

    if (!recipientEmail || !emailRegex.test(recipientEmail)) {
      // Fallback to website emailConfig replyToEmail or null
      recipientEmail = website.emailConfig?.replyToEmail?.trim();
    }

    if (!recipientEmail || !emailRegex.test(recipientEmail)) {
      return { skipped: true, reason: "No valid destination email configured" };
    }

    // 4. Generate Subject
    const subjectMap = {
      contact: `Nueva solicitud de contacto en tu web - SPP Labs`,
      booking: `Nueva cita agendada en tu calendario - SPP Labs`,
      ai_chat: `Nueva conversación con tu Chatbot IA - SPP Labs`,
      spp_announcement: `Nuevo comunicado de SPP Labs en tu panel`,
      monthly_report: `Tu Informe Mensual de rendimiento ya está disponible - SPP Labs`,
      general_summary: `Resumen de nueva actividad en tu web - SPP Labs`,
    };

    const emailSubject = title ? `${title} - SPP Labs` : (subjectMap[type] || `Nueva notificación en tu panel - SPP Labs`);

    // 5. Build HTML
    const html = generateTenantNotificationHtml({
      notificationType: type,
      recipientName: website.displayName || "",
      clientDomain: website.domain,
      title,
      message,
      ctaText,
      ctaUrl,
      summaryItems,
      unsubscribeUrl: `/dashboard?openSettings=notifications`,
    });

    // 6. Send Email with sender "SPP Labs" and reply-to "info@spplabs.es"
    const result = await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      html,
      senderName: "SPP Labs",
      replyTo: "info@spplabs.es",
      clientDomain: website.domain,
    });

    return { success: true, result, recipientEmail };
  } catch (error) {
    console.error("sendTenantNotification exception:", error);
    return { success: false, error: error.message };
  }
}
