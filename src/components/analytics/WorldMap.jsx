"use client";

import { useState } from "react";

// Precise percentage coordinates (left %, top %) mapped onto mundo.webp (1694x929)
const COUNTRY_LOOKUP = {
  "ES": { name: "España", flag: "🇪🇸", left: 44.2, top: 36.0 },
  "Spain": { name: "España", flag: "🇪🇸", left: 44.2, top: 36.0 },
  "España": { name: "España", flag: "🇪🇸", left: 44.2, top: 36.0 },

  "US": { name: "Estados Unidos", flag: "🇺🇸", left: 20.0, top: 33.4 },
  "United States": { name: "Estados Unidos", flag: "🇺🇸", left: 20.0, top: 33.4 },
  "USA": { name: "Estados Unidos", flag: "🇺🇸", left: 20.0, top: 33.4 },

  "DE": { name: "Alemania", flag: "🇩🇪", left: 47.2, top: 28.0 },
  "Germany": { name: "Alemania", flag: "🇩🇪", left: 47.2, top: 28.0 },
  "Alemania": { name: "Alemania", flag: "🇩🇪", left: 47.2, top: 28.0 },

  "GB": { name: "Reino Unido", flag: "🇬🇧", left: 44.0, top: 26.9 },
  "United Kingdom": { name: "Reino Unido", flag: "🇬🇧", left: 44.0, top: 26.9 },
  "Reino Unido": { name: "Reino Unido", flag: "🇬🇧", left: 44.0, top: 26.9 },
  "UK": { name: "Reino Unido", flag: "🇬🇧", left: 44.0, top: 26.9 },

  "FR": { name: "Francia", flag: "🇫🇷", left: 45.2, top: 31.8 },
  "France": { name: "Francia", flag: "🇫🇷", left: 45.2, top: 31.8 },
  "Francia": { name: "Francia", flag: "🇫🇷", left: 45.2, top: 31.8 },

  "IT": { name: "Italia", flag: "🇮🇹", left: 48.1, top: 34.4 },
  "Italy": { name: "Italia", flag: "🇮🇹", left: 48.1, top: 34.4 },
  "Italia": { name: "Italia", flag: "🇮🇹", left: 48.1, top: 34.4 },

  "JP": { name: "Japón", flag: "🇯🇵", left: 84.7, top: 35.5 },
  "Japan": { name: "Japón", flag: "🇯🇵", left: 84.7, top: 35.5 },
  "Japón": { name: "Japón", flag: "🇯🇵", left: 84.7, top: 35.5 },

  "BR": { name: "Brasil", flag: "🇧🇷", left: 32.5, top: 66.7 },
  "Brazil": { name: "Brasil", flag: "🇧🇷", left: 32.5, top: 66.7 },
  "Brasil": { name: "Brasil", flag: "🇧🇷", left: 32.5, top: 66.7 },

  "MX": { name: "México", flag: "🇲🇽", left: 16.5, top: 44.1 },
  "Mexico": { name: "México", flag: "🇲🇽", left: 16.5, top: 44.1 },
  "México": { name: "México", flag: "🇲🇽", left: 16.5, top: 44.1 },

  "AR": { name: "Argentina", flag: "🇦🇷", left: 28.9, top: 80.7 },
  "Argentina": { name: "Argentina", flag: "🇦🇷", left: 28.9, top: 80.7 },

  "CA": { name: "Canadá", flag: "🇨🇦", left: 18.9, top: 20.5 },
  "Canada": { name: "Canadá", flag: "🇨🇦", left: 18.9, top: 20.5 },
  "Canadá": { name: "Canadá", flag: "🇨🇦", left: 18.9, top: 20.5 },

  "AU": { name: "Australia", flag: "🇦🇺", left: 82.0, top: 78.6 },
  "Australia": { name: "Australia", flag: "🇦🇺", left: 82.0, top: 78.6 },

  "PT": { name: "Portugal", flag: "🇵🇹", left: 42.8, top: 36.5 },
  "Portugal": { name: "Portugal", flag: "🇵🇹", left: 42.8, top: 36.5 },

  "NL": { name: "Países Bajos", flag: "🇳🇱", left: 46.0, top: 26.9 },
  "Netherlands": { name: "Países Bajos", flag: "🇳🇱", left: 46.0, top: 26.9 },

  "BE": { name: "Bélgica", flag: "🇧🇪", left: 45.5, top: 28.5 },
  "Belgium": { name: "Bélgica", flag: "🇧🇪", left: 45.5, top: 28.5 },

  "CH": { name: "Suiza", flag: "🇨🇭", left: 46.6, top: 31.8 },
  "Switzerland": { name: "Suiza", flag: "🇨🇭", left: 46.6, top: 31.8 },

  "SE": { name: "Suecia", flag: "🇸🇪", left: 48.7, top: 19.9 },
  "Sweden": { name: "Suecia", flag: "🇸🇪", left: 48.7, top: 19.9 },

  "NO": { name: "Noruega", flag: "🇳🇴", left: 46.6, top: 19.4 },
  "Norway": { name: "Noruega", flag: "🇳🇴", left: 46.6, top: 19.4 },

  "PL": { name: "Polonia", flag: "🇵🇱", left: 49.3, top: 27.4 },
  "Poland": { name: "Polonia", flag: "🇵🇱", left: 49.3, top: 27.4 },

  "IN": { name: "India", flag: "🇮🇳", left: 67.6, top: 46.3 },
  "India": { name: "India", flag: "🇮🇳", left: 67.6, top: 46.3 },

  "CN": { name: "China", flag: "🇨🇳", left: 75.0, top: 35.5 },
  "China": { name: "China", flag: "🇨🇳", left: 75.0, top: 35.5 },

  "CL": { name: "Chile", flag: "🇨🇱", left: 26.8, top: 79.6 },
  "Chile": { name: "Chile", flag: "🇨🇱", left: 26.8, top: 79.6 },

  "CO": { name: "Colombia", flag: "🇨🇴", left: 25.4, top: 54.9 },
  "Colombia": { name: "Colombia", flag: "🇨🇴", left: 25.4, top: 54.9 },

  "PE": { name: "Perú", flag: "🇵🇪", left: 25.1, top: 63.0 },
  "Peru": { name: "Perú", flag: "🇵🇪", left: 25.1, top: 63.0 },

  "MA": { name: "Marruecos", flag: "🇲🇦", left: 43.4, top: 42.0 },
  "Morocco": { name: "Marruecos", flag: "🇲🇦", left: 43.4, top: 42.0 },

  "ZA": { name: "Sudáfrica", flag: "🇿🇦", left: 50.8, top: 78.6 },
  "South Africa": { name: "Sudáfrica", flag: "🇿🇦", left: 50.8, top: 78.6 },

  "AE": { name: "EAU", flag: "🇦🇪", left: 59.6, top: 44.1 },
  "United Arab Emirates": { name: "EAU", flag: "🇦🇪", left: 59.6, top: 44.1 },
};

function getCountryMeta(rawName) {
  if (!rawName) return { name: "Desconocido", flag: "🌍", left: 50.0, top: 50.0 };
  const trimmed = rawName.trim();
  if (COUNTRY_LOOKUP[trimmed]) return COUNTRY_LOOKUP[trimmed];
  
  const key = Object.keys(COUNTRY_LOOKUP).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (key) return COUNTRY_LOOKUP[key];

  return { name: trimmed, flag: "🌍", left: 50.0, top: 50.0 };
}

export default function WorldMap({ countries = [], lang = "es" }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const totalVisits = countries.reduce((acc, c) => acc + Number(c.count || 0), 0);
  const maxCount = Math.max(...countries.map(c => Number(c.count || 0)), 1);

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
              {lang === "es" ? "Superposición de métricas en mapa real" : "Real ClickHouse visitor overlay"}
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
            {countries.map((c, idx) => {
              const count = Number(c.count || 0);
              const meta = getCountryMeta(c.country);
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
                  onMouseEnter={() => setHoveredCountry({ ...c, meta, pct })}
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
                      className={`absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-slate-900/95 border border-blue-400/60 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl animate-fade-in pointer-events-none ${
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

            {countries.length === 0 && (
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
      <div className="w-full lg:w-2/5 flex flex-col justify-between h-auto min-h-[380px]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === "es" ? "Desglose por País (ClickHouse)" : "Country Breakdown (ClickHouse)"}
            </h4>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">{countries.length} países</span>
          </div>

          {countries.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs italic font-medium">
              {lang === "es" ? "No se han detectado visitas en el periodo." : "No visits detected in this timeframe."}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {countries.map((c, idx) => {
                const count = Number(c.count || 0);
                const meta = getCountryMeta(c.country);
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
                      <span className="text-xl">{meta.flag}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                          {meta.name}
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
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Tráfico Detectado
          </span>
          <span>{totalVisits} visitas totales</span>
        </div>
      </div>
    </div>
  );
}
