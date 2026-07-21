import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { clickhouseQuery } from "@/lib/clickhouse";

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

    // Enforce admin permission for impersonation
    if (targetDomain !== payload.domain && payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden", message: "Access denied" }, { status: 403 });
    }

    // Verify the target domain exists
    const website = await prisma.website.findUnique({
      where: { domain: targetDomain },
    });

    if (!website) {
      return NextResponse.json({ error: "NotFound", message: "Domain not registered" }, { status: 404 });
    }    // 2. Resolve query timeframe and build trend query
    const timeframe = url.searchParams.get("timeframe") || "week";

    let timeClause = "";
    let prevTimeClause = "";
    let periodLabel = "vs periodo anterior";

    if (timeframe === "day") {
      timeClause = "AND event_time >= now() - interval 24 hour";
      prevTimeClause = "AND event_time >= now() - interval 48 hour AND event_time < now() - interval 24 hour";
      periodLabel = "vs día anterior";
    } else if (timeframe === "week") {
      timeClause = "AND event_time >= now() - interval 7 day";
      prevTimeClause = "AND event_time >= now() - interval 14 day AND event_time < now() - interval 7 day";
      periodLabel = "vs semana anterior";
    } else if (timeframe === "month") {
      timeClause = "AND event_time >= now() - interval 30 day";
      prevTimeClause = "AND event_time >= now() - interval 60 day AND event_time < now() - interval 30 day";
      periodLabel = "vs mes anterior";
    } else if (timeframe === "year") {
      timeClause = "AND event_time >= now() - interval 365 day";
      prevTimeClause = "AND event_time >= now() - interval 730 day AND event_time < now() - interval 365 day";
      periodLabel = "vs año anterior";
    } else {
      // all time
      timeClause = "";
      prevTimeClause = "";
      periodLabel = "total histórico";
    }

    let trendQuery = "";
    if (timeframe === "day") {
      trendQuery = `
        SELECT 
          toHour(event_time) as hour,
          count() as count
        FROM analytics_events
        WHERE website_id = {website_id: String}
        AND event_time >= now() - interval 24 hour
        GROUP BY hour
        ORDER BY hour ASC
      `;
    } else if (timeframe === "week") {
      trendQuery = `
        SELECT 
          formatDateTime(event_time, '%Y-%m-%d') as date,
          count() as count
        FROM analytics_events
        WHERE website_id = {website_id: String}
        AND event_time >= now() - interval 7 day
        GROUP BY date
        ORDER BY date ASC
      `;
    } else if (timeframe === "month") {
      trendQuery = `
        SELECT 
          formatDateTime(event_time, '%Y-%m-%d') as date,
          count() as count
        FROM analytics_events
        WHERE website_id = {website_id: String}
        AND event_time >= now() - interval 30 day
        GROUP BY date
        ORDER BY date ASC
      `;
    } else if (timeframe === "year") {
      trendQuery = `
        SELECT 
          formatDateTime(event_time, '%Y-%m') as date,
          count() as count
        FROM analytics_events
        WHERE website_id = {website_id: String}
        AND event_time >= now() - interval 365 day
        GROUP BY date
        ORDER BY date ASC
      `;
    } else {
      // all time
      trendQuery = `
        SELECT 
          formatDateTime(event_time, '%Y-%m') as date,
          count() as count
        FROM analytics_events
        WHERE website_id = {website_id: String}
        GROUP BY date
        ORDER BY date ASC
      `;
    }

    // Execute all queries in parallel to maximize performance
    const [
      overview,
      overviewPrev,
      realtime,
      topPages,
      referrers,
      devices,
      browsers,
      os,
      countries,
      conversions,
      trends,
      spainCities,
    ] = await Promise.all([
      // A. Overview Cards for selected timeframe
      clickhouseQuery(
        `SELECT 
          count() as visitors,
          uniq(visitor_id) as unique_visitors,
          uniq(session_id) as sessions,
          avg(duration_ms) as avg_duration_raw
         FROM analytics_events 
         WHERE website_id = {website_id: String} ${timeClause}`,
        { website_id: targetDomain }
      ),
      // A2. Overview Cards for previous period (real comparison calculation)
      prevTimeClause ? clickhouseQuery(
        `SELECT 
          count() as visitors,
          uniq(visitor_id) as unique_visitors,
          uniq(session_id) as sessions
         FROM analytics_events 
         WHERE website_id = {website_id: String} ${prevTimeClause}`,
        { website_id: targetDomain }
      ) : Promise.resolve([]),
      // B. Real-time active visitors (last 5 minutes)
      clickhouseQuery(
        `SELECT uniq(visitor_id) as active_visitors
         FROM analytics_events
         WHERE website_id = {website_id: String}
         AND event_time >= now() - interval 5 minute`,
        { website_id: targetDomain }
      ),
      // C. Top pages
      clickhouseQuery(
        `SELECT page_url, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${timeClause}
         AND event_type = 'page_view'
         GROUP BY page_url
         ORDER BY count DESC
         LIMIT 10`,
        { website_id: targetDomain }
      ),
      // D. Traffic Referrers
      clickhouseQuery(
        `SELECT referrer, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${timeClause}
         GROUP BY referrer
         ORDER BY count DESC
         LIMIT 10`,
        { website_id: targetDomain }
      ),
      // E. Devices
      clickhouseQuery(
        `SELECT device_type, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${timeClause}
         GROUP BY device_type
         ORDER BY count DESC`,
        { website_id: targetDomain }
      ),
      // F. Browsers
      clickhouseQuery(
        `SELECT browser, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${timeClause}
         GROUP BY browser
         ORDER BY count DESC`,
        { website_id: targetDomain }
      ),
      // G. Operating Systems
      clickhouseQuery(
        `SELECT os, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${timeClause}
         GROUP BY os
         ORDER BY count DESC`,
        { website_id: targetDomain }
      ),
      // H. Countries
      clickhouseQuery(
        `SELECT country, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${timeClause}
         GROUP BY country
         ORDER BY count DESC
         LIMIT 10`,
        { website_id: targetDomain }
      ),
      // I. Conversions
      clickhouseQuery(
        `SELECT event_type, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${timeClause}
         AND event_type IN ('form_submit', 'booking_created', 'button_click', 'outbound_link')
         GROUP BY event_type`,
        { website_id: targetDomain }
      ),
      // J. Dynamic Trends
      clickhouseQuery(trendQuery, { website_id: targetDomain }),
      // K. Spain Cities
      clickhouseQuery(
        `SELECT city, count() as count
         FROM analytics_events
         WHERE website_id = {website_id: String} ${timeClause}
         AND (country = 'Spain' OR country = 'ES')
         GROUP BY city
         ORDER BY count DESC
         LIMIT 10`,
        { website_id: targetDomain }
      ),
    ]);

    // Parse bounce rate from overview data
    const bounceRes = await clickhouseQuery(
      `SELECT count() as bounce_sessions_count FROM (
        SELECT session_id, count() as pv_count 
        FROM analytics_events 
        WHERE website_id = {website_id: String} ${timeClause}
        GROUP BY session_id
        HAVING pv_count = 1
      )`,
      { website_id: targetDomain }
    );

    const stats = overview[0] || { visitors: 0, unique_visitors: 0, sessions: 0, avg_duration_raw: 0 };
    const prevStats = (overviewPrev && overviewPrev[0]) ? overviewPrev[0] : { visitors: 0, unique_visitors: 0, sessions: 0 };

    const calcPct = (curr, prev) => {
      const c = Number(curr || 0);
      const p = Number(prev || 0);
      if (p === 0) {
        return c > 0 ? "↑ +100%" : "0.0%";
      }
      const pct = ((c - p) / p) * 100;
      if (pct > 0) return `↑ +${pct.toFixed(1)}%`;
      if (pct < 0) return `↓ ${pct.toFixed(1)}%`;
      return "0.0%";
    };

    const visitorsGrowth = calcPct(stats.visitors, prevStats.visitors);
    const uniqueGrowth = calcPct(stats.unique_visitors, prevStats.unique_visitors);
    const sessionsGrowth = calcPct(stats.sessions, prevStats.sessions);

    const sessionsCount = Number(stats.sessions || 0);
    const bounceSessions = Number(bounceRes[0]?.bounce_sessions_count || 0);
    const bounceRate = sessionsCount > 0 ? Math.round((bounceSessions / sessionsCount) * 100) : 0;
    
    const avgDurationSeconds = sessionsCount > 0 
      ? Math.round(Number(stats.avg_duration_raw || 0) / 1000) 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        domain: targetDomain,
        overview: {
          visitors: Number(stats.visitors || 0),
          visitors_growth: visitorsGrowth,
          unique_visitors: Number(stats.unique_visitors || 0),
          unique_growth: uniqueGrowth,
          sessions: sessionsCount,
          sessions_growth: sessionsGrowth,
          bounce_rate: bounceRate,
          avg_duration: avgDurationSeconds,
          active_visitors: Number(realtime[0]?.active_visitors || 0),
          period_label: periodLabel,
        },
        topPages,
        referrers: referrers.map(r => ({
          referrer: r.referrer || "Direct / None",
          count: Number(r.count),
        })),
        devices,
        browsers,
        os,
        countries,
        conversions,
        trends: trends.map(t => ({
          date: t.date || (t.hour !== undefined ? `${t.hour}:00` : "Unknown"),
          count: Number(t.count)
        })),
        spainCities,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics API error:", error);
    return NextResponse.json({ error: "Internal Server Error", message: "Failed to load dashboard analytics" }, { status: 500 });
  }
}
