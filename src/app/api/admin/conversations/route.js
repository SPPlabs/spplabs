import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma, withRLS } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request) {
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
    let targetDomain = searchParams.get("domain") || session.domain;
    targetDomain = targetDomain.trim().toLowerCase();

    if (session.role !== "ADMIN" && session.domain !== targetDomain) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const db = session.role === "ADMIN" ? prisma : withRLS(website.id);

    const conversations = await db.chatConversation.findMany({
      where: { websiteId: website.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    const formatted = conversations.map(c => ({
      id: c.id,
      visitorId: c.visitorId,
      visitorName: c.visitorName || "Visitante",
      visitorEmail: c.visitorEmail || null,
      status: c.status,
      startedAt: c.startedAt,
      lastMessageAt: c.lastMessageAt,
      firstMessageSnippet: c.messages[0]?.content || "Conversación iniciada",
      messageCount: c.messages.length,
      messages: c.messages,
    }));

    return NextResponse.json({ success: true, conversations: formatted });
  } catch (error) {
    console.error("Fetch conversations error:", error);
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

    const targetConv = await prisma.chatConversation.findUnique({
      where: { id },
      include: { website: true }
    });

    if (!targetConv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && session.domain !== targetConv.website.domain) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = session.role === "ADMIN" ? prisma : withRLS(targetConv.websiteId);

    await db.chatConversation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
