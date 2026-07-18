import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

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

    // Perform hard delete (cascades on other models automatically)
    await prisma.website.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "User account deleted successfully." });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
