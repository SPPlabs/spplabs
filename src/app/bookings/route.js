import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/crypto";

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // 1. Extract API Key and Domain
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

    // Booking fields
    const { name, phone, email, message, date, time } = body;

    // Validate inputs
    if (!domain) {
      return NextResponse.json(
        { error: "Bad Request", message: "Website domain is required (header: x-website-domain or body: domain)" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Unauthorized", message: "API key is required" },
        { status: 401 }
      );
    }

    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: "Bad Request", message: "name, email, date, and time are required" },
        { status: 400 }
      );
    }

    // 2. Look up the website by domain
    const website = await prisma.website.findUnique({
      where: { domain },
      include: { apiKeys: true },
    });

    if (!website) {
      return NextResponse.json(
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
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid API key" },
        { status: 401 }
      );
    }

    // 4. Save booking
    // date will be parsed as a Date object; time will be saved as string
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        websiteId: website.id,
        date: parsedDate,
        time: time.trim(),
        name: name.trim(),
        phone: (phone || "").trim(),
        email: email.trim().toLowerCase(),
        message: (message || "").trim(),
        status: "PENDING",
      },
    });

    // 5. Update API Key last used timestamp (asynchronously)
    prisma.websiteApiKey
      .update({
        where: { id: activeKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((e) => console.error("Failed to update API key lastUsedAt:", e));

    return NextResponse.json({
      success: true,
      message: "Booking requested successfully",
      id: booking.id,
    });
  } catch (error) {
    console.error("Public bookings API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to request booking" },
      { status: 500 }
    );
  }
}
