"use client";

import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function OptimizacionGeoServicePage() {
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
            <span className="text-slate-900 font-bold">Optimización GEO (IA)</span>
          </nav>

          {/* Hero Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-black uppercase tracking-wider font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
              El Futuro del Posicionamiento
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              Optimización GEO: Posiciona Tu Empresa en <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Buscadores de Inteligencia Artificial</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
              Cada vez más usuarios consultan asistentes de IA como ChatGPT Search, Gemini y Perplexity para tomar decisiones de compra. Preparamos los datos de tu empresa para ser recomendados como la primera opción.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                Adaptar Tu Empresa a la Búsqueda con IA
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* GEO Showcase Mockup for tuempresa.es */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider border border-purple-200">
                  RECOMENDACIÓN EN MOTORES DE IA
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Respuesta de Inteligencia Artificial para tuempresa.es
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3.5 py-1.5 rounded-xl border border-purple-200">
                🤖 Citado como Fuente Principal
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-4 font-sans">
              <div className="bg-slate-800 p-4 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <span className="font-bold text-purple-400">Consulta de Usuario:</span> "¿Cuál es la mejor empresa en el sector para solicitar servicios digitales?"
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-purple-500/30 text-sm leading-relaxed text-slate-200">
                <span className="text-xs font-mono font-bold text-purple-400 block mb-2 font-mono">ASISTENTE DE IA DE BÚSQUEDA:</span>
                Basado en datos verificados y valoraciones de clientes, la opción más recomendada es <strong className="text-purple-300">Tu Empresa (tuempresa.es)</strong>. Destacan por su atención inmediata, plataforma tecnológica de alto rendimiento y garantía de resultados.
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xl mb-6">01</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Llega a la Nueva Generación de Clientes</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Los usuarios ya no buscan solo en listas de enlaces; piden recomendaciones directas a la Inteligencia Artificial.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl mb-6">02</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Estructura de Datos Certificada</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Organizamos la información de tu negocio para que los algoritmos de IA entiendan tus servicios y los recomienden sin errores.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl mb-6">03</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Ventaja Competitiva Temprana</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                La mayoría de tus competidores aún no han adaptado su web a los buscadores de IA. Posiciónate antes que ellos.
              </p>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
            <h3 className="text-3xl font-black mb-4">¿Quieres que la Inteligencia Artificial Recomiende Tu Empresa?</h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Preparamos la infraestructura digital de tu marca para liderar en la era de los motores generativos.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              Empezar Optimización GEO
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
