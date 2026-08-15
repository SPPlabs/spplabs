import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { sendEmail } from "@/lib/email";
import { generateTestEmailHtml } from "@/lib/emailTemplates";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spp_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized", message: "Missing session" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedDomain = searchParams.get("domain")?.trim().toLowerCase();

    let targetDomain = session.domain;
    if (session.role === "ADMIN" && requestedDomain) {
      targetDomain = requestedDomain;
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    const logs = await prisma.scheduledEmail.findMany({
      where: { websiteId: website.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("GET email-logs error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spp_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized", message: "Missing session" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { domain, testEmail } = body;

    if (!testEmail || !testEmail.includes("@")) {
      return NextResponse.json({ error: "BadRequest", message: "Email de destino inválido" }, { status: 400 });
    }

    let targetDomain = session.domain;
    if (session.role === "ADMIN" && domain) {
      targetDomain = domain.trim().toLowerCase();
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
      include: { emailConfig: true },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    const config = website.emailConfig || {
      senderName: website.displayName,
      brandColor: "#0284c7",
    };

    const htmlContent = generateTestEmailHtml({
      companyName: website.displayName,
      clientDomain: website.domain,
      brandColor: config.brandColor,
    });

    const sendResult = await sendEmail({
      to: testEmail.trim(),
      subject: `[Prueba] Configuración de correo para ${website.displayName}`,
      html: htmlContent,
      senderName: config.senderName || website.displayName,
      replyTo: config.replyToEmail || undefined,
      clientDomain: website.domain,
    });

    // Register log in database
    await prisma.scheduledEmail.create({
      data: {
        websiteId: website.id,
        recipientEmail: testEmail.trim(),
        recipientName: "Test Recipient",
        subject: `[Prueba] Configuración de correo para ${website.displayName}`,
        emailType: "TEST_EMAIL",
        status: sendResult.success ? "SENT" : "FAILED",
        scheduledFor: new Date(),
        sentAt: sendResult.success ? new Date() : null,
        error: sendResult.error || null,
        metadata: { isTest: true, sendResult },
      },
    });

    if (!sendResult.success) {
      return NextResponse.json({
        success: false,
        message: sendResult.error || "No se pudo enviar el correo de prueba",
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Correo de prueba enviado con éxito a ${testEmail}`,
      mock: sendResult.mock || false,
    });
  } catch (error) {
    console.error("POST send test email error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}
