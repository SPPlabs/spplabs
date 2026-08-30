import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyAuthState,
  exchangeCodeForTokens,
  getGoogleUserInfo,
  syncGoogleCalendarEvents,
  getAppBaseUrl,
} from "@/lib/googleCalendar";

export async function GET(request) {
  const baseUrl = getAppBaseUrl();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    console.error("[Google Callback Route] Google OAuth error parameter:", errorParam);
    return NextResponse.redirect(
      `${baseUrl}/dashboard?tab=bookings&gcal=error&reason=${encodeURIComponent(errorParam)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?tab=bookings&gcal=error&reason=missing_code_or_state`
    );
  }

  try {
    // 1. Verify signed state token
    const statePayload = await verifyAuthState(state);
    if (!statePayload || !statePayload.websiteId) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard?tab=bookings&gcal=error&reason=invalid_or_expired_state`
      );
    }

    const { websiteId, domain } = statePayload;

    // 2. Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // 3. Get connected Google email address
    let googleAccountEmail = "Google Calendar";
    try {
      const userInfo = await getGoogleUserInfo(tokens.accessToken);
      if (userInfo && userInfo.email) {
        googleAccountEmail = userInfo.email;
      }
    } catch (userInfoErr) {
      console.warn("[Google Callback] Could not fetch user email:", userInfoErr.message);
    }

    const expiresIn = tokens.expiresIn || 3600;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // 4. Upsert GoogleCalendarConnection in database
    await prisma.googleCalendarConnection.upsert({
      where: { websiteId },
      create: {
        websiteId,
        googleAccountEmail,
        googleCalendarId: "primary",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || "",
        tokenExpiresAt,
      },
      update: {
        googleAccountEmail,
        googleCalendarId: "primary",
        accessToken: tokens.accessToken,
        ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
        tokenExpiresAt,
      },
    });

    // 5. Trigger initial background sync for existing events
    syncGoogleCalendarEvents(websiteId).catch((syncErr) =>
      console.error("[Google Callback] Background sync error:", syncErr)
    );

    // 6. Redirect to dashboard with success message
    const redirectUrl = domain
      ? `${baseUrl}/dashboard?tab=bookings&gcal=connected`
      : `${baseUrl}/dashboard?tab=bookings&gcal=connected`;

    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("[Google Callback Route] Exception handling callback:", err);
    return NextResponse.redirect(
      `${baseUrl}/dashboard?tab=bookings&gcal=error&reason=${encodeURIComponent(err.message || "exchange_failed")}`
    );
  }
}
