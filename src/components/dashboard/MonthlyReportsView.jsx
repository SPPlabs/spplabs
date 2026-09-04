"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TableIcon,
  DownloadIcon,
  AlertTriangleIcon,
  UsersIcon,
  InboxIcon,
  CalendarIcon,
  ClockIcon,
  BotIcon,
  SparklesIcon,
  LightbulbIcon,
  MailIcon,
  ChartBarIcon,
  LockClosedIcon,
  RocketIcon,
  TrendingUpIcon,
  TargetIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
} from "@/components/dashboard/DashboardIcons";

function getInsightBadgeIcon(item) {
  const text = `${item.badge || ""} ${item.category || ""} ${item.id || ""}`.toLowerCase();
  if (text.includes("captación") || text.includes("disponibilidad") || text.includes("continua") || text.includes("rocket") || item.id === "automation_win") {
    return <RocketIcon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />;
  }
  if (text.includes("cobertura") || text.includes("alcance") || text.includes("presencia") || text.includes("trending") || item.id === "reach_win") {
    return <TrendingUpIcon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />;
  }
  if (text.includes("leads") || text.includes("interés") || text.includes("oportunidades") || text.includes("target") || item.id === "leads_win") {
    return <TargetIcon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />;
  }
  if (text.includes("móvil") || text.includes("smartphone") || text.includes("dispositivos") || item.id === "mobile_win") {
    return <DevicePhoneMobileIcon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />;
  }
  if (text.includes("canal") || text.includes("tráfico") || text.includes("fuente") || item.id === "source_win") {
    return <GlobeAltIcon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />;
  }
  if (text.includes("atención") || text.includes("idea") || item.id === "traffic_interest") {
    return <LightbulbIcon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />;
  }
  return <SparklesIcon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />;
}

function cleanBadgeText(badge, category) {
  const raw = badge || category || "Logro Destacado";
  return raw.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Extended_Pictographic}/gu, "").trim();
}

export default function MonthlyReportsView({ currentWebsiteDomain, lang = "es" }) {
  const now = new Date();
  const currentCalYear = now.getFullYear();
  const currentCalMonth = now.getMonth() + 1; // 1-12

  // Last closed month (e.g. if today is August 2026, default is July 2026)
  const defaultYear = currentCalMonth === 1 ? currentCalYear - 1 : currentCalYear;
  const defaultMonth = currentCalMonth === 1 ? 12 : currentCalMonth - 1;

  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [enableCompare, setEnableCompare] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const monthsList = [
    { num: 1, name: "Enero" },
    { num: 2, name: "Febrero" },
    { num: 3, name: "Marzo" },
    { num: 4, name: "Abril" },
    { num: 5, name: "Mayo" },
    { num: 6, name: "Junio" },
    { num: 7, name: "Julio" },
    { num: 8, name: "Agosto" },
    { num: 9, name: "Septiembre" },
    { num: 10, name: "Octubre" },
    { num: 11, name: "Noviembre" },
    { num: 12, name: "Diciembre" },
  ];

  const yearsList = [2026, 2025, 2024];

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchReport = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const loadReport = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/admin/reports/monthly?domain=${encodeURIComponent(
            currentWebsiteDomain || ""
          )}&year=${selectedYear}&month=${selectedMonth}&compare=${enableCompare}`
        );
        const json = await res.json();
        if (isCancelled) return;
        if (res.ok && json.success) {
          setData(json.data || json);
        } else {
          setError(json.message || "Error al cargar los datos del informe.");
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("fetchReport error:", err);
          setError("Error de conexión al cargar el informe.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      isCancelled = true;
    };
  }, [currentWebsiteDomain, selectedYear, selectedMonth, enableCompare, refreshTrigger]);

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!data || data.isInProgress) return;
    const rows = [
      ["Concepto", "Valor"],
      ["Dominio", data?.domain || ""],
      ["Periodo", `${data?.monthName || ""} ${data?.year || ""}`],
      ["Visitas Totales", data?.overview?.visitors || 0],
      ["Visitantes Únicos", data?.overview?.unique_visitors || 0],
      ["Sesiones Totales", data?.overview?.sessions || 0],
      ["Tasa de Rebote (%)", `${data?.overview?.bounce_rate || 0}%`],
      ["Duración Media (seg)", data?.overview?.avg_duration || 0],
      ["Formularios Recibidos", data?.crm?.contact_forms || 0],
      ["Citas Solicitadas", data?.crm?.total_bookings || 0],
      ["Citas Confirmadas", data?.crm?.confirmed_bookings || 0],
      ["Citas Fuera de Horario (24/7)", data?.crm?.off_hours_bookings || 0],
      ["Chats Asistente IA", data?.crm?.chat_conversations || 0],
      ["Correos Automáticos Enviados", data?.crm?.emails_sent || 0],
      ["Solicitudes Reseñas Google", data?.crm?.review_requests_sent || 0],
    ];

    let csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Informe_${data.domain}_${data.year}_${data.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to check if a month is in progress or future
  const isMonthInProgress = (year, monthNum) => {
    return year === currentCalYear && monthNum === currentCalMonth;
  };

  const isMonthFuture = (year, monthNum) => {
    return year > currentCalYear || (year === currentCalYear && monthNum > currentCalMonth);
  };

  // Helper for rendering delta badges
  const renderComparisonDelta = (growthStr, prevValue, prevMonthName) => {
    if (!enableCompare || !data?.comparison || growthStr === undefined) return null;
    const isPositive = growthStr.startsWith("+") || parseFloat(growthStr) > 0;
    const isNegative = growthStr.startsWith("-");

    return (
      <span
        className={`text-[11px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 border shadow-2xs ${
          isPositive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : isNegative
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : "bg-slate-100 text-slate-700 border-slate-200"
        }`}
        title={`Mes anterior (${prevMonthName}): ${prevValue}`}
      >
        <span>{isPositive ? "▲" : isNegative ? "▼" : "•"}</span>
        <span>{growthStr}</span>
        <span className="text-[10px] opacity-75 font-normal">vs {prevValue}</span>
      </span>
    );
  };

  const currentCalMonthName = monthsList.find((m) => m.num === currentCalMonth)?.name || "";
  const lastClosedMonthName = monthsList.find((m) => m.num === defaultMonth)?.name || "";

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none animate-fade-in">
      {/* Printable Header styling standard */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Top Controls & Month Picker Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 no-print">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <TableIcon className="w-4.5 h-4.5" />
              </span>
              <span>Informes Mensuales</span>
            </h2>

            {/* Prominent Current Month Indicator */}
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>Mes actual: {currentCalMonthName} {currentCalYear} (En curso)</span>
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-500 mt-2">
            Resumen mensual consolidado. Los informes cerrados se publican el día 1 del mes siguiente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Dropdown */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs rounded-2xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shadow-2xs"
            >
              {monthsList.map((m) => {
                const inProg = isMonthInProgress(selectedYear, m.num);
                const isFut = isMonthFuture(selectedYear, m.num);
                return (
                  <option key={m.num} value={m.num}>
                    {m.name} {inProg ? "— (Mes actual en curso)" : isFut ? "— (Futuro)" : ""}
                  </option>
                );
              })}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▼</span>
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs rounded-2xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shadow-2xs"
            >
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▼</span>
          </div>

          {/* Compare Toggle */}
          <button
            type="button"
            onClick={() => setEnableCompare(!enableCompare)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs select-none border ${
              enableCompare
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${enableCompare ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`}></span>
            <span>Comparar con mes anterior</span>
          </button>

          {/* Action Buttons */}
          <button
            onClick={handleExportCsv}
            disabled={loading || !data || data.isInProgress}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-2xs disabled:opacity-40"
          >
            <TableIcon className="w-4 h-4 text-slate-700" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrintPdf}
            disabled={loading || !data || data.isInProgress}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-40"
          >
            <DownloadIcon className="w-4 h-4 text-white" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-16 text-center shadow-xs">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-extrabold text-slate-800">Cargando informe mensual...</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Consolidando analítica OLAP y métricas de clientes</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center text-rose-900 shadow-xs">
          <AlertTriangleIcon className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={fetchReport}
            className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* State: In Progress Month Notice (Requirement: Current Month Cannot Be Viewed Till Completed) */}
      {!loading && !error && data && data.isInProgress && (
        <div className="bg-white border border-amber-200 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
            <ClockIcon className="w-8 h-8" />
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full">
              <LockClosedIcon className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              <span>Informe Mensual En Curso</span>
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              El informe de {data.monthName} {data.year} aún no ha finalizado
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Los informes mensuales de SPP Labs representan ciclos consolidados cerrados. El informe completo y definitivo de <strong>{data.monthName} {data.year}</strong> se publicará automáticamente el <strong>{data.availableAt}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedYear(defaultYear);
                setSelectedMonth(defaultMonth);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Ver último informe cerrado ({lastClosedMonthName} {defaultYear})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Report Content (Closed Months Only) */}
      {!loading && !error && data && !data.isInProgress && (
        <div className="space-y-8 print-full-width">
          {/* Printable Report Title Banner */}
          <div className="hidden print:block mb-8 pb-4 border-b border-slate-200">
            <h1 className="text-2xl font-black text-slate-900">Informe Mensual Consolidado</h1>
            <p className="text-sm font-bold text-slate-600 mt-1">
              Sitio Web: <span className="text-slate-900">{data.displayName} ({data.domain})</span> | Periodo: <span className="text-slate-900">{data.monthName} {data.year}</span>
            </p>
          </div>

          {/* Comparative Overview Banner (Visible when enableCompare is true) */}
          {enableCompare && data.comparison && (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md space-y-4 animate-fade-in no-print">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300 shrink-0">
                    <ChartBarIcon className="w-4 h-4" />
                  </span>
                  <span className="text-base font-black">Comparativa Mes a Mes</span>
                  <span className="text-xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-extrabold">
                    {data.monthName} {data.year} vs {data.comparison.prev_month_name} {data.comparison.prev_year}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Crecimiento respecto a los 30 días previos
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Metric 1 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Visitantes Únicos</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-white">{data.overview.unique_visitors.toLocaleString()}</span>
                    <span className={`text-xs font-black ${data.comparison.unique_growth.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                      {data.comparison.unique_growth}
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Ant: {data.comparison.prev_unique}</span>
                </div>

                {/* Metric 2 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Visitas</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-white">{data.overview.visitors.toLocaleString()}</span>
                    <span className={`text-xs font-black ${data.comparison.visitors_growth.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                      {data.comparison.visitors_growth}
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Ant: {data.comparison.prev_visitors}</span>
                </div>

                {/* Metric 3 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Leads & Formularios</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-white">{data.overview.total_leads}</span>
                    <span className={`text-xs font-black ${data.comparison.leads_growth.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                      {data.comparison.leads_growth}
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Ant: {data.comparison.prev_leads}</span>
                </div>

                {/* Metric 4 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Citas Confirmadas</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-white">{data.crm.confirmed_bookings}</span>
                    <span className={`text-xs font-black ${data.comparison.bookings_growth.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                      {data.comparison.bookings_growth}
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Ant: {data.comparison.prev_bookings}</span>
                </div>

                {/* Metric 5 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Sesiones Totales</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-white">{data.overview.sessions.toLocaleString()}</span>
                    <span className={`text-xs font-black ${data.comparison.sessions_growth.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                      {data.comparison.sessions_growth}
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Ant: {data.comparison.prev_sessions}</span>
                </div>

                {/* Metric 6 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Emails Enviados</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-white">{data.crm.emails_sent || 0}</span>
                    <span className={`text-xs font-black ${(data.comparison.emails_growth || "+0%").startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                      {data.comparison.emails_growth || "0%"}
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Ant: {data.comparison.prev_emails || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {/* Card 1: Unique Visitors */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Visitantes Únicos</span>
                <span className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UsersIcon className="w-4.5 h-4.5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.overview.unique_visitors.toLocaleString()}</span>
                {renderComparisonDelta(data.comparison?.unique_growth, data.comparison?.prev_unique, data.comparison?.prev_month_name)}
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 mt-2">
                Total de visitas: {data.overview.visitors.toLocaleString()}
              </p>
            </div>

            {/* Card 2: Contact Leads */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Leads & Contactos</span>
                <span className="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <InboxIcon className="w-4.5 h-4.5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.overview.total_leads}</span>
                {enableCompare && data.comparison ? (
                  renderComparisonDelta(data.comparison.leads_growth, data.comparison.prev_leads, data.comparison.prev_month_name)
                ) : (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {data.overview.lead_conversion_rate}% Conv.
                  </span>
                )}
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 mt-2">
                {data.crm.contact_forms} formularios + {data.crm.total_bookings} citas
              </p>
            </div>

            {/* Card 3: Confirmed Bookings */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Citas Confirmadas</span>
                <span className="w-8 h-8 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CalendarIcon className="w-4.5 h-4.5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.crm.confirmed_bookings}</span>
                {enableCompare && data.comparison ? (
                  renderComparisonDelta(data.comparison.bookings_growth, data.comparison.prev_bookings, data.comparison.prev_month_name)
                ) : data.crm.off_hours_bookings > 0 ? (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 text-purple-600" />
                    <span>{data.crm.off_hours_bookings} fuera horario</span>
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 mt-2">
                Pendientes: {data.crm.pending_bookings}
              </p>
            </div>

            {/* Card 4: AI Chatbot Interactivity */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Asistencia Virtual IA</span>
                <span className="w-8 h-8 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BotIcon className="w-4.5 h-4.5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.crm.chat_conversations}</span>
                {enableCompare && data.comparison ? (
                  renderComparisonDelta(data.comparison.chats_growth, data.comparison.prev_chats, data.comparison.prev_month_name)
                ) : (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {data.crm.total_tokens.toLocaleString()} tokens
                  </span>
                )}
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 mt-2">
                Atención continua a visitantes
              </p>
            </div>

            {/* Card 5: Automated Emails & Google Reviews */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Emails & Reseñas</span>
                <span className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <MailIcon className="w-4.5 h-4.5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{(data.crm.emails_sent || 0).toLocaleString()}</span>
                {enableCompare && data.comparison ? (
                  renderComparisonDelta(data.comparison.emails_growth, data.comparison.prev_emails, data.comparison.prev_month_name)
                ) : (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {data.crm.review_requests_sent || 0} reseñas
                  </span>
                )}
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 mt-2">
                {data.crm.review_requests_sent || 0} solicitudes Google Booster
              </p>
            </div>
          </div>

          {/* Section 2: Positive ROI AI Insights Section */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-7 text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
                  Diagnóstico y Logros Destacados
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  AI Insights & Resumen de Progreso ({data.monthName} {data.year})
                </h3>
              </div>
              <span className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-300">
                <SparklesIcon className="w-5 h-5" />
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {data.insights &&
                data.insights.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 hover:bg-white/10 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 inline-flex items-center gap-1.5">
                          {getInsightBadgeIcon(item)}
                          <span>{cleanBadgeText(item.badge, item.category)}</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white mb-2 leading-snug">{item.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-[11px] font-semibold text-emerald-300 flex items-start gap-1.5">
                        <LightbulbIcon className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span>{item.action}</span>
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 3: Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Daily Traffic Line Chart */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Evolución Diaria del Tráfico</h3>
                  <p className="text-xs font-semibold text-slate-400">Visitas acumuladas por día en {data.monthName}</p>
                </div>
                <span className="text-xs font-black px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
                  {data.overview.visitors.toLocaleString()} Visitas
                </span>
              </div>

              {/* SVG Line Chart */}
              {data.dailyTrend && data.dailyTrend.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[500px] h-56 relative flex items-end gap-2 pt-6 pb-6 border-b border-slate-100">
                    {(() => {
                      const maxCount = Math.max(...data.dailyTrend.map((d) => d.count), 1);
                      return data.dailyTrend.map((d, i) => {
                        const heightPct = Math.max((d.count / maxCount) * 100, 6);
                        const dayNum = d.date.split("-")[2] || i + 1;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black py-1 px-2.5 rounded-xl whitespace-nowrap z-20 pointer-events-none shadow-md">
                              Día {dayNum}: {d.count} visitas
                            </div>
                            {/* Bar Visual */}
                            <div className="w-full flex items-end justify-center h-40">
                              <div
                                style={{ height: `${heightPct}%` }}
                                className="w-full max-w-[18px] bg-gradient-to-t from-slate-900 to-indigo-600 rounded-t-lg group-hover:from-indigo-600 group-hover:to-purple-500 transition-all duration-300"
                              ></div>
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-400">{dayNum}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs font-bold text-slate-400">
                  Sin datos suficientes para el gráfico diario.
                </div>
              )}
            </div>

            {/* Peak Hours Distribution Bar Chart */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <div className="mb-6">
                <h3 className="text-base font-extrabold text-slate-900">Franjas Horarias</h3>
                <p className="text-xs font-semibold text-slate-400">Distribución de actividad por hora del día</p>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {(() => {
                  const maxH = Math.max(...(data.hourlyDist || []).map((h) => h.count), 1);
                  return (data.hourlyDist || []).slice(0, 8).map((h, i) => {
                    const widthPct = Math.max((h.count / maxH) * 100, 8);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-extrabold text-slate-600">
                          <span>{h.hour}</span>
                          <span>{h.count} visitas</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div style={{ width: `${widthPct}%` }} className="bg-indigo-600 h-full rounded-full"></div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Section 4: CRM Breakdown & Traffic Sources Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 mb-4">Páginas Más Visitadas</h3>
              <div className="divide-y divide-slate-100">
                {data.topPages && data.topPages.length > 0 ? (
                  data.topPages.map((p, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800 truncate max-w-[280px]">{p.page_url}</span>
                      <span className="font-black px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl">
                        {p.count} vistas
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4">No hay datos de páginas vistas.</p>
                )}
              </div>
            </div>

            {/* Traffic Referrers */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 mb-4">Fuentes de Tráfico (Origen)</h3>
              <div className="divide-y divide-slate-100">
                {data.referrers && data.referrers.length > 0 ? (
                  data.referrers.map((r, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800 truncate max-w-[280px]">{r.referrer}</span>
                      <span className="font-black px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl">
                        {r.count} visitas
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4">No hay datos de orígenes.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
