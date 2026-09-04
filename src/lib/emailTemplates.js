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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fillColor}" stroke="${fillColor}" stroke-width="0" style="${style}"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>`;
}

function getSvgCalendar(strokeColor = "#1e40af", size = 15) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -2px; margin-right: 6px;"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>`;
}

function getSvgClock(strokeColor = "#92400e", size = 15) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -2px; margin-right: 6px;"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
}

function getSvgCheck(strokeColor = "#166534", size = 15) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -2px; margin-right: 6px;"><path d="M4.5 12.75l6 6 9-13.5" /></svg>`;
}

function renderHeader(companyName, clientDomain, brandColor = "#0284c7", customLogoUrl = null) {
  let logoImgHtml = "";
  if (customLogoUrl && customLogoUrl.trim()) {
    const rawUrl = customLogoUrl.trim();
    const absoluteLogoUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `https://${clientDomain || "spplabs.es"}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

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
