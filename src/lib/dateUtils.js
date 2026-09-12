/**
 * Centralized Date and Timezone utilities for Spain (Europe/Madrid)
 * Handles daylight saving time (CEST UTC+2 vs CET UTC+1) consistently across server and client.
 */

export const SPAIN_TIMEZONE = "Europe/Madrid";

/**
 * Returns the current date components in Spain timezone (Europe/Madrid).
 */
export function getSpainDate(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SPAIN_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(d);

  const map = {};
  for (const p of parts) map[p.type] = p.value;

  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
  };
}

/**
 * Converts a Spain date (YYYY-MM-DD or Date object) and time string (HH:mm) into a UTC Date object.
 * Correctly accounts for Spain's daylight saving time offset for that specific calendar date.
 */
export function getSpainDateTimeUtc(dateStr, timeStr = "09:00") {
  const [hRaw, mRaw] = (timeStr || "09:00").split(":").map(Number);
  const h = Number.isInteger(hRaw) ? hRaw : 9;
  const m = Number.isInteger(mRaw) ? mRaw : 0;
  const formattedTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

  let cleanDate;
  if (typeof dateStr === "string") {
    cleanDate = dateStr.substring(0, 10);
  } else if (dateStr instanceof Date) {
    cleanDate = dateStr.toISOString().substring(0, 10);
  } else {
    cleanDate = new Date().toISOString().substring(0, 10);
  }

  // Probe offset in Europe/Madrid for this specific date at noon
  const tempDate = new Date(`${cleanDate}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SPAIN_TIMEZONE,
    timeZoneName: "longOffset",
  }).formatToParts(tempDate);
  const tzPart = parts.find((p) => p.type === "timeZoneName")?.value || "GMT+02:00";
  const offset = tzPart.replace("GMT", "");

  return new Date(`${cleanDate}T${formattedTime}${offset}`);
}

/**
 * Returns the exact UTC date boundaries for a given month in Spain timezone.
 * Used for monthly report consolidations and ClickHouse query filtering.
 */
export function getSpainMonthBoundariesUtc(year, month) {
  const pad = (n) => String(n).padStart(2, "0");
  const lastDay = new Date(Date.UTC(year, month, 0)).getDate();

  const startDate = getSpainDateTimeUtc(`${year}-${pad(month)}-01`, "00:00");
  const endBase = getSpainDateTimeUtc(`${year}-${pad(month)}-${pad(lastDay)}`, "23:59");
  // Extend to end of the minute: 23:59:59.999
  const endDate = new Date(endBase.getTime() + 59999);

  return {
    startDate,
    endDate,
    startISO: startDate.toISOString().replace("T", " ").substring(0, 19),
    endISO: endDate.toISOString().replace("T", " ").substring(0, 19),
  };
}
