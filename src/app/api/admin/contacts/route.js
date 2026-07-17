import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

// DELETE: Hard Delete Contact Form Submission
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized", message: "No active session" }, { status: 401 });
    }

    const session = await verifyJWT(sessionToken);
    if (!session || !session.domain) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Bad Request", message: "Contact ID is required" }, { status: 400 });
    }

    const contact = await prisma.contactForm.findUnique({
      where: { id },
      include: { website: true },
    });

    if (!contact) {
      return NextResponse.json({ error: "NotFound", message: "Contact submission not found" }, { status: 404 });
    }

    // Enforce permissions
    if (contact.website.domain !== session.domain && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden", message: "Access denied" }, { status: 403 });
    }

    await prisma.contactForm.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Contact submission successfully hard deleted" });
  } catch (error) {
    console.error("DELETE contact submission error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
