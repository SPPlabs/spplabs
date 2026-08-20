"use client";

import { useState, useEffect } from "react";
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
} from "@/components/dashboard/DashboardIcons";

export default function MonthlyReportsView({ currentWebsiteDomain, lang = "es" }) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
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

  useEffect(() => {
    fetchReport();
  }, [selectedYear, selectedMonth, enableCompare, currentWebsiteDomain]);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/reports/monthly?domain=${encodeURIComponent(
          currentWebsiteDomain || ""
        )}&year=${selectedYear}&month=${selectedMonth}&compare=${enableCompare}`
      );
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.message || "Error al cargar los datos del informe.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión al cargar el informe.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!data) return;
    const rows = [
      ["Concepto", "Valor"],
      ["Dominio", data.domain],
      ["Periodo", `${data.monthName} ${data.year}`],
      ["Visitas Totales", data.overview.visitors],
      ["Visitantes Únicos", data.overview.unique_visitors],
      ["Sesiones Totales", data.overview.sessions],
      ["Tasa de Rebote (%)", `${data.overview.bounce_rate}%`],
      ["Duración Media (seg)", data.overview.avg_duration],
      ["Formularios Recibidos", data.crm.contact_forms],
      ["Citas Solicitadas", data.crm.total_bookings],
      ["Citas Confirmadas", data.crm.confirmed_bookings],
      ["Citas Fuera de Horario (24/7)", data.crm.off_hours_bookings],
      ["Chats Asistente IA", data.crm.chat_conversations],
    ];

    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Informe_${data.domain}_${data.year}_${data.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
      {/* Printable Header styling standard */}
      <style jsx global>{`
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
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Informes Mensuales</h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Resumen consolidado de rendimiento, actividad comercial y asistencia IA.
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
              {monthsList.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
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

          {/* Optional Compare Toggle */}
          <label className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2 rounded-2xl cursor-pointer text-xs font-extrabold text-slate-700 transition-all select-none shadow-2xs">
            <input
              type="checkbox"
              checked={enableCompare}
              onChange={(e) => setEnableCompare(e.target.checked)}
              className="w-4 h-4 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900/20 cursor-pointer accent-slate-900"
            />
            <span>Comparar con mes anterior</span>
          </label>

          {/* Action Buttons */}
          <button
            onClick={handleExportCsv}
            disabled={loading || !data}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-2xs disabled:opacity-50"
          >
            <TableIcon className="w-4 h-4 text-slate-700" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrintPdf}
            disabled={loading || !data}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <DownloadIcon className="w-4 h-4 text-white" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-xs">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-extrabold text-slate-700">Cargando informe mensual...</p>
          <p className="text-xs text-slate-400 mt-1">Consolidando métricas analíticas y CRM</p>
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

      {/* Main Report Content */}
      {!loading && !error && data && (
        <div className="space-y-8 print-full-width">
          {/* Printable Report Title Banner */}
          <div className="hidden print:block mb-8 pb-4 border-b border-slate-200">
            <h1 className="text-2xl font-black text-slate-900">Informe Mensual de Rendimiento</h1>
            <p className="text-sm font-bold text-slate-600 mt-1">
              Sitio Web: <span className="text-slate-900">{data.displayName} ({data.domain})</span> | Periodo: <span className="text-slate-900">{data.monthName} {data.year}</span>
            </p>
          </div>

          {/* Section 1: Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Unique Visitors */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Visitantes Únicos</span>
                <span className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UsersIcon className="w-4.5 h-4.5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.overview.unique_visitors.toLocaleString()}</span>
                {enableCompare && data.comparison && (
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {data.comparison.unique_growth}
                  </span>
                )}
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
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.overview.total_leads}</span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {data.overview.lead_conversion_rate}% Conv.
                </span>
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
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.crm.confirmed_bookings}</span>
                {data.crm.off_hours_bookings > 0 && (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 text-purple-600" />
                    <span>{data.crm.off_hours_bookings} fuera horario</span>
                  </span>
                )}
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
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{data.crm.chat_conversations}</span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {data.crm.total_tokens.toLocaleString()} tokens
                </span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 mt-2">
                Atención continua a visitantes
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
              {data.insights && data.insights.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 hover:bg-white/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30">
                        {item.badge || item.category}
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
                          <div
                            style={{ width: `${widthPct}%` }}
                            className="bg-indigo-600 h-full rounded-full"
                          ></div>
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
                      <span className="font-extrabold text-slate-800 truncate max-w-[280px]">
                        {p.page_url}
                      </span>
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
                      <span className="font-extrabold text-slate-800 truncate max-w-[280px]">
                        {r.referrer}
                      </span>
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
