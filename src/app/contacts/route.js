import { NextResponse } from "next/server";
import { verifyApiKey, hashApiKey, isLegacyApiKeyHash } from "@/lib/crypto";
import { prisma, withRLS } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    // 1. Extract API Key and Domain from headers or body
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

    // Field inputs
    const { name, phone, email, message } = body;

    // Validate request inputs
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

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    // Field content and character limit validations
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      return jsonResponse(
        { error: "Bad Request", message: "Name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!trimmedEmail || trimmedEmail.length > 120 || !emailRegex.test(trimmedEmail)) {
      return jsonResponse(
        { error: "Bad Request", message: "A valid email address is required (max 120 characters)." },
        { status: 400 }
      );
    }

    if (trimmedPhone) {
      const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{4,20}$/;
      if (trimmedPhone.length < 6 || trimmedPhone.length > 30 || !phoneRegex.test(trimmedPhone)) {
        return jsonResponse(
          { error: "Bad Request", message: "Phone number format is invalid (6 to 30 characters)." },
          { status: 400 }
        );
      }
    }

    if (!trimmedMessage || trimmedMessage.length < 5 || trimmedMessage.length > 3000) {
      return jsonResponse(
        { error: "Bad Request", message: "Message must be between 5 and 3,000 characters." },
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

    const db = withRLS(website.id);

    // 4. Save contact form submission
    const submission = await db.contactForm.create({
      data: {
        websiteId: website.id,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        message: trimmedMessage,
      },
    });

    // Increment aggregated monthly metrics asynchronously (immune to future deletions)
    import("@/lib/monthlyMetrics").then(({ incrementMonthlyContactForms }) => {
      incrementMonthlyContactForms(website.id, new Date());
    }).catch(e => console.error("Failed to increment monthly contact metrics:", e));

    // 5. Update API Key last used timestamp and lazily upgrade legacy Argon2id hashes to SHA-256
    const keyUpdateData = { lastUsedAt: new Date() };
    if (isLegacyApiKeyHash(activeKey.keyHash)) {
      keyUpdateData.keyHash = hashApiKey(apiKey);
    }

    prisma.websiteApiKey
      .update({
        where: { id: activeKey.id },
        data: keyUpdateData,
      })
      .catch((e) => console.error("Failed to update API key lastUsedAt/keyHash:", e));

    // 6. Trigger automated welcome/confirmation email asynchronously
    (async () => {
      try {
        const emailConfig = await prisma.websiteEmailConfig.findUnique({
          where: { websiteId: website.id },
        });

        if (!emailConfig || emailConfig.enableWelcomeEmail) {
          const { sendEmail } = await import("@/lib/email");
          const { generateWelcomeContactHtml } = await import("@/lib/emailTemplates");

          const companyName = website.displayName || "Atención al Cliente";
          const brandColor = emailConfig?.brandColor || "#0284c7";
          const customLogoUrl = emailConfig?.customLogoUrl || website.logoUrl || null;

          const html = generateWelcomeContactHtml({
            recipientName: name.trim(),
            companyName,
            clientDomain: website.domain,
            brandColor,
            messageSnippet: message.trim().slice(0, 200),
            customLogoUrl,
          });

          const sendRes = await sendEmail({
            to: email.trim().toLowerCase(),
            subject: `Hemos recibido tu mensaje - ${companyName}`,
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
              subject: `Hemos recibido tu mensaje - ${companyName}`,
              emailType: "WELCOME_CONTACT",
              status: sendRes.success ? "SENT" : "FAILED",
              scheduledFor: new Date(),
              sentAt: sendRes.success ? new Date() : null,
              error: sendRes.error || null,
              metadata: { messageId: submission.id },
            },
          });
        }

        // B. Schedule or Send Google Review Booster for Contact Form
        if (emailConfig && emailConfig.enableContactReviewRequest) {
          const companyName = website.displayName || "Atención al Cliente";
          const customLogoUrl = emailConfig?.customLogoUrl || website.logoUrl || null;
          const delayHours = emailConfig.contactReviewDelayHours !== undefined ? emailConfig.contactReviewDelayHours : 24;

          if (delayHours === 0) {
            // Immediate dispatch
            const { sendEmail } = await import("@/lib/email");
            const { generateGoogleReviewHtml } = await import("@/lib/emailTemplates");
            const brandColor = emailConfig?.brandColor || "#0284c7";

            const reviewHtml = generateGoogleReviewHtml({
              recipientName: name.trim(),
              companyName,
              clientDomain: website.domain,
              googleReviewUrl: emailConfig.googleReviewUrl || `https://${website.domain}`,
              brandColor,
              customLogoUrl,
            });

            const sendRes = await sendEmail({
              to: email.trim().toLowerCase(),
              subject: `¿Qué tal fue tu experiencia con ${companyName}? ⭐`,
              html: reviewHtml,
              senderName: emailConfig?.senderName || companyName,
              replyTo: emailConfig?.replyToEmail || undefined,
              clientDomain: website.domain,
            });

            await prisma.scheduledEmail.create({
              data: {
                websiteId: website.id,
                recipientEmail: email.trim().toLowerCase(),
                recipientName: name.trim(),
                subject: `¿Qué tal fue tu experiencia con ${companyName}? ⭐`,
                emailType: "GOOGLE_REVIEW_REQUEST",
                status: sendRes.success ? "SENT" : "FAILED",
                scheduledFor: new Date(),
                sentAt: sendRes.success ? new Date() : null,
                error: sendRes.error || null,
                metadata: { contactId: submission.id, source: "contact_form_immediate" },
              },
            });
          } else {
            // Delayed dispatch
            const reviewScheduledDate = new Date(Date.now() + delayHours * 60 * 60 * 1000);

            await prisma.scheduledEmail.create({
              data: {
                websiteId: website.id,
                recipientEmail: email.trim().toLowerCase(),
                recipientName: name.trim(),
                subject: `¿Qué tal fue tu experiencia con ${companyName}? ⭐`,
                emailType: "GOOGLE_REVIEW_REQUEST",
                status: "PENDING",
                scheduledFor: reviewScheduledDate,
                metadata: { contactId: submission.id, source: "contact_form" },
              },
            });
          }
        }
      } catch (err) {
        console.error("Async contact email & review booster error:", err);
      }
    })();

    return jsonResponse({
      success: true,
      message: "Contact form submitted successfully",
      id: submission.id,
    });
  } catch (error) {
    console.error("Public contacts API error:", error);
    return jsonResponse(
      { error: "Internal Server Error", message: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
