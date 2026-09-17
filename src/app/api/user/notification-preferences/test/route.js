import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { sendTenantNotification } from "@/lib/userNotifications";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spp_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized", message: "Missing session" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session || !session.domain) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      // empty body is fine
    }

    const requestedDomain = body.domain?.trim().toLowerCase();
    let targetDomain = session.domain;
    if (session.role === "ADMIN" && requestedDomain) {
      targetDomain = requestedDomain;
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
      include: { userNotificationPreference: true },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Website not found" }, { status: 404 });
    }

    const pref = website.userNotificationPreference;
    if (!pref || !pref.enabled) {
      return NextResponse.json(
        {
          error: "BadRequest",
          message: "Debes activar las notificaciones y guardar un correo antes de enviar una prueba.",
        },
        { status: 400 }
      );
    }

    if (!pref.notificationEmail) {
      return NextResponse.json(
        {
          error: "BadRequest",
          message: "No hay una dirección de correo configurada para recibir notificaciones.",
        },
        { status: 400 }
      );
    }

    // Send a test general summary notification
    const res = await sendTenantNotification({
      websiteId: website.id,
      type: "general_summary",
      title: "Prueba de Notificación de Actividad",
      message:
        "Este es un correo de prueba para verificar que tu sistema de notificaciones por email de SPP Labs funciona correctamente. Cada vez que haya nueva actividad en tu web, recibirás un aviso similar para mantenerte informado.",
      ctaText: "Acceder a mi Panel de Control",
      ctaUrl: "/dashboard",
      summaryItems: [
        "1 nuevo formulario de contacto recibido",
        "2 citas agendadas pendientes de confirmar",
        "3 conversaciones con el Asistente IA",
        "Informe mensual disponible para consulta",
      ],
    });

    if (!res.success && !res.skipped) {
      return NextResponse.json(
        { error: "EmailError", message: res.error || "No se pudo entregar el correo de prueba." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Correo de prueba enviado a ${pref.notificationEmail}`,
      recipientEmail: pref.notificationEmail,
    });
  } catch (error) {
    console.error("POST notification-preferences test error:", error);
    return NextResponse.json({ error: "InternalError", message: error.message }, { status: 500 });
  }
}
