"use client";

import { useState } from "react";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function SistemaReservasServicePage() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:30 AM");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const availableSlots = ["09:30 AM", "10:30 AM", "11:30 AM", "04:00 PM", "05:00 PM", "06:00 PM"];

  const features = [
    { num: "01", title: isEs ? "Agenda Automatizada 100%" : "100% Automated Calendar", desc: isEs ? "Olvídate de coordinar horarios manualmente. La plataforma bloquea automáticamente las horas ocupadas." : "Eliminate manual scheduling. The platform automatically blocks unavailable slots." },
    { num: "02", title: isEs ? "Recordatorios y Confirmaciones" : "Automated Email Confirmations", desc: isEs ? "Envía avisos automáticos por email a tus clientes para reducir la tasa de ausencias." : "Send automatic notification reminders to reduce no-shows and keep clients informed." },
    { num: "03", title: isEs ? "Sincronizado con Tu CRM" : "Instant CRM Sync", desc: isEs ? "Cada reserva queda guardada al instante en el panel de control de tu empresa." : "Every booked consultation streams directly into your operations dashboard." },
  ];

  const faqs = [
    { q: isEs ? "¿Se puede integrar con mi calendario existente (Google/Outlook)?" : "Can it integrate with existing Google or Outlook calendars?", a: isEs ? "Sí, el sistema se sincroniza bidireccionalmente para evitar duplicidades en su agenda." : "Yes, it supports two-way calendar sync to prevent double bookings." },
    { q: isEs ? "¿Puedo personalizar los campos del formulario de reserva?" : "Can I customize the booking form questions?", a: isEs ? "Totalmente. Puede solicitar nombre, email, teléfono, tipo de servicio o cualquier pregunta relevante." : "Absolutely. You can request phone numbers, service choices, or specific client questions." },
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
            <span className="text-slate-900 font-bold">{isEs ? "Sistema de Reservas" : "Booking System"}</span>
          </nav>

          {/* Hero Header */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              {isEs ? "Automatización de Agenda y Citas" : "Automated Appointment Scheduling"}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              {isEs ? "Sistema de Reservas y Contacto " : "Interactive Booking Platform "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                {isEs ? "Sin Complicaciones" : "Zero Friction"}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
              {isEs
                ? "Permite que tus clientes agenden citas comerciales, reuniones o llamadas directamente desde tu web en horarios disponibles, sin llamadas de ida y vuelta ni errores en la agenda."
                : "Allow prospects to schedule calls or consultations directly from your site in open time slots without back-and-forth emails."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isEs ? "Probar Agendador para Tu Empresa" : "Get Booking System"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Interactive Booking Slot Selector Mockup (Client-Side State Only) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-200">
                  {isEs ? "SIMULADOR DE RESERVA INTERACTIVO" : "INTERACTIVE BOOKING SIMULATOR"}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  {isEs ? "Selección de Citas en Tiempo Real" : "Real-Time Slot Selection"}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-200">
                📅 {isEs ? "Sincronización Inmediata" : "Instant Sync"}
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-6 text-white shadow-xl max-w-2xl mx-auto space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="font-bold text-sm">{isEs ? "Selecciona la Hora de la Cita" : "Select Appointment Time"}</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">● {isEs ? "Disponibilidad en Vivo" : "Live Available Slots"}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedTimeSlot(slot);
                      setBookingConfirmed(false);
                    }}
                    className={`py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                      selectedTimeSlot === slot
                        ? "bg-indigo-600 text-white border border-indigo-400 shadow-md scale-102"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">{isEs ? "Hora Seleccionada:" : "Selected Time:"}</span>
                  <span className="font-bold font-mono text-indigo-400 text-sm">{selectedTimeSlot}</span>
                </div>
                <button
                  onClick={() => setBookingConfirmed(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {isEs ? "Confirmar Reserva" : "Confirm Slot"}
                </button>
              </div>

              {bookingConfirmed && (
                <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-xl text-center text-xs text-emerald-300 animate-fade-in font-bold">
                  ✓ {isEs ? `¡Cita de prueba confirmada para las ${selectedTimeSlot}! Registrada en el CRM.` : `Test appointment confirmed for ${selectedTimeSlot}! Sent to CRM.`}
                </div>
              )}
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {features.map((f, idx) => (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl mb-6 font-mono">
                  {f.num}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQs Accordion */}
          <div className="max-w-3xl mx-auto mb-24 space-y-6">
            <h3 className="text-2xl font-black text-center text-slate-950">{isEs ? "Preguntas Frecuentes sobre el Agendador" : "Booking System FAQ"}</h3>
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
            <h3 className="text-3xl font-black mb-4">{isEs ? "¿Quieres Automatizar la Reserva de Citas en Tu Empresa?" : "Want to Automate Booking for Your Company?"}</h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              {isEs ? "Integramos el agendador en tu sitio web con sincronización completa a tu panel de control." : "We integrate interactive calendars into your platform with real-time CRM syncing."}
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              {isEs ? "Solicitar Sistema de Reservas" : "Get Booking System"}
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
