"use client";

import { useState } from "react";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function CrmDashboardServicePage() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  // Simulated high-volume dashboard metrics for tuempresa.es
  const mockMetrics = {
    domain: "tuempresa.es",
    companyName: "Tu Empresa",
    impressions: "12,450",
    visitors: "1,840",
    sessions: "2,420",
    avgDuration: "3m 45s",
    bounceRate: "24%",
    activeNow: "14",
    confirmedBookings: 24,
    pendingBookings: 5,
    newMessages: 18,
    aiConversations: 42,
  };

  return (
    <MainLayout activePage="servicios">
      <div className="bg-slate-50 min-h-screen py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 font-mono">
            <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/servicios" className="hover:text-blue-600 transition-colors">Servicios</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">CRM y Panel de Control</span>
          </nav>

          {/* Hero Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black uppercase tracking-wider font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              Plataforma Todo-En-Uno de Gestión
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              El Panel de Control y CRM que <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Multiplica las Ventas</span> de tu Empresa
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
              Centraliza métricas en tiempo real, formularios de clientes, reservas automáticas y la base de conocimiento de tu Inteligencia Artificial en una sola plataforma privada y ultrarrápida.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                Solicitar Demostración Gratuita
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href="#demo-interactiva"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-extrabold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Ver Demostración en Vivo
              </a>
            </div>
          </div>

          {/* Interactive Live Mockup Showcase (Branded for tuempresa.es) */}
          <div id="demo-interactiva" className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-8 shadow-2xl mb-24 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200">
                  DEMOSTRACIÓN INTERACTIVA DEL CRM
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Vista Previa del Panel Operativo de {mockMetrics.companyName}
                </h2>
              </div>

              {/* Mockup Tabs (Resumen, Analíticas, Clientes, IA, Notificaciones) - NO USUARIOS */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto max-w-full">
                {[
                  { id: "overview", label: "Resumen" },
                  { id: "analytics", label: "Analíticas" },
                  { id: "clientes", label: "Clientes & Citas" },
                  { id: "ia", label: "Asistente IA" },
                  { id: "notificaciones", label: "Centro de Alertas" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === t.id
                        ? "bg-slate-900 text-white shadow-md"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT 1: RESUMEN */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in">
                {/* Header Badge Card */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                  <div>
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider border border-blue-400/30">
                      {mockMetrics.domain}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black mt-3">Panel de Operaciones de {mockMetrics.companyName}</h3>
                    <p className="text-slate-400 text-sm mt-1">Control integral de leads, reservas y analíticas en tiempo real</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-center min-w-[120px]">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Contactos</span>
                      <span className="text-3xl font-black font-mono text-blue-400">{mockMetrics.newMessages}</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-center min-w-[120px]">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Citas Reservadas</span>
                      <span className="text-3xl font-black font-mono text-emerald-400">{mockMetrics.confirmedBookings}</span>
                    </div>
                  </div>
                </div>

                {/* Key Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Impresiones Totales</span>
                    <span className="text-3xl font-black font-mono text-slate-900 block">{mockMetrics.impressions}</span>
                    <span className="text-xs font-bold text-emerald-600 mt-2 inline-block">↑ +48.5% este mes</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Visitantes Únicos</span>
                    <span className="text-3xl font-black font-mono text-slate-900 block">{mockMetrics.visitors}</span>
                    <span className="text-xs font-bold text-emerald-600 mt-2 inline-block">↑ +32.1% este mes</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Conversiones de IA</span>
                    <span className="text-3xl font-black font-mono text-blue-600 block">{mockMetrics.aiConversations}</span>
                    <span className="text-xs font-bold text-blue-600 mt-2 inline-block">100% automatizadas</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Tasa de Conversión</span>
                    <span className="text-3xl font-black font-mono text-emerald-600 block">4.8%</span>
                    <span className="text-xs font-bold text-slate-500 mt-2 inline-block">Superior a la media</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: ANALÍTICAS */}
            {activeTab === "analytics" && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">MOTOR ANALÍTICO</span>
                      <h3 className="text-xl font-extrabold mt-1">Tráfico en Tiempo Real en {mockMetrics.domain}</h3>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-mono font-bold border border-emerald-400/30">
                      ● {mockMetrics.activeNow} usuarios activos ahora
                    </span>
                  </div>

                  {/* World & Spain Map Overlay Representation */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden min-h-[220px] flex items-center justify-center">
                    <img src="/espana.webp" alt="Mapa España" className="max-h-[200px] opacity-80 object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-slate-950/90 border border-blue-400/50 p-4 rounded-2xl backdrop-blur-md text-center shadow-xl">
                        <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Geolocalización en Tiempo Real</span>
                        <span className="text-base font-black text-white block mt-1">Tráfico distribuido por Madrid, Barcelona, Valencia, Sevilla y Bilbao</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: CLIENTES & CITAS */}
            {activeTab === "clientes" && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Messages list */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Mensajes de Contacto ({mockMetrics.newMessages})</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Laura Gómez", email: "laura@ejemplo.es", service: "Presupuesto Web", msg: "Hola, queremos solicitar propuesta para rediseñar nuestra plataforma comercial." },
                        { name: "Carlos Mendoza", email: "carlos@empresa.com", service: "Integración CRM", msg: "Necesitamos conectar nuestros formularios de captura con el panel de administración." },
                        { name: "Elena Ramos", email: "elena@tech.es", service: "Chatbot IA", msg: "Queremos entrenar un chatbot con nuestro catálogo de productos." },
                      ].map((m, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">{m.service}</span>
                          </div>
                          <span className="text-xs text-blue-600 font-mono block mb-2">{m.email}</span>
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 italic">"{m.msg}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking scheduler list */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Calendario de Reservas (24 Confirmadas)</h3>
                    <div className="space-y-3">
                      {[
                        { time: "09:30 AM", name: "David Soria", status: "CONFIRMADA", type: "Demo de Plataforma" },
                        { time: "11:00 AM", name: "María Prieto", status: "CONFIRMADA", type: "Consultoría Técnica" },
                        { time: "04:30 PM", name: "Javier Ruiz", status: "PENDIENTE", type: "Revisión de Requisitos" },
                      ].map((b, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-500 block">{b.time}</span>
                            <span className="font-bold text-slate-900 text-sm block">{b.name}</span>
                            <span className="text-[11px] text-slate-500">{b.type}</span>
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                            b.status === "CONFIRMADA" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: ASISTENTE IA */}
            {activeTab === "ia" && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
                  <h3 className="text-xl font-black text-slate-900 mb-2">Configuración del Asistente de IA de Tu Empresa</h3>
                  <p className="text-xs text-slate-500 mb-6">Base de conocimiento utilizada para responder a visitantes 24 horas al día.</p>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-700 leading-relaxed max-h-[160px] overflow-y-auto mb-4">
                    Tu Empresa - Información del Negocio<br />
                    ¿Quiénes somos?<br />
                    Somos una empresa especializada en soluciones de desarrollo web premium, inteligencia artificial aplicada y sistemas de gestión para empresas. Nuestro objetivo es ayudar a negocios a captar clientes y automatizar procesos.<br /><br />
                    Servicios principales:<br />
                    - Desarrollo Web de alto rendimiento<br />
                    - Integración de CRM y agendador de reservas<br />
                    - Asistentes de IA entrenados a medida<br />
                    Horario de atención: Lunes a Viernes de 09:00 a 19:00.
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all">
                      ✓ Guardar Información de IA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: CENTRO DE ALERTAS */}
            {activeTab === "notificaciones" && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                  <h3 className="text-lg font-black text-slate-900 mb-4">Centro de Alertas y Novedades</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                      <span className="text-xs font-bold text-amber-800 uppercase block mb-1">Citas Pendientes</span>
                      <span className="text-base font-black text-amber-950">5 por confirmar</span>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                      <span className="text-xs font-bold text-blue-800 uppercase block mb-1">Mensajes Nuevos</span>
                      <span className="text-base font-black text-blue-950">18 en la bandeja</span>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                      <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Estado del Sistema</span>
                      <span className="text-base font-black text-emerald-950">100% Operativo</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Module Explanations & Business Value Breakdown */}
          <div className="space-y-16 mb-24">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full inline-block mb-3">
                ARQUITECTURA DE MÓDULOS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
                ¿Cómo Ayuda el CRM a la Operación de tu Empresa?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Module 1 */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl mb-6 border border-blue-100">
                  01
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Analíticas de Tráfico en Tiempo Real</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Conoce exactamente de dónde proceden tus visitantes, qué páginas convierten mejor y qué ciudades o países generan mayores ingresos. Toma decisiones basadas en datos reales y no en suposiciones.
                </p>
              </div>

              {/* Module 2 */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mb-6 border border-emerald-100">
                  02
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Gestión de Clientes y Leads</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Todos los mensajes de tus formularios de contacto se organizan automáticamente con nombres, correos y números de teléfono. Responde al instante y evita que ningún cliente potencial se pierda.
                </p>
              </div>

              {/* Module 3 */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl mb-6 border border-indigo-100">
                  03
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Calendario Interactivo de Reservas</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Tus clientes agendan reuniones directamente en horas disponibles sin duplicar citas. Confirma o rechaza reservas con un solo clic y recibe notificaciones en tiempo real.
                </p>
              </div>

              {/* Module 4 */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xl mb-6 border border-purple-100">
                  04
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Entrenador de IA 24/7</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Actualiza la base de información de tu asistente de Inteligencia Artificial en cualquier momento. Modifica precios, horarios o respuestas frecuentes y tu IA empezará a usarlos de inmediato.
                </p>
              </div>

              {/* Module 5 */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl mb-6 border border-amber-100">
                  05
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Centro de Alertas Operativas</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Recibe avisos inmediatos de peticiones pendientes, nuevas citas por confirmar o consultas sin atender para mantener un nivel de servicio excepcional con tus clientes.
                </p>
              </div>

              {/* Module 6 */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl mb-6 border border-teal-100">
                  06
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Seguridad y Privacidad Garantizada</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Tu base de datos se mantiene en un entorno seguro y aislado, cumpliendo con la normativa de protección de datos (RGPD) para garantizar la total privacidad de tu negocio.
                </p>
              </div>
            </div>
          </div>

          {/* High Conversion CTA Section */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
                ¿Preparado para Implementar el CRM en Tu Empresa?
              </h3>
              <p className="text-slate-300 text-base sm:text-lg">
                Diseñamos e integramos la plataforma a medida de las necesidades operativas de tu negocio. Solicita una demostración guiada hoy mismo.
              </p>
              <div>
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center px-9 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                >
                  Solicitar Demostración Ahora
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
