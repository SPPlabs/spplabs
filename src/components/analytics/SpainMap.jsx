"use client";

import { useState } from "react";

// Precise percentage coordinates (left %, top %) mapped onto españa.webp (1536x1024)
const CITY_LOOKUP = {
  "Madrid": { name: "Madrid", region: "Comunidad de Madrid", left: 44.0, top: 40.0 },
  "Barcelona": { name: "Barcelona", region: "Cataluña", left: 82.7, top: 25.9 },
  "Valencia": { name: "Valencia", region: "Comunitat Valenciana", left: 64.8, top: 46.4 },
  "Sevilla": { name: "Sevilla", region: "Andalucía", left: 29.0, top: 69.8 },
  "Zaragoza": { name: "Zaragoza", region: "Aragón", left: 63.2, top: 25.4 },
  "Málaga": { name: "Málaga", region: "Andalucía", left: 35.2, top: 77.1 },
  "Malaga": { name: "Málaga", region: "Andalucía", left: 35.2, top: 77.1 },
  "Murcia": { name: "Murcia", region: "Región de Murcia", left: 61.5, top: 62.0 },
  "Palma": { name: "Palma de Mallorca", region: "Islas Baleares", left: 85.9, top: 48.3 },
  "Palma de Mallorca": { name: "Palma de Mallorca", region: "Islas Baleares", left: 85.9, top: 48.3 },
  "Bilbao": { name: "Bilbao", region: "País Vasco", left: 52.7, top: 8.3 },
  "Alicante": { name: "Alicante", region: "Comunitat Valenciana", left: 65.4, top: 57.1 },
  "Vigo": { name: "Vigo", region: "Galicia", left: 17.6, top: 17.1 },
  "A Coruña": { name: "A Coruña", region: "Galicia", left: 19.5, top: 5.9 },
  "La Coruña": { name: "A Coruña", region: "Galicia", left: 19.5, top: 5.9 },
  "Coruña": { name: "A Coruña", region: "Galicia", left: 19.5, top: 5.9 },
  "Granada": { name: "Granada", region: "Andalucía", left: 40.7, top: 72.8 },
  "Córdoba": { name: "Córdoba", region: "Andalucía", left: 34.2, top: 65.0 },
  "Cordoba": { name: "Córdoba", region: "Andalucía", left: 34.2, top: 65.0 },
  "Valladolid": { name: "Valladolid", region: "Castilla y León", left: 39.1, top: 24.4 },
  "Oviedo": { name: "Oviedo", region: "Principado de Asturias", left: 36.5, top: 7.3 },
  "Gijón": { name: "Gijón", region: "Principado de Asturias", left: 37.0, top: 6.8 },
  "Gijon": { name: "Gijón", region: "Principado de Asturias", left: 37.0, top: 6.8 },
  "Santander": { name: "Santander", region: "Cantabria", left: 48.2, top: 7.3 },
  "San Sebastián": { name: "San Sebastián", region: "País Vasco", left: 56.0, top: 9.3 },
  "Donostia": { name: "San Sebastián", region: "País Vasco", left: 56.0, top: 9.3 },
  "Pamplona": { name: "Pamplona", region: "Comunidad Foral de Navarra", left: 57.6, top: 14.2 },
  "Toledo": { name: "Toledo", region: "Castilla-La Mancha", left: 42.3, top: 45.9 },
  "Salamanca": { name: "Salamanca", region: "Castilla y León", left: 33.5, top: 31.7 },
  "Burgos": { name: "Burgos", region: "Castilla y León", left: 46.5, top: 16.6 },
  "Cádiz": { name: "Cádiz", region: "Andalucía", left: 26.4, top: 80.6 },
  "Cadiz": { name: "Cádiz", region: "Andalucía", left: 26.4, top: 80.6 },
  "Badajoz": { name: "Badajoz", region: "Extremadura", left: 26.7, top: 52.2 },
  "Almería": { name: "Almería", region: "Andalucía", left: 48.5, top: 76.2 },
  "Almeria": { name: "Almería", region: "Andalucía", left: 48.5, top: 76.2 },
  "Girona": { name: "Girona", region: "Cataluña", left: 85.9, top: 18.6 },
  "Gerona": { name: "Girona", region: "Cataluña", left: 85.9, top: 18.6 },
  "Tarragona": { name: "Tarragona", region: "Cataluña", left: 76.2, top: 31.3 },
  "Castellón": { name: "Castellón de la Plana", region: "Comunitat Valenciana", left: 68.0, top: 39.1 },
  "Castellon": { name: "Castellón de la Plana", region: "Comunitat Valenciana", left: 68.0, top: 39.1 },
  "Albacete": { name: "Albacete", region: "Castilla-La Mancha", left: 54.7, top: 51.3 },
  "Logroño": { name: "Logroño", region: "La Rioja", left: 51.4, top: 16.6 },
  "Logrono": { name: "Logroño", region: "La Rioja", left: 51.4, top: 16.6 },
  "Huelva": { name: "Huelva", region: "Andalucía", left: 24.1, top: 72.3 },
  "Lleida": { name: "Lleida", region: "Cataluña", left: 71.9, top: 24.4 },
  "Lerida": { name: "Lleida", region: "Cataluña", left: 71.9, top: 24.4 },
  "Marbella": { name: "Marbella", region: "Andalucía", left: 32.9, top: 79.6 },
  "León": { name: "León", region: "Castilla y León", left: 33.5, top: 15.6 },
  "Leon": { name: "León", region: "Castilla y León", left: 33.5, top: 15.6 },
  "Jaén": { name: "Jaén", region: "Andalucía", left: 39.4, top: 65.9 },
  "Jaen": { name: "Jaén", region: "Andalucía", left: 39.4, top: 65.9 },
  "Ourense": { name: "Ourense", region: "Galicia", left: 22.5, top: 18.1 },
  "Orense": { name: "Ourense", region: "Galicia", left: 22.5, top: 18.1 },
  "Lugo": { name: "Lugo", region: "Galicia", left: 23.8, top: 11.2 },
  "Cáceres": { name: "Cáceres", region: "Extremadura", left: 30.3, top: 44.9 },
  "Caceres": { name: "Cáceres", region: "Extremadura", left: 30.3, top: 44.9 },
  "Las Palmas": { name: "Las Palmas de Gran Canaria", region: "Canarias", left: 14.0, top: 89.8 },
  "Las Palmas de Gran Canaria": { name: "Las Palmas de Gran Canaria", region: "Canarias", left: 14.0, top: 89.8 },
  "Santa Cruz de Tenerife": { name: "Santa Cruz de Tenerife", region: "Canarias", left: 11.4, top: 88.9 },
  "Tenerife": { name: "Santa Cruz de Tenerife", region: "Canarias", left: 11.4, top: 88.9 },
  "Ceuta": { name: "Ceuta", region: "Ceuta", left: 37.1, top: 90.3 },
  "Melilla": { name: "Melilla", region: "Melilla", left: 52.3, top: 93.8 },
};

function getCityMeta(rawCity) {
  if (!rawCity) return { name: "Desconocida", region: "España", left: 44.0, top: 40.0 };
  const trimmed = rawCity.trim();
  if (CITY_LOOKUP[trimmed]) return CITY_LOOKUP[trimmed];

  const key = Object.keys(CITY_LOOKUP).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (key) return CITY_LOOKUP[key];

  return { name: trimmed, region: "España", left: 44.0, top: 40.0 };
}

export default function SpainMap({ spainCities = [], lang = "es" }) {
  const [hoveredCity, setHoveredCity] = useState(null);

  const totalSpainVisits = spainCities.reduce((acc, c) => acc + Number(c.count || 0), 0);
  const maxCityCount = Math.max(...spainCities.map(c => Number(c.count || 0)), 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-8 w-full transition-colors relative z-10">
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
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 relative shadow-inner group">
          <img
            src="/espana.webp"
            alt="Mapa España"
            className="w-full h-auto object-contain rounded-xl opacity-90 transition-opacity duration-300 group-hover:opacity-100 block"
          />

          {/* Data Nodes Layer */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {spainCities.map((c, idx) => {
              const count = Number(c.count || 0);
              const meta = getCityMeta(c.city);
              const isHovered = hoveredCity?.city === c.city;
              const pct = totalSpainVisits > 0 ? ((count / totalSpainVisits) * 100).toFixed(1) : "0.0";

              const sizePx = 16 + Math.min(16, (count / maxCityCount) * 12);
              const isTopHalf = meta.top < 40;

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
                  className={`absolute pointer-events-auto cursor-pointer ${isHovered ? "z-50" : "z-20"}`}
                >
                  {/* Ping Ring */}
                  <span
                    style={{ width: `${sizePx * 2.2}px`, height: `${sizePx * 2.2}px` }}
                    className="absolute -inset-1/2 m-auto rounded-full bg-sky-400 opacity-40 animate-ping pointer-events-none"
                  ></span>

                  {/* Beacon Core */}
                  <div
                    style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
                    className={`relative rounded-full bg-sky-500 border-2 border-white shadow-xl flex items-center justify-center transition-all duration-200 ${
                      isHovered ? "scale-125 bg-sky-400 ring-4 ring-sky-400/50 shadow-2xl" : "hover:scale-110"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  </div>

                  {/* High Z-Index Hover Card */}
                  {isHovered && (
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-slate-900/95 border border-sky-400/60 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl animate-fade-in pointer-events-none ${
                        isTopHalf ? "top-full mt-2.5" : "bottom-full mb-2.5"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-black text-white">
                        <span>📍 {meta.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">{meta.region}</div>
                      <div className="text-[11px] font-mono text-sky-400 font-bold mt-0.5 flex items-center justify-between gap-3">
                        <span>{count} {count === 1 ? "visita" : "visitas"}</span>
                        <span className="text-slate-400 text-[10px]">({pct}%)</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {spainCities.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-sm shadow-md">
                  {lang === "es" ? "Sin accesos registrados en España aún" : "No visits recorded from Spain yet"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spain Cities Leaderboard Panel - Full Card Height Scrollable Area */}
      <div className="w-full lg:w-2/5 flex flex-col justify-between h-auto min-h-[380px]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === "es" ? "Top Ciudades en España (ClickHouse)" : "Top Spain Cities (ClickHouse)"}
            </h4>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">{spainCities.length} ciudades</span>
          </div>

          {spainCities.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs italic font-medium">
              {lang === "es" ? "No se registraron visitas en España." : "No visits recorded from Spain."}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
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
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isHovered
                        ? "bg-sky-50 dark:bg-sky-950/50 border-sky-400 dark:border-sky-700 shadow-md translate-x-1"
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
                      <span className="text-xs font-black text-slate-900 dark:text-sky-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {count} {count === 1 ? "visita" : "visitas"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spain Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-4">
          <span>Total España: <strong className="text-sky-600 dark:text-sky-400">{totalSpainVisits}</strong></span>
          <span>{spainCities.length} ciudades activas</span>
        </div>
      </div>
    </div>
  );
}
