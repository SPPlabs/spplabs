"use client";

import React from "react";
import { SppLabsLogo } from "@/components/SppLabsLogo";

export default function MonthlyReportPdfTemplate({
  data,
  currentWebsite,
  currentLogoUrl,
  lang = "es",
}) {
  if (!data || data.isInProgress || data.isBeforeActive) return null;

  const displayName = currentWebsite?.displayName || data.displayName || data.domain || "Cliente";
  const domain = currentWebsite?.domain || data.domain || "";
  const logoUrl = currentLogoUrl || currentWebsite?.logoUrl || data.logoUrl || null;
  const monthName = data.monthName || "";
  const year = data.year || new Date().getFullYear();

  // Date formatting for header
  const reportDateStr = new Date().toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const overview = data.overview || {};
  const crm = data.crm || {};
  const comparison = data.comparison || null;
  const insights = data.insights || [];
  const dailyTrend = data.dailyTrend || [];
  const hourlyDist = data.hourlyDist || [];
  const topPages = (data.topPages || []).slice(0, 5);
  const referrers = (data.referrers || []).slice(0, 5);
  const devices = data.devices || [];
  const browsers = (data.browsers || []).slice(0, 4);
  const spainCities = (data.spainCities || []).slice(0, 4);
  const countries = (data.countries || []).slice(0, 4);

  // Calculate totals
  const totalDeviceCount = devices.reduce((sum, d) => sum + (Number(d.count) || 0), 0) || 1;
  const maxDailyCount = Math.max(...dailyTrend.map((d) => d.count || 0), 1);

  return (
    <div
      id="monthly-report-pdf-container"
      style={{
        width: "794px",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        margin: "0 auto",
      }}
    >
      {/* ========================================================================= */}
      {/* PAGE 1: RESUMEN EJECUTIVO, SCORECARD DE RENDIMIENTO Y ANÁLISIS ESTRATÉGICO */}
      {/* ========================================================================= */}
      <div
        id="report-pdf-page-1"
        style={{
          width: "794px",
          height: "1123px",
          maxHeight: "1123px",
          boxSizing: "border-box",
          padding: "36px 42px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div>
          {/* Executive Corporate Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #0f172a",
              paddingBottom: "16px",
              marginBottom: "18px",
            }}
          >
            {/* SPP Labs Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <SppLabsLogo className="w-6 h-6 text-white" />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "900",
                    letterSpacing: "-0.02em",
                    color: "#0f172a",
                    display: "block",
                  }}
                >
                  SPP LABS
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "800",
                    letterSpacing: "0.08em",
                    color: "#64748b",
                    textTransform: "uppercase",
                  }}
                >
                  Informe Ejecutivo Consolidado
                </span>
              </div>
            </div>

            {/* Client / Company Brand & Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "right" }}>
              <div>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "900",
                    color: "#0f172a",
                    display: "block",
                    lineHeight: "1.2",
                  }}
                >
                  {displayName}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#2563eb",
                    display: "block",
                  }}
                >
                  {domain}
                </span>
              </div>

              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={displayName}
                  crossOrigin="anonymous"
                  style={{
                    width: "46px",
                    height: "46px",
                    objectFit: "contain",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    padding: "3px",
                    backgroundColor: "#f8fafc",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "10px",
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                    fontWeight: "900",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {displayName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Period Title Strip */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "12px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#64748b",
                  display: "block",
                }}
              >
                Periodo Analizado
              </span>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: "900",
                  color: "#0f172a",
                  margin: "2px 0 0 0",
                }}
              >
                {monthName} {year}
              </h1>
            </div>

            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#64748b",
                  display: "block",
                }}
              >
                Emisión Oficial: {reportDateStr}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "800",
                  color: "#16a34a",
                  backgroundColor: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  display: "inline-block",
                  marginTop: "3px",
                }}
              >
                ✓ Ciclo Cerrado y Verificado
              </span>
            </div>
          </div>

          {/* KPI Scorecard Section Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <div style={{ width: "3px", height: "14px", backgroundColor: "#2563eb", borderRadius: "2px" }}></div>
            <h2
              style={{
                fontSize: "12px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#1e293b",
                margin: 0,
              }}
            >
              1. Cuadro de Mando Ejecutivo (KPIs Consolidados)
            </h2>
          </div>

          {/* 8-Card Structured KPI Grid (4 columns x 2 rows) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {/* KPI 1: Unique Visitors */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Visitantes Únicos
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                <span style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                  {(overview.unique_visitors || 0).toLocaleString()}
                </span>
                {comparison?.unique_growth && (
                  <span
                    style={{
                      fontSize: "9.5px",
                      fontWeight: "800",
                      color: comparison.unique_growth.startsWith("+") ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {comparison.unique_growth}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "9px", color: "#64748b", display: "block", marginTop: "2px" }}>
                Total visitas: {(overview.visitors || 0).toLocaleString()}
              </span>
            </div>

            {/* KPI 2: Total Leads & Conversion */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Oportunidades (Leads)
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                <span style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                  {overview.total_leads || 0}
                </span>
                <span
                  style={{
                    fontSize: "9.5px",
                    fontWeight: "800",
                    color: "#16a34a",
                    backgroundColor: "#f0fdf4",
                    padding: "1px 5px",
                    borderRadius: "4px",
                  }}
                >
                  {overview.lead_conversion_rate || 0}% conv.
                </span>
              </div>
              <span style={{ fontSize: "9px", color: "#64748b", display: "block", marginTop: "2px" }}>
                {crm.contact_forms || 0} forms · {crm.total_bookings || 0} citas
              </span>
            </div>

            {/* KPI 3: Confirmed Bookings */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Citas Confirmadas
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                <span style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                  {crm.confirmed_bookings || 0}
                </span>
                {crm.off_hours_bookings > 0 && (
                  <span
                    style={{
                      fontSize: "9.5px",
                      fontWeight: "800",
                      color: "#7c3aed",
                      backgroundColor: "#f5f3ff",
                      padding: "1px 5px",
                      borderRadius: "4px",
                    }}
                  >
                    {crm.off_hours_bookings} en 24/7
                  </span>
                )}
              </div>
              <span style={{ fontSize: "9px", color: "#64748b", display: "block", marginTop: "2px" }}>
                Pendientes: {crm.pending_bookings || 0}
              </span>
            </div>

            {/* KPI 4: Virtual AI Assistance */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Asistencia Virtual IA
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                <span style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                  {crm.chat_conversations || 0}
                </span>
                <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#475569" }}>
                  chats
                </span>
              </div>
              <span style={{ fontSize: "9px", color: "#64748b", display: "block", marginTop: "2px" }}>
                Tokens: {(crm.total_tokens || 0).toLocaleString()}
              </span>
            </div>

            {/* KPI 5: Total Sessions */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Sesiones Totales
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                <span style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                  {(overview.sessions || 0).toLocaleString()}
                </span>
              </div>
              <span style={{ fontSize: "9px", color: "#64748b", display: "block", marginTop: "2px" }}>
                Duración media: {Math.round((overview.avg_duration || 0) / 60)} min
              </span>
            </div>

            {/* KPI 6: Bounce Rate */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Tasa de Rebote
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                <span style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                  {overview.bounce_rate || 0}%
                </span>
              </div>
              <span style={{ fontSize: "9px", color: "#64748b", display: "block", marginTop: "2px" }}>
                {(100 - (overview.bounce_rate || 0)).toFixed(1)}% retención
              </span>
            </div>

            {/* KPI 7: Automated Emails */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Emails Automatizados
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                <span style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                  {(crm.emails_sent || 0).toLocaleString()}
                </span>
              </div>
              <span style={{ fontSize: "9px", color: "#64748b", display: "block", marginTop: "2px" }}>
                Confirmaciones y avisos
              </span>
            </div>

            {/* KPI 8: Review Requests */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "9.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Reseñas Google Booster
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                <span style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                  {(crm.review_requests_sent || 0).toLocaleString()}
                </span>
              </div>
              <span style={{ fontSize: "9px", color: "#64748b", display: "block", marginTop: "2px" }}>
                Solicitudes de reputación
              </span>
            </div>
          </div>

          {/* AI Strategic Insights Section Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <div style={{ width: "3px", height: "14px", backgroundColor: "#7c3aed", borderRadius: "2px" }}></div>
            <h2
              style={{
                fontSize: "12px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#1e293b",
                margin: 0,
              }}
            >
              2. Diagnóstico Estratégico y Retorno de Inversión (AI Insights)
            </h2>
          </div>

          {/* 3 Executive Insight Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {insights.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  borderLeft: "4px solid #2563eb",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#2563eb",
                      backgroundColor: "#eff6ff",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {item.badge || item.category || "Logro Destacado"}
                  </span>
                  <span style={{ fontSize: "9px", fontWeight: "700", color: "#64748b" }}>
                    Impacto Digital
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "12.5px",
                    fontWeight: "800",
                    color: "#0f172a",
                    margin: "2px 0 4px 0",
                    lineHeight: "1.3",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#475569",
                    margin: "0 0 6px 0",
                    lineHeight: "1.4",
                  }}
                >
                  {item.description}
                </p>
                <div
                  style={{
                    fontSize: "10.5px",
                    fontWeight: "700",
                    color: "#166534",
                    backgroundColor: "#f0fdf4",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    display: "inline-block",
                  }}
                >
                  💡 Recomendación: {item.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page 1 Footer */}
        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "9px",
            color: "#94a3b8",
            fontWeight: "700",
          }}
        >
          <span>SPP Labs · Tecnología y Crecimiento Digital · Confidencial</span>
          <span>{domain} — {monthName} {year}</span>
          <span>Página 1 de 2</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: DESGLOSE OPERATIVO DETALLADO (TRÁFICO, CONTENIDOS, CRM Y CANALES) */}
      {/* ========================================================================= */}
      <div
        id="report-pdf-page-2"
        style={{
          width: "794px",
          height: "1123px",
          maxHeight: "1123px",
          boxSizing: "border-box",
          padding: "36px 42px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div>
          {/* Secondary Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1.5px solid #e2e8f0",
              paddingBottom: "12px",
              marginBottom: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "900", color: "#0f172a" }}>
                SPP LABS
              </span>
              <span style={{ color: "#cbd5e1" }}>|</span>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                Desglose Operativo y Analítica Detallada
              </span>
            </div>

            <div style={{ fontSize: "11px", fontWeight: "800", color: "#0f172a" }}>
              {displayName} ({monthName} {year})
            </div>
          </div>

          {/* Section 3: Daily Traffic & Hourly Distribution */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "3px", height: "14px", backgroundColor: "#0284c7", borderRadius: "2px" }}></div>
              <h2 style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "#1e293b", margin: 0 }}>
                3. Evolución Diaria y Franjas Horarias de Tráfico
              </h2>
            </div>

            {/* Daily Trend Clean Bar Chart (No scroll, 100% visible) */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "10px", fontWeight: "700", color: "#64748b" }}>
                <span>Visitas por día del mes ({monthName})</span>
                <span style={{ color: "#0f172a", fontWeight: "800" }}>Pico máximo: {maxDailyCount} visitas/día</span>
              </div>

              {dailyTrend.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "2px",
                    height: "65px",
                    borderBottom: "1px solid #cbd5e1",
                    paddingBottom: "2px",
                  }}
                >
                  {dailyTrend.map((d, i) => {
                    const heightPct = Math.max((d.count / maxDailyCount) * 100, 4);
                    const dayNum = d.date.split("-")[2] || i + 1;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "100%",
                          justifyContent: "flex-end",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: `${heightPct}%`,
                            backgroundColor: "#2563eb",
                            borderRadius: "2px 2px 0 0",
                          }}
                          title={`Día ${dayNum}: ${d.count} visitas`}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: "10px", color: "#94a3b8", textAlign: "center", padding: "12px 0" }}>
                  Sin datos suficientes de evolución diaria
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5px", color: "#94a3b8", fontWeight: "700", marginTop: "4px" }}>
                <span>Día 1</span>
                <span>Día 15</span>
                <span>Día {dailyTrend.length || 30}</span>
              </div>
            </div>

            {/* Peak Hours Breakdown */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
              }}
            >
              {[
                { label: "Madrugada (00h-06h)", hours: [0, 1, 2, 3, 4, 5] },
                { label: "Mañana (06h-12h)", hours: [6, 7, 8, 9, 10, 11] },
                { label: "Tarde (12h-18h)", hours: [12, 13, 14, 15, 16, 17] },
                { label: "Noche (18h-24h)", hours: [18, 19, 20, 21, 22, 23] },
              ].map((bracket, idx) => {
                const count = hourlyDist
                  .filter((h) => bracket.hours.includes(parseInt(h.hour, 10)))
                  .reduce((sum, h) => sum + (h.count || 0), 0);
                const totalVisits = overview.visitors || 1;
                const pct = Math.round((count / totalVisits) * 100);

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "8px 10px",
                    }}
                  >
                    <span style={{ fontSize: "8.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", display: "block" }}>
                      {bracket.label}
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "2px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "900", color: "#0f172a" }}>
                        {count.toLocaleString()}
                      </span>
                      <span style={{ fontSize: "9.5px", fontWeight: "700", color: "#2563eb" }}>
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Top Pages & Referrers Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            {/* Top Pages Table */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <div style={{ width: "3px", height: "12px", backgroundColor: "#2563eb", borderRadius: "2px" }}></div>
                <h3 style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.04em", color: "#0f172a", margin: 0 }}>
                  Páginas Más Visitadas
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {topPages.length > 0 ? (
                  topPages.map((p, idx) => {
                    const totalPViews = topPages.reduce((s, x) => s + x.count, 0) || 1;
                    const pct = Math.round((p.count / totalPViews) * 100);
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "10px",
                          borderBottom: idx === topPages.length - 1 ? "none" : "1px solid #f1f5f9",
                          paddingBottom: "4px",
                        }}
                      >
                        <span style={{ fontWeight: "700", color: "#1e293b", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {idx + 1}. {p.page_url}
                        </span>
                        <span style={{ fontWeight: "800", color: "#2563eb", whiteSpace: "nowrap" }}>
                          {p.count} <span style={{ color: "#94a3b8", fontWeight: "600" }}>({pct}%)</span>
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>Sin datos de páginas vistas</span>
                )}
              </div>
            </div>

            {/* Referrers Table */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <div style={{ width: "3px", height: "12px", backgroundColor: "#16a34a", borderRadius: "2px" }}></div>
                <h3 style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.04em", color: "#0f172a", margin: 0 }}>
                  Fuentes de Captación (Origen)
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {referrers.length > 0 ? (
                  referrers.map((r, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "10px",
                        borderBottom: idx === referrers.length - 1 ? "none" : "1px solid #f1f5f9",
                        paddingBottom: "4px",
                      }}
                    >
                      <span style={{ fontWeight: "700", color: "#1e293b", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {idx + 1}. {r.referrer}
                      </span>
                      <span style={{ fontWeight: "800", color: "#16a34a", whiteSpace: "nowrap" }}>
                        {r.count} visitas
                      </span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>Sin datos de fuentes de tráfico</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Technology & Geographic Demographics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            {/* Devices & Browsers */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <h4 style={{ fontSize: "10.5px", fontWeight: "900", textTransform: "uppercase", color: "#0f172a", margin: "0 0 8px 0" }}>
                Dispositivos y Navegadores
              </h4>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                {devices.map((d, i) => {
                  const pct = Math.round((d.count / totalDeviceCount) * 100);
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: "8.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", display: "block" }}>
                        {d.device || "Otro"}
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: "900", color: "#0f172a" }}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {browsers.length > 0 && (
                <div style={{ fontSize: "9.5px", color: "#64748b", fontWeight: "600" }}>
                  Navegadores líderes: {browsers.map((b) => `${b.browser} (${b.count})`).join(" · ")}
                </div>
              )}
            </div>

            {/* Geography (Spain Cities & Countries) */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <h4 style={{ fontSize: "10.5px", fontWeight: "900", textTransform: "uppercase", color: "#0f172a", margin: "0 0 8px 0" }}>
                Distribución Geográfica
              </h4>
              <div style={{ fontSize: "10px", color: "#334155", lineHeight: "1.6" }}>
                <div>
                  <strong style={{ color: "#0f172a" }}>Principales Ciudades (España): </strong>
                  {spainCities.length > 0
                    ? spainCities.map((c) => `${c.city} (${c.count})`).join(", ")
                    : "Datos en consolidación"}
                </div>
                <div style={{ marginTop: "4px" }}>
                  <strong style={{ color: "#0f172a" }}>Países de Procedencia: </strong>
                  {countries.length > 0
                    ? countries.map((c) => `${c.country} (${c.count})`).join(", ")
                    : "España y directos"}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Official Audit & Guarantee Box */}
          <div
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              borderRadius: "12px",
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#93c5fd",
                    display: "block",
                  }}
                >
                  Garantía y Propiedad del Dato
                </span>
                <span style={{ fontSize: "11.5px", fontWeight: "900", color: "#ffffff", display: "block", marginTop: "2px" }}>
                  Infraestructura Cloud de Alto Rendimiento · SPP Labs
                </span>
                <p style={{ fontSize: "9.5px", color: "#94a3b8", margin: "3px 0 0 0", lineHeight: "1.3" }}>
                  Todas las métricas y registros de clientes recogidos en este informe son propiedad exclusiva de {displayName}.
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "800",
                    color: "#4ade80",
                    border: "1px solid #166534",
                    backgroundColor: "#052e16",
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  ✓ Verificado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "9px",
            color: "#94a3b8",
            fontWeight: "700",
          }}
        >
          <span>SPP Labs · Tecnología y Crecimiento Digital · Confidencial</span>
          <span>{domain} — {monthName} {year}</span>
          <span>Página 2 de 2</span>
        </div>
      </div>
    </div>
  );
}
