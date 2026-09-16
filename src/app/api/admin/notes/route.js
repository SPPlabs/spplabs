import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma, withRLS } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

async function getAuthAndTargetWebsite(request, bodyDomain = null) {
  const cookieStore = await cookies();
  const token = cookieStore.get("spp_session")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };

  const session = await verifyJWT(token);
  if (!session) return { error: "Unauthorized", status: 401 };

  const { searchParams } = new URL(request.url);
  const requestedDomain = (searchParams.get("domain") || bodyDomain)?.trim().toLowerCase();

  let targetDomain = session.domain;
  if (session.role === "ADMIN" && requestedDomain) {
    targetDomain = requestedDomain;
  }

  const website = await prisma.website.findUnique({
    where: { domain: targetDomain },
  });

  if (!website) {
    return { error: "Website not found", status: 404 };
  }

  return { session, website };
}

export async function GET(request) {
  try {
    const auth = await getAuthAndTargetWebsite(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session, website } = auth;
    const db = session.role === "ADMIN" ? prisma : withRLS(website.id);

    const allNotes = await db.dashboardNote.findMany({
      where: { websiteId: website.id },
      orderBy: [
        { pinned: "desc" },
        { updatedAt: "desc" },
      ],
    });

    const catalogNote = allNotes.find((n) => n.role === "__SYSTEM_TAGS_CATALOG__");
    let tags = [];
    if (catalogNote && catalogNote.content) {
      try {
        const parsed = JSON.parse(catalogNote.content);
        if (Array.isArray(parsed)) tags = parsed;
      } catch {
        tags = [];
      }
    }

    const notes = allNotes.filter((n) => n.role !== "__SYSTEM_TAGS_CATALOG__");

    return NextResponse.json({ success: true, notes, tags });
  } catch (error) {
    console.error("GET /api/admin/notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const auth = await getAuthAndTargetWebsite(request, body?.domain);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session, website } = auth;

    // Special action: Sync / Persist website custom tags catalog
    if (body.action === "sync_tags") {
      const tags = Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim().replace(/^#+/, "")).filter(Boolean)
        : [];

      const db = session.role === "ADMIN" ? prisma : withRLS(website.id);

      const existingCatalog = await db.dashboardNote.findFirst({
        where: {
          websiteId: website.id,
          role: "__SYSTEM_TAGS_CATALOG__",
        },
      });

      let updatedNote;
      if (existingCatalog) {
        updatedNote = await db.dashboardNote.update({
          where: { id: existingCatalog.id },
          data: {
            content: JSON.stringify(tags),
          },
        });
      } else {
        updatedNote = await db.dashboardNote.create({
          data: {
            websiteId: website.id,
            type: "NOTE",
            title: "__SPP_TAGS_CATALOG__",
            content: JSON.stringify(tags),
            role: "__SYSTEM_TAGS_CATALOG__",
          },
        });
      }

      return NextResponse.json({ success: true, tags, noteId: updatedNote.id });
    }

    const { type, title, content, email, phone, role, tag, color, pinned } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title/Name is required" }, { status: 400 });
    }

    const validTypes = ["NOTE", "CLIENT", "STAFF"];
    const noteType = validTypes.includes(type) ? type : "NOTE";

    const db = session.role === "ADMIN" ? prisma : withRLS(website.id);

    const note = await db.dashboardNote.create({
      data: {
        websiteId: website.id,
        type: noteType,
        title: title.trim(),
        content: content?.trim() || "",
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        role: role?.trim() || null,
        tag: tag?.trim() || null,
        color: color?.trim() || null,
        pinned: Boolean(pinned),
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("POST /api/admin/notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const auth = await getAuthAndTargetWebsite(request, body?.domain);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session, website } = auth;
    const { id, type, title, content, email, phone, role, tag, color, pinned } = body;

    if (!id) {
      return NextResponse.json({ error: "Note id is required" }, { status: 400 });
    }

    const db = session.role === "ADMIN" ? prisma : withRLS(website.id);

    // Verify note exists and belongs to this website
    const existing = await db.dashboardNote.findFirst({
      where: { id, websiteId: website.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updateData = {};
    if (type !== undefined) {
      const validTypes = ["NOTE", "CLIENT", "STAFF"];
      if (validTypes.includes(type)) updateData.type = type;
    }
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (role !== undefined) updateData.role = role ? role.trim() : null;
    if (tag !== undefined) updateData.tag = tag ? tag.trim() : null;
    if (color !== undefined) updateData.color = color ? color.trim() : null;
    if (pinned !== undefined) updateData.pinned = Boolean(pinned);

    const updated = await db.dashboardNote.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, note: updated });
  } catch (error) {
    console.error("PATCH /api/admin/notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  return PATCH(request);
}

export async function DELETE(request) {
  try {
    const auth = await getAuthAndTargetWebsite(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session, website } = auth;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tagToDelete = searchParams.get("tag");

    const db = session.role === "ADMIN" ? prisma : withRLS(website.id);

    // If deleting an entire tag: update all notes with this tag to tag: null
    if (tagToDelete) {
      const cleanTag = tagToDelete.trim().replace(/^#+/, "").trim();
      const result = await db.dashboardNote.updateMany({
        where: {
          websiteId: website.id,
          tag: {
            equals: cleanTag,
            mode: "insensitive",
          },
        },
        data: {
          tag: null,
        },
      });

      // Also remove from server tags catalog if present
      const existingCatalog = await db.dashboardNote.findFirst({
        where: {
          websiteId: website.id,
          role: "__SYSTEM_TAGS_CATALOG__",
        },
      });

      if (existingCatalog && existingCatalog.content) {
        try {
          const parsed = JSON.parse(existingCatalog.content);
          if (Array.isArray(parsed)) {
            const updated = parsed.filter((t) => t.toLowerCase() !== cleanTag.toLowerCase());
            await db.dashboardNote.update({
              where: { id: existingCatalog.id },
              data: { content: JSON.stringify(updated) },
            });
          }
        } catch (e) {
          console.error("Error updating tags catalog in DELETE:", e);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Tag "${cleanTag}" removed from notes`,
        affectedCount: result.count,
      });
    }

    if (!id) {
      return NextResponse.json({ error: "id or tag is required" }, { status: 400 });
    }

    const existing = await db.dashboardNote.findFirst({
      where: { id, websiteId: website.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await db.dashboardNote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
