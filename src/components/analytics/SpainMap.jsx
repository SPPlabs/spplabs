"use client";

import { useState } from "react";

// Accurate percentage coordinates (left %, top %) mapped onto españa.webp
const CITY_LOOKUP = {
  "Madrid": { name: "Madrid", region: "Comunidad de Madrid", left: 50.0, top: 45.0 },
  "Barcelona": { name: "Barcelona", region: "Cataluña", left: 79.5, top: 31.0 },
  "Valencia": { name: "Valencia", region: "Comunitat Valenciana", left: 65.5, top: 48.5 },
  "Sevilla": { name: "Sevilla", region: "Andalucía", left: 34.5, top: 72.5 },
  "Zaragoza": { name: "Zaragoza", region: "Aragón", left: 63.5, top: 30.5 },
  "Málaga": { name: "Málaga", region: "Andalucía", left: 41.5, top: 79.5 },
  "Malaga": { name: "Málaga", region: "Andalucía", left: 41.5, top: 79.5 },
  "Murcia": { name: "Murcia", region: "Región de Murcia", left: 61.5, top: 63.5 },
  "Palma": { name: "Palma de Mallorca", region: "Islas Baleares", left: 85.5, top: 50.0 },
  "Palma de Mallorca": { name: "Palma de Mallorca", region: "Islas Baleares", left: 85.5, top: 50.0 },
  "Bilbao": { name: "Bilbao", region: "País Vasco", left: 53.5, top: 13.5 },
  "Alicante": { name: "Alicante", region: "Comunitat Valenciana", left: 65.0, top: 59.5 },
  "Vigo": { name: "Vigo", region: "Galicia", left: 19.5, top: 20.0 },
  "A Coruña": { name: "A Coruña", region: "Galicia", left: 21.0, top: 8.5 },
  "La Coruña": { name: "A Coruña", region: "Galicia", left: 21.0, top: 8.5 },
  "Coruña": { name: "A Coruña", region: "Galicia", left: 21.0, top: 8.5 },
  "Granada": { name: "Granada", region: "Andalucía", left: 47.0, top: 75.0 },
  "Córdoba": { name: "Córdoba", region: "Andalucía", left: 40.5, top: 68.0 },
  "Cordoba": { name: "Córdoba", region: "Andalucía", left: 40.5, top: 68.0 },
  "Valladolid": { name: "Valladolid", region: "Castilla y León", left: 42.5, top: 29.5 },
  "Oviedo": { name: "Oviedo", region: "Principado de Asturias", left: 36.5, top: 10.5 },
  "Gijón": { name: "Gijón", region: "Principado de Asturias", left: 37.0, top: 9.5 },
  "Gijon": { name: "Gijón", region: "Principado de Asturias", left: 37.0, top: 9.5 },
  "Santander": { name: "Santander", region: "Cantabria", left: 47.5, top: 10.0 },
  "San Sebastián": { name: "San Sebastián", region: "País Vasco", left: 57.5, top: 14.0 },
  "Donostia": { name: "San Sebastián", region: "País Vasco", left: 57.5, top: 14.0 },
  "Pamplona": { name: "Pamplona", region: "Comunidad Foral de Navarra", left: 59.5, top: 18.5 },
  "Toledo": { name: "Toledo", region: "Castilla-La Mancha", left: 47.0, top: 50.5 },
  "Salamanca": { name: "Salamanca", region: "Castilla y León", left: 36.5, top: 36.5 },
  "Burgos": { name: "Burgos", region: "Castilla y León", left: 49.5, top: 21.5 },
  "Cádiz": { name: "Cádiz", region: "Andalucía", left: 31.0, top: 82.5 },
  "Cadiz": { name: "Cádiz", region: "Andalucía", left: 31.0, top: 82.5 },
  "Badajoz": { name: "Badajoz", region: "Extremadura", left: 30.5, top: 56.5 },
  "Almería": { name: "Almería", region: "Andalucía", left: 53.5, top: 78.5 },
  "Almeria": { name: "Almería", region: "Andalucía", left: 53.5, top: 78.5 },
  "Girona": { name: "Girona", region: "Cataluña", left: 83.5, top: 23.5 },
  "Gerona": { name: "Girona", region: "Cataluña", left: 83.5, top: 23.5 },
  "Tarragona": { name: "Tarragona", region: "Cataluña", left: 74.0, top: 34.5 },
  "Castellón": { name: "Castellón de la Plana", region: "Comunitat Valenciana", left: 67.5, top: 42.5 },
  "Castellon": { name: "Castellón de la Plana", region: "Comunitat Valenciana", left: 67.5, top: 42.5 },
  "Albacete": { name: "Albacete", region: "Castilla-La Mancha", left: 57.5, top: 55.5 },
  "Logroño": { name: "Logroño", region: "La Rioja", left: 54.0, top: 21.0 },
  "Logrono": { name: "Logroño", region: "La Rioja", left: 54.0, top: 21.0 },
  "Huelva": { name: "Huelva", region: "Andalucía", left: 28.5, top: 74.5 },
  "Lleida": { name: "Lleida", region: "Cataluña", left: 71.5, top: 27.5 },
  "Lerida": { name: "Lleida", region: "Cataluña", left: 71.5, top: 27.5 },
  "Marbella": { name: "Marbella", region: "Andalucía", left: 39.5, top: 81.5 },
  "León": { name: "León", region: "Castilla y León", left: 36.0, top: 18.5 },
  "Leon": { name: "León", region: "Castilla y León", left: 36.0, top: 18.5 },
  "Jaén": { name: "Jaén", region: "Andalucía", left: 46.0, top: 69.5 },
  "Jaen": { name: "Jaén", region: "Andalucía", left: 46.0, top: 69.5 },
  "Ourense": { name: "Ourense", region: "Galicia", left: 25.0, top: 21.5 },
  "Orense": { name: "Ourense", region: "Galicia", left: 25.0, top: 21.5 },
  "Lugo": { name: "Lugo", region: "Galicia", left: 26.5, top: 13.5 },
  "Cáceres": { name: "Cáceres", region: "Extremadura", left: 33.5, top: 49.5 },
  "Caceres": { name: "Cáceres", region: "Extremadura", left: 33.5, top: 49.5 },
  "Las Palmas": { name: "Las Palmas de Gran Canaria", region: "Canarias", left: 14.5, top: 91.0 },
  "Las Palmas de Gran Canaria": { name: "Las Palmas de Gran Canaria", region: "Canarias", left: 14.5, top: 91.0 },
  "Santa Cruz de Tenerife": { name: "Santa Cruz de Tenerife", region: "Canarias", left: 11.5, top: 90.0 },
  "Tenerife": { name: "Santa Cruz de Tenerife", region: "Canarias", left: 11.5, top: 90.0 },
  "Ceuta": { name: "Ceuta", region: "Ceuta", left: 37.1, top: 90.7 },
  "Melilla": { name: "Melilla", region: "Melilla", left: 52.3, top: 94.0 },
};

function getCityMeta(rawCity) {
  if (!rawCity) return { name: "Desconocida", region: "España", left: 50.0, top: 45.0 };
  const trimmed = rawCity.trim();
  if (CITY_LOOKUP[trimmed]) return CITY_LOOKUP[trimmed];

  const key = Object.keys(CITY_LOOKUP).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (key) return CITY_LOOKUP[key];

  return { name: trimmed, region: "España", left: 50.0, top: 45.0 };
}

export default function SpainMap({ spainCities = [], lang = "es" }) {
  const [hoveredCity, setHoveredCity] = useState(null);

  const totalSpainVisits = spainCities.reduce((acc, c) => acc + Number(c.count || 0), 0);
  const maxCityCount = Math.max(...spainCities.map(c => Number(c.count || 0)), 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-8 w-full transition-colors">
      {/* Map Container */}
      <div className="w-full lg:w-3/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
              {lang === "es" ? "Mapa de Ciudades en España" : "Spain City Visitor Map"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "es" ? "Geolocalización ClickHouse en mapa oficial" : "ClickHouse geolocation overlay"}
            </p>
          </div>
          <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs px-3 py-1.5 rounded-xl font-bold border border-sky-200 dark:border-sky-800 font-mono">
            🇪🇸 NODO ESPAÑA
          </span>
        </div>

        {/* Real Spain Image Box with Overlay */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 relative overflow-hidden shadow-inner group">
          <img
            src="/espana.webp"
            alt="Mapa España"
            className="w-full h-auto object-contain rounded-xl opacity-90 transition-opacity duration-300 group-hover:opacity-100"
          />

          {/* Data Nodes Layer */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {spainCities.map((c, idx) => {
              const count = Number(c.count || 0);
              const meta = getCityMeta(c.city);
              const isHovered = hoveredCity?.city === c.city;
              const pct = totalSpainVisits > 0 ? ((count / totalSpainVisits) * 100).toFixed(1) : "0.0";

              const sizePx = 14 + Math.min(18, (count / maxCityCount) * 14);

              return (
                <div
                  key={idx}
                  style={{
                    left: `${meta.left}%`,
                    top: `${meta.top}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseEnter={() => setHoveredCity({ ...c, meta, pct })}
                  onMouseLeave={() => setHoveredCity(null)}
                  className="absolute pointer-events-auto cursor-pointer group/node"
                >
                  {/* Ping Animation Ring */}
                  <span
                    style={{ width: `${sizePx * 2.2}px`, height: `${sizePx * 2.2}px` }}
                    className="absolute -inset-1/2 m-auto rounded-full bg-sky-400 opacity-40 animate-ping"
                  ></span>

                  {/* Beacon Core */}
                  <div
                    style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
                    className={`relative rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 ${
                      isHovered ? "scale-125 bg-sky-400 ring-4 ring-sky-400/40 z-30" : "hover:scale-110"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  </div>

                  {/* Hover Tooltip Card */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 whitespace-nowrap bg-slate-900/95 border border-sky-400/50 backdrop-blur-md px-3 py-2 rounded-xl shadow-2xl animate-fade-in pointer-events-none">
                      <div className="flex items-center gap-1.5 text-xs font-black text-white">
                        <span>📍 {meta.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">{meta.region}</div>
                      <div className="text-[11px] font-mono text-sky-400 font-bold mt-0.5">
                        {count} {count === 1 ? "visita" : "visitas"} ({pct}%)
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {spainCities.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-slate-900/80 border border-slate-700 text-slate-400 text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-sm">
                  {lang === "es" ? "Sin accesos registrados en España aún" : "No visits recorded from Spain yet"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spain Cities Leaderboard Panel */}
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

        {/* Spain Legend */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span>Total España: <strong className="text-sky-600 dark:text-sky-400">{totalSpainVisits}</strong></span>
          <span>{spainCities.length} ciudades activas</span>
        </div>
      </div>
    </div>
  );
}
