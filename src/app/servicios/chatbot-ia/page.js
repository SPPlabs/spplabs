"use client";

import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function ChatbotIaServicePage() {
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
            <span className="text-slate-900 font-bold">Chatbot de IA 24/7</span>
          </nav>

          {/* Hero Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-black uppercase tracking-wider font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              Atención Comercial Automatizada 24/7
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              Chatbot de IA 24/7 Entrenado para <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Vender y Atender</span> tus Clientes
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
              Implementa un asistente de Inteligencia Artificial que responde preguntas sobre tu empresa, soluciona dudas comerciales al instante y ayuda a cerrar ventas incluso cuando tu equipo está descansando.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                Probar Chatbot para Tu Empresa
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Chatbot Showcase Mockup for tuempresa.es */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                  INTERFAZ DE CHAT EN TIEMPO REAL
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Asistente Virtual en Vivo para tuempresa.es
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                🟢 IA Activa • 42 Chats Atendidos Hoy
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-4 max-w-xl mx-auto">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                  IA
                </div>
                <div>
                  <span className="font-bold text-sm block">Asistente de Tu Empresa</span>
                  <span className="text-[10px] text-emerald-400 font-mono">En línea las 24 horas</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-800 text-slate-200 p-3 rounded-xl max-w-[85%]">
                  👋 ¡Hola! Soy el asistente virtual de Tu Empresa. ¿En qué puedo ayudarte hoy?
                </div>
                <div className="bg-emerald-600 text-white p-3 rounded-xl max-w-[85%] ml-auto text-right">
                  ¿Cuáles son vuestros servicios y cómo puedo agendar una consulta?
                </div>
                <div className="bg-slate-800 text-slate-200 p-3 rounded-xl max-w-[85%]">
                  Ofrecemos desarrollo web, integración de CRM y soluciones digitales a medida. Puedes agendar una cita directamente en nuestro calendario o dejar tu teléfono.
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mb-6">01</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Respuesta Instantánea sin Demoras</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tus clientes reciben información precisa en menos de 2 segundos sin tener que esperar a que se abra la oficina.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl mb-6">02</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Entrenado con Tus Propios Datos</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Cargamos tus catálogos, listas de precios, horarios y FAQs para que la IA responda de forma completamente personalizada.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl mb-6">03</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Captación de Leads Automatizada</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                El chatbot solicita el email y teléfono del visitante antes de despedirse, enviando el contacto directamente a tu CRM.
              </p>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
            <h3 className="text-3xl font-black mb-4">¿Quieres un Asistente Virtual para Tu Empresa?</h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Configuramos y desplegamos tu chatbot de IA listo para atender a tus clientes en tiempo récord.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              Solicitar Demostración de Chatbot
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
