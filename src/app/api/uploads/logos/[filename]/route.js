import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request, context) {
  try {
    const params = await context.params;
    const rawFilename = params?.filename;

    if (!rawFilename) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Sanitize filename to prevent path traversal
    const safeFilename = path.basename(rawFilename).replace(/[^a-zA-Z0-9._-]/g, "");
    const filePath = path.join(process.cwd(), "public", "uploads", "logos", safeFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    let contentType = "image/png";

    if (safeFilename.endsWith(".webp")) {
      contentType = "image/webp";
    } else if (safeFilename.endsWith(".jpg") || safeFilename.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (safeFilename.endsWith(".svg")) {
      contentType = "image/svg+xml";
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Serve logo error:", error);
    return new NextResponse("Error reading file", { status: 500 });
  }
}
