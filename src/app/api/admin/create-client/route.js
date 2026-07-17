import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { generateToken, generateApiKey, hashApiKey } from "@/lib/crypto";

export async function POST(request) {
  try {
    // 1. Authenticate user session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Session required." },
        { status: 401 }
      );
    }

    const session = await verifyJWT(sessionToken);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin access required." },
        { status: 403 }
      );
    }

    // 2. Validate inputs
    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { domain, displayName } = body;
    if (!domain || !displayName) {
      return NextResponse.json(
        { error: "Bad Request", message: "domain and displayName are required." },
        { status: 400 }
      );
    }

    const normalizedDomain = domain.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();

    // Regex check for domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(normalizedDomain) && normalizedDomain !== "localhost") {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid domain name format." },
        { status: 400 }
      );
    }

    // 3. Check if domain already exists
    const existingWebsite = await prisma.website.findUnique({
      where: { domain: normalizedDomain },
    });

    if (existingWebsite) {
      return NextResponse.json(
        { error: "Conflict", message: `Domain '${normalizedDomain}' is already registered.` },
        { status: 409 }
      );
    }

    // 4. Generate keys and tokens
    const rawSignupToken = generateToken();
    const rawApiKey = generateApiKey();
    const hashedKey = await hashApiKey(rawApiKey);

    // 5. Create Database Entries
    const { website, signupToken } = await prisma.$transaction(async (tx) => {
      // Create Website
      const newWebsite = await tx.website.create({
        data: {
          domain: normalizedDomain,
          displayName: cleanDisplayName,
          role: "USER",
          // passwordHash and registeredAt are null until signup
        },
      });

      // Create Signup Token
      const newToken = await tx.signupToken.create({
        data: {
          domain: normalizedDomain,
          token: rawSignupToken,
        },
      });

      // Create Website API Key
      await tx.websiteApiKey.create({
        data: {
          websiteId: newWebsite.id,
          name: "Default API Key",
          keyHash: hashedKey,
        },
      });

      return { website: newWebsite, signupToken: newToken };
    });

    // 6. Return response containing unhashed credentials
    return NextResponse.json({
      success: true,
      website: {
        id: website.id,
        domain: website.domain,
        displayName: website.displayName,
        createdAt: website.createdAt,
      },
      signupToken: signupToken.token,
      rawApiKey: rawApiKey, // Only visible here once
    });
  } catch (error) {
    console.error("Admin create-client error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create client user." },
      { status: 500 }
    );
  }
}
