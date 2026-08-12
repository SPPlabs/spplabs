"use client";

import { useState } from "react";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function CrmDashboardServicePage() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  const [activeTab, setActiveTab] = useState("overview");
  const [openFaq, setOpenFaq] = useState(null);

  // Simulated metrics for demo presentation
  const mockMetrics = {
    domain: "tuempresa.es",
    companyName: isEs ? "Tu Empresa" : "Your Business",
    impressions: "14,820",
    visitors: "2,140",
    sessions: "2,980",
    activeNow: "18",
    confirmedBookings: 28,
    pendingBookings: 4,
    newMessages: 22,
    aiConversations: 56,
  };

  const modules = [
    { num: "01", title: isEs ? "Analíticas de Tráfico en Tiempo Real" : "Real-Time Traffic Analytics", desc: isEs ? "Conozca de dónde proceden sus visitantes y qué páginas generan mayor tasa de conversión." : "Monitor visitor locations, active live sessions, and conversion channels in real time." },
    { num: "02", title: isEs ? "Gestión Centralizada de Contactos" : "Lead & Contact Pipeline", desc: isEs ? "Formularios de contacto organizados por fecha, tipo de servicio y estado de respuesta." : "All contact form submissions organized with clear status, contact details, and dates." },
    { num: "03", title: isEs ? "Calendario Interactivo de Citas" : "Appointment Scheduler", desc: isEs ? "Citas de clientes organizadas por hora con opciones de confirmación y cancelación." : "Customer bookings scheduled by time slot with instant status management." },
    { num: "04", title: isEs ? "Entrenador de IA 24/7" : "AI Knowledge Base Trainer", desc: isEs ? "Modifique la base de datos de su chatbot en tiempo real sin tocar código." : "Update your AI chatbot knowledge base in real time without writing any code." },
  ];

  const faqs = [
    { q: isEs ? "¿Es complicado aprender a usar el panel de control?" : "Is the operations panel easy to use?", a: isEs ? "No, la interfaz está diseñada de forma muy intuitiva para que cualquier miembro de su equipo pueda gestionar leads y citas sin conocimientos técnicos." : "Not at all. The interface is engineered to be intuitive so any team member can manage leads and appointments effortlessly." },
    { q: isEs ? "¿Cumple con la normativa de privacidad RGPD?" : "Does it comply with GDPR privacy regulations?", a: isEs ? "Sí, los datos se almacenan de forma segura con cifrado Argon2id y cumplimiento estricto del RGPD europeo." : "Yes, data is encrypted and securely stored following European GDPR standards." },
    { q: isEs ? "¿Puedo exportar los datos de mis clientes?" : "Can I export customer data?", a: isEs ? "Sí, el panel permite descargar reportes de contactos y citas en cualquier momento." : "Yes, customer leads and booking reports can be exported anytime." },
  ];

  return (
    <MainLayout activePage="servicios">
      <div className="bg-slate-50 min-h-screen py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 font-mono">
            <Link href="/" className="hover:text-blue-600 transition-colors">{isEs ? "Inicio" : "Home"}</Link>
            <span>/</span>
            <Link href="/servicios" className="hover:text-blue-600 transition-colors">{isEs ? "Servicios" : "Services"}</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">{isEs ? "CRM y Panel de Control" : "CRM & Operations"}</span>
          </nav>

          {/* Hero Header */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              {isEs ? "Plataforma Todo-En-Uno de Gestión" : "All-in-One Operations Platform"}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              {isEs ? "El Panel de Control y CRM que " : "The Operations CRM Built to "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {isEs ? "Multiplica las Ventas" : "Scale Business Operations"}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
              {isEs
                ? "Centraliza métricas en tiempo real, formularios de clientes, reservas automáticas y la base de conocimiento de tu Inteligencia Artificial en una sola plataforma privada y ultrarrápida."
                : "Centralize traffic metrics, customer intake forms, automated appointments, and AI knowledge base management in one secure platform."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isEs ? "Solicitar Demostración Gratuita" : "Request Free Demo"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Interactive Live CRM Showcase (Client-Side Simulated Tabs) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-8 shadow-2xl mb-24 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200">
                  {isEs ? "DEMOSTRACIÓN INTERACTIVA DEL CRM" : "INTERACTIVE CRM DEMO"}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  {isEs ? `Vista Previa del Panel Operativo de ${mockMetrics.companyName}` : `Operations Control Panel Preview`}
                </h2>
              </div>

              {/* Tabs selector */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto max-w-full">
                {[
                  { id: "overview", label: isEs ? "Resumen" : "Overview" },
                  { id: "analytics", label: isEs ? "Analíticas" : "Analytics" },
                  { id: "clientes", label: isEs ? "Clientes & Citas" : "Leads & Bookings" },
                  { id: "ia", label: isEs ? "Asistente IA" : "AI Knowledge" },
                  { id: "notificaciones", label: isEs ? "Alertas" : "Alerts" },
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

            {/* TAB 1: RESUMEN */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                  <div>
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full font-mono font-bold border border-blue-400/30">
                      {mockMetrics.domain}
                    </span>
                    <h3 className="text-2xl font-black mt-2">{isEs ? `Panel Principal de ${mockMetrics.companyName}` : "Operations Dashboard"}</h3>
                    <p className="text-slate-400 text-xs mt-1">{isEs ? "Métricas generales y estado operativo en tiempo real" : "Live operational metrics and lead state"}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-center min-w-[110px]">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">{isEs ? "Mensajes" : "Leads"}</span>
                      <span className="text-2xl font-black font-mono text-blue-400">{mockMetrics.newMessages}</span>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-center min-w-[110px]">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">{isEs ? "Citas" : "Bookings"}</span>
                      <span className="text-2xl font-black font-mono text-emerald-400">{mockMetrics.confirmedBookings}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">{isEs ? "Impresiones" : "Impressions"}</span>
                    <span className="text-2xl font-black font-mono text-slate-900">{mockMetrics.impressions}</span>
                    <span className="text-xs font-bold text-emerald-600 mt-1 block">↑ +42% este mes</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">{isEs ? "Visitantes Únicos" : "Unique Visitors"}</span>
                    <span className="text-2xl font-black font-mono text-slate-900">{mockMetrics.visitors}</span>
                    <span className="text-xs font-bold text-emerald-600 mt-1 block">↑ +28% este mes</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">{isEs ? "Chats de IA" : "AI Chats"}</span>
                    <span className="text-2xl font-black font-mono text-blue-600">{mockMetrics.aiConversations}</span>
                    <span className="text-xs font-bold text-blue-600 mt-1 block">100% automatizados</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">{isEs ? "Tasa Conversión" : "Conversion Rate"}</span>
                    <span className="text-2xl font-black font-mono text-emerald-600">5.2%</span>
                    <span className="text-xs font-bold text-slate-500 mt-1 block">Alta eficiencia</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ANALÍTICAS */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-400 uppercase">{isEs ? "MONITOR EN TIEMPO REAL" : "LIVE MONITOR"}</span>
                      <h3 className="text-lg font-bold mt-0.5">{isEs ? "Geolocalización de Tráfico" : "Traffic Geo-Distribution"}</h3>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-mono font-bold border border-emerald-400/30">
                      ● {mockMetrics.activeNow} {isEs ? "activos ahora" : "live active"}
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
                    <img src="/espana.webp" alt="Mapa España" className="max-h-[160px] mx-auto opacity-80 object-contain mb-3" />
                    <p className="text-xs text-slate-300 font-mono">{isEs ? "Tráfico procedente de Madrid, Barcelona, Valencia, Sevilla y Bilbao." : "Active visitor stream from major regions."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CLIENTES */}
            {activeTab === "clientes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">{isEs ? "Bandeja de Contactos" : "Lead Inbox"}</h3>
                  <div className="space-y-2.5">
                    {[
                      { name: "Laura Gómez", email: "laura@ejemplo.es", service: "Presupuesto Web" },
                      { name: "Carlos Mendoza", email: "carlos@empresa.com", service: "Integración CRM" },
                    ].map((c, i) => (
                      <div key={i} className="bg-white border border-slate-200 p-3 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">{c.service}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block mt-1">{c.email}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">{isEs ? "Próximas Citas" : "Upcoming Bookings"}</h3>
                  <div className="space-y-2.5">
                    {[
                      { time: "09:30 AM", name: "David Soria", status: isEs ? "CONFIRMADA" : "CONFIRMED" },
                      { time: "11:30 AM", name: "Elena Ramos", status: isEs ? "PENDIENTE" : "PENDING" },
                    ].map((b, i) => (
                      <div key={i} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block">{b.time}</span>
                          <span className="font-bold text-slate-900 text-xs">{b.name}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ASISTENTE IA */}
            {activeTab === "ia" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-2">{isEs ? "Entrenador de Base de Conocimiento IA" : "AI Knowledge Trainer"}</h3>
                <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-700 mb-3 leading-relaxed">
                  Tu Empresa - Catálogo y Respuestas<br />
                  - Horarios: Lunes a Viernes de 09:00 a 19:00.<br />
                  - Servicios: Desarrollo Web, CRM y Chatbot de IA.<br />
                  - Garantía: Soporte prioritario 24/7.
                </div>
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer">
                    {isEs ? "✓ Guardar Conocimiento" : "✓ Save Knowledge Base"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: ALERTAS */}
            {activeTab === "notificaciones" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block">{isEs ? "Citas Pendientes" : "Pending Slots"}</span>
                  <span className="text-xl font-black text-amber-950">4 {isEs ? "por revisar" : "need review"}</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-blue-800 uppercase block">{isEs ? "Nuevos Leads" : "New Leads"}</span>
                  <span className="text-xl font-black text-blue-950">22 {isEs ? "recibidos" : "received"}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">{isEs ? "Estado Sistema" : "System Status"}</span>
                  <span className="text-xl font-black text-emerald-950">100% {isEs ? "Operativo" : "Operational"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Module Breakdown Grid */}
          <div className="mb-24 space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full inline-block mb-3">
                {isEs ? "ARQUITECTURA DE MÓDULOS" : "MODULE ARCHITECTURE"}
              </span>
              <h2 className="text-3xl font-black text-slate-950">{isEs ? "¿Qué Incluye el Panel Operativo?" : "Key Operational Modules"}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((m, idx) => (
                <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 font-mono">
                    {m.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{m.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="max-w-3xl mx-auto mb-24 space-y-6">
            <h3 className="text-2xl font-black text-center text-slate-950">{isEs ? "Preguntas Frecuentes sobre el CRM" : "CRM & Panel FAQ"}</h3>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
                    <span className="text-slate-400 font-bold">{openFaq === idx ? "−" : "+"}</span>
                  </div>
                  {openFaq === idx && (
                    <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Footer */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
            <h3 className="text-3xl font-black mb-4">{isEs ? "¿Preparado para Implementar el CRM en Tu Empresa?" : "Ready to Deploy Your Operations CRM?"}</h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              {isEs ? "Diseñamos e integramos la plataforma a medida de las necesidades operativas de tu negocio." : "We engineer and integrate custom operation platforms tailored to your business needs."}
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              {isEs ? "Solicitar Demostración Guiada" : "Schedule Live Guided Demo"}
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
