"use client";

import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function PosicionamientoSeoServicePage() {
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
            <span className="text-slate-900 font-bold">Posicionamiento SEO</span>
          </nav>

          {/* Hero Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-black uppercase tracking-wider font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              Visibilidad Orgánica en Buscadores
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              Posicionamiento SEO para Ser el <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Primer Resultado</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
              Consigue que los clientes que buscan tus productos o servicios te encuentren en Google de forma natural, sin depender únicamente de la publicidad pagada.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                Auditar la Web de Tu Empresa
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* SEO Performance Showcase Mockup for tuempresa.es */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                  CRECIMIENTO ORGÁNICO EN BUSCADORES
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Evolución del Tráfico Orgánico para tuempresa.es
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                📈 Top #1 en Palabras Clave Clave
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800 p-4 rounded-xl text-center">
                  <span className="text-xs text-slate-400 font-bold block uppercase">Posición Media</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">#1.4</span>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl text-center">
                  <span className="text-xs text-slate-400 font-bold block uppercase">Clics Orgánicos</span>
                  <span className="text-2xl font-black font-mono text-white">8,420</span>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl text-center">
                  <span className="text-xs text-slate-400 font-bold block uppercase">Incremento de Leads</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">+142%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mb-6">01</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Captación Constante de Clientes</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Aparecer en las primeras posiciones te permite recibir consultas comerciales continuas de usuarios con intención clara de compra.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl mb-6">02</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Ahorro en Publicidad Pagada</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                El tráfico orgánico genera visitas sostenidas sin necesidad de pagar por cada clic en anuncios de búsqueda.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl mb-6">03</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Autoridad de Marca</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Los clientes confían más en las empresas que aparecen en los primeros resultados orgánicos de Google.
              </p>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
            <h3 className="text-3xl font-black mb-4">¿Quieres que Tu Empresa Ocupe el Primer Lugar?</h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Realizamos un análisis gratuito del estado actual de tu web y te proponemos un plan para superar a tus competidores.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              Solicitar Estudio SEO Gratuito
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
