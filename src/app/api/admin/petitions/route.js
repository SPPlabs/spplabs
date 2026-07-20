import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma, withRLS } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyJWT(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { message, domain } = body;
    if (!message || !domain) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Security: Only website owner (or Admin) can submit requests for that domain
    if (session.role !== "ADMIN" && session.domain !== domain) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetWebsite = await prisma.website.findUnique({
      where: { domain: domain.trim().toLowerCase() },
    });

    if (!targetWebsite) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const db = session.role === "ADMIN" ? prisma : withRLS(session.id);

    const supportRequest = await db.supportRequest.create({
      data: {
        websiteId: targetWebsite.id,
        title: "Petición del cliente",
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true, supportRequest });
  } catch (error) {
    console.error("Support request creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyJWT(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const db = session.role === "ADMIN" ? prisma : withRLS(session.id);

    const requestToMsg = await db.supportRequest.findUnique({
      where: { id },
      include: { website: true }
    });

    if (!requestToMsg) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Security check: Only Admin or the owner of that website can delete the request
    if (session.role !== "ADMIN" && session.domain !== requestToMsg.website.domain) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.supportRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Petition deleted successfully." });
  } catch (error) {
    console.error("Support request deletion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
