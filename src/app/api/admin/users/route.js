import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { deleteWebsiteVectors } from "@/core/services/ai/qdrant";
import { clickhouseDeleteWebsiteEvents } from "@/lib/clickhouse";

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyJWT(sessionToken);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden", message: "Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    // Find if user exists
    const user = await prisma.website.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Do not allow deleting own admin account
    if (user.domain === "spplabs.es") {
      return NextResponse.json({ error: "Forbidden", message: "Cannot delete own admin account." }, { status: 403 });
    }

    // 1. Delete Qdrant vector embeddings for this websiteId
    try {
      await deleteWebsiteVectors(user.id);
      console.log(`[Qdrant] Cleaned vector store for websiteId: ${user.id}`);
    } catch (qdrantErr) {
      console.error(`[Qdrant] Deletion warning for websiteId ${user.id}:`, qdrantErr);
    }

    // 2. Delete ClickHouse analytics events for this domain and websiteId
    try {
      await clickhouseDeleteWebsiteEvents(user.domain);
      await clickhouseDeleteWebsiteEvents(user.id);
      console.log(`[ClickHouse] Cleaned analytics data for domain: ${user.domain}`);
    } catch (chErr) {
      console.error(`[ClickHouse] Deletion warning for domain ${user.domain}:`, chErr);
    }

    // 3. Delete any signup tokens for this domain from PostgreSQL
    try {
      await prisma.signupToken.deleteMany({
        where: { domain: user.domain },
      });
    } catch (tokenErr) {
      console.error(`[PostgreSQL] SignupToken cleanup warning:`, tokenErr);
    }

    // 4. Perform hard delete in PostgreSQL (cascades on related models automatically)
    await prisma.website.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "User account and all associated data in PostgreSQL, ClickHouse, and Qdrant deleted successfully." });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
