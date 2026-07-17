import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Check if cookie exists
    if (cookieStore.has("spp_session")) {
      // Expire the cookie
      cookieStore.set("spp_session", "", { maxAge: 0, path: "/" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during logout" },
      { status: 500 }
    );
  }
}
