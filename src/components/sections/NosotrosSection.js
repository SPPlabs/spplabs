"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function NosotrosSection() {
  const { lang } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section 1: About us */}
        <div className="grid md:grid-cols-12 gap-12 items-center mb-24">
          <div className="md:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3.5 py-1.5 rounded-full inline-block">
              {lang === "es" ? "Conoce SPP Labs" : "About SPP Labs"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight">
              {lang === "es" ? "En SPP Labs ayudamos a empresas a crecer" : "Empowering Business Growth with Digital Solutions"}
            </h2>
            <p className="text-zinc-650 text-base md:text-lg leading-relaxed font-medium">
              {lang === "es"
                ? "En SPP Labs ayudamos a empresas a crecer mediante soluciones digitales que combinan diseño web premium, inteligencia artificial y automatización."
                : "At SPP Labs we help businesses grow through digital solutions combining premium web design, artificial intelligence, and automation."}
            </p>
            <p className="text-zinc-650 text-sm md:text-base leading-relaxed">
              {lang === "es"
                ? "Creamos experiencias digitales enfocadas en atraer clientes, optimizar procesos y generar resultados reales. Cada proyecto está diseñado para ofrecer el máximo rendimiento, un diseño cuidado y tecnología preparada para el futuro."
                : "We build digital experiences focused on attracting clients, streamlining processes, and delivering real results. Every project is crafted for peak performance, thoughtful design, and future-proof technology."}
            </p>
            <p className="text-brand-blue font-extrabold text-sm md:text-base">
              {lang === "es"
                ? "Innovamos para que tu negocio destaque."
                : "We innovate so your business stands out."}
            </p>
          </div>

          <div className="md:col-span-5 border border-zinc-200 rounded-3xl p-8 bg-zinc-50/50 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full"></div>
            <h3 className="text-lg font-bold text-black mb-4">{lang === "es" ? "Nuestros Pilares" : "Our Core Ethos"}</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue font-black flex items-center justify-center shrink-0 text-xs">✓</span>
                <div>
                  <span className="text-sm font-bold text-black block">{lang === "es" ? "Velocidad Sub-Milisegundo" : "Sub-Millisecond Performance"}</span>
                  <span className="text-xs text-zinc-500 block">{lang === "es" ? "Analíticas impulsadas por ClickHouse." : "Analytics powered directly by ClickHouse nodes."}</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-green/10 text-brand-green font-black flex items-center justify-center shrink-0 text-xs">✓</span>
                <div>
                  <span className="text-sm font-bold text-black block">{lang === "es" ? "Modelos de IA Locales" : "Local AI Architectures"}</span>
                  <span className="text-xs text-zinc-500 block">{lang === "es" ? "Inferencia en GPUs propias." : "vLLM model hosting inside our server rack."}</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-200 text-black font-black flex items-center justify-center shrink-0 text-xs">✓</span>
                <div>
                  <span className="text-sm font-bold text-black block">{lang === "es" ? "Soberanía Hardware" : "In-House Server Nodes"}</span>
                  <span className="text-xs text-zinc-500 block">{lang === "es" ? "Sin silos de nubes externas." : "Completely free from external SaaS clouds."}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2: Casos de éxito */}
        <div className="border-t border-zinc-150 pt-20 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-green/5 border border-brand-green/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
              {lang === "es" ? "Testimonios" : "Client Success Stories"}
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-black">{lang === "es" ? "Casos de Éxito y Reseñas" : "Reviews & Client Feedback"}</h3>
            <p className="text-zinc-500 text-sm mt-2">{lang === "es" ? "Lo que opinan las empresas que han migrado su infraestructura a SPP Labs." : "Feedback from organizations that run their dashboards on SPP Labs."}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-4">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-zinc-650 text-xs leading-relaxed italic mb-6">
                  "Trabajar con SPP Labs ha sido una de las mejores decisiones para nuestro negocio. La web transmite una imagen mucho más profesional y el chatbot responde a nuestros clientes al instante. Hemos notado un aumento en las consultas desde el primer mes."
                </p>
              </div>
              <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-black">Carlos Moreno</span>
              </div>
            </div>

            {/* Review 2 */}
            <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-4">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-zinc-650 text-xs leading-relaxed italic mb-6">
                  "Buscábamos una empresa que se encargara de todo y SPP Labs superó nuestras expectativas. El diseño es impecable, la web carga muy rápido y el soporte siempre responde cuando lo necesitamos."
                </p>
              </div>
              <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-black">Laura Sánchez</span>
              </div>
            </div>

            {/* Review 3 */}
            <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-4">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-zinc-650 text-xs leading-relaxed italic mb-6">
                  "Lo que más nos sorprendió fue la combinación de diseño, inteligencia artificial y automatización. Ahora dedicamos mucho menos tiempo a tareas repetitivas y podemos centrarnos en hacer crecer nuestro negocio."
                </p>
              </div>
              <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-black">Javier Ortega</span>
              </div>
            </div>

            {/* Review 4 */}
            <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-4">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-zinc-650 text-xs leading-relaxed italic mb-6">
                  "Desde el primer contacto entendieron exactamente lo que necesitábamos. El resultado ha sido una web moderna, rápida y que realmente convierte visitas en clientes. Muy recomendables."
                </p>
              </div>
              <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-black">Marta Delgado</span>
              </div>
            </div>

            {/* Review 5 */}
            <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-4">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-zinc-650 text-xs leading-relaxed italic mb-6">
                  "La atención al detalle y la calidad del trabajo han sido excelentes. Además del diseño, el chatbot y las automatizaciones nos han ayudado a mejorar la atención al cliente sin aumentar la carga de trabajo."
                </p>
              </div>
              <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-black">Daniel Navarro</span>
              </div>
            </div>

            {/* Review 6 */}
            <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-4">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-zinc-650 text-xs leading-relaxed italic mb-6">
                  "Queríamos renovar nuestra presencia online y SPP Labs hizo un trabajo excepcional. El proceso fue rápido, la comunicación muy fluida y el resultado final superó nuestras expectativas."
                </p>
              </div>
              <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-black">Elena Ruiz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Comunidad */}
        <div className="border-t border-zinc-150 pt-20">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-zinc-800/90 rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 via-cyan-400/10 to-brand-green/10 pointer-events-none -z-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl pointer-events-none"></div>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/90 text-xs font-extrabold uppercase tracking-widest text-brand-green mb-6 shadow-sm">
              {lang === "es" ? "ÚNETE A NUESTRA COMUNIDAD" : "JOIN OUR COMMUNITY"}
            </span>
            
            <div className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-400 to-brand-green tracking-tighter mb-4 font-sans drop-shadow-sm">
              30.000+
            </div>
            
            <h4 className="text-xl sm:text-2xl font-black text-white mb-4 font-sans tracking-tight">
              {lang === "es" ? "Seguidores Activos en Redes Sociales" : "Active Social Media Followers"}
            </h4>
            
            <p className="text-zinc-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-10 font-medium">
              {lang === "es"
                ? "Nuestros canales de redes sociales acumulan más de 30.000 seguidores activos encantados con nuestros servicios."
                : "Our social media channels accumulate over 30,000 active followers delighted with our services."}
            </p>

            <div className="flex justify-center">
              <a
                href="https://www.tiktok.com/@spplabs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 hover:from-black hover:to-zinc-950 text-white rounded-2xl border border-zinc-700 shadow-xl hover:shadow-cyan-500/20 hover:border-cyan-400/60 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 font-extrabold text-sm sm:text-base group cursor-pointer"
                id="comunidad-tiktok-cta"
              >
                <svg className="w-6 h-6 fill-current text-white group-hover:text-cyan-400 transition-colors shrink-0" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.83V7.63a6.34 6.34 0 0 0-4.66 1.83 6.34 6.34 0 0 0-1.85 4.66 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.33V9.05a8.28 8.28 0 0 0 4.95 1.63V7.24a4.83 4.83 0 0 1-1.0.55z" />
                </svg>
                <span>{lang === "es" ? "Síguenos en TikTok" : "Follow us on TikTok"}</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
