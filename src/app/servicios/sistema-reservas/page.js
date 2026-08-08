"use client";

import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function SistemaReservasServicePage() {
  const { lang } = useLanguage();

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
            <span className="text-slate-900 font-bold">Sistema de Reservas y Contacto</span>
          </nav>

          {/* Hero Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-black uppercase tracking-wider font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              Automatización de Agenda y Citas
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              Sistema de Reservas y Contacto <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Sin Complicaciones</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
              Permite que tus clientes agenden citas comerciales, reuniones o llamadas directamente desde tu web en horarios disponibles, sin llamadas de ida y vuelta ni errores en la agenda.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                Probar Agendador para Tu Empresa
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Booking System Showcase Mockup for tuempresa.es */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-200">
                  CALENDARIO DE REUNIONES INTERACTIVO
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Gestión de Citas para tuempresa.es
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-200">
                📅 24 Citas Confirmadas Este Mes
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl max-w-2xl mx-auto space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="font-bold text-sm">Selecciona Fecha y Hora</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">● Horarios Disponibles en Tiempo Real</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-2">
                {["09:30 AM", "10:30 AM", "11:30 AM", "04:00 PM", "05:00 PM", "06:00 PM"].map((slot, idx) => (
                  <button
                    key={idx}
                    className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
                      idx === 1
                        ? "bg-indigo-600 text-white border border-indigo-400 shadow-md"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl mb-6">01</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Agenda Automatizada 100%</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Olvídate de coordinar horarios manualmente. La plataforma bloquea automáticamente las horas ocupadas.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl mb-6">02</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Recordatorios y Confirmaciones</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Envía avisos automáticos por email y notificación a tus clientes para reducir la tasa de ausencias.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mb-6">03</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Integrado en Tu CRM</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Cada reserva queda guardada al instante en el panel de control de tu empresa con todos los datos del cliente.
              </p>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
            <h3 className="text-3xl font-black mb-4">¿Quieres Automatizar la Reserva de Citas en Tu Empresa?</h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Integramos el agendador en tu sitio web con sincronización completa a tu panel de control.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              Solicitar Sistema de Reservas
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
