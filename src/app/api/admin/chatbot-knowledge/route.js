import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { syncWebsiteKnowledge } from "@/core/services/ai";

/**
 * Handles POST requests to save chatbot knowledge to PostgreSQL (Prisma)
 * and trigger safe multi-tenant vector synchronization in Qdrant.
 */
export async function POST(request) {
  try {
    // 1. Authenticate user session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyJWT(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
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

    // 3. Security: Check if user owns the requested domain, or is an ADMIN
    if (session.role !== "ADMIN" && session.domain !== domain) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Resolve the target Website using the domain
    const targetWebsite = await prisma.website.findUnique({
      where: { domain: domain.trim().toLowerCase() },
    });

    if (!targetWebsite) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // 5. Update ChatbotKnowledge record in PostgreSQL (Database is single source of truth)
    const kb = await prisma.chatbotKnowledge.upsert({
      where: { websiteId: targetWebsite.id },
      update: { content: content },
      create: { websiteId: targetWebsite.id, content: content },
    });

    // 6. Attempt Qdrant vector index synchronization using validated targetWebsite.id (UUID)
    try {
      await syncWebsiteKnowledge(targetWebsite.id, content);
      
      // Update lastSyncedAt timestamp ONLY upon successful Qdrant ingestion
      const updatedKb = await prisma.chatbotKnowledge.update({
        where: { id: kb.id },
        data: { lastSyncedAt: new Date() },
      });
      
      return NextResponse.json({ success: true, chatbotKnowledge: updatedKb });
    } catch (syncError) {
      console.error(`PostgreSQL knowledge saved successfully for websiteId: ${targetWebsite.id}, but Qdrant synchronization failed:`, syncError);
      
      // Return partial success: Database was saved, but vector sync failed and needs a retry.
      // PostgreSQL is NOT rolled back.
      return NextResponse.json({
        success: true,
        chatbotKnowledge: kb,
        warning: "Your knowledge base was saved successfully to the database, but synchronization with the AI vector index failed. Please try saving again to sync.",
        syncError: syncError instanceof Error ? syncError.message : String(syncError),
      });
    }

  } catch (error) {
    console.error("Chatbot knowledge update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
