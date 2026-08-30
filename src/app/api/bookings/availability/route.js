import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFreeBusySlots } from "@/lib/googleCalendar";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-website-domain, x-api-key, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const domain = (
      request.headers.get("x-website-domain") ||
      url.searchParams.get("domain") ||
      ""
    ).trim().toLowerCase();
    const dateStr = url.searchParams.get("date")?.trim(); // Format: YYYY-MM-DD
    const duration = parseInt(url.searchParams.get("duration") || "45", 10);

    if (!domain) {
      return NextResponse.json(
        { error: "BadRequest", message: "Parameter 'domain' is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: "BadRequest", message: "Parameter 'date' is required in YYYY-MM-DD format" },
        { status: 400, headers: corsHeaders }
      );
    }

    const website = await prisma.website.findUnique({
      where: { domain },
      select: { id: true, domain: true, displayName: true },
    });

    if (!website) {
      return NextResponse.json(
        { error: "NotFound", message: "Website domain not registered" },
        { status: 404, headers: corsHeaders }
      );
    }

    const availability = await getFreeBusySlots({
      websiteId: website.id,
      dateStr,
      slotDurationMinutes: duration,
    });

    return NextResponse.json(
      {
        success: true,
        domain: website.domain,
        ...availability,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("[Bookings Availability Route] Error:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: error.message || "Failed to calculate slot availability" },
      { status: 500, headers: corsHeaders }
    );
  }
}
