import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spp_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized", message: "Missing session" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { domain, webpBase64, pngBase64 } = body;

    let targetDomain = session.domain;
    if (session.role === "ADMIN" && domain) {
      targetDomain = domain.trim().toLowerCase();
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    // Sanitize domain for filesystem use
    const safeDomain = targetDomain.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 1. Save WebP version (for web UI)
    if (webpBase64) {
      const cleanWebp = webpBase64.replace(/^data:image\/\w+;base64,/, "");
      const webpBuffer = Buffer.from(cleanWebp, "base64");
      const webpPath = path.join(uploadDir, `${safeDomain}-logo.webp`);
      fs.writeFileSync(webpPath, webpBuffer);
    }

    // 2. Save PNG version (for emails and fallback)
    if (pngBase64) {
      const cleanPng = pngBase64.replace(/^data:image\/\w+;base64,/, "");
      const pngBuffer = Buffer.from(cleanPng, "base64");
      const pngPath = path.join(uploadDir, `${safeDomain}-logo.png`);
      fs.writeFileSync(pngPath, pngBuffer);
    } else if (webpBase64) {
      // Fallback: if only webp provided, write it as png name as well
      const cleanWebp = webpBase64.replace(/^data:image\/\w+;base64,/, "");
      const webpBuffer = Buffer.from(cleanWebp, "base64");
      const pngPath = path.join(uploadDir, `${safeDomain}-logo.png`);
      fs.writeFileSync(pngPath, webpBuffer);
    }

    const timestamp = Date.now();
    const relativeLogoUrl = `/api/uploads/logos/${safeDomain}-logo.webp?v=${timestamp}`;
    const emailLogoUrl = `/api/uploads/logos/${safeDomain}-logo.png?v=${timestamp}`;

    // Update database Website record
    await prisma.website.update({
      where: { id: website.id },
      data: { logoUrl: relativeLogoUrl },
    });

    // Sync with WebsiteEmailConfig if it exists or upsert
    await prisma.websiteEmailConfig.upsert({
      where: { websiteId: website.id },
      update: { customLogoUrl: emailLogoUrl },
      create: {
        websiteId: website.id,
        customLogoUrl: emailLogoUrl,
        senderName: website.displayName || "Atención al Cliente",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Logo uploaded and saved successfully",
      logoUrl: relativeLogoUrl,
      emailLogoUrl: emailLogoUrl,
    });
  } catch (error) {
    console.error("Upload logo error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spp_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized", message: "Missing session" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedDomain = searchParams.get("domain")?.trim().toLowerCase();

    let targetDomain = session.domain;
    if (session.role === "ADMIN" && requestedDomain) {
      targetDomain = requestedDomain;
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    const safeDomain = targetDomain.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");

    // Remove files from disk
    const webpPath = path.join(uploadDir, `${safeDomain}-logo.webp`);
    const pngPath = path.join(uploadDir, `${safeDomain}-logo.png`);

    if (fs.existsSync(webpPath)) {
      try { fs.unlinkSync(webpPath); } catch (_) {}
    }
    if (fs.existsSync(pngPath)) {
      try { fs.unlinkSync(pngPath); } catch (_) {}
    }

    // Clear database records
    await prisma.website.update({
      where: { id: website.id },
      data: { logoUrl: null },
    });

    await prisma.websiteEmailConfig.updateMany({
      where: { websiteId: website.id },
      data: { customLogoUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: "Logo removed successfully",
    });
  } catch (error) {
    console.error("Delete logo error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}
