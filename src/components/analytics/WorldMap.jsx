"use client";

import { useState } from "react";

// Precise percentage coordinates (left %, top %) mapped onto mundo.webp (1694x929)
const COUNTRY_LOOKUP = {
  "ES": { name: "España", flag: "🇪🇸", left: 41.8, top: 41.5 },
  "Spain": { name: "España", flag: "🇪🇸", left: 41.8, top: 41.5 },
  "España": { name: "España", flag: "🇪🇸", left: 41.8, top: 41.5 },

  "US": { name: "Estados Unidos", flag: "🇺🇸", left: 17.5, top: 38.0 },
  "United States": { name: "Estados Unidos", flag: "🇺🇸", left: 17.5, top: 38.0 },
  "USA": { name: "Estados Unidos", flag: "🇺🇸", left: 17.5, top: 38.0 },

  "DE": { name: "Alemania", flag: "🇩🇪", left: 45.8, top: 32.5 },
  "Germany": { name: "Alemania", flag: "🇩🇪", left: 45.8, top: 32.5 },
  "Alemania": { name: "Alemania", flag: "🇩🇪", left: 45.8, top: 32.5 },

  "GB": { name: "Reino Unido", flag: "🇬🇧", left: 42.0, top: 31.0 },
  "United Kingdom": { name: "Reino Unido", flag: "🇬🇧", left: 42.0, top: 31.0 },
  "Reino Unido": { name: "Reino Unido", flag: "🇬🇧", left: 42.0, top: 31.0 },
  "UK": { name: "Reino Unido", flag: "🇬🇧", left: 42.0, top: 31.0 },

  "FR": { name: "Francia", flag: "🇫🇷", left: 43.5, top: 36.5 },
  "France": { name: "Francia", flag: "🇫🇷", left: 43.5, top: 36.5 },
  "Francia": { name: "Francia", flag: "🇫🇷", left: 43.5, top: 36.5 },

  "IT": { name: "Italia", flag: "🇮🇹", left: 46.8, top: 40.0 },
  "Italy": { name: "Italia", flag: "🇮🇹", left: 46.8, top: 40.0 },
  "Italia": { name: "Italia", flag: "🇮🇹", left: 46.8, top: 40.0 },

  "JP": { name: "Japón", flag: "🇯🇵", left: 88.5, top: 40.5 },
  "Japan": { name: "Japón", flag: "🇯🇵", left: 88.5, top: 40.5 },
  "Japón": { name: "Japón", flag: "🇯🇵", left: 88.5, top: 40.5 },

  "BR": { name: "Brasil", flag: "🇧🇷", left: 31.0, top: 72.0 },
  "Brazil": { name: "Brasil", flag: "🇧🇷", left: 31.0, top: 72.0 },
  "Brasil": { name: "Brasil", flag: "🇧🇷", left: 31.0, top: 72.0 },

  "MX": { name: "México", flag: "🇲🇽", left: 14.5, top: 49.0 },
  "Mexico": { name: "México", flag: "🇲🇽", left: 14.5, top: 49.0 },
  "México": { name: "México", flag: "🇲🇽", left: 14.5, top: 49.0 },

  "AR": { name: "Argentina", flag: "🇦🇷", left: 27.5, top: 86.0 },
  "Argentina": { name: "Argentina", flag: "🇦🇷", left: 27.5, top: 86.0 },

  "CA": { name: "Canadá", flag: "🇨🇦", left: 18.0, top: 24.0 },
  "Canada": { name: "Canadá", flag: "🇨🇦", left: 18.0, top: 24.0 },
  "Canadá": { name: "Canadá", flag: "🇨🇦", left: 18.0, top: 24.0 },

  "AU": { name: "Australia", flag: "🇦🇺", left: 85.0, top: 83.0 },
  "Australia": { name: "Australia", flag: "🇦🇺", left: 85.0, top: 83.0 },

  "PT": { name: "Portugal", flag: "🇵🇹", left: 40.2, top: 42.0 },
  "Portugal": { name: "Portugal", flag: "🇵🇹", left: 40.2, top: 42.0 },

  "NL": { name: "Países Bajos", flag: "🇳🇱", left: 44.5, top: 31.0 },
  "Netherlands": { name: "Países Bajos", flag: "🇳🇱", left: 44.5, top: 31.0 },

  "BE": { name: "Bélgica", flag: "🇧🇪", left: 44.0, top: 32.5 },
  "Belgium": { name: "Bélgica", flag: "🇧🇪", left: 44.0, top: 32.5 },

  "CH": { name: "Suiza", flag: "🇨🇭", left: 45.2, top: 36.0 },
  "Switzerland": { name: "Suiza", flag: "🇨🇭", left: 45.2, top: 36.0 },

  "SE": { name: "Suecia", flag: "🇸🇪", left: 47.5, top: 22.0 },
  "Sweden": { name: "Suecia", flag: "🇸🇪", left: 47.5, top: 22.0 },

  "NO": { name: "Noruega", flag: "🇳🇴", left: 45.0, top: 21.5 },
  "Norway": { name: "Noruega", flag: "🇳🇴", left: 45.0, top: 21.5 },

  "PL": { name: "Polonia", flag: "🇵🇱", left: 48.0, top: 31.0 },
  "Poland": { name: "Polonia", flag: "🇵🇱", left: 48.0, top: 31.0 },

  "IN": { name: "India", flag: "🇮🇳", left: 68.5, top: 51.0 },
  "India": { name: "India", flag: "🇮🇳", left: 68.5, top: 51.0 },

  "CN": { name: "China", flag: "🇨🇳", left: 77.0, top: 40.0 },
  "China": { name: "China", flag: "🇨🇳", left: 77.0, top: 40.0 },

  "CL": { name: "Chile", flag: "🇨🇱", left: 25.5, top: 85.0 },
  "Chile": { name: "Chile", flag: "🇨🇱", left: 25.5, top: 85.0 },

  "CO": { name: "Colombia", flag: "🇨🇴", left: 23.8, top: 60.0 },
  "Colombia": { name: "Colombia", flag: "🇨🇴", left: 23.8, top: 60.0 },

  "PE": { name: "Perú", flag: "🇵🇪", left: 23.5, top: 68.0 },
  "Peru": { name: "Perú", flag: "🇵🇪", left: 23.5, top: 68.0 },

  "MA": { name: "Marruecos", flag: "🇲🇦", left: 41.5, top: 47.0 },
  "Morocco": { name: "Marruecos", flag: "🇲🇦", left: 41.5, top: 47.0 },

  "ZA": { name: "Sudáfrica", flag: "🇿🇦", left: 50.0, top: 84.0 },
  "South Africa": { name: "Sudáfrica", flag: "🇿🇦", left: 50.0, top: 84.0 },

  "AE": { name: "EAU", flag: "🇦🇪", left: 59.5, top: 48.5 },
  "United Arab Emirates": { name: "EAU", flag: "🇦🇪", left: 59.5, top: 48.5 },
};

function getCountryMeta(rawName) {
  if (!rawName) return null;
  const trimmed = rawName.trim();
  
  // Filter out system / non-geographic records
  const lower = trimmed.toLowerCase();
  if (["system", "unknown", "n/a", "localhost", "127.0.0.1", "internal", "none", ""].includes(lower)) {
    return null;
  }

  if (COUNTRY_LOOKUP[trimmed]) return COUNTRY_LOOKUP[trimmed];
  
  const key = Object.keys(COUNTRY_LOOKUP).find(k => k.toLowerCase() === lower);
  if (key) return COUNTRY_LOOKUP[key];

  return { name: trimmed, flag: "🌍", left: null, top: null };
}

export default function WorldMap({ countries = [], lang = "es" }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  // Filter out non-geographic records (System, Unknown, N/A) completely from both map and sidebar
  const validCountries = countries.filter(c => {
    const meta = getCountryMeta(c.country);
    return meta !== null;
  });

  const validCountryNodes = validCountries
    .map(c => ({ ...c, meta: getCountryMeta(c.country) }))
    .filter(c => c.meta && c.meta.left !== null && c.meta.top !== null);

  const totalVisits = validCountries.reduce((acc, c) => acc + Number(c.count || 0), 0);
  const maxCount = Math.max(...validCountries.map(c => Number(c.count || 0)), 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-8 w-full transition-colors relative z-10">
      {/* Map Container */}
      <div className="w-full lg:w-3/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              {lang === "es" ? "Mapa Global de Visitas" : "Global Visitor Map"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "es" ? "Superposición de métricas en mapa real" : "Real-time visitor overlay"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span>Total:</span>
            <span className="text-blue-600 dark:text-blue-400 font-black">{totalVisits}</span>
          </div>
        </div>

        {/* Real World Image Box with Overlay */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 relative shadow-inner group">
          <img
            src="/mundo.webp"
            alt="Mapa Mundial"
            className="w-full h-auto object-contain rounded-xl opacity-90 transition-opacity duration-300 group-hover:opacity-100 block"
          />

          {/* Data Nodes Layer */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {validCountryNodes.map((c, idx) => {
              const count = Number(c.count || 0);
              const meta = c.meta;
              const pct = totalVisits > 0 ? ((count / totalVisits) * 100).toFixed(1) : "0.0";
              const isHovered = hoveredCountry?.country === c.country;

              const sizePx = 16 + Math.min(16, (count / maxCount) * 12);
              const isTopHalf = meta.top < 40;

              return (
                <div
                  key={idx}
                  style={{
                    left: `${meta.left}%`,
                    top: `${meta.top}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseEnter={() => setHoveredCountry({ ...c, pct })}
                  onMouseLeave={() => setHoveredCountry(null)}
                  className={`absolute pointer-events-auto cursor-pointer ${isHovered ? "z-50" : "z-20"}`}
                >
                  {/* Ping Ring */}
                  <span
                    style={{ width: `${sizePx * 2.2}px`, height: `${sizePx * 2.2}px` }}
                    className="absolute -inset-1/2 m-auto rounded-full bg-blue-400 opacity-40 animate-ping pointer-events-none"
                  ></span>

                  {/* Beacon Core */}
                  <div
                    style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
                    className={`relative rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center transition-all duration-200 ${
                      isHovered ? "scale-125 bg-blue-500 ring-4 ring-blue-400/50 shadow-2xl" : "hover:scale-110"
                    }`}
                  >
                    <span className="text-[10px] select-none leading-none">{meta.flag}</span>
                  </div>

                  {/* High Z-Index Hover Card */}
                  {isHovered && (
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-slate-900/95 border border-blue-400/70 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl animate-fade-in pointer-events-none ${
                        isTopHalf ? "top-full mt-2.5" : "bottom-full mb-2.5"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-black text-white">
                        <span className="text-sm">{meta.flag}</span>
                        <span>{meta.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-blue-400 font-bold mt-0.5 flex items-center justify-between gap-3">
                        <span>{count} {count === 1 ? "visita" : "visitas"}</span>
                        <span className="text-slate-400 text-[10px]">({pct}%)</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {validCountryNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-sm shadow-md">
                  {lang === "es" ? "Sin registros internacionales aún" : "No international traffic recorded yet"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Country Breakdown Panel - Full Card Height Scrollable Area */}
      <div className="w-full lg:w-2/5 flex flex-col justify-between min-h-[420px]">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {lang === "es" ? "Desglose por País" : "Country Breakdown"}
          </h4>
          <span className="text-[11px] font-mono text-slate-400 font-semibold">{validCountries.length} países</span>
        </div>

        {validCountries.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs italic font-medium flex-1 flex items-center justify-center">
            {lang === "es" ? "No se han detectado visitas en el periodo." : "No visits detected in this timeframe."}
          </div>
        ) : (
          <div className="flex-1 max-h-[380px] overflow-y-auto space-y-2.5 pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            {validCountries.map((c, idx) => {
              const count = Number(c.count || 0);
              const meta = getCountryMeta(c.country);
              const displayName = meta ? meta.name : (c.country || "Desconocido");
              const displayFlag = meta ? meta.flag : "🌐";
              const pct = totalVisits > 0 ? ((count / totalVisits) * 100).toFixed(1) : "0.0";
              const isHovered = hoveredCountry?.country === c.country;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCountry({ ...c, meta, pct })}
                  onMouseLeave={() => setHoveredCountry(null)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isHovered
                      ? "bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700 shadow-md translate-x-1"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{displayFlag}</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{pct}% del tráfico</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs font-black text-slate-900 dark:text-blue-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {count} {count === 1 ? "visita" : "visitas"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 mt-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Tráfico Detectado
          </span>
          <span>{totalVisits} visitas totales</span>
        </div>
      </div>
    </div>
  );
}
