"use client";

import { useState } from "react";

// Country metadata mapped to exact percentage coordinates (left %, top %) on mundo.webp
const COUNTRY_LOOKUP = {
  "ES": { name: "España", flag: "🇪🇸", left: 47.8, top: 36.5 },
  "Spain": { name: "España", flag: "🇪🇸", left: 47.8, top: 36.5 },
  "España": { name: "España", flag: "🇪🇸", left: 47.8, top: 36.5 },

  "US": { name: "Estados Unidos", flag: "🇺🇸", left: 21.0, top: 34.0 },
  "United States": { name: "Estados Unidos", flag: "🇺🇸", left: 21.0, top: 34.0 },
  "USA": { name: "Estados Unidos", flag: "🇺🇸", left: 21.0, top: 34.0 },

  "DE": { name: "Alemania", flag: "🇩🇪", left: 51.7, top: 28.5 },
  "Germany": { name: "Alemania", flag: "🇩🇪", left: 51.7, top: 28.5 },
  "Alemania": { name: "Alemania", flag: "🇩🇪", left: 51.7, top: 28.5 },

  "GB": { name: "Reino Unido", flag: "🇬🇧", left: 48.0, top: 27.5 },
  "United Kingdom": { name: "Reino Unido", flag: "🇬🇧", left: 48.0, top: 27.5 },
  "Reino Unido": { name: "Reino Unido", flag: "🇬🇧", left: 48.0, top: 27.5 },
  "UK": { name: "Reino Unido", flag: "🇬🇧", left: 48.0, top: 27.5 },

  "FR": { name: "Francia", flag: "🇫🇷", left: 49.3, top: 32.2 },
  "France": { name: "Francia", flag: "🇫🇷", left: 49.3, top: 32.2 },
  "Francia": { name: "Francia", flag: "🇫🇷", left: 49.3, top: 32.2 },

  "IT": { name: "Italia", flag: "🇮🇹", left: 52.5, top: 35.0 },
  "Italy": { name: "Italia", flag: "🇮🇹", left: 52.5, top: 35.0 },
  "Italia": { name: "Italia", flag: "🇮🇹", left: 52.5, top: 35.0 },

  "JP": { name: "Japón", flag: "🇯🇵", left: 85.5, top: 35.5 },
  "Japan": { name: "Japón", flag: "🇯🇵", left: 85.5, top: 35.5 },
  "Japón": { name: "Japón", flag: "🇯🇵", left: 85.5, top: 35.5 },

  "BR": { name: "Brasil", flag: "🇧🇷", left: 33.5, top: 67.0 },
  "Brazil": { name: "Brasil", flag: "🇧🇷", left: 33.5, top: 67.0 },
  "Brasil": { name: "Brasil", flag: "🇧🇷", left: 33.5, top: 67.0 },

  "MX": { name: "México", flag: "🇲🇽", left: 17.5, top: 45.0 },
  "Mexico": { name: "México", flag: "🇲🇽", left: 17.5, top: 45.0 },
  "México": { name: "México", flag: "🇲🇽", left: 17.5, top: 45.0 },

  "AR": { name: "Argentina", flag: "🇦🇷", left: 29.5, top: 80.0 },
  "Argentina": { name: "Argentina", flag: "🇦🇷", left: 29.5, top: 80.0 },

  "CA": { name: "Canadá", flag: "🇨🇦", left: 21.5, top: 21.0 },
  "Canada": { name: "Canadá", flag: "🇨🇦", left: 21.5, top: 21.0 },
  "Canadá": { name: "Canadá", flag: "🇨🇦", left: 21.5, top: 21.0 },

  "AU": { name: "Australia", flag: "🇦🇺", left: 82.5, top: 77.5 },
  "Australia": { name: "Australia", flag: "🇦🇺", left: 82.5, top: 77.5 },

  "PT": { name: "Portugal", flag: "🇵🇹", left: 46.2, top: 37.0 },
  "Portugal": { name: "Portugal", flag: "🇵🇹", left: 46.2, top: 37.0 },

  "NL": { name: "Países Bajos", flag: "🇳🇱", left: 50.3, top: 27.8 },
  "Netherlands": { name: "Países Bajos", flag: "🇳🇱", left: 50.3, top: 27.8 },

  "BE": { name: "Bélgica", flag: "🇧🇪", left: 49.8, top: 28.5 },
  "Belgium": { name: "Bélgica", flag: "🇧🇪", left: 49.8, top: 28.5 },

  "CH": { name: "Suiza", flag: "🇨🇭", left: 50.9, top: 31.8 },
  "Switzerland": { name: "Suiza", flag: "🇨🇭", left: 50.9, top: 31.8 },

  "SE": { name: "Suecia", flag: "🇸🇪", left: 53.0, top: 20.0 },
  "Sweden": { name: "Suecia", flag: "🇸🇪", left: 53.0, top: 20.0 },

  "NO": { name: "Noruega", flag: "🇳🇴", left: 51.0, top: 19.5 },
  "Norway": { name: "Noruega", flag: "🇳🇴", left: 51.0, top: 19.5 },

  "PL": { name: "Polonia", flag: "🇵🇱", left: 54.0, top: 27.5 },
  "Poland": { name: "Polonia", flag: "🇵🇱", left: 54.0, top: 27.5 },

  "IN": { name: "India", flag: "🇮🇳", left: 69.5, top: 45.5 },
  "India": { name: "India", flag: "🇮🇳", left: 69.5, top: 45.5 },

  "CN": { name: "China", flag: "🇨🇳", left: 77.0, top: 35.0 },
  "China": { name: "China", flag: "🇨🇳", left: 77.0, top: 35.0 },

  "CL": { name: "Chile", flag: "🇨🇱", left: 27.0, top: 80.0 },
  "Chile": { name: "Chile", flag: "🇨🇱", left: 27.0, top: 80.0 },

  "CO": { name: "Colombia", flag: "🇨🇴", left: 27.0, top: 55.5 },
  "Colombia": { name: "Colombia", flag: "🇨🇴", left: 27.0, top: 55.5 },

  "PE": { name: "Perú", flag: "🇵🇪", left: 26.5, top: 63.5 },
  "Peru": { name: "Perú", flag: "🇵🇪", left: 26.5, top: 63.5 },

  "MA": { name: "Marruecos", flag: "🇲🇦", left: 47.0, top: 41.5 },
  "Morocco": { name: "Marruecos", flag: "🇲🇦", left: 47.0, top: 41.5 },

  "ZA": { name: "Sudáfrica", flag: "🇿🇦", left: 54.5, top: 78.0 },
  "South Africa": { name: "Sudáfrica", flag: "🇿🇦", left: 54.5, top: 78.0 },

  "AE": { name: "EAU", flag: "🇦🇪", left: 61.5, top: 43.5 },
  "United Arab Emirates": { name: "EAU", flag: "🇦🇪", left: 61.5, top: 43.5 },
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-8 w-full transition-colors">
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
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <span>Total:</span>
            <span className="text-blue-600 dark:text-blue-400 font-black">{totalVisits}</span>
          </div>
        </div>

        {/* Real World Image Box with Overlay */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 relative overflow-hidden shadow-inner group">
          <img
            src="/mundo.webp"
            alt="Mapa Mundial"
            className="w-full h-auto object-contain rounded-xl opacity-90 transition-opacity duration-300 group-hover:opacity-100"
          />

          {/* Data Nodes Layer */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {countries.map((c, idx) => {
              const count = Number(c.count || 0);
              const meta = getCountryMeta(c.country);
              const pct = totalVisits > 0 ? ((count / totalVisits) * 100).toFixed(1) : "0.0";
              const isHovered = hoveredCountry?.country === c.country;

              // Size calculation
              const sizePx = 14 + Math.min(18, (count / maxCount) * 14);

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
                  className="absolute pointer-events-auto cursor-pointer group/node"
                >
                  {/* Ping Animation Ring */}
                  <span
                    style={{ width: `${sizePx * 2.2}px`, height: `${sizePx * 2.2}px` }}
                    className="absolute -inset-1/2 m-auto rounded-full bg-blue-400 opacity-40 animate-ping"
                  ></span>

                  {/* Beacon Core */}
                  <div
                    style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
                    className={`relative rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 ${
                      isHovered ? "scale-125 bg-blue-400 ring-4 ring-blue-400/40 z-30" : "hover:scale-110"
                    }`}
                  >
                    <span className="text-[10px] select-none">{meta.flag}</span>
                  </div>

                  {/* Hover Tooltip Card */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 whitespace-nowrap bg-slate-900/95 border border-blue-400/50 backdrop-blur-md px-3 py-2 rounded-xl shadow-2xl animate-fade-in pointer-events-none">
                      <div className="flex items-center gap-1.5 text-xs font-black text-white">
                        <span>{meta.flag}</span>
                        <span>{meta.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-blue-400 font-bold mt-0.5">
                        {count} {count === 1 ? "visita" : "visitas"} ({pct}%)
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {countries.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-slate-900/80 border border-slate-700 text-slate-400 text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-sm">
                  {lang === "es" ? "Sin registros internacionales aún" : "No international traffic recorded yet"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Country Breakdown Panel */}
      <div className="w-full lg:w-2/5 space-y-4 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            {lang === "es" ? "Desglose por País (ClickHouse)" : "Country Breakdown (ClickHouse)"}
          </h4>

          {countries.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic font-medium">
              {lang === "es" ? "No se han detectado visitas en el periodo." : "No visits detected in this timeframe."}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
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
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isHovered
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{meta.flag}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                          {meta.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{pct}% del tráfico</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-black text-slate-900 dark:text-blue-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
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
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Tráfico Detectado
          </span>
          <span>{countries.length} países activos</span>
        </div>
      </div>
    </div>
  );
}
