"use client";

import { useState } from "react";

// Accurate mathematical (latitude, longitude) conversion for Spanish cities onto a 600x480 SVG Canvas
const CITY_LOOKUP = {
  "Madrid": { name: "Madrid", region: "Comunidad de Madrid", x: 281, y: 199 },
  "Barcelona": { name: "Barcelona", region: "Cataluña", x: 516, y: 150 },
  "Valencia": { name: "Valencia", region: "Comunitat Valenciana", x: 415, y: 246 },
  "Sevilla": { name: "Sevilla", region: "Andalucía", x: 190, y: 350 },
  "Zaragoza": { name: "Zaragoza", region: "Aragón", x: 394, y: 137 },
  "Málaga": { name: "Málaga", region: "Andalucía", x: 253, y: 384 },
  "Malaga": { name: "Málaga", region: "Andalucía", x: 253, y: 384 },
  "Murcia": { name: "Murcia", region: "Región de Murcia", x: 384, y: 320 },
  "Palma": { name: "Palma de Mallorca", region: "Islas Baleares", x: 536, y: 241 },
  "Palma de Mallorca": { name: "Palma de Mallorca", region: "Islas Baleares", x: 536, y: 241 },
  "Bilbao": { name: "Bilbao", region: "País Vasco", x: 312, y: 57 },
  "Alicante": { name: "Alicante", region: "Comunitat Valenciana", x: 410, y: 302 },
  "Vigo": { name: "Vigo", region: "Galicia", x: 81, y: 108 },
  "A Coruña": { name: "A Coruña", region: "Galicia", x: 93, y: 52 },
  "La Coruña": { name: "A Coruña", region: "Galicia", x: 93, y: 52 },
  "Coruña": { name: "A Coruña", region: "Galicia", x: 93, y: 52 },
  "Granada": { name: "Granada", region: "Andalucía", x: 286, y: 361 },
  "Córdoba": { name: "Córdoba", region: "Andalucía", x: 239, y: 325 },
  "Cordoba": { name: "Córdoba", region: "Andalucía", x: 239, y: 325 },
  "Valladolid": { name: "Valladolid", region: "Castilla y León", x: 241, y: 137 },
  "Oviedo": { name: "Oviedo", region: "Principado de Asturias", x: 196, y: 52 },
  "Gijón": { name: "Gijón", region: "Principado de Asturias", x: 202, y: 48 },
  "Gijon": { name: "Gijón", region: "Principado de Asturias", x: 202, y: 48 },
  "Santander": { name: "Santander", region: "Cantabria", x: 277, y: 47 },
  "San Sebastián": { name: "San Sebastián", region: "País Vasco", x: 350, y: 54 },
  "Donostia": { name: "San Sebastián", region: "País Vasco", x: 350, y: 54 },
  "Pamplona": { name: "Pamplona", region: "Comunidad Foral de Navarra", x: 364, y: 79 },
  "Toledo": { name: "Toledo", region: "Castilla-La Mancha", x: 269, y: 227 },
  "Salamanca": { name: "Salamanca", region: "Castilla y León", x: 203, y: 171 },
  "Burgos": { name: "Burgos", region: "Castilla y León", x: 282, y: 103 },
  "Cádiz": { name: "Cádiz", region: "Andalucía", x: 178, y: 393 },
  "Cadiz": { name: "Cádiz", region: "Andalucía", x: 178, y: 393 },
  "Badajoz": { name: "Badajoz", region: "Extremadura", x: 151, y: 276 },
  "Almería": { name: "Almería", region: "Andalucía", x: 331, y: 378 },
  "Almeria": { name: "Almería", region: "Andalucía", x: 331, y: 378 },
  "Girona": { name: "Girona", region: "Cataluña", x: 542, y: 121 },
  "Gerona": { name: "Girona", region: "Cataluña", x: 542, y: 121 },
  "Tarragona": { name: "Tarragona", region: "Cataluña", x: 480, y: 164 },
  "Castellón": { name: "Castellón de la Plana", region: "Comunitat Valenciana", x: 428, y: 221 },
  "Castellon": { name: "Castellón de la Plana", region: "Comunitat Valenciana", x: 428, y: 221 },
  "Albacete": { name: "Albacete", region: "Castilla-La Mancha", x: 355, y: 270 },
  "Logroño": { name: "Logroño", region: "La Rioja", x: 332, y: 97 },
  "Logrono": { name: "Logroño", region: "La Rioja", x: 332, y: 97 },
  "Huelva": { name: "Huelva", region: "Andalucía", x: 152, y: 357 },
  "Lleida": { name: "Lleida", region: "Cataluña", x: 455, y: 139 },
  "Lerida": { name: "Lleida", region: "Cataluña", x: 455, y: 139 },
  "Marbella": { name: "Marbella", region: "Andalucía", x: 234, y: 394 },
  "León": { name: "León", region: "Castilla y León", x: 207, y: 90 },
  "Leon": { name: "León", region: "Castilla y León", x: 207, y: 90 },
  "Jaén": { name: "Jaén", region: "Andalucía", x: 278, y: 331 },
  "Jaen": { name: "Jaén", region: "Andalucía", x: 278, y: 331 },
  "Ourense": { name: "Ourense", region: "Galicia", x: 115, y: 103 },
  "Orense": { name: "Ourense", region: "Galicia", x: 115, y: 103 },
  "Lugo": { name: "Lugo", region: "Galicia", x: 127, y: 69 },
  "Cáceres": { name: "Cáceres", region: "Extremadura", x: 175, y: 246 },
  "Caceres": { name: "Cáceres", region: "Extremadura", x: 175, y: 246 },
  "Las Palmas": { name: "Las Palmas de Gran Canaria", region: "Canarias", x: 75, y: 420 },
  "Las Palmas de Gran Canaria": { name: "Las Palmas de Gran Canaria", region: "Canarias", x: 75, y: 420 },
  "Santa Cruz de Tenerife": { name: "Santa Cruz de Tenerife", region: "Canarias", x: 45, y: 415 },
  "Tenerife": { name: "Santa Cruz de Tenerife", region: "Canarias", x: 45, y: 415 },
  "Ceuta": { name: "Ceuta", region: "Ceuta", x: 205, y: 425 },
  "Melilla": { name: "Melilla", region: "Melilla", x: 270, y: 430 },
};

function getCityMeta(rawCity) {
  if (!rawCity) return { name: "Desconocida", region: "España", x: 281, y: 199 };
  const trimmed = rawCity.trim();
  if (CITY_LOOKUP[trimmed]) return CITY_LOOKUP[trimmed];

  const key = Object.keys(CITY_LOOKUP).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (key) return CITY_LOOKUP[key];

  return { name: trimmed, region: "España", x: 281, y: 199 };
}

export default function SpainMap({ spainCities = [], lang = "es" }) {
  const [hoveredCity, setHoveredCity] = useState(null);

  const totalSpainVisits = spainCities.reduce((acc, c) => acc + Number(c.count || 0), 0);
  const maxCityCount = Math.max(...spainCities.map(c => Number(c.count || 0)), 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-8 w-full transition-colors">
      {/* SVG Canvas Container */}
      <div className="w-full lg:w-3/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
              {lang === "es" ? "Mapa de Ciudades en España" : "Spain City Visitor Map"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "es" ? "Geolocalización precisa e Ingestion ClickHouse" : "Precise geolocation via ClickHouse ingestion"}
            </p>
          </div>
          <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs px-3 py-1.5 rounded-xl font-bold border border-sky-200 dark:border-sky-800 font-mono">
            🇪🇸 NODO ESPAÑA
          </span>
        </div>

        {/* Spain Vector ViewBox */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden min-h-[260px] shadow-inner">
          <svg viewBox="0 0 600 450" className="w-full h-auto max-h-[300px] overflow-visible">
            <defs>
              <pattern id="spainGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
              <filter id="skyGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <rect width="600" height="450" fill="url(#spainGrid)" />

            {/* Accurate Peninsular Spain Vector Contour */}
            <path
              d="
                M 90 40 
                Q 140 38, 200 42 
                T 280 40 
                T 350 45 
                T 370 65 
                T 450 110 
                T 545 115 
                T 550 145 
                T 510 170 
                T 475 220 
                T 430 240 
                T 420 310 
                T 340 375 
                T 270 395 
                T 220 395 
                T 170 390 
                T 145 355 
                T 150 270 
                T 195 240 
                T 200 170 
                T 195 125 
                T 145 135 
                T 75 115 
                T 70 65 
                Z
              "
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1.8"
              opacity="0.9"
            />

            {/* Portugal Border Divider Line */}
            <path
              d="M 195 125 L 145 135 L 150 270 L 195 240"
              fill="none"
              stroke="#475569"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x="160" y="200" fill="#64748b" fontSize="9" fontWeight="bold" letterSpacing="1">
              PORTUGAL
            </text>

            {/* France / Pyrenees Line */}
            <line x1="370" y1="65" x2="545" y2="115" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="440" y="70" fill="#64748b" fontSize="9" fontWeight="bold">
              FRANCIA
            </text>

            {/* Balearic Islands */}
            {/* Mallorca */}
            <path d="M 525 230 Q 545 225, 545 245 T 525 245 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Menorca */}
            <path d="M 555 215 Q 565 212, 563 222 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Ibiza & Formentera */}
            <path d="M 505 250 Q 515 248, 513 258 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="510" y="272" fill="#94a3b8" fontSize="8" fontWeight="bold">
              BALEARES
            </text>

            {/* Canary Islands Inset Box */}
            <rect x="15" y="375" width="110" height="60" fill="#090d16" stroke="#334155" strokeWidth="1" rx="8" />
            <text x="22" y="388" fill="#38bdf8" fontSize="8" fontWeight="800" letterSpacing="0.5">
              CANARIAS
            </text>
            {/* Tenerife */}
            <path d="M 40 410 Q 52 405, 48 420 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
            {/* Gran Canaria */}
            <path d="M 70 412 Q 80 410, 78 422 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
            {/* Lanzarote & Fuerteventura */}
            <path d="M 100 395 Q 110 390, 105 410 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />

            {/* Ceuta & Melilla Insets */}
            <rect x="195" y="415" width="22" height="16" fill="#090d16" stroke="#334155" strokeWidth="1" rx="4" />
            <text x="198" y="426" fill="#94a3b8" fontSize="7" fontWeight="bold">CEU</text>

            <rect x="260" y="420" width="22" height="16" fill="#090d16" stroke="#334155" strokeWidth="1" rx="4" />
            <text x="262" y="431" fill="#94a3b8" fontSize="7" fontWeight="bold">MEL</text>

            {/* Render City Heatmap Nodes */}
            {spainCities.map((c, idx) => {
              const count = Number(c.count || 0);
              const meta = getCityMeta(c.city);
              const isHovered = hoveredCity?.city === c.city;
              const pct = totalSpainVisits > 0 ? ((count / totalSpainVisits) * 100).toFixed(1) : "0.0";

              const radius = 4 + Math.min(10, (count / maxCityCount) * 8);

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredCity({ ...c, meta, pct })}
                  onMouseLeave={() => setHoveredCity(null)}
                  className="cursor-pointer group"
                >
                  {/* Heat Pulse Ring */}
                  <circle
                    cx={meta.x}
                    cy={meta.y}
                    r={radius * 2}
                    fill="#0284c7"
                    opacity="0.4"
                    className="animate-ping"
                  />

                  {/* Heat Aura */}
                  <circle
                    cx={meta.x}
                    cy={meta.y}
                    r={radius + 3}
                    fill="#0ea5e9"
                    opacity="0.3"
                    filter="url(#skyGlow)"
                  />

                  {/* Core City Pin Node */}
                  <circle
                    cx={meta.x}
                    cy={meta.y}
                    r={radius}
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth={isHovered ? "2.5" : "1.5"}
                    className="transition-all duration-200 group-hover:scale-125"
                  />

                  {/* City Label */}
                  <text
                    x={meta.x}
                    y={meta.y - radius - 3}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="800"
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow-md"
                  >
                    {c.city}
                  </text>
                </g>
              );
            })}

            {/* Active Hover Card Tooltip */}
            {hoveredCity && (
              <g className="pointer-events-none animate-fade-in">
                <rect
                  x={Math.max(10, Math.min(440, hoveredCity.meta.x - 70))}
                  y={Math.max(10, hoveredCity.meta.y - 65)}
                  width="140"
                  height="48"
                  rx="10"
                  fill="#090d16"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  className="shadow-2xl"
                />
                <text
                  x={Math.max(10, Math.min(440, hoveredCity.meta.x - 70)) + 10}
                  y={Math.max(10, hoveredCity.meta.y - 65) + 18}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="900"
                >
                  📍 {hoveredCity.meta.name}
                </text>
                <text
                  x={Math.max(10, Math.min(440, hoveredCity.meta.x - 70)) + 10}
                  y={Math.max(10, hoveredCity.meta.y - 65) + 34}
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="700"
                >
                  {hoveredCity.count} {hoveredCity.count === 1 ? "visita" : "visitas"} ({hoveredCity.pct}%)
                </text>
              </g>
            )}

            {spainCities.length === 0 && (
              <text x="300" y="225" fill="#64748b" fontSize="13" fontWeight="bold" textAnchor="middle">
                {lang === "es" ? "Sin accesos registrados en España aún" : "No visits recorded from Spain yet"}
              </text>
            )}
          </svg>
        </div>
      </div>

      {/* Cities Leaderboard Panel */}
      <div className="w-full lg:w-2/5 space-y-4 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            {lang === "es" ? "Top Ciudades en España (ClickHouse)" : "Top Spain Cities (ClickHouse)"}
          </h4>

          {spainCities.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic font-medium">
              {lang === "es" ? "No se registraron visitas en España." : "No visits recorded from Spain."}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {spainCities.map((c, idx) => {
                const count = Number(c.count || 0);
                const meta = getCityMeta(c.city);
                const pct = totalSpainVisits > 0 ? ((count / totalSpainVisits) * 100).toFixed(1) : "0.0";
                const isHovered = hoveredCity?.city === c.city;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredCity({ ...c, meta, pct })}
                    onMouseLeave={() => setHoveredCity(null)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isHovered
                        ? "bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0"></span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                          {meta.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{meta.region}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-black text-slate-900 dark:text-sky-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {count} {count === 1 ? "visita" : "visitas"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Map Footer Info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span>Total España: <strong className="text-sky-600 dark:text-sky-400">{totalSpainVisits}</strong></span>
          <span>{spainCities.length} ciudades activas</span>
        </div>
      </div>
    </div>
  );
}
