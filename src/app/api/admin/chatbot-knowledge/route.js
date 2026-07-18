import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
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

    const { content, domain } = body;
    if (typeof content !== "string" || !domain) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Security: Only ADMIN or owner of the website can edit knowledge base
    if (session.role !== "ADMIN" && session.domain !== domain) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetWebsite = await prisma.website.findUnique({
      where: { domain: domain.trim().toLowerCase() },
    });

    if (!targetWebsite) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const kb = await prisma.chatbotKnowledge.upsert({
      where: { websiteId: targetWebsite.id },
      update: { content: content },
      create: { websiteId: targetWebsite.id, content: content },
    });

    return NextResponse.json({ success: true, chatbotKnowledge: kb });
  } catch (error) {
    console.error("Chatbot knowledge update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
