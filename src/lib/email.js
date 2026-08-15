import { Resend } from "resend";

let resendClient = null;

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey.trim() !== "") {
      resendClient = new Resend(apiKey.trim());
    }
  }
  return resendClient;
}

/**
 * Sends an email using Resend SDK with multi-tenant sender branding.
 * If RESEND_API_KEY is not defined, it logs the message for local development safely.
 */
export async function sendEmail({
  to,
  subject,
  html,
  senderName = "Atención al Cliente",
  replyTo = null,
  clientDomain = "spplabs.es",
}) {
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || "notificaciones@spplabs.es";
  const fromFormatted = `${senderName} <${fromEmail}>`;

  const client = getResendClient();

  if (!client) {
    console.log(`[EMAIL DEV MOCK] From: ${fromFormatted} -> To: ${to} | Subject: "${subject}"`);
    return {
      success: true,
      mock: true,
      id: `mock_email_${Date.now()}`,
      message: "Email simulated successfully in development mode (RESEND_API_KEY not set).",
    };
  }

  try {
    const response = await client.emails.send({
      from: fromFormatted,
      to: [to],
      subject,
      html,
      reply_to: replyTo || undefined,
    });

    if (response.error) {
      console.error("[RESEND ERROR]", response.error);
      return { success: false, error: response.error.message || "Failed to send email via Resend" };
    }

    return { success: true, id: response.data?.id, data: response.data };
  } catch (err) {
    console.error("[EMAIL SEND EXCEPTION]", err);
    return { success: false, error: err.message || "Unknown email delivery error" };
  }
}
