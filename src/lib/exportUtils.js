/**
 * SPP Labs Export & Clipboard Utility Functions
 * Supports CSV export, iCalendar (.ics) export, and formatted clipboard copying
 * for Contact Forms, Calendar Events, and Individual Bookings.
 */

/**
 * Robust copy-to-clipboard with fallback
 */
export async function copyTextToClipboard(text) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers / iframe contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Clipboard copy error:", err);
    return false;
  }
}

/**
 * Trigger browser file download via Blob
 */
export function downloadBlob(content, filename, mimeType = "text/plain;charset=utf-8") {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error("Download blob error:", err);
    return false;
  }
}

function escapeCsv(val = "") {
  const str = String(val ?? "").replace(/"/g, '""');
  return `"${str}"`;
}

function escapeIcs(str = "") {
  return String(str ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\n|\r/g, "\\n");
}

function formatIcsLocalDate(date, timeStr) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());

  let hours = 9;
  let minutes = 0;
  if (timeStr && timeStr.includes(":")) {
    const parts = timeStr.split(":");
    hours = parseInt(parts[0], 10) || 9;
    minutes = parseInt(parts[1], 10) || 0;
  }

  return `${year}${month}${day}T${pad(hours)}${pad(minutes)}00`;
}

function formatIcsLocalEndDate(date, timeStr, durationMinutes = 60) {
  const d = new Date(date);
  let hours = 9;
  let minutes = 0;
  if (timeStr && timeStr.includes(":")) {
    const parts = timeStr.split(":");
    hours = parseInt(parts[0], 10) || 9;
    minutes = parseInt(parts[1], 10) || 0;
  }

  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes + durationMinutes);
  const pad = (n) => String(n).padStart(2, "0");
  return `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
}

// ----------------------------------------------------
// CONTACT FORMS UTILS
// ----------------------------------------------------

export function formatContactToText(form, lang = "es") {
  const dateFormatted = new Date(form.createdAt).toLocaleString(lang === "es" ? "es-ES" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (lang === "es") {
    return `📋 MENSAJE DE CONTACTO\n---------------------------\nNombre: ${form.name}\nEmail: ${form.email}\nTeléfono: ${form.phone || "No especificado"}\nFecha: ${dateFormatted}\n\nMensaje:\n"${form.message || ""}"`;
  }
  return `📋 CONTACT MESSAGE\n---------------------------\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || "Not specified"}\nDate: ${dateFormatted}\n\nMessage:\n"${form.message || ""}"`;
}

export function formatContactsListToText(forms = [], lang = "es", domain = "") {
  if (forms.length === 0) {
    return lang === "es" ? "No hay formularios de contacto." : "No contact forms found.";
  }

  const header = lang === "es"
    ? `📋 LISTADO DE CONTACTOS (${forms.length}) - ${domain || "SPP Labs"}\n==============================================\n\n`
    : `📋 CONTACTS LIST (${forms.length}) - ${domain || "SPP Labs"}\n==============================================\n\n`;

  const items = forms.map((f, i) => `#${i + 1} - ${formatContactToText(f, lang)}`).join("\n\n" + "-".repeat(40) + "\n\n");
  return header + items;
}

export function exportContactsToCsv(forms = [], domain = "empresa") {
  const headers = ["Nombre", "Email", "Teléfono", "Fecha de Recepción", "Mensaje"];
  const rows = forms.map((f) => [
    escapeCsv(f.name),
    escapeCsv(f.email),
    escapeCsv(f.phone || ""),
    escapeCsv(new Date(f.createdAt).toLocaleString("es-ES")),
    escapeCsv(f.message || ""),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const dateStr = new Date().toISOString().split("T")[0];
  const safeDomain = (domain || "spplabs").replace(/[^a-zA-Z0-9_-]/g, "_");
  downloadBlob(csvContent, `contactos_${safeDomain}_${dateStr}.csv`, "text/csv;charset=utf-8;");
}

// ----------------------------------------------------
// BOOKINGS / CALENDAR UTILS
// ----------------------------------------------------

export function formatBookingToText(booking, lang = "es") {
  const dateFormatted = new Date(booking.date).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusLabel = booking.status === "CONFIRMED"
    ? (lang === "es" ? "CONFIRMADA" : "CONFIRMED")
    : booking.status === "CANCELLED"
    ? (lang === "es" ? "CANCELADA" : "CANCELLED")
    : (lang === "es" ? "PENDIENTE" : "PENDING");

  if (lang === "es") {
    return `📅 DETALLES DE CITA / RESERVA\n---------------------------\nCliente: ${booking.name}\nFecha: ${dateFormatted}\nHora: ${booking.time}\nEstado: ${statusLabel}\nEmail: ${booking.email || "No especificado"}\nTeléfono: ${booking.phone || "No especificado"}\n\nDetalles / Nota:\n"${booking.message || "Sin comentarios adicionales."}"`;
  }
  return `📅 BOOKING DETAILS\n---------------------------\nClient: ${booking.name}\nDate: ${dateFormatted}\nTime: ${booking.time}\nStatus: ${statusLabel}\nEmail: ${booking.email || "Not specified"}\nPhone: ${booking.phone || "Not specified"}\n\nDetails / Notes:\n"${booking.message || "No additional comments."}"`;
}

export function formatBookingsListToText(bookings = [], lang = "es", title = "Calendario de Citas") {
  if (bookings.length === 0) {
    return lang === "es" ? "No hay reservas registradas." : "No bookings found.";
  }

  const header = `📅 ${title.toUpperCase()} (${bookings.length})\n==============================================\n\n`;
  const items = bookings.map((b, i) => `#${i + 1} - ${formatBookingToText(b, lang)}`).join("\n\n" + "-".repeat(40) + "\n\n");
  return header + items;
}

export function exportBookingsToCsv(bookings = [], domain = "empresa", suffix = "todas") {
  const headers = ["Cliente", "Fecha", "Hora", "Estado", "Email", "Teléfono", "Detalles"];
  const rows = bookings.map((b) => [
    escapeCsv(b.name),
    escapeCsv(new Date(b.date).toLocaleDateString("es-ES")),
    escapeCsv(b.time || ""),
    escapeCsv(b.status || "PENDING"),
    escapeCsv(b.email || ""),
    escapeCsv(b.phone || ""),
    escapeCsv(b.message || ""),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const dateStr = new Date().toISOString().split("T")[0];
  const safeDomain = (domain || "spplabs").replace(/[^a-zA-Z0-9_-]/g, "_");
  downloadBlob(csvContent, `reservas_${safeDomain}_${suffix}_${dateStr}.csv`, "text/csv;charset=utf-8;");
}

export function generateBookingIcs(booking, companyName = "SPP Labs") {
  const uid = `booking-${booking.id || Date.now()}@${(companyName || "spplabs").toLowerCase().replace(/\s+/g, "")}.com`;
  const dtStart = formatIcsLocalDate(booking.date, booking.time);
  const dtEnd = formatIcsLocalEndDate(booking.date, booking.time, 60);
  const nowIcs = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const summary = escapeIcs(`Cita con ${booking.name || "Cliente"} - ${companyName}`);
  const description = escapeIcs(
    `Cliente: ${booking.name || ""}\nEmail: ${booking.email || ""}\nTeléfono: ${booking.phone || ""}\nEstado: ${booking.status || "CONFIRMED"}\nNotas: ${booking.message || ""}`
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SPP Labs//Booking System//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowIcs}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `STATUS:${booking.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function exportBookingIcsFile(booking, companyName = "SPP Labs") {
  const ics = generateBookingIcs(booking, companyName);
  const dateStr = new Date(booking.date).toISOString().split("T")[0];
  const safeName = (booking.name || "cita").replace(/[^a-zA-Z0-9_-]/g, "_");
  downloadBlob(ics, `cita_${safeName}_${dateStr}.ics`, "text/calendar;charset=utf-8");
}

export function generateCalendarIcs(bookings = [], companyName = "SPP Labs") {
  const nowIcs = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const events = bookings.map((b) => {
    const uid = `booking-${b.id || Math.random().toString(36).substring(2)}@${(companyName || "spplabs").toLowerCase().replace(/\s+/g, "")}.com`;
    const dtStart = formatIcsLocalDate(b.date, b.time);
    const dtEnd = formatIcsLocalEndDate(b.date, b.time, 60);
    const summary = escapeIcs(`Cita con ${b.name || "Cliente"} - ${companyName}`);
    const description = escapeIcs(
      `Cliente: ${b.name || ""}\nEmail: ${b.email || ""}\nTeléfono: ${b.phone || ""}\nEstado: ${b.status || "CONFIRMED"}\nNotas: ${b.message || ""}`
    );

    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${nowIcs}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `STATUS:${b.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED"}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SPP Labs//Booking Calendar System//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function exportCalendarIcsFile(bookings = [], companyName = "SPP Labs", filenamePrefix = "calendario") {
  const ics = generateCalendarIcs(bookings, companyName);
  const dateStr = new Date().toISOString().split("T")[0];
  const safeDomain = (companyName || "spplabs").replace(/[^a-zA-Z0-9_-]/g, "_");
  downloadBlob(ics, `${filenamePrefix}_${safeDomain}_${dateStr}.ics`, "text/calendar;charset=utf-8");
}
