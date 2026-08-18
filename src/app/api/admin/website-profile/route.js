import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function PATCH(request) {
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
    const { displayName, domain } = body;

    if (!displayName || !displayName.trim()) {
      return NextResponse.json({ error: "BadRequest", message: "displayName is required" }, { status: 400 });
    }

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

    const updated = await prisma.website.update({
      where: { id: website.id },
      data: { displayName: displayName.trim() },
    });

    return NextResponse.json({
      success: true,
      message: "Display name updated successfully",
      website: {
        id: updated.id,
        domain: updated.domain,
        displayName: updated.displayName,
      },
    });
  } catch (error) {
    console.error("PATCH website-profile error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}
