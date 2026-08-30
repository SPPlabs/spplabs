import { prisma } from "./prisma";
import { SignJWT, jwtVerify } from "jose";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_super_secret_jwt_key_spplabs_change_in_production"
);

/**
 * Returns the effective App Base URL for OAuth redirects.
 */
export function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "https://spplabs.es";
}

/**
 * Returns the OAuth redirect URI configured for Google Cloud.
 */
export function getGoogleRedirectUri() {
  if (process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_REDIRECT_URI.trim() !== "") {
    return process.env.GOOGLE_REDIRECT_URI.trim();
  }
  return `${getAppBaseUrl()}/api/integrations/google-calendar/callback`;
}

/**
 * Generates the Google OAuth 2.0 authorization URL for a given website tenant.
 */
export async function getGoogleAuthUrl(websiteId, domain) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID environment variable is not defined");
  }

  // Create a signed state token to prevent CSRF and identify tenant on callback
  const stateToken = await new SignJWT({ websiteId, domain, timestamp: Date.now() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
    state: stateToken,
  });

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Verifies the signed OAuth state token.
 */
export async function verifyAuthState(stateToken) {
  try {
    const { payload } = await jwtVerify(stateToken, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Exchanges the Google authorization code for access and refresh tokens.
 */
export async function exchangeCodeForTokens(code) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = getGoogleRedirectUri();

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET) are missing");
  }

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Failed to exchange Google OAuth code for tokens");
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in, // in seconds
    tokenType: data.token_type,
    scope: data.scope,
  };
}

/**
 * Fetches the user info (email) from Google using an access token.
 */
export async function getGoogleUserInfo(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info from Google");
  }

  return await response.json();
}

/**
 * Retrieves a guaranteed valid access token for a website tenant.
 * Automatically uses the refresh token if expired.
 */
export async function getValidAccessToken(websiteId) {
  const connection = await prisma.googleCalendarConnection.findUnique({
    where: { websiteId },
  });

  if (!connection) {
    return null;
  }

  const now = new Date();
  const bufferMs = 5 * 60 * 1000; // 5 minute safety buffer

  // If token is still valid, return it
  if (new Date(connection.tokenExpiresAt).getTime() - bufferMs > now.getTime()) {
    return connection.accessToken;
  }

  // Token is expired or expiring soon; refresh it
  if (!connection.refreshToken) {
    console.warn(`[GoogleCalendar] No refresh token available for website ${websiteId}`);
    return connection.accessToken;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  try {
    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: connection.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[GoogleCalendar] Token refresh failed for website ${websiteId}:`, data);
      return null;
    }

    const newAccessToken = data.access_token;
    const expiresIn = data.expires_in || 3600;
    const newExpiresAt = new Date(Date.now() + expiresIn * 1000);

    await prisma.googleCalendarConnection.update({
      where: { websiteId },
      data: {
        accessToken: newAccessToken,
        tokenExpiresAt: newExpiresAt,
      },
    });

    return newAccessToken;
  } catch (err) {
    console.error(`[GoogleCalendar] Exception refreshing token for website ${websiteId}:`, err);
    return null;
  }
}

/**
 * Creates an event in the tenant's Google Calendar from an SPP Labs booking.
 */
export async function createGoogleCalendarEvent({ websiteId, booking, websiteDisplayName = "SPP Labs" }) {
  try {
    const accessToken = await getValidAccessToken(websiteId);
    if (!accessToken) {
      return { success: false, reason: "No valid Google Calendar connection" };
    }

    // Parse date and time into ISO string
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = (booking.time || "09:00").split(":").map(Number);
    
    // Start DateTime
    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(hours || 9, minutes || 0, 0, 0);

    // End DateTime (Default 45 minutes appointment)
    const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000);

    const eventPayload = {
      summary: `Cita: ${booking.name} (${websiteDisplayName})`,
      description: [
        `Cliente: ${booking.name}`,
        `Teléfono: ${booking.phone}`,
        `Email: ${booking.email}`,
        `Mensaje: ${booking.message || "Sin mensaje adicional"}`,
        `Estado: ${booking.status || "CONFIRMADA"}`,
        `---`,
        `Gestionado automáticamente por SPP Labs`,
      ].join("\n"),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Europe/Madrid",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Europe/Madrid",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 60 },
          { method: "popup", minutes: 15 },
        ],
      },
      colorId: "2", // Green/Sage color in Google Calendar
    };

    const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    });

    const createdEvent = await response.json();
    if (!response.ok) {
      console.error("[GoogleCalendar] Failed to insert event:", createdEvent);
      return { success: false, error: createdEvent.error?.message || "Insert failed" };
    }

    // Save googleEventId in the booking record
    if (createdEvent.id && booking.id) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { googleEventId: createdEvent.id },
      });
    }

    return { success: true, googleEventId: createdEvent.id, event: createdEvent };
  } catch (err) {
    console.error("[GoogleCalendar] Exception creating event:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing Google Calendar event when a booking is modified or rescheduled.
 */
export async function updateGoogleCalendarEvent({ websiteId, booking, websiteDisplayName = "SPP Labs" }) {
  try {
    if (!booking.googleEventId) {
      // If event was not created yet, create it
      return await createGoogleCalendarEvent({ websiteId, booking, websiteDisplayName });
    }

    const accessToken = await getValidAccessToken(websiteId);
    if (!accessToken) {
      return { success: false, reason: "No valid Google Calendar connection" };
    }

    const bookingDate = new Date(booking.date);
    const [hours, minutes] = (booking.time || "09:00").split(":").map(Number);
    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(hours || 9, minutes || 0, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000);

    const isCancelled = booking.status === "CANCELLED";
    const statusPrefix = isCancelled ? "[CANCELADA] " : "";

    const eventPayload = {
      summary: `${statusPrefix}Cita: ${booking.name} (${websiteDisplayName})`,
      description: [
        `Cliente: ${booking.name}`,
        `Teléfono: ${booking.phone}`,
        `Email: ${booking.email}`,
        `Mensaje: ${booking.message || "Sin mensaje adicional"}`,
        `Estado: ${booking.status}`,
        `---`,
        `Actualizado por SPP Labs`,
      ].join("\n"),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Europe/Madrid",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Europe/Madrid",
      },
      colorId: isCancelled ? "11" : "2", // Red if cancelled, green if active
    };

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events/${booking.googleEventId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      }
    );

    const updatedEvent = await response.json();
    return { success: response.ok, event: updatedEvent };
  } catch (err) {
    console.error("[GoogleCalendar] Exception updating event:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes an event from Google Calendar.
 */
export async function deleteGoogleCalendarEvent({ websiteId, googleEventId }) {
  try {
    if (!googleEventId) return { success: true };

    const accessToken = await getValidAccessToken(websiteId);
    if (!accessToken) return { success: false, reason: "No valid connection" };

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events/${googleEventId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return { success: response.status === 204 || response.status === 404 };
  } catch (err) {
    console.error("[GoogleCalendar] Exception deleting event:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Synchronizes events from Google Calendar to SPP Labs' `ExternalCalendarEvent` table.
 * Supports incremental sync via `syncToken`.
 */
export async function syncGoogleCalendarEvents(websiteId) {
  try {
    const connection = await prisma.googleCalendarConnection.findUnique({
      where: { websiteId },
    });

    if (!connection) {
      return { success: false, message: "Website has no Google Calendar connection" };
    }

    const accessToken = await getValidAccessToken(websiteId);
    if (!accessToken) {
      return { success: false, message: "Could not obtain valid access token" };
    }

    const queryParams = new URLSearchParams({
      singleEvents: "true",
      maxResults: "250",
    });

    // If we have a syncToken, use it for incremental sync
    if (connection.syncToken) {
      queryParams.set("syncToken", connection.syncToken);
    } else {
      // For initial sync, fetch events starting from 30 days in the past up to 1 year in the future
      const past30Days = new Date();
      past30Days.setDate(past30Days.getDate() - 30);
      queryParams.set("timeMin", past30Days.toISOString());
    }

    let url = `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events?${queryParams.toString()}`;
    let response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // If syncToken is invalid or expired (410 Gone), reset and do a full sync
    if (response.status === 410) {
      console.warn(`[GoogleCalendar] syncToken expired for website ${websiteId}, performing full resync`);
      const past30Days = new Date();
      past30Days.setDate(past30Days.getDate() - 30);
      const fallbackParams = new URLSearchParams({
        singleEvents: "true",
        maxResults: "250",
        timeMin: past30Days.toISOString(),
      });
      url = `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events?${fallbackParams.toString()}`;
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    const data = await response.json();
    if (!response.ok) {
      console.error("[GoogleCalendar] Failed to fetch events for sync:", data);
      return { success: false, error: data.error?.message || "Sync fetch failed" };
    }

    const items = data.items || [];
    let upsertedCount = 0;
    let deletedCount = 0;

    for (const item of items) {
      const googleEventId = item.id;
      const status = item.status; // "confirmed" or "cancelled"

      if (status === "cancelled") {
        // Delete or mark cancelled in database
        await prisma.externalCalendarEvent.deleteMany({
          where: { websiteId, googleEventId },
        });
        deletedCount++;
        continue;
      }

      // Check if event has valid start/end
      const startIso = item.start?.dateTime || item.start?.date;
      const endIso = item.end?.dateTime || item.end?.date;
      const isAllDay = !item.start?.dateTime && Boolean(item.start?.date);

      if (!startIso || !endIso) continue;

      const startDateTime = new Date(startIso);
      const endDateTime = new Date(endIso);
      const title = item.summary || "(Sin título)";
      const description = item.description || "";

      await prisma.externalCalendarEvent.upsert({
        where: {
          websiteId_googleEventId: {
            websiteId,
            googleEventId,
          },
        },
        create: {
          websiteId,
          googleEventId,
          title,
          description,
          startDateTime,
          endDateTime,
          isAllDay,
          status: "confirmed",
        },
        update: {
          title,
          description,
          startDateTime,
          endDateTime,
          isAllDay,
          status: "confirmed",
        },
      });
      upsertedCount++;
    }

    // Save nextSyncToken if returned
    if (data.nextSyncToken) {
      await prisma.googleCalendarConnection.update({
        where: { websiteId },
        data: { syncToken: data.nextSyncToken },
      });
    }

    return {
      success: true,
      upsertedCount,
      deletedCount,
      nextSyncToken: data.nextSyncToken,
    };
  } catch (err) {
    console.error("[GoogleCalendar] Sync exception:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Computes available booking time slots for a given date by combining
 * SPP Labs local bookings and Google Calendar external events.
 */
export async function getFreeBusySlots({
  websiteId,
  dateStr, // Format: YYYY-MM-DD
  slotDurationMinutes = 45,
  businessHoursStart = "09:00",
  businessHoursEnd = "20:00",
  slotIntervalMinutes = 30,
}) {
  try {
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
    const nextDay = new Date(`${dateStr}T23:59:59.999Z`);

    // 1. Fetch active SPP Labs bookings for this date
    const localBookings = await prisma.booking.findMany({
      where: {
        websiteId,
        date: targetDate,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: {
        id: true,
        time: true,
        status: true,
      },
    });

    // 2. Fetch external Google Calendar events overlapping with this date
    const externalEvents = await prisma.externalCalendarEvent.findMany({
      where: {
        websiteId,
        status: "confirmed",
        OR: [
          {
            startDateTime: { lte: nextDay },
            endDateTime: { gte: targetDate },
          },
        ],
      },
    });

    // Generate possible slots according to business hours
    const [startH, startM] = businessHoursStart.split(":").map(Number);
    const [endH, endM] = businessHoursEnd.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const slots = [];

    for (let m = startMinutes; m + slotDurationMinutes <= endMinutes; m += slotIntervalMinutes) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

      const slotStart = new Date(`${dateStr}T${timeStr}:00`);
      const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60 * 1000);

      // Check collision with SPP Labs bookings
      let isBusy = false;
      let reason = null;

      for (const booking of localBookings) {
        if (booking.time === timeStr) {
          isBusy = true;
          reason = "Cita existente";
          break;
        }
      }

      // Check collision with Google Calendar events
      if (!isBusy) {
        for (const ext of externalEvents) {
          if (ext.isAllDay) {
            isBusy = true;
            reason = "Evento de día completo";
            break;
          }

          const extStart = new Date(ext.startDateTime);
          const extEnd = new Date(ext.endDateTime);

          // Overlap condition: slotStart < extEnd && slotEnd > extStart
          if (slotStart < extEnd && slotEnd > extStart) {
            isBusy = true;
            reason = "Ocupado en Google Calendar";
            break;
          }
        }
      }

      slots.push({
        time: timeStr,
        available: !isBusy,
        reason: isBusy ? reason : null,
      });
    }

    return {
      date: dateStr,
      slots,
      totalSlots: slots.length,
      availableSlots: slots.filter((s) => s.available).length,
    };
  } catch (err) {
    console.error("[GoogleCalendar] Exception computing free/busy slots:", err);
    throw err;
  }
}
