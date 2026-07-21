import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { signJWT } from "@/lib/jwt";

export async function POST(request) {
  try {
    const body = await request.json();
    const { domain, password } = body;

    if (!domain || !password) {
      return NextResponse.json(
        { error: "Domain and password are required" },
        { status: 400 }
      );
    }

    // Normalized domain lookup (lowercase)
    const normalizedDomain = domain.trim().toLowerCase();

    // Find the website
    const website = await prisma.website.findUnique({
      where: { domain: normalizedDomain },
    });

    if (!website || !website.passwordHash) {
      return NextResponse.json(
        { error: "Invalid domain or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, website.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid domain or password" },
        { status: 401 }
      );
    }

    // Create session token
    const token = await signJWT({
      id: website.id,
      domain: website.domain,
      role: website.role,
    });

    // Set cookie (HttpOnly, Secure, SameSite=Lax)
    const cookieStore = await cookies();
    cookieStore.set("spp_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({
      success: true,
      user: {
        id: website.id,
        domain: website.domain,
        displayName: website.displayName,
        role: website.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
