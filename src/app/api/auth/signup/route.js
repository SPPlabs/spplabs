import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { signJWT } from "@/lib/jwt";

export async function POST(request) {
  try {
    const body = await request.json();
    const { domain, token, password } = body;

    if (!domain || !token || !password) {
      return NextResponse.json(
        { error: "Domain, signup token, and password are required" },
        { status: 400 }
      );
    }

    const normalizedDomain = domain.trim().toLowerCase();
    const cleanToken = token.trim();

    // 1. Verify token exists for this domain
    const signupToken = await prisma.signupToken.findFirst({
      where: {
        domain: normalizedDomain,
        token: cleanToken,
      },
    });

    if (!signupToken) {
      return NextResponse.json(
        { error: "Invalid domain or signup token" },
        { status: 400 }
      );
    }

    // 2. Find pre-created website record
    const website = await prisma.website.findUnique({
      where: { domain: normalizedDomain },
    });

    if (!website) {
      return NextResponse.json(
        { error: "No pending website found for this domain" },
        { status: 404 }
      );
    }

    if (website.passwordHash) {
      return NextResponse.json(
        { error: "This domain has already been registered and signed up" },
        { status: 400 }
      );
    }

    // 3. Hash the client's new password with Argon2id
    const hashedPassword = await hashPassword(password);

    // 4. Update the website record
    const updatedWebsite = await prisma.website.update({
      where: { id: website.id },
      data: {
        passwordHash: hashedPassword,
        registeredAt: new Date(),
      },
    });

    // 5. Delete the token so it cannot be used again
    await prisma.signupToken.delete({
      where: { id: signupToken.id },
    });

    // 6. Log the client in automatically
    const sessionToken = await signJWT({
      id: updatedWebsite.id,
      domain: updatedWebsite.domain,
      role: updatedWebsite.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("spp_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedWebsite.id,
        domain: updatedWebsite.domain,
        displayName: updatedWebsite.displayName,
        role: updatedWebsite.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during signup" },
      { status: 500 }
    );
  }
}
