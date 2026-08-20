import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { clickhouseQuery } from "@/lib/clickhouse";
import { generateChatCompletion } from "@/core/services/ai";

export async function GET(request) {
  try {
    // 1. Authenticate user session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("spp_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized", message: "No active session" }, { status: 401 });
    }

    const payload = await verifyJWT(sessionToken);
    if (!payload || !payload.domain) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session token" }, { status: 401 });
    }

    // Determine target domain (admin can impersonate)
    const url = new URL(request.url);
    let targetDomain = url.searchParams.get("domain") || payload.domain;
    targetDomain = targetDomain.trim().toLowerCase();

    if (targetDomain !== payload.domain && payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden", message: "Access denied" }, { status: 403 });
    }

    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Domain not registered" }, { status: 404 });
    }

    // 2. Parse year and month parameters (Default to current date)
    const now = new Date();
    const targetYear = parseInt(url.searchParams.get("year") || String(now.getFullYear()), 10);
    const targetMonth = parseInt(url.searchParams.get("month") || String(now.getMonth() + 1), 10);
    const enableCompare = url.searchParams.get("compare") === "true";

    // Build date boundaries for target month
    const startDateObj = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0));
    const lastDayOfMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getDate();
    const endDateObj = new Date(Date.UTC(targetYear, targetMonth - 1, lastDayOfMonth, 23, 59, 59, 999));

    const startISO = startDateObj.toISOString().replace("T", " ").substring(0, 19);
    const endISO = endDateObj.toISOString().replace("T", " ").substring(0, 19);

    // Build date boundaries for previous month (for optional comparison)
    let prevYear = targetYear;
    let prevMonth = targetMonth - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevStartDateObj = new Date(Date.UTC(prevYear, prevMonth - 1, 1, 0, 0, 0));
    const prevLastDay = new Date(Date.UTC(prevYear, prevMonth, 0)).getDate();
    const prevEndDateObj = new Date(Date.UTC(prevYear, prevMonth - 1, prevLastDay, 23, 59, 59, 999));

    const prevStartISO = prevStartDateObj.toISOString().replace("T", " ").substring(0, 19);
    const prevEndISO = prevEndDateObj.toISOString().replace("T", " ").substring(0, 19);

    const monthTimeClause = `AND event_time >= '${startISO}' AND event_time <= '${endISO}'`;
    const prevMonthTimeClause = `AND event_time >= '${prevStartISO}' AND event_time <= '${prevEndISO}'`;

    // 3. Query ClickHouse Analytics for Target Month
    const [
      overview,
      prevOverview,
      dailyTrend,
      hourlyDist,
      topPages,
      referrers,
      devices,
      browsers,
      spainCities,
      countries,
    ] = await Promise.all([
      // Overview stats
      clickhouseQuery(
        `SELECT 
          count() as visitors,
          uniq(visitor_id) as unique_visitors,
          uniq(session_id) as sessions,
          avg(duration_ms) as avg_duration_raw
         FROM analytics_events 
         WHERE website_id = {website_id: String} ${monthTimeClause}`,
        { website_id: targetDomain }
      ),
      // Prev Overview stats (only fetched if comparison is enabled or for fallback ratio)
      clickhouseQuery(
        `SELECT 
          count() as visitors,
          uniq(visitor_id) as unique_visitors,
          uniq(session_id) as sessions
         FROM analytics_events 
         WHERE website_id = {website_id: String} ${prevMonthTimeClause}`,
        { website_id: targetDomain }
      ),
      // Daily Trend
      clickhouseQuery(
        `SELECT 
          formatDateTime(event_time, '%Y-%m-%d') as date,
          count() as count,
          uniq(visitor_id) as unique_visitors
         FROM analytics_events
         WHERE website_id = {website_id: String} ${monthTimeClause}
         GROUP BY date
         ORDER BY date ASC`,
        { website_id: targetDomain }
      ),
      // Hourly distribution
      clickhouseQuery(
        `SELECT 
          toHour(event_time) as hour,
          count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${monthTimeClause}
         GROUP BY hour
         ORDER BY hour ASC`,
        { website_id: targetDomain }
      ),
      // Top Pages
      clickhouseQuery(
        `SELECT page_url, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${monthTimeClause}
         AND event_type = 'page_view'
         AND page_url NOT IN ('/hola', '/test', '/demo', '/api', '/admin', '/wp-admin', '/wp-login.php', '/.env')
         AND page_url NOT LIKE '/api/%'
         AND page_url NOT LIKE '%.env%'
         AND page_url NOT LIKE '%.php%'
         GROUP BY page_url
         ORDER BY count DESC
         LIMIT 10`,
        { website_id: targetDomain }
      ),
      // Referrers
      clickhouseQuery(
        `SELECT referrer, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${monthTimeClause}
         AND referrer NOT IN ('', 'null', 'undefined')
         GROUP BY referrer
         ORDER BY count DESC
         LIMIT 10`,
        { website_id: targetDomain }
      ),
      // Devices
      clickhouseQuery(
        `SELECT device_type, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${monthTimeClause}
         AND device_type NOT IN ('API', 'Server', 'Bot', 'Unknown', '')
         GROUP BY device_type
         ORDER BY count DESC`,
        { website_id: targetDomain }
      ),
      // Browsers
      clickhouseQuery(
        `SELECT browser, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${monthTimeClause}
         AND browser NOT IN ('Node', 'Server', 'Unknown', 'curl', 'PostmanRuntime', 'axios', 'Python', '')
         GROUP BY browser
         ORDER BY count DESC`,
        { website_id: targetDomain }
      ),
      // Spain Cities
      clickhouseQuery(
        `SELECT city, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${monthTimeClause}
         AND (country = 'Spain' OR country = 'ES')
         GROUP BY city
         ORDER BY count DESC
         LIMIT 10`,
        { website_id: targetDomain }
      ),
      // Countries
      clickhouseQuery(
        `SELECT country, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${monthTimeClause}
         GROUP BY country
         ORDER BY count DESC
         LIMIT 10`,
        { website_id: targetDomain }
      ),
    ]);

    // Bounce Rate query
    const bounceRes = await clickhouseQuery(
      `SELECT count() as bounce_sessions_count FROM (
        SELECT session_id, count() as pv_count 
        FROM analytics_events 
        WHERE website_id = {website_id: String} ${monthTimeClause}
        GROUP BY session_id
        HAVING pv_count = 1
      )`,
      { website_id: targetDomain }
    );

    // 4. Query PostgreSQL (Prisma) for CRM Data & Aggregated Monthly Metrics
    const [liveContactFormsCount, liveBookings, liveChatConversationsCount, aiTokenUsage, monthlyMetrics] = await Promise.all([
      prisma.contactForm.count({
        where: {
          websiteId: website.id,
          createdAt: { gte: startDateObj, lte: endDateObj },
        },
      }),
      prisma.booking.findMany({
        where: {
          websiteId: website.id,
          createdAt: { gte: startDateObj, lte: endDateObj },
        },
      }),
      prisma.chatConversation.count({
        where: {
          websiteId: website.id,
          startedAt: { gte: startDateObj, lte: endDateObj },
        },
      }),
      prisma.aiUsageMonthly.findUnique({
        where: {
          websiteId_year_month: {
            websiteId: website.id,
            year: targetYear,
            month: targetMonth,
          },
        },
      }),
      prisma.websiteMonthlyMetrics.findUnique({
        where: {
          websiteId_year_month: {
            websiteId: website.id,
            year: targetYear,
            month: targetMonth,
          },
        },
      }),
    ]);

    // Live bookings metrics
    const liveConfirmed = liveBookings.filter(b => b.status === "CONFIRMED").length;
    const livePending = liveBookings.filter(b => b.status === "PENDING").length;
    const liveOffHours = liveBookings.filter(b => {
      const created = new Date(b.createdAt);
      const hour = created.getHours();
      const day = created.getDay(); // 0 is Sunday, 6 is Saturday
      return hour < 9 || hour >= 19 || day === 0 || day === 6;
    }).length;

    // Combined metrics: Protected against user deletions using aggregated metrics
    const contactFormsCount = Math.max(monthlyMetrics?.contactFormsCount || 0, liveContactFormsCount);
    const totalBookings = Math.max(monthlyMetrics?.totalBookingsCount || 0, liveBookings.length);
    const confirmedBookings = Math.max(monthlyMetrics?.confirmedBookings || 0, liveConfirmed);
    const pendingBookings = Math.max(monthlyMetrics?.pendingBookings || 0, livePending);
    const offHoursBookings = Math.max(monthlyMetrics?.offHoursBookings || 0, liveOffHours);
    const chatConversationsCount = Math.max(monthlyMetrics?.chatConversations || 0, liveChatConversationsCount);

    // Auto-seed/sync baseline into websiteMonthlyMetrics if live data is higher
    if (
      !monthlyMetrics ||
      liveContactFormsCount > (monthlyMetrics.contactFormsCount || 0) ||
      liveBookings.length > (monthlyMetrics.totalBookingsCount || 0) ||
      liveChatConversationsCount > (monthlyMetrics.chatConversations || 0)
    ) {
      prisma.websiteMonthlyMetrics.upsert({
        where: {
          websiteId_year_month: {
            websiteId: website.id,
            year: targetYear,
            month: targetMonth,
          },
        },
        update: {
          contactFormsCount,
          totalBookingsCount: totalBookings,
          confirmedBookings,
          pendingBookings,
          offHoursBookings,
          chatConversations: chatConversationsCount,
        },
        create: {
          websiteId: website.id,
          year: targetYear,
          month: targetMonth,
          contactFormsCount,
          totalBookingsCount: totalBookings,
          confirmedBookings,
          pendingBookings,
          offHoursBookings,
          chatConversations: chatConversationsCount,
        },
      }).catch(err => console.error("Auto-sync baseline monthly metrics error:", err));
    }

    // Overview Stats formatting
    const currStats = overview[0] || { visitors: 0, unique_visitors: 0, sessions: 0, avg_duration_raw: 0 };
    const prevStats = prevOverview[0] || { visitors: 0, unique_visitors: 0, sessions: 0 };

    const totalVisitors = Number(currStats.visitors || 0);
    const uniqueVisitors = Number(currStats.unique_visitors || 0);
    const totalSessions = Number(currStats.sessions || 0);
    const bounceSessions = Number(bounceRes[0]?.bounce_sessions_count || 0);
    const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 100) : 0;
    const avgDurationSec = totalSessions > 0 ? Math.round(Number(currStats.avg_duration_raw || 0) / 1000) : 0;

    // Conversion rate (Visits to Leads/Bookings)
    const totalLeads = contactFormsCount + totalBookings;
    const leadConversionRate = uniqueVisitors > 0 ? ((totalLeads / uniqueVisitors) * 100).toFixed(1) : "0.0";

    // Growth calculation (only computed if comparison enabled)
    const calcGrowth = (curr, prev) => {
      const c = Number(curr || 0);
      const p = Number(prev || 0);
      if (p === 0) return c > 0 ? "+100%" : "0%";
      const pct = ((c - p) / p) * 100;
      return pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
    };

    const comparisonData = enableCompare ? {
      visitors_growth: calcGrowth(totalVisitors, prevStats.visitors),
      unique_growth: calcGrowth(uniqueVisitors, prevStats.unique_visitors),
      sessions_growth: calcGrowth(totalSessions, prevStats.sessions),
      prev_visitors: Number(prevStats.visitors || 0),
      prev_unique: Number(prevStats.unique_visitors || 0),
      prev_sessions: Number(prevStats.sessions || 0),
    } : null;

    // 5. Positive ROI AI Insights Generator
    // Generate motivational, positive, value-oriented insights based on actual numbers
    const positiveInsights = generatePositiveInsights({
      websiteDisplayName: website.displayName,
      domain: targetDomain,
      monthName: getMonthNameEs(targetMonth),
      year: targetYear,
      totalVisitors,
      uniqueVisitors,
      totalSessions,
      contactFormsCount,
      totalBookings,
      confirmedBookings,
      offHoursBookings,
      chatConversationsCount,
      aiTokenUsage,
      topPages,
      referrers,
      devices,
      leadConversionRate,
    });

    // Option: Try invoking LLM for ultra-polished synthesis if available, fallback to structured generator
    let finalInsights = positiveInsights;
    try {
      if (process.env.OPENAI_API_KEY || process.env.VLLM_SERVER_URL) {
        const llmPrompt = `Eres un consultor ejecutivo de marketing digital y negocios. Analiza estos datos mensuales del sitio web "${website.displayName}" (${targetDomain}) para el mes de ${getMonthNameEs(targetMonth)} ${targetYear}:
- Visitantes Únicos: ${uniqueVisitors}
- Total Visitas: ${totalVisitors}
- Formularios de Contacto: ${contactFormsCount}
- Citas Solicitadas: ${totalBookings} (${confirmedBookings} confirmadas, ${offHoursBookings} fuera de horario)
- Chats con Asistente IA: ${chatConversationsCount}
- Top Fuente de Tráfico: ${referrers[0]?.referrer || "Directo"}
- Top Página: ${topPages[0]?.page_url || "/"}

Genera 3 o 4 logros y recomendaciones clave orientadas a DESTACAR LOS BUENOS RESULTADOS, el progreso del negocio y el valor de la automatización. Devuelve UN ARRAY JSON de objetos con el formato exacto:
[
  {
    "id": "1",
    "category": "Captación y Leads",
    "badge": "Logro Destacado",
    "title": "...",
    "description": "...",
    "action": "..."
  }
]`;

        const llmResponse = await generateChatCompletion({
          messages: [{ role: "user", content: llmPrompt }],
          max_tokens: 600,
          temperature: 0.3,
        });

        const rawText = llmResponse.choices?.[0]?.message?.content || "";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            finalInsights = parsed;
          }
        }
      }
    } catch (err) {
      console.log("LLM insight synthesis fallback used:", err.message || err);
    }

    return NextResponse.json({
      success: true,
      data: {
        domain: targetDomain,
        displayName: website.displayName,
        year: targetYear,
        month: targetMonth,
        monthName: getMonthNameEs(targetMonth),
        overview: {
          visitors: totalVisitors,
          unique_visitors: uniqueVisitors,
          sessions: totalSessions,
          bounce_rate: bounceRate,
          avg_duration: avgDurationSec,
          total_leads: totalLeads,
          lead_conversion_rate: leadConversionRate,
        },
        crm: {
          contact_forms: contactFormsCount,
          total_bookings: totalBookings,
          confirmed_bookings: confirmedBookings,
          pending_bookings: pendingBookings,
          off_hours_bookings: offHoursBookings,
          chat_conversations: chatConversationsCount,
          total_tokens: aiTokenUsage ? Number(aiTokenUsage.totalTokens) : 0,
        },
        comparison: comparisonData,
        dailyTrend: dailyTrend.map(t => ({
          date: t.date,
          count: Number(t.count),
          unique_visitors: Number(t.unique_visitors || 0),
        })),
        hourlyDist: hourlyDist.map(h => ({
          hour: `${h.hour}:00`,
          count: Number(h.count),
        })),
        topPages: topPages.map(p => ({ page_url: p.page_url, count: Number(p.count) })),
        referrers: referrers.map(r => ({ referrer: r.referrer || "Directo / Orgánico", count: Number(r.count) })),
        devices: devices.map(d => ({ device: d.device_type, count: Number(d.count) })),
        browsers: browsers.map(b => ({ browser: b.browser, count: Number(b.count) })),
        spainCities: spainCities.map(c => ({ city: c.city, count: Number(c.count) })),
        countries: countries.map(c => ({ country: c.country, count: Number(c.count) })),
        insights: finalInsights,
      },
    });
  } catch (error) {
    console.error("Monthly reports API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to load monthly report data" },
      { status: 500 }
    );
  }
}

// Helper to translate month numbers to Spanish names
function getMonthNameEs(monthNum) {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return months[monthNum - 1] || "Mes actual";
}

// Deterministic positive ROI insights generator (High quality fallback & default engine)
function generatePositiveInsights({
  websiteDisplayName,
  monthName,
  year,
  totalVisitors,
  uniqueVisitors,
  contactFormsCount,
  totalBookings,
  confirmedBookings,
  offHoursBookings,
  chatConversationsCount,
  topPages,
  referrers,
  devices,
  leadConversionRate,
}) {
  const insights = [];

  // Insight 1: 24/7 Automation & Off-hours Wins
  if (offHoursBookings > 0 || chatConversationsCount > 0) {
    const totalAutomated = offHoursBookings + chatConversationsCount;
    insights.push({
      id: "automation_win",
      category: "Disponibilidad 24/7",
      badge: "🚀 Captación Continua",
      title: "Atención y Captación Automática Fuera de Horario",
      description: `Durante ${monthName} de ${year}, la automatización del sitio atendió ${totalAutomated} interacciones y solicitudes fuera del horario comercial habitual.`,
      action: "La presencia digital activa permitió convertir consultas nocturnas y de fin de semana sin requerir atención manual constante.",
    });
  } else {
    insights.push({
      id: "reach_win",
      category: "Presencia Digital",
      badge: "📈 Cobertura Activa",
      title: "Consolidación del Alcance del Sitio Web",
      description: `El sitio web mantuvo una cobertura continua en ${monthName}, alcanzando ${uniqueVisitors || totalVisitors || 1} visitantes únicos durante el mes.`,
      action: "Se recomienda continuar promocionando los servicios clave en la página de inicio para acelerar la captación.",
    });
  }

  // Insight 2: High Conversion & Lead Performance
  const totalLeads = contactFormsCount + totalBookings;
  if (totalLeads > 0) {
    insights.push({
      id: "leads_win",
      category: "Generación de Contactos",
      badge: "🎯 Alto Interés",
      title: `${totalLeads} Oportunidades de Negocio Generadas`,
      description: `Se captaron ${contactFormsCount} formularios de contacto directos y ${totalBookings} solicitudes de cita (${confirmedBookings} confirmadas) en ${monthName}.`,
      action: `La tasa de conversión del sitio alcanzó el ${leadConversionRate}% respecto a los visitantes únicos.`,
    });
  } else {
    insights.push({
      id: "traffic_interest",
      category: "Atención del Cliente",
      badge: "💡 Interés Creciente",
      title: "Interés Sostenido en las Secciones Principales",
      description: `Los usuarios consultaron con mayor frecuencia la sección '${topPages[0]?.page_url || "/"}', registrando ${topPages[0]?.count || totalVisitors} visualizaciones.`,
      action: "Añadir un botón directo de llamada a la acción en esta página aumentará la tasa de respuesta.",
    });
  }

  // Insight 3: Top Traffic Source & Mobile Optimization
  const topSource = referrers[0]?.referrer || "Tráfico Directo / Orgánico";
  const mobileDevice = devices.find(d => d.device === "Mobile")?.count || 0;
  const totalDev = devices.reduce((acc, d) => acc + d.count, 0) || 1;
  const mobilePct = Math.round((mobileDevice / totalDev) * 100);

  if (mobilePct > 50) {
    insights.push({
      id: "mobile_win",
      category: "Experiencia Móvil",
      badge: "📱 Dominio Smartphone",
      title: `Excelente Adaptación para Dispositivos Móviles (${mobilePct}%)`,
      description: `El ${mobilePct}% de tus clientes interactuó desde teléfonos móviles de forma fluida durante el mes.`,
      action: "La optimización móvil garantiza una experiencia ágil para los usuarios en cualquier lugar.",
    });
  } else {
    insights.push({
      id: "source_win",
      category: "Canales de Tráfico",
      badge: "🌐 Canal Principal",
      title: `Liderazgo de Captación desde ${topSource}`,
      description: `${topSource} se posicionó como la principal fuente de atracción de usuarios hacia tu negocio este mes.`,
      action: "Mantener la presencia en este canal reforzará la llegada de nuevos clientes de forma constante.",
    });
  }

  return insights;
}
