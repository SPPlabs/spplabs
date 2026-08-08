"use client";

import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function DesarrolloWebServicePage() {
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
            <span className="text-slate-900 font-bold">Desarrollo Web Premium</span>
          </nav>

          {/* Hero Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black uppercase tracking-wider font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              Velocidad y Conversión Garantizada
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              Desarrollo Web Premium Creado para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Captar Clientes</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
              Transformamos la presencia digital de tu empresa en una herramienta comercial activa. Creamos páginas ultra rápidas, adaptadas a móviles y diseñadas para convertir visitas en ventas.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                Solicitar Propuesta para Tu Empresa
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Live Web Showcase Mockup for tuempresa.es */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200">
                  DEMOSTRACIÓN DE DISEÑO WEB PREMIUM
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Plataforma Digital Diseñada para tuempresa.es
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                ⚡ Carga en 0.4s • Rendimiento 100/100
              </div>
            </div>

            {/* Web Experience Mockup Container */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                  <span className="text-xs font-mono text-slate-400 ml-2">https://tuempresa.es</span>
                </div>
                <span className="text-xs font-bold bg-blue-600 px-3 py-1 rounded-lg">VERSIÓN EN VIVO</span>
              </div>

              <div className="space-y-6 py-4 text-center max-w-2xl mx-auto">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">LÍDERES EN SU SECTOR</span>
                <h3 className="text-3xl sm:text-4xl font-black">Soluciones Inteligentes para Impulsar Tu Empresa</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Ofrecemos atención inmediata, asesoramiento personalizado y resultados medibles desde el primer día.
                </p>
                <div className="pt-2">
                  <span className="px-6 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl inline-block shadow-md">
                    Contactar Ahora
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl mb-6">01</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Velocidad Extrema de Carga</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                El 53% de los usuarios abandona una web si tarda más de 3 segundos en cargar. Nuestras webs se abren de manera instantánea en cualquier dispositivo.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mb-6">02</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Diseño Adaptado a Móviles</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Más del 70% de tus clientes navegarán desde su smartphone. Creamos interfaces táctiles cómodas, atractivas y fáciles de usar.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl mb-6">03</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Llamadas a la Acción Efectivas</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Ubicamos estratégicamente botones de contacto y reservas para guiar al usuario a solicitar información sin esfuerzo.
              </p>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
            <h3 className="text-3xl font-black mb-4">¿Preparado para Renovar la Web de Tu Empresa?</h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Cuéntanos tu proyecto y diseñaremos una propuesta a medida para potenciar tu presencia en internet.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              Pedir Presupuesto Sin Compromiso
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
