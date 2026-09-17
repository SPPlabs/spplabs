/**
 * Responsive HTML Email Templates for Multi-Tenant SPP Labs Engine
 * Fully compatible with Gmail, Outlook, Apple Mail and Mobile Email Clients.
 */

function getBaseStyles(brandColor = "#0284c7") {
  return `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background-color: #f8fafc;
    margin: 0;
    padding: 0;
    width: 100% !important;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  `;
}

function getSvgStar(fillColor = "#f59e0b", size = 28, style = "display: inline-block; vertical-align: middle;") {
  return `<span style="display: inline-block; color: ${fillColor}; font-size: ${size}px; line-height: 1; vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; mso-line-height-rule: exactly; ${style}">&#9733;</span>`;
}

function getSvgCalendar(strokeColor = "#1e40af", size = 15) {
  return `<span style="display: inline-block; margin-right: 6px; font-size: ${size || 15}px; line-height: 1; vertical-align: -1px;">&#128197;</span>`;
}

function getSvgClock(strokeColor = "#92400e", size = 15) {
  return `<span style="display: inline-block; margin-right: 6px; font-size: ${size || 15}px; line-height: 1; vertical-align: -1px;">&#9200;</span>`;
}

function getSvgCheck(strokeColor = "#166534", size = 15) {
  return `<span style="display: inline-block; width: 17px; height: 17px; line-height: 17px; text-align: center; border-radius: 50%; background-color: ${strokeColor}; color: #ffffff; font-size: 11px; font-weight: 900; margin-right: 7px; vertical-align: -1px; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; mso-line-height-rule: exactly;">&#10003;</span>`;
}

function renderHeader(companyName, clientDomain, brandColor = "#0284c7", customLogoUrl = null) {
  let logoImgHtml = "";
  let rawUrl = customLogoUrl && typeof customLogoUrl === "string" ? customLogoUrl.trim() : null;

  // Default fallback for SPP Labs if no custom logo is uploaded
  if (!rawUrl && (!clientDomain || clientDomain === "spplabs.es" || clientDomain === "www.spplabs.es")) {
    rawUrl = "/logo.webp";
  }

  if (rawUrl) {
    // Prefer PNG sibling over WebP for broad email client compatibility (e.g. desktop Outlook)
    if (rawUrl.includes("-logo.webp")) {
      rawUrl = rawUrl.replace("-logo.webp", "-logo.png");
    }

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spplabs.es";
    const cleanBaseUrl = appBaseUrl.endsWith("/") ? appBaseUrl.slice(0, -1) : appBaseUrl;

    const absoluteLogoUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `${cleanBaseUrl}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

    logoImgHtml = `
      <img src="${absoluteLogoUrl}" alt="${companyName || "Logo"}" style="max-height: 42px; max-width: 140px; width: auto; height: auto; object-fit: contain; display: block; margin-bottom: 8px; border-radius: 8px;" />
    `;
  }

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 20px 20px 0 0; padding: 24px 32px;">
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                ${logoImgHtml}
                <span style="font-size: ${logoImgHtml ? "16px" : "20px"}; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; display: inline-block;">
                  ${companyName || clientDomain || "SPP Labs"}
                </span>
                <span style="display: block; font-size: 11px; font-family: monospace; color: #94a3b8; margin-top: 2px;">
                  ${clientDomain || ""}
                </span>
              </td>
              <td align="right">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${brandColor}; border-radius: 50%;"></span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function renderFooter(companyName, clientDomain) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 32px; background-color: #f1f5f9; border-radius: 0 0 20px 20px; border-top: 1px solid #e2e8f0; margin-top: 32px;">
      <tr>
        <td style="font-size: 11px; color: #64748b; line-height: 1.6; text-align: center;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">
            © ${new Date().getFullYear()} ${companyName || clientDomain || "SPP Labs"}. Todos los derechos reservados.
          </p>
          <p style="margin: 0; font-size: 10.5px; color: #94a3b8;">
            Has recibido este correo electrónico en relación con tu solicitud o cita en <strong>${clientDomain || companyName}</strong>.<br/>
            Para ejercer tus derechos de acceso, rectificación o cancelación, contacta directamente con el emisor.
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function generateWelcomeContactHtml({ recipientName, companyName, clientDomain, brandColor = "#0284c7", messageSnippet, customLogoUrl = null }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hemos recibido tu consulta</title>
</head>
<body style="${getBaseStyles(brandColor)}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td>
              ${renderHeader(companyName, clientDomain, brandColor, customLogoUrl)}

              <div style="padding: 32px;">
                <div style="display: inline-block; padding: 6px 14px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; font-size: 12px; font-weight: 700; color: #166534; margin-bottom: 20px; line-height: 1.4;">
                  ${getSvgCheck("#166534", 15)}Mensaje recibido correctamente
                </div>

                <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.3;">
                  ¡Hola ${recipientName || "Estimado cliente"}!
                </h1>

                <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
                  Gracias por ponerte en contacto con <strong>${companyName || clientDomain}</strong>. Hemos recibido tu mensaje a través de nuestra web y nuestro equipo ya está revisándolo.
                </p>

                ${messageSnippet ? `
                <div style="background-color: #f8fafc; border-left: 3px solid ${brandColor}; padding: 14px 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #475569; font-style: italic;">
                  "${messageSnippet}"
                </div>
                ` : ""}

                <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
                  Nos pondremos en contacto contigo a la mayor brevedad posible para responder a tu consulta o darte más detalles.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                  <tr>
                    <td align="center">
                      <a href="https://${clientDomain}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                        Visitar Sitio Web →
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              ${renderFooter(companyName, clientDomain)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateBookingConfirmationHtml({ recipientName, companyName, clientDomain, dateStr, timeStr, brandColor = "#0284c7", customLogoUrl = null }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cita Confirmada</title>
</head>
<body style="${getBaseStyles(brandColor)}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td>
              ${renderHeader(companyName, clientDomain, brandColor, customLogoUrl)}

              <div style="padding: 32px;">
                <div style="display: inline-block; padding: 6px 14px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; font-size: 12px; font-weight: 700; color: #1e40af; margin-bottom: 20px; line-height: 1.4;">
                  ${getSvgCalendar("#1e40af", 15)}Solicitud de Cita Registrada
                </div>

                <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.3;">
                  Tu cita en ${companyName || clientDomain}
                </h1>

                <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                  Hola <strong>${recipientName}</strong>, tu cita ha quedado programada en nuestro sistema con los siguientes detalles:
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                  <tr>
                    <td style="padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Fecha:</span>
                      <strong style="font-size: 15px; color: #0f172a;">${dateStr}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 12px;">
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Hora:</span>
                      <strong style="font-size: 15px; color: ${brandColor}; font-family: monospace;">${timeStr}</strong>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0;">
                  Te enviaremos un recordatorio automático antes de la fecha. Si necesitas cancelar o modificar tu cita, por favor ponte en contacto con nosotros.
                </p>
              </div>

              ${renderFooter(companyName, clientDomain)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateBookingReminderHtml({ recipientName, companyName, clientDomain, dateStr, timeStr, brandColor = "#0284c7", customLogoUrl = null }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Cita</title>
</head>
<body style="${getBaseStyles(brandColor)}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td>
              ${renderHeader(companyName, clientDomain, brandColor, customLogoUrl)}

              <div style="padding: 32px;">
                <div style="display: inline-block; padding: 6px 14px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 20px; line-height: 1.4;">
                  ${getSvgClock("#92400e", 15)}Recordatorio de Cita Mañana
                </div>

                <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.3;">
                  ¡Hola ${recipientName}! Te recordamos tu cita
                </h1>

                <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                  Te escribimos de <strong>${companyName || clientDomain}</strong> para recordarte que tienes una cita programada para mañana:
                </p>

                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 6px;">HORARIO RESERVADO</span>
                  <span style="font-size: 20px; font-weight: 900; color: #0f172a; display: block;">${dateStr}</span>
                  <span style="font-size: 24px; font-weight: 900; color: ${brandColor}; font-family: monospace; display: block; margin-top: 4px;">${timeStr}</span>
                </div>

                <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 16px 0; text-align: center;">
                  ¡Te esperamos puntualmente! Si surge cualquier imprevisto, avísanos con antelación.
                </p>
              </div>

              ${renderFooter(companyName, clientDomain)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateGoogleReviewHtml({ recipientName, companyName, clientDomain, googleReviewUrl, brandColor = "#0284c7", customLogoUrl = null }) {
  const reviewLink = googleReviewUrl && googleReviewUrl.trim() !== "" ? googleReviewUrl.trim() : `https://${clientDomain}`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¿Qué tal fue tu experiencia?</title>
</head>
<body style="${getBaseStyles(brandColor)}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td>
              ${renderHeader(companyName, clientDomain, brandColor, customLogoUrl)}

              <div style="padding: 32px; text-align: center;">
                <div style="margin-bottom: 16px; text-align: center;">
                  <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                    <tr>
                      <td style="padding: 0 4px;">${getSvgStar("#f59e0b", 30)}</td>
                      <td style="padding: 0 4px;">${getSvgStar("#f59e0b", 30)}</td>
                      <td style="padding: 0 4px;">${getSvgStar("#f59e0b", 30)}</td>
                      <td style="padding: 0 4px;">${getSvgStar("#f59e0b", 30)}</td>
                      <td style="padding: 0 4px;">${getSvgStar("#f59e0b", 30)}</td>
                    </tr>
                  </table>
                </div>

                <h1 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0 0 12px 0; line-height: 1.3;">
                  ¿Qué tal fue tu experiencia hoy, ${recipientName || ""}?
                </h1>

                <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 auto 24px auto; max-width: 440px;">
                  En <strong>${companyName || clientDomain}</strong> trabajamos cada día para ofrecerte el mejor servicio posible. Tu opinión es fundamental para nosotros y ayuda a otros clientes a conocernos.
                </p>

                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 24px; margin: 0 auto 28px auto;">
                  <span style="font-size: 13px; font-weight: 700; color: #166534; display: block; margin-bottom: 16px;">
                    ¿Nos regalarías 30 segundos valorando nuestra atención en Google?
                  </span>

                  <a href="${reviewLink}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); line-height: 1;">
                    ${getSvgStar("#fbbf24", 16, "display: inline-block; vertical-align: -2px; margin-right: 8px;")}Dejar Reseña en Google Maps →
                  </a>
                </div>

                <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                  ¡Agradecemos de corazón tu confianza y apoyo!
                </p>
              </div>

              ${renderFooter(companyName, clientDomain)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateTestEmailHtml({ companyName, clientDomain, brandColor = "#0284c7", customLogoUrl = null }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prueba de Configuración de Email</title>
</head>
<body style="${getBaseStyles(brandColor)}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td>
              ${renderHeader(companyName, clientDomain, brandColor, customLogoUrl)}

              <div style="padding: 32px; text-align: center;">
                <div style="display: inline-block; padding: 6px 14px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; font-size: 12px; font-weight: 700; color: #166534; margin-bottom: 16px; line-height: 1.4;">
                  ${getSvgCheck("#166534", 15)}Prueba de Envío Exitosa
                </div>

                <h1 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0 0 12px 0;">
                  ¡Tu sistema de correos de ${companyName || clientDomain} está listo!
                </h1>

                <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 auto 24px auto;">
                  Este es un mensaje de prueba enviado desde tu panel de control de <strong>SPP Labs</strong>. Tus clientes recibirán correos con este diseño visual y tu identidad de marca.
                </p>
              </div>

              ${renderFooter(companyName, clientDomain)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateCustomEmailHtml({
  recipientName = "",
  companyName = "SPP Labs",
  clientDomain = "spplabs.es",
  brandColor = "#0284c7",
  customLogoUrl = null,
  subject = "Comunicado Oficial",
  messageBody = "",
  ctaText = null,
  ctaUrl = null,
  badgeText = "Comunicado Oficial",
}) {
  const formattedBody = messageBody && messageBody.trim() !== ""
    ? messageBody
        .split(/\n\s*\n/)
        .map((para) => `<p style="font-size: 14px; line-height: 1.65; color: #334155; margin: 0 0 16px 0;">${para.trim().replace(/\n/g, "<br/>")}</p>`)
        .join("")
    : `<p style="font-size: 14px; line-height: 1.65; color: #334155; margin: 0 0 16px 0;">Te escribimos de parte de <strong>${companyName || clientDomain}</strong> en relación con nuestros servicios.</p>`;

  const cleanCtaUrl = ctaUrl && ctaUrl.trim() !== "" ? ctaUrl.trim() : `https://${clientDomain}`;
  const ctaButtonHtml = ctaText && ctaText.trim() !== "" ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="${cleanCtaUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 32px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); line-height: 1;">
            ${ctaText} →
          </a>
        </td>
      </tr>
    </table>
  ` : "";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || "Comunicado"}</title>
</head>
<body style="${getBaseStyles(brandColor)}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td>
              ${renderHeader(companyName, clientDomain, brandColor, customLogoUrl)}

              <div style="padding: 32px;">
                <div style="display: inline-block; padding: 6px 14px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; font-size: 12px; font-weight: 700; color: #1e40af; margin-bottom: 20px; line-height: 1.4;">
                  ${badgeText || "Comunicado Oficial"}
                </div>

                <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.3;">
                  ${subject || "Comunicado de " + (companyName || clientDomain)}
                </h1>

                ${recipientName && recipientName.trim() !== "" ? `
                <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">
                  Hola ${recipientName},
                </p>
                ` : ""}

                ${formattedBody}

                ${ctaButtonHtml}
              </div>

              ${renderFooter(companyName, clientDomain)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function escapeHtml(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * SPP Labs Tenant Activity Notification Email Template.
 * Dispatches sleek, privacy-first teaser alerts with link directly to the dashboard.
 */
export function generateTenantNotificationHtml({
  notificationType = "general_summary",
  recipientName = "",
  clientDomain = "spplabs.es",
  title = "",
  message = "",
  ctaText = "Acceder al Dashboard",
  ctaUrl = "https://spplabs.es/dashboard",
  summaryItems = [],
  unsubscribeUrl = "https://spplabs.es/dashboard?openSettings=notifications",
}) {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spplabs.es";
  const cleanBaseUrl = appBaseUrl.endsWith("/") ? appBaseUrl.slice(0, -1) : appBaseUrl;

  const fullCtaUrl = ctaUrl.startsWith("http") ? ctaUrl : `${cleanBaseUrl}${ctaUrl.startsWith("/") ? "" : "/"}${ctaUrl}`;
  const fullUnsubUrl = unsubscribeUrl.startsWith("http") ? unsubscribeUrl : `${cleanBaseUrl}${unsubscribeUrl.startsWith("/") ? "" : "/"}${unsubscribeUrl}`;

  // Badge configurations
  const badges = {
    contact: {
      text: "📩 Nuevo Formulario de Contacto",
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
      textColor: "#1d4ed8",
      defaultTitle: "Has recibido un nuevo mensaje en tu web",
      defaultMsg: "Un usuario ha completado el formulario de contacto de tu sitio web. Por motivos de privacidad y rapidez, puedes revisar los detalles y responder directamente desde tu panel de control.",
      defaultCta: "Ver Mensaje en el Dashboard",
    },
    booking: {
      text: "📅 Nueva Reserva Solicitada",
      bgColor: "#ecfdf5",
      borderColor: "#a7f3d0",
      textColor: "#047857",
      defaultTitle: "Tienes una nueva cita agendada en tu web",
      defaultMsg: "Un visitante ha solicitado una nueva cita en tu calendario web. Accede a tu panel para comprobar la disponibilidad, confirmar o gestionar la reserva.",
      defaultCta: "Gestionar Cita en el Dashboard",
    },
    ai_chat: {
      text: "🤖 Nueva Conversación Chatbot IA",
      bgColor: "#f5f3ff",
      borderColor: "#ddd6fe",
      textColor: "#6d28d9",
      defaultTitle: "Nueva interacción con tu asistente virtual",
      defaultMsg: "Un visitante acaba de mantener una conversación con el chatbot de inteligencia artificial en tu web. Revisa las consultas realizadas y métricas en tu panel.",
      defaultCta: "Ver Conversación en el Dashboard",
    },
    spp_announcement: {
      text: "📢 Comunicado Oficial de SPP Labs",
      bgColor: "#fffbeb",
      borderColor: "#fde68a",
      textColor: "#b45309",
      defaultTitle: "Tienes una nueva notificación de SPP Labs",
      defaultMsg: "El equipo de SPP Labs ha publicado una actualización importante para tu cuenta y servicios web. Accede a tu panel para revisarla.",
      defaultCta: "Leer Comunicado en el Dashboard",
    },
    monthly_report: {
      text: "📊 Informe Mensual de Rendimiento",
      bgColor: "#eef2ff",
      borderColor: "#c7d2fe",
      textColor: "#4338ca",
      defaultTitle: "Tu Informe Mensual ya está disponible",
      defaultMsg: "El balance analítico de rendimiento y actividad de tu sitio web correspondiente a este mes ha sido generado con éxito. Ya puedes consultarlo o descargarlo en PDF.",
      defaultCta: "Consultar Informe Mensual",
    },
    general_summary: {
      text: "⚡ Resumen de Actividad Pendiente",
      bgColor: "#f0fdfa",
      borderColor: "#99f6e4",
      textColor: "#0f766e",
      defaultTitle: "Novedades pendientes en tu panel de SPP Labs",
      defaultMsg: "Tienes nueva actividad sin revisar en tu sitio web. Accede a tu panel de control para gestionar todas las solicitudes en un solo lugar.",
      defaultCta: "Acceder a mi Panel de Control",
    },
  };

  const badge = badges[notificationType] || badges.general_summary;
  const headingTitle = escapeHtml(title || badge.defaultTitle);
  const descriptionText = escapeHtml(message || badge.defaultMsg);
  const buttonText = escapeHtml(ctaText || badge.defaultCta);
  const safeClientDomain = escapeHtml(clientDomain);
  const safeRecipientName = escapeHtml(recipientName);

  const logoUrl = `${cleanBaseUrl}/logo.png`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headingTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.04); overflow: hidden;">
          
          <!-- SPP Labs Luxury Dark Header -->
          <tr>
            <td style="background-color: #0b1329; padding: 28px 32px; border-bottom: 1px solid #1e293b;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <img src="${logoUrl}" alt="SPP Labs Logo" width="32" height="32" style="width: 32px; height: 32px; border-radius: 8px; display: block; object-fit: contain;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 19px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; display: block; line-height: 1;">
                            SPP Labs
                          </span>
                          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; display: block; margin-top: 3px;">
                            Panel de Control &amp; Notificaciones
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; font-size: 11px; font-weight: 600; font-family: monospace; color: #94a3b8; background-color: #1e293b; padding: 4px 10px; border-radius: 8px;">
                      ${safeClientDomain}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notification Body Card -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <!-- Badge -->
              <div style="display: inline-block; padding: 6px 14px; background-color: ${badge.bgColor}; border: 1px solid ${badge.borderColor}; border-radius: 12px; font-size: 12px; font-weight: 800; color: ${badge.textColor}; margin-bottom: 20px; line-height: 1.4;">
                ${badge.text}
              </div>

              <!-- Title -->
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 14px 0; line-height: 1.35; letter-spacing: -0.3px;">
                ${headingTitle}
              </h1>

              ${safeRecipientName ? `
              <p style="font-size: 14px; font-weight: 700; color: #334155; margin: 0 0 14px 0;">
                Hola ${safeRecipientName},
              </p>
              ` : ""}

              <!-- Message Teaser (Intrigue/Privacy compliant) -->
              <p style="font-size: 14px; line-height: 1.65; color: #475569; margin: 0 0 24px 0;">
                ${descriptionText}
              </p>

              <!-- Optional Summary Box -->
              ${Array.isArray(summaryItems) && summaryItems.length > 0 ? `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px 20px; margin-bottom: 26px;">
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; display: block; margin-bottom: 10px;">
                  Resumen de actividad reciente:
                </span>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${summaryItems.map((item) => {
                    const text = typeof item === "string" ? item : (item?.label ? `${item.label}: ${item.value || ""}` : "");
                    return `
                  <tr>
                    <td style="padding: 5px 0; font-size: 13px; font-weight: 600; color: #1e293b;">
                      <span style="color: #0284c7; margin-right: 8px;">•</span> ${escapeHtml(text)}
                    </td>
                  </tr>
                    `;
                  }).join("")}
                </table>
              </div>
              ` : ""}

              <!-- Action Button -->
              <div style="text-align: center; margin: 28px 0 20px 0;">
                <a href="${fullCtaUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 14px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
                  ${buttonText} &rarr;
                </a>
              </div>

              <!-- Security / Privacy Teaser note -->
              <p style="font-size: 11.5px; color: #94a3b8; text-align: center; line-height: 1.5; margin: 16px 0 0 0;">
                🔒 Por seguridad y protección de datos, los detalles completos y las respuestas se gestionan exclusivamente desde tu panel seguro de SPP Labs.
              </p>
            </td>
          </tr>

          <!-- Subtle Footer with Unsubscribe / Notification Preferences Button -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #64748b;">
                &copy; ${new Date().getFullYear()} SPP Labs &bull; Gestión Inteligente y Presencia Digital
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                Has recibido esta notificación porque tu cuenta de <strong>${clientDomain}</strong> tiene activadas las alertas por email en SPP Labs.
              </p>
              <div style="padding-top: 4px;">
                <a href="${fullUnsubUrl}" target="_blank" style="font-size: 11px; font-weight: 600; color: #64748b; text-decoration: underline; display: inline-block;">
                  Gestionar preferencias o desactivar notificaciones por email
                </a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

