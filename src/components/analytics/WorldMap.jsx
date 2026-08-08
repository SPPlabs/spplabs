"use client";

import { useState } from "react";

// Country metadata with accurate projected coordinates on a 1000x500 canvas
const COUNTRY_LOOKUP = {
  "ES": { name: "España", flag: "🇪🇸", lat: 40.4, lng: -3.7, x: 489, y: 137 },
  "Spain": { name: "España", flag: "🇪🇸", lat: 40.4, lng: -3.7, x: 489, y: 137 },
  "España": { name: "España", flag: "🇪🇸", lat: 40.4, lng: -3.7, x: 489, y: 137 },

  "US": { name: "Estados Unidos", flag: "🇺🇸", lat: 38.9, lng: -77.0, x: 286, y: 142 },
  "United States": { name: "Estados Unidos", flag: "🇺🇸", lat: 38.9, lng: -77.0, x: 286, y: 142 },
  "USA": { name: "Estados Unidos", flag: "🇺🇸", lat: 38.9, lng: -77.0, x: 286, y: 142 },

  "DE": { name: "Alemania", flag: "🇩🇪", lat: 52.5, lng: 13.4, x: 537, y: 104 },
  "Germany": { name: "Alemania", flag: "🇩🇪", lat: 52.5, lng: 13.4, x: 537, y: 104 },
  "Alemania": { name: "Alemania", flag: "🇩🇪", lat: 52.5, lng: 13.4, x: 537, y: 104 },

  "GB": { name: "Reino Unido", flag: "🇬🇧", lat: 51.5, lng: -0.1, x: 499, y: 107 },
  "United Kingdom": { name: "Reino Unido", flag: "🇬🇧", lat: 51.5, lng: -0.1, x: 499, y: 107 },
  "Reino Unido": { name: "Reino Unido", flag: "🇬🇧", lat: 51.5, lng: -0.1, x: 499, y: 107 },
  "UK": { name: "Reino Unido", flag: "🇬🇧", lat: 51.5, lng: -0.1, x: 499, y: 107 },

  "FR": { name: "Francia", flag: "🇫🇷", lat: 48.8, lng: 2.3, x: 506, y: 114 },
  "France": { name: "Francia", flag: "🇫🇷", lat: 48.8, lng: 2.3, x: 506, y: 114 },
  "Francia": { name: "Francia", flag: "🇫🇷", lat: 48.8, lng: 2.3, x: 506, y: 114 },

  "IT": { name: "Italia", flag: "🇮🇹", lat: 41.9, lng: 12.5, x: 534, y: 133 },
  "Italy": { name: "Italia", flag: "🇮🇹", lat: 41.9, lng: 12.5, x: 534, y: 133 },
  "Italia": { name: "Italia", flag: "🇮🇹", lat: 41.9, lng: 12.5, x: 534, y: 133 },

  "JP": { name: "Japón", flag: "🇯🇵", lat: 35.7, lng: 139.7, x: 888, y: 151 },
  "Japan": { name: "Japón", flag: "🇯🇵", lat: 35.7, lng: 139.7, x: 888, y: 151 },
  "Japón": { name: "Japón", flag: "🇯🇵", lat: 35.7, lng: 139.7, x: 888, y: 151 },

  "BR": { name: "Brasil", flag: "🇧🇷", lat: -15.8, lng: -47.9, x: 367, y: 294 },
  "Brazil": { name: "Brasil", flag: "🇧🇷", lat: -15.8, lng: -47.9, x: 367, y: 294 },
  "Brasil": { name: "Brasil", flag: "🇧🇷", lat: -15.8, lng: -47.9, x: 367, y: 294 },

  "MX": { name: "México", flag: "🇲🇽", lat: 19.4, lng: -99.1, x: 224, y: 196 },
  "Mexico": { name: "México", flag: "🇲🇽", lat: 19.4, lng: -99.1, x: 224, y: 196 },
  "México": { name: "México", flag: "🇲🇽", lat: 19.4, lng: -99.1, x: 224, y: 196 },

  "AR": { name: "Argentina", flag: "🇦🇷", lat: -34.6, lng: -58.4, x: 338, y: 346 },
  "Argentina": { name: "Argentina", flag: "🇦🇷", lat: -34.6, lng: -58.4, x: 338, y: 346 },

  "CA": { name: "Canadá", flag: "🇨🇦", lat: 56.1, lng: -106.3, x: 204, y: 94 },
  "Canada": { name: "Canadá", flag: "🇨🇦", lat: 56.1, lng: -106.3, x: 204, y: 94 },
  "Canadá": { name: "Canadá", flag: "🇨🇦", lat: 56.1, lng: -106.3, x: 204, y: 94 },

  "AU": { name: "Australia", flag: "🇦🇺", lat: -25.2, lng: 133.7, x: 871, y: 320 },
  "Australia": { name: "Australia", flag: "🇦🇺", lat: -25.2, lng: 133.7, x: 871, y: 320 },

  "PT": { name: "Portugal", flag: "🇵🇹", lat: 38.7, lng: -9.1, x: 474, y: 142 },
  "Portugal": { name: "Portugal", flag: "🇵🇹", lat: 38.7, lng: -9.1, x: 474, y: 142 },

  "NL": { name: "Países Bajos", flag: "🇳🇱", lat: 52.3, lng: 4.9, x: 513, y: 104 },
  "Netherlands": { name: "Países Bajos", flag: "🇳🇱", lat: 52.3, lng: 4.9, x: 513, y: 104 },

  "BE": { name: "Bélgica", flag: "🇧🇪", lat: 50.8, lng: 4.3, x: 512, y: 108 },
  "Belgium": { name: "Bélgica", flag: "🇧🇪", lat: 50.8, lng: 4.3, x: 512, y: 108 },

  "CH": { name: "Suiza", flag: "🇨🇭", lat: 46.8, lng: 8.2, x: 523, y: 120 },
  "Switzerland": { name: "Suiza", flag: "🇨🇭", lat: 46.8, lng: 8.2, x: 523, y: 120 },

  "SE": { name: "Suecia", flag: "🇸🇪", lat: 60.1, lng: 18.6, x: 552, y: 83 },
  "Sweden": { name: "Suecia", flag: "🇸🇪", lat: 60.1, lng: 18.6, x: 552, y: 83 },

  "NO": { name: "Noruega", flag: "🇳🇴", lat: 60.4, lng: 8.4, x: 523, y: 82 },
  "Norway": { name: "Noruega", flag: "🇳🇴", lat: 60.4, lng: 8.4, x: 523, y: 82 },

  "PL": { name: "Polonia", flag: "🇵🇱", lat: 51.9, lng: 19.1, x: 553, y: 105 },
  "Poland": { name: "Polonia", flag: "🇵🇱", lat: 51.9, lng: 19.1, x: 553, y: 105 },

  "IN": { name: "India", flag: "🇮🇳", lat: 20.5, lng: 78.9, x: 719, y: 193 },
  "India": { name: "India", flag: "🇮🇳", lat: 20.5, lng: 78.9, x: 719, y: 193 },

  "CN": { name: "China", flag: "🇨🇳", lat: 35.8, lng: 104.1, x: 789, y: 150 },
  "China": { name: "China", flag: "🇨🇳", lat: 35.8, lng: 104.1, x: 789, y: 150 },

  "CL": { name: "Chile", flag: "🇨🇱", lat: -35.6, lng: -71.5, x: 301, y: 349 },
  "Chile": { name: "Chile", flag: "🇨🇱", lat: -35.6, lng: -71.5, x: 301, y: 349 },

  "CO": { name: "Colombia", flag: "🇨🇴", lat: 4.5, lng: -74.2, x: 294, y: 237 },
  "Colombia": { name: "Colombia", flag: "🇨🇴", lat: 4.5, lng: -74.2, x: 294, y: 237 },

  "PE": { name: "Perú", flag: "🇵🇪", lat: -9.1, lng: -75.0, x: 291, y: 275 },
  "Peru": { name: "Perú", flag: "🇵🇪", lat: -9.1, lng: -75.0, x: 291, y: 275 },

  "MA": { name: "Marruecos", flag: "🇲🇦", lat: 31.7, lng: -7.0, x: 480, y: 162 },
  "Morocco": { name: "Marruecos", flag: "🇲🇦", lat: 31.7, lng: -7.0, x: 480, y: 162 },

  "ZA": { name: "Sudáfrica", flag: "🇿🇦", lat: -30.5, lng: 22.9, x: 563, y: 335 },
  "South Africa": { name: "Sudáfrica", flag: "🇿🇦", lat: -30.5, lng: 22.9, x: 563, y: 335 },

  "AE": { name: "EAU", flag: "🇦🇪", lat: 23.4, lng: 53.8, x: 649, y: 185 },
  "United Arab Emirates": { name: "EAU", flag: "🇦🇪", lat: 23.4, lng: 53.8, x: 649, y: 185 },
};

function getCountryMeta(rawName) {
  if (!rawName) return { name: "Desconocido", flag: "🌍", x: 500, y: 250 };
  const trimmed = rawName.trim();
  if (COUNTRY_LOOKUP[trimmed]) return COUNTRY_LOOKUP[trimmed];
  
  const key = Object.keys(COUNTRY_LOOKUP).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (key) return COUNTRY_LOOKUP[key];

  return { name: trimmed, flag: "🌍", x: 500, y: 250 };
}

export default function WorldMap({ countries = [], lang = "es" }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const totalVisits = countries.reduce((acc, c) => acc + Number(c.count || 0), 0);
  const maxCount = Math.max(...countries.map(c => Number(c.count || 0)), 1);

  const getBeaconColor = (count) => {
    if (!count) return "#94a3b8";
    const ratio = count / maxCount;
    if (ratio > 0.75) return "#3b82f6";
    if (ratio > 0.40) return "#0ea5e9";
    if (ratio > 0.15) return "#06b6d4";
    return "#38bdf8";
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-8 w-full transition-colors">
      {/* SVG Canvas Container */}
      <div className="w-full lg:w-3/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              {lang === "es" ? "Mapa Global de Visitas" : "Global Visitor Map"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "es" ? "Procesado en tiempo real vía ClickHouse OLAP" : "Real-time query via ClickHouse OLAP"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <span>Total:</span>
            <span className="text-blue-600 dark:text-blue-400 font-black">{totalVisits}</span>
          </div>
        </div>

        {/* World Vector View Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden min-h-[260px] shadow-inner">
          <svg viewBox="0 0 1000 500" className="w-full h-auto max-h-[300px] overflow-visible">
            <defs>
              <pattern id="worldGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
              <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <rect width="1000" height="500" fill="url(#worldGrid)" />

            <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" strokeWidth="1" />

            {/* Detailed Vector Landmasses */}
            {/* North America */}
            <path
              d="M 90 70 L 140 60 L 190 75 L 260 70 L 310 90 L 330 130 L 290 160 L 250 180 L 220 220 L 190 200 L 160 170 L 130 175 L 100 130 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.2"
            />
            {/* Greenland */}
            <path d="M 340 40 L 410 30 L 440 65 L 390 85 L 350 70 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* South America */}
            <path
              d="M 270 230 L 320 235 L 375 270 L 380 320 L 340 390 L 310 430 L 295 400 L 285 330 L 260 270 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.2"
            />
            {/* Europe */}
            <path
              d="M 460 100 L 490 85 L 530 80 L 565 95 L 560 130 L 520 145 L 485 145 L 465 125 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.2"
            />
            {/* British Isles */}
            <path d="M 470 95 L 485 90 L 490 110 L 475 115 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Scandinavia */}
            <path d="M 515 50 L 545 45 L 555 85 L 530 90 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Africa */}
            <path
              d="M 455 155 L 550 155 L 610 200 L 590 270 L 560 340 L 530 350 L 490 280 L 445 200 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.2"
            />
            {/* Madagascar */}
            <path d="M 610 300 L 625 310 L 615 345 L 600 335 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Asia */}
            <path
              d="M 570 75 L 750 60 L 890 90 L 910 160 L 840 210 L 760 230 L 720 250 L 680 200 L 620 170 L 570 130 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.2"
            />
            {/* Japan */}
            <path d="M 875 130 L 895 140 L 880 180 L 865 160 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Indonesia & SE Asia Islands */}
            <path d="M 760 245 L 830 255 L 850 280 L 780 270 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Australia */}
            <path
              d="M 800 300 L 880 290 L 910 330 L 890 380 L 820 370 L 790 330 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.2"
            />
            {/* New Zealand */}
            <path d="M 930 380 L 945 390 L 935 420 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />

            {/* Country Nodes & Beacons (Data from ClickHouse) */}
            {countries.map((c, idx) => {
              const count = Number(c.count || 0);
              const meta = getCountryMeta(c.country);
              const color = getBeaconColor(count);
              const pct = totalVisits > 0 ? ((count / totalVisits) * 100).toFixed(1) : "0.0";
              const isHovered = hoveredCountry?.country === c.country;

              const r = 5 + Math.min(12, (count / maxCount) * 10);

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredCountry({ ...c, meta, pct })}
                  onMouseLeave={() => setHoveredCountry(null)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={meta.x}
                    cy={meta.y}
                    r={r * 2.2}
                    fill={color}
                    opacity="0.35"
                    className="animate-ping"
                  />

                  <circle
                    cx={meta.x}
                    cy={meta.y}
                    r={r + 3}
                    fill={color}
                    opacity="0.25"
                    filter="url(#blueGlow)"
                  />

                  <circle
                    cx={meta.x}
                    cy={meta.y}
                    r={r}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? "2.5" : "1.5"}
                    className="transition-all duration-200 group-hover:scale-125"
                  />

                  <text
                    x={meta.x}
                    y={meta.y - r - 4}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="800"
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow-md select-none"
                  >
                    {meta.flag}
                  </text>
                </g>
              );
            })}

            {/* Tooltip Overlay */}
            {hoveredCountry && (
              <g className="pointer-events-none animate-fade-in">
                <rect
                  x={Math.max(10, Math.min(840, hoveredCountry.meta.x - 75))}
                  y={Math.max(10, hoveredCountry.meta.y - 65)}
                  width="150"
                  height="50"
                  rx="10"
                  fill="#090d16"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  className="shadow-2xl"
                />
                <text
                  x={Math.max(10, Math.min(840, hoveredCountry.meta.x - 75)) + 12}
                  y={Math.max(10, hoveredCountry.meta.y - 65) + 20}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="900"
                >
                  {hoveredCountry.meta.flag} {hoveredCountry.meta.name}
                </text>
                <text
                  x={Math.max(10, Math.min(840, hoveredCountry.meta.x - 75)) + 12}
                  y={Math.max(10, hoveredCountry.meta.y - 65) + 38}
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="700"
                >
                  {hoveredCountry.count} {hoveredCountry.count === 1 ? "visita" : "visitas"} ({hoveredCountry.pct}%)
                </text>
              </g>
            )}

            {countries.length === 0 && (
              <text x="500" y="250" fill="#64748b" fontSize="13" fontWeight="bold" textAnchor="middle">
                {lang === "es" ? "Sin registros internacionales aún" : "No international traffic recorded yet"}
              </text>
            )}
          </svg>
        </div>
      </div>

      {/* Country Leaderboard Panel */}
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

        {/* Map Legend */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Alta Densidad
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Media / Baja
          </span>
        </div>
      </div>
    </div>
  );
}
