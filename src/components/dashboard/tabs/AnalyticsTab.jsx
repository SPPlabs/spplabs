"use client";

import WorldMap from "@/components/analytics/WorldMap";
import SpainMap from "@/components/analytics/SpainMap";

function DonutChart({ data }) {
  if (!data || data.length === 0) return <p className="text-xs text-slate-400 py-6 text-center">No hay datos</p>;
  
  const total = data.reduce((acc, item) => acc + Number(item.count || 0), 0);
  const colors = [
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#f59e0b", // Amber
    "#f43f5e", // Rose
    "#10b981", // Emerald
    "#3b82f6", // Blue
  ];

  let accumulatedPercent = 0;

  const slices = data.map((item, index) => {
    const count = Number(item.count || 0);
    const percent = total > 0 ? (count / total) * 100 : 0;
    const color = colors[index % colors.length];
    const offset = 100 - accumulatedPercent;
    accumulatedPercent += percent;

    return {
      name: item.name || item.device_type || item.browser || item.os || item.page_url || "Otro",
      count,
      percent: percent.toFixed(1),
      color,
      strokeDasharray: `${percent} ${100 - percent}`,
      strokeDashoffset: offset,
    };
  });

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="5" />
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke={slice.color}
              strokeWidth="5"
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              className="transition-all duration-500 hover:stroke-[6.5] cursor-pointer"
            />
          ))}
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
          <span className="text-base font-black font-mono text-slate-900">{total}</span>
        </div>
      </div>

      <div className="mt-4 w-full space-y-1.5 max-h-36 overflow-y-auto px-2">
        {slices.slice(0, 5).map((slice, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
              <span className="truncate max-w-[120px]" title={slice.name}>{slice.name}</span>
            </div>
            <span className="font-mono text-slate-900 shrink-0">{slice.count} ({slice.percent}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatReferrerName(ref) {
  if (!ref || ref === "Direct / None" || ref === "Direct" || ref === "Directo / Ninguno" || ref === "" || ref === "null" || ref === "undefined") {
    return "Directo";
  }

  const str = String(ref).trim();
  const lower = str.toLowerCase();

  if (lower.includes("google")) return "Google";
  if (lower.includes("safari")) return "Safari";
  if (lower.includes("edge") || lower.includes("msn")) return "Edge";
  if (lower.includes("bing")) return "Bing";
  if (lower.includes("facebook") || lower.includes("fb.com")) return "Facebook";
  if (lower.includes("tiktok")) return "TikTok";
  if (lower.includes("instagram")) return "Instagram";
  if (lower.includes("twitter") || lower.includes("t.co") || lower.includes("x.com")) return "Twitter / X";
  if (lower.includes("linkedin") || lower.includes("lnkd.in")) return "LinkedIn";
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "YouTube";
  if (lower.includes("github")) return "GitHub";
  if (lower.includes("reddit")) return "Reddit";
  if (lower.includes("yahoo")) return "Yahoo";
  if (lower.includes("duckduckgo")) return "DuckDuckGo";
  if (lower.includes("whatsapp")) return "WhatsApp";
  if (lower.includes("telegram") || lower.includes("t.me")) return "Telegram";
  if (lower.includes("internal ai engine") || lower.includes("ai engine")) return "Motor IA";
  if (lower.includes("spplabs") || lower.includes("spp labs")) return "SPP Labs";

  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("android-app://")) {
    try {
      let clean = str.replace(/^(https?:\/\/)?(android-app:\/\/)?(www\.|m\.|l\.)?/, "");
      clean = clean.split("/")[0].split("?")[0].split(":")[0];
      if (clean) {
        const parts = clean.split(".");
        if (parts.length >= 2) {
          const namePart = parts[parts.length - 2];
          if (namePart.length >= 2) {
            return namePart.charAt(0).toUpperCase() + namePart.slice(1);
          }
        }
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      }
    } catch (e) {
      // ignore
    }
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

function ReferralFunnel({ data, lang }) {
  if (!data || data.length === 0) return <p className="text-xs text-slate-450 py-6 text-center">No hay datos</p>;

  const grouped = {};
  data.forEach(item => {
    const cleanName = formatReferrerName(item.referrer);
    const count = Number(item.count || 0);
    grouped[cleanName] = (grouped[cleanName] || 0) + count;
  });

  const consolidatedData = Object.entries(grouped).map(([referrer, count]) => ({ referrer, count }));
  const total = consolidatedData.reduce((acc, item) => acc + item.count, 0);
  const sortedData = consolidatedData.sort((a, b) => b.count - a.count).slice(0, 5);
  const colors = ["#8b5cf6", "#06b6d4", "#f59e0b", "#f43f5e", "#10b981"];

  let currentFunnelY = 80;
  const funnelHeight = 40;

  const lanes = sortedData.map((item, idx) => {
    const fraction = total > 0 ? item.count / total : 0;
    const laneWidth = Math.max(fraction * funnelHeight, 2);
    const color = colors[idx % colors.length];

    const sourceY = 20 + idx * 35;
    const destY = currentFunnelY + laneWidth / 2;
    currentFunnelY += laneWidth;

    const pathD = `M 20 ${sourceY} C 100 ${sourceY}, 100 ${destY}, 180 ${destY}`;

    return {
      name: item.referrer,
      count: item.count,
      percent: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
      pathD,
      laneWidth,
      color,
      sourceY,
    };
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center w-full">
      <div className="w-full md:w-1/2 h-52 relative">
        <svg viewBox="0 0 240 200" className="w-full h-full overflow-visible">
          <path d="M 180 75 L 210 75 L 225 100 L 225 120 L 210 145 L 180 145 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
          <text x="200" y="113" fill="#64748b" textAnchor="middle" className="text-[7px] font-black tracking-widest font-mono">EMBUDO</text>
          
          {lanes.map((lane, idx) => (
            <g key={idx} className="group">
              <path
                d={lane.pathD}
                fill="none"
                stroke={lane.color}
                strokeWidth={lane.laneWidth}
                strokeOpacity="0.4"
                className="transition-all duration-300 group-hover:stroke-opacity-80"
              />
              <path
                d={lane.pathD}
                fill="none"
                stroke={lane.color}
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              <circle cx="20" cy={lane.sourceY} r="3.5" fill={lane.color} />
            </g>
          ))}
        </svg>
      </div>

      <div className="w-full md:w-1/2 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {lang === "es" ? "Orígenes de Tráfico" : "Traffic Sources"}
        </h4>
        {lanes.map((lane, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lane.color }}></span>
                <span className="text-slate-800 font-medium truncate max-w-[150px]" title={lane.name}>{lane.name}</span>
              </div>
              <span className="font-mono text-slate-900">{lane.count} ({lane.percent}%)</span>
            </div>
            <div className="h-2 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${lane.percent}%`, backgroundColor: lane.color }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsTab({
  currentWebsite,
  t,
  lang,
  analyticsTimeframe,
  setAnalyticsTimeframe,
  fetchAnalytics,
  analyticsData,
  analyticsLoading,
  analyticsError,
  visitorsTimeframe,
  setVisitorsTimeframe,
  fetchVisitorsTrends,
  visitorsTrends,
  visitorsTrendsLoading,
  activeTooltipId,
  renderInfoTooltip,
  activeChartPointIdx,
  setActiveChartPointIdx,
}) {
  return (
    <div className="space-y-8 animate-fade-in w-full max-w-full overflow-x-hidden">
      {/* Header stats & Timeframe Controls */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm w-full">
        <div className="relative z-10">
          <span className="bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider font-mono border border-slate-200 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            {currentWebsite.domain}
          </span>
          <h2 className="text-3xl font-black mt-3 text-slate-950 tracking-tight">{t.analyticsTitle}</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">{t.analyticsSubtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 relative z-10">
          {/* Timeframe Buttons Switcher */}
          <div className="flex bg-slate-100/90 rounded-2xl p-1.5 border border-slate-200/80 max-w-sm shrink-0 shadow-inner">
            {[
              { key: "day", label: lang === "es" ? "Día" : "Day" },
              { key: "week", label: lang === "es" ? "Semana" : "Week" },
              { key: "month", label: lang === "es" ? "Mes" : "Month" },
              { key: "year", label: lang === "es" ? "Año" : "Year" },
              { key: "all", label: lang === "es" ? "Todo" : "All" }
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => {
                  setAnalyticsTimeframe(opt.key);
                  fetchAnalytics(opt.key);
                }}
                className={`text-center py-1.5 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  analyticsTimeframe === opt.key 
                    ? "bg-slate-950 text-white shadow-md scale-105" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time indicator */}
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-2 text-emerald-700 font-extrabold text-xs shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              {(analyticsData?.overview?.active_visitors || 0) + " " + t.analyticsActiveUsers}
            </div>
            <button
              onClick={() => fetchAnalytics(analyticsTimeframe)}
              disabled={analyticsLoading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
              title={lang === "es" ? "Actualizar analíticas" : "Refresh analytics"}
            >
              <svg className={`w-5 h-5 ${analyticsLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Skeleton loading animation */}
      {analyticsLoading && !analyticsData && (
        <div className="space-y-6 animate-pulse w-full">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100/90 rounded-2xl border border-slate-200/60"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-100/90 rounded-3xl border border-slate-200/60"></div>
          <div className="h-64 bg-slate-100/90 rounded-3xl border border-slate-200/60"></div>
        </div>
      )}

      {analyticsError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-5 rounded-2xl font-semibold shadow-sm">
          {analyticsError}
        </div>
      )}

      {analyticsData && (
        <div className="space-y-8 w-full">
          {/* Color-Coded KPI Overview Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full relative">
            <div className={`bg-white border-t-4 border-t-purple-500 border-x border-b border-slate-200/80 rounded-2xl p-5 text-center shadow-sm glass-card-hover transition-all relative ${
              activeTooltipId === "totalHits" ? "z-50 shadow-md scale-[1.01]" : "z-10 hover:z-30"
            }`}>
              <div className="flex items-center justify-center gap-1 mb-1.5">
                <span className="text-[11px] font-extrabold text-purple-600 uppercase tracking-wider">{t.analyticsTotalHits}</span>
                {renderInfoTooltip("totalHits", lang === "es" ? "Suma total de páginas cargadas y solicitudes registradas en la web." : "Total number of pageviews and requests logged on the site.", "shift-right-mobile")}
              </div>
              <span className="text-3xl font-black font-mono text-slate-950 tracking-tight">{analyticsData.overview.visitors}</span>
              <span className={`text-[10px] font-bold block mt-1 ${analyticsData.overview.visitors_growth?.startsWith("↓") ? "text-rose-600" : "text-emerald-600"}`}>
                {analyticsData.overview.visitors_growth} {analyticsData.overview.period_label || "vs anterior"}
              </span>
            </div>

            <div className={`bg-white border-t-4 border-t-sky-500 border-x border-b border-slate-200/80 rounded-2xl p-5 text-center shadow-sm glass-card-hover transition-all relative ${
              activeTooltipId === "uniques" ? "z-50 shadow-md scale-[1.01]" : "z-10 hover:z-30"
            }`}>
              <div className="flex items-center justify-center gap-1 mb-1.5">
                <span className="text-[11px] font-extrabold text-sky-600 uppercase tracking-wider">{t.analyticsUniques}</span>
                {renderInfoTooltip("uniques", lang === "es" ? "Número de usuarios o dispositivos distintos que han accedido a la web." : "Number of distinct users or individual devices visiting the site.", "shift-left-mobile")}
              </div>
              <span className="text-3xl font-black font-mono text-sky-600 tracking-tight">{analyticsData.overview.unique_visitors}</span>
              <span className={`text-[10px] font-bold block mt-1 ${analyticsData.overview.unique_growth?.startsWith("↓") ? "text-rose-600" : "text-sky-600"}`}>
                {analyticsData.overview.unique_growth} {analyticsData.overview.period_label || "vs anterior"}
              </span>
            </div>

            <div className={`bg-white border-t-4 border-t-emerald-500 border-x border-b border-slate-200/80 rounded-2xl p-5 text-center shadow-sm glass-card-hover transition-all relative ${
              activeTooltipId === "sessions" ? "z-50 shadow-md scale-[1.01]" : "z-10 hover:z-30"
            }`}>
              <div className="flex items-center justify-center gap-1 mb-1.5">
                <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">{t.analyticsSessions}</span>
                {renderInfoTooltip("sessions", lang === "es" ? "Grupos de interacción continua realizadas por un visitante sin interrupciones." : "Continuous periods of user activity on the site without long breaks.", "shift-right-mobile")}
              </div>
              <span className="text-3xl font-black font-mono text-emerald-600 tracking-tight">{analyticsData.overview.sessions}</span>
              <span className={`text-[10px] font-bold block mt-1 ${analyticsData.overview.sessions_growth?.startsWith("↓") ? "text-rose-600" : "text-emerald-600"}`}>
                {analyticsData.overview.sessions_growth} {analyticsData.overview.period_label || "vs anterior"}
              </span>
            </div>

            <div className={`bg-white border-t-4 border-t-amber-500 border-x border-b border-slate-200/80 rounded-2xl p-5 text-center shadow-sm glass-card-hover transition-all relative ${
              activeTooltipId === "duration" ? "z-50 shadow-md scale-[1.01]" : "z-10 hover:z-30"
            }`}>
              <div className="flex items-center justify-center gap-1 mb-1.5">
                <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider">{t.analyticsDuration}</span>
                {renderInfoTooltip("duration", lang === "es" ? "Tiempo medio estimado que pasa cada visitante dentro del sitio web." : "Average time a visitor spends navigating pages during a session.", "shift-left-mobile")}
              </div>
              <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">{analyticsData.overview.avg_duration}s</span>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">Promedio por sesión</span>
            </div>

            <div className={`bg-white border-t-4 border-t-indigo-600 border-x border-b border-slate-200/80 rounded-2xl p-5 text-center col-span-2 lg:col-span-1 shadow-sm glass-card-hover flex flex-col justify-center items-center transition-all relative ${
              activeTooltipId === "bounce" ? "z-50 shadow-md scale-[1.01]" : "z-10 hover:z-30"
            }`}>
              <div className="flex items-center justify-center gap-1 mb-1.5">
                <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">{t.analyticsBounce}</span>
                {renderInfoTooltip("bounce", lang === "es" ? "Porcentaje de visitas donde el usuario salió tras ver solo una página." : "Percentage of visits where the user left after viewing only one page.", "shift-left")}
              </div>
              <span className="text-3xl font-black font-mono text-indigo-600 tracking-tight">{analyticsData.overview.bounce_rate}%</span>
            </div>
          </div>

          {/* Independent Traffic Trend Line Chart */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm w-full relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-bold shadow-md">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 005.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 uppercase tracking-wider">{t.analyticsTrafficVolume}</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {lang === "es" 
                      ? `Histórico de visitantes por ${visitorsTimeframe === "day" ? "hora" : visitorsTimeframe === "week" ? "día de la semana" : visitorsTimeframe === "month" ? "día del mes" : visitorsTimeframe === "year" ? "mes" : "periodo"}`
                      : "Visitor history over time"}
                  </p>
                </div>
              </div>

              {/* Independent Timeframe Dropdown Select for Visitors Chart */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
                  {lang === "es" ? "Periodo Gráfica:" : "Chart Period:"}
                </span>
                <select
                  value={visitorsTimeframe}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVisitorsTimeframe(val);
                    fetchVisitorsTrends(val);
                  }}
                  disabled={visitorsTrendsLoading}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs px-3.5 py-1.5 rounded-xl font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer transition-all shadow-xs"
                >
                  <option value="day">{lang === "es" ? "Día (Por hora)" : "Day (Hourly)"}</option>
                  <option value="week">{lang === "es" ? "Semana (Por día)" : "Week (Daily)"}</option>
                  <option value="month">{lang === "es" ? "Mes (Por día)" : "Month (Daily)"}</option>
                  <option value="year">{lang === "es" ? "Año (Por mes)" : "Year (Monthly)"}</option>
                  <option value="all">{lang === "es" ? "Todo (Por mes)" : "All (Monthly)"}</option>
                </select>
              </div>
            </div>
            
            {(visitorsTrends.length > 0 ? visitorsTrends : analyticsData.trends).length === 0 ? (
              <p className="text-sm text-slate-400 py-12 text-center font-medium">No hay registros de tendencia en este periodo.</p>
            ) : (
              <div className="w-full">
                {(() => {
                  const trendPoints = visitorsTrends.length > 0 ? visitorsTrends : analyticsData.trends;
                  const maxVal = Math.max(...trendPoints.map(t => Number(t.count || 0)), 1);
                  const midVal = Math.round(maxVal / 2);
                  
                  const width = 850;
                  const height = 240;
                  const chartLeft = 60;
                  const chartRight = 830;
                  const chartTop = 30;
                  const chartBottom = 190;
                  const plotWidth = chartRight - chartLeft;
                  const plotHeight = chartBottom - chartTop;

                  const spacing = trendPoints.length > 1 ? plotWidth / (trendPoints.length - 1) : plotWidth;
                  
                  const ptsArr = trendPoints.map((t, idx) => {
                    const x = trendPoints.length > 1 ? chartLeft + idx * spacing : chartLeft + plotWidth / 2;
                    const y = chartBottom - (Number(t.count || 0) / maxVal) * plotHeight;
                    return { x, y, t };
                  });

                  const ptsString = ptsArr.map(p => `${p.x},${p.y}`).join(" ");

                  const areaPts = ptsArr.length > 0 
                    ? `${chartLeft},${chartBottom} ${ptsString} ${chartRight},${chartBottom}` 
                    : "";

                  const formatXLabel = (t) => {
                    const tf = visitorsTimeframe;
                    if (tf === "day") {
                      if (t.hour !== undefined && t.hour !== null) return `${String(t.hour).padStart(2, "0")}:00`;
                      if (t.date && t.date.includes(":")) return t.date;
                      return t.date || `${t.hour || 0}:00`;
                    }
                    if (tf === "week") {
                      if (t.date) {
                        const parts = t.date.split("-");
                        if (parts.length === 3) {
                          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                          const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
                          return `${days[d.getDay()]} ${parts[2]}/${parts[1]}`;
                        }
                        return t.date;
                      }
                      return t.hour !== undefined ? `${t.hour}:00` : "";
                    }
                    if (tf === "month") {
                      if (t.date) {
                        const parts = t.date.split("-");
                        if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
                        return t.date;
                      }
                      return "";
                    }
                    if (tf === "year" || tf === "all") {
                      if (t.date) {
                        const parts = t.date.split("-");
                        if (parts.length >= 2) {
                          const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                          const mIdx = Number(parts[1]) - 1;
                          return months[mIdx] || parts[1];
                        }
                        return t.date;
                      }
                      return "";
                    }
                    if (t.date) {
                      const parts = t.date.split("-");
                      return parts.length > 1 ? parts.slice(1).join("/") : t.date;
                    }
                    return t.hour !== undefined ? `${t.hour}:00` : "";
                  };

                  const xAxisTitle = lang === "es"
                    ? (visitorsTimeframe === "day" ? "Hora del día (24h)" : visitorsTimeframe === "week" ? "Día de la semana" : visitorsTimeframe === "month" ? "Día del mes" : visitorsTimeframe === "year" ? "Mes del año" : "Periodo")
                    : (visitorsTimeframe === "day" ? "Hour of day (24h)" : visitorsTimeframe === "week" ? "Day of week" : visitorsTimeframe === "month" ? "Day of month" : visitorsTimeframe === "year" ? "Month" : "Period");

                  return (
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[650px] p-2">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 overflow-visible">
                          <defs>
                            <linearGradient id="areaGradVibrant" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25"/>
                              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0"/>
                            </linearGradient>
                          </defs>

                          {/* Y-AXIS TITLE & NUMERICAL LABELS */}
                          <text x="5" y="16" fill="#0284c7" className="text-[10px] font-black font-mono uppercase tracking-wider">
                            {lang === "es" ? "Visitantes" : "Visitors"}
                          </text>

                          {/* Y-AXIS GRID LINES & NUMBERS */}
                          <line x1={chartLeft} y1={chartTop} x2={chartRight} y2={chartTop} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                          <text x={chartLeft - 8} y={chartTop + 4} fill="#64748b" textAnchor="end" className="text-[10px] font-mono font-bold">
                            {maxVal}
                          </text>

                          <line x1={chartLeft} y1={chartTop + plotHeight / 2} x2={chartRight} y2={chartTop + plotHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                          <text x={chartLeft - 8} y={chartTop + plotHeight / 2 + 4} fill="#64748b" textAnchor="end" className="text-[10px] font-mono font-bold">
                            {midVal}
                          </text>

                          <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke="#cbd5e1" strokeWidth="1.5" />
                          <text x={chartLeft - 8} y={chartBottom + 4} fill="#64748b" textAnchor="end" className="text-[10px] font-mono font-bold">
                            0
                          </text>

                          {/* AREA SHADING & TREND LINE */}
                          {areaPts && <polygon points={areaPts} fill="url(#areaGradVibrant)" />}
                          
                          {ptsString && (
                            <polyline 
                              points={ptsString} 
                              fill="none" 
                              stroke="#0284c7" 
                              strokeWidth="3.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                            />
                          )}
                          
                          {/* HOVER & TOUCH TAP POINTS */}
                          {ptsArr.map((pt, idx) => {
                            const labelX = formatXLabel(pt.t);
                            const countVal = Number(pt.t.count || 0);
                            const isPointActive = activeChartPointIdx === idx;

                            const tooltipY = pt.y < 45 ? pt.y + 12 : pt.y - 32;
                            
                            let tooltipX = pt.x - 45;
                            if (pt.x < 55) tooltipX = pt.x - 10;
                            if (pt.x > width - 55) tooltipX = pt.x - 80;

                            return (
                              <g 
                                key={idx} 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveChartPointIdx(prev => (prev === idx ? null : idx));
                                }}
                              >
                                <circle cx={pt.x} cy={pt.y} r="20" fill="transparent" className="cursor-pointer" />

                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r="4.5" 
                                  fill={isPointActive ? "#0f172a" : "#0284c7"} 
                                  stroke="#ffffff" 
                                  strokeWidth="2" 
                                  className="pointer-events-none transition-colors" 
                                />

                                <g className={`transition-opacity duration-150 pointer-events-none ${
                                  isPointActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}>
                                  <rect x={tooltipX} y={tooltipY} width="90" height="22" rx="6" fill="#0f172a" />
                                  <text x={tooltipX + 45} y={tooltipY + 14} fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" className="font-mono">
                                    {countVal} {countVal === 1 ? (lang === "es" ? "visitante" : "visitor") : (lang === "es" ? "visitantes" : "visitors")}
                                  </text>
                                </g>

                                <text x={pt.x} y={chartBottom + 16} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">
                                  {labelX}
                                </text>
                              </g>
                            );
                          })}

                          <text 
                            x={(chartLeft + chartRight) / 2} 
                            y={chartBottom + 35} 
                            fill="#475569" 
                            className="text-[10px] font-black font-mono uppercase tracking-widest"
                            textAnchor="middle"
                          >
                            {xAxisTitle}
                          </text>
                        </svg>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Funnel of Traffic Referrers */}
          <ReferralFunnel data={analyticsData.referrers} lang={lang} />

          {/* GEOGRAPHICAL MAPS */}
          <div className="space-y-8 w-full">
            <WorldMap countries={analyticsData.countries} lang={lang} />
            <SpainMap spainCities={analyticsData.spainCities} lang={lang} />
          </div>

          {/* Category Donut Charts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider text-center pt-2">
                {lang === "es" ? "Páginas más visitadas" : "Top Visited Pages"}
              </h4>
              <DonutChart
                data={analyticsData.topPages
                  .filter(p => p.page_url && !["/hola", "/test", "/demo", "/api"].includes(p.page_url) && !p.page_url.startsWith("/api/") && !p.page_url.includes(".env") && !p.page_url.includes(".php"))
                  .map(p => ({ name: p.page_url, count: p.count }))}
              />
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider text-center pt-2">
                {lang === "es" ? "Sistemas Operativos" : "Operating Systems"}
              </h4>
              <DonutChart
                data={analyticsData.os
                  .filter(o => o.os && !["Server", "Node", "Unknown", "API"].includes(o.os))
                  .map(o => ({ name: o.os, count: o.count }))}
              />
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider text-center pt-2">
                {lang === "es" ? "Dispositivos" : "Devices"}
              </h4>
              <DonutChart
                data={analyticsData.devices
                  .filter(d => d.device_type && !["API", "Server", "Bot", "Unknown"].includes(d.device_type))
                  .map(d => ({ name: d.device_type, count: d.count }))}
              />
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider text-center pt-2">
                {lang === "es" ? "Navegadores" : "Browsers"}
              </h4>
              <DonutChart
                data={analyticsData.browsers
                  .filter(b => b.browser && !["Node", "Server", "Unknown", "curl", "axios"].includes(b.browser))
                  .map(b => ({ name: b.browser, count: b.count }))}
              />
            </div>
          </div>

          {/* Conversions Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm w-full relative z-10">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">{t.analyticsEvents}</h3>
            {analyticsData.conversions.length === 0 ? (
              <p className="text-xs text-slate-450 py-6 text-center">
                {lang === "es" ? "No hay conversiones registradas aún." : "No conversions logged yet."}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {analyticsData.conversions.map((conv, idx) => {
                  let label = conv.event_type;
                  let desc = lang === "es" ? "Eventos e interacciones registradas." : "Recorded events and interactions.";
                  let color = "text-slate-950";

                  if (conv.event_type === "form_submit") {
                    label = lang === "es" ? "Formularios Enviados" : "Form Submissions";
                    desc = lang === "es" ? "Número de contactos o consultas enviadas mediante formularios en la web." : "Number of contact or lead submissions via forms.";
                    color = "text-brand-blue";
                  } else if (conv.event_type === "booking_created") {
                    label = lang === "es" ? "Reservas Creadas" : "Bookings Created";
                    desc = lang === "es" ? "Citas y reservas agendadas con éxito por los clientes." : "Appointments and bookings created by visitors.";
                    color = "text-brand-green";
                  } else if (conv.event_type === "button_click") {
                    label = lang === "es" ? "Clics en Botones" : "Button Clicks";
                    desc = lang === "es" ? "Total de clics en botones principales e interactivos (CTA)." : "Total clicks on main interactive buttons and CTAs.";
                    color = "text-slate-700";
                  } else if (conv.event_type === "outbound_link") {
                    label = lang === "es" ? "Enlaces Salientes" : "Outbound Links";
                    desc = lang === "es" ? "Clics dirigidos hacia enlaces externos, redes sociales o webs de terceros." : "Clicks towards external links or third-party sites.";
                    color = "text-red-500";
                  } else {
                    label = conv.event_type.replace(/_/g, " ").toUpperCase();
                  }
                  return (
                    <div key={idx} className={`bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center shadow-xs hover:shadow-sm transition-all relative ${
                      activeTooltipId === `conv_${conv.event_type}` ? "z-50 shadow-md scale-[1.01]" : "z-10 hover:z-30"
                    }`}>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">{label}</span>
                        {renderInfoTooltip(`conv_${conv.event_type}`, desc, "center")}
                      </div>
                      <span className={`text-2xl font-black font-mono ${color}`}>{conv.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
