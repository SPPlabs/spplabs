"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function TecnologiaSection() {
  const { lang } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-green/5 border border-brand-green/10 px-3.5 py-1.5 rounded-full mb-4 inline-block">
            {lang === "es" ? "Ecosistema Tecnológico" : "Tech Ecosystem"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black mt-3 leading-tight">
            {lang === "es" ? "Nuestras Tecnologías Integradas" : "Our Integrated Tech Stack"}
          </h1>
          <p className="text-zinc-650 mt-4 text-base md:text-lg leading-relaxed">
            {lang === "es"
              ? "Bases de datos ultra-rápidas, aceleración por hardware, contenedores aislados y orquestación de inteligencia artificial ejecutadas en nuestros servidores de SPP labs"
              : "High-throughput databases, hardware acceleration, containerization, and AI orchestration engines running at the core of our infrastructure."}
          </p>
        </div>

        {/* Circular Orbit Ecosystem Hero with 12 Hovering Logos */}
        <div className="relative my-8 py-8 flex items-center justify-center min-h-[520px] md:min-h-[600px] w-full max-w-5xl mx-auto overflow-hidden">
          {/* Background Decorative Orbital Concentric Rings */}
          <div className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-zinc-200/60 opacity-60 pointer-events-none"></div>
          <div className="absolute w-[440px] h-[440px] md:w-[540px] md:h-[540px] rounded-full border border-dashed border-zinc-200/40 pointer-events-none"></div>

          {/* CENTRAL NODE: SPP Labs Logo */}
          <div className="relative z-20 flex flex-col items-center justify-center p-6 bg-white rounded-full shadow-2xl border border-zinc-200/80 animate-float-gentle">
            <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
              <Image
                src="/tech/logo sin fondo.webp"
                alt="SPP Labs Core"
                width={144}
                height={144}
                sizes="(max-width: 768px) 112px, 144px"
                className="w-full h-full object-contain rounded-2xl p-1"
              />
            </div>
            <span className="mt-2 px-3.5 py-1 bg-slate-900 text-white font-mono font-bold text-[11px] rounded-full shadow-xs tracking-wider">
              SPP LABS
            </span>
          </div>

          {/* HOVERING TECH LOGOS IN 12-POINT CIRCULAR ORBIT */}
          {/* 1. Next.js - Top (0°) */}
          <div className="absolute top-[2%] left-1/2 -translate-x-1/2 z-20 animate-float-gentle delay-1">
            <Image
              src="/tech/next-js-logo-png_seeklogo-321806.webp"
              alt="Next.js"
              title="Next.js"
              width={80}
              height={80}
              sizes="(max-width: 768px) 56px, 80px"
              className="w-12 sm:w-14 md:w-20 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 2. Docker - Top Right (30°) */}
          <div className="absolute top-[9%] right-[18%] md:right-[23%] z-20 animate-float-reverse delay-2">
            <Image
              src="/tech/Docker-Emblem.webp"
              alt="Docker (Container)"
              title="Docker (Container)"
              width={96}
              height={80}
              sizes="(max-width: 768px) 64px, 96px"
              className="w-14 sm:w-16 md:w-24 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 3. Tailwind CSS - Upper Right (60°) */}
          <div className="absolute top-[28%] right-[4%] md:right-[8%] z-20 animate-float-gentle delay-3">
            <Image
              src="/tech/tailwind-css-logo-png_seeklogo-434090.webp"
              alt="Tailwind CSS"
              title="Tailwind CSS"
              width={80}
              height={80}
              sizes="(max-width: 768px) 56px, 80px"
              className="w-12 sm:w-14 md:w-20 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 4. ClickHouse DB - Right (90°) */}
          <div className="absolute top-1/2 -translate-y-1/2 right-[1%] sm:right-[2%] md:right-[4%] z-20 animate-float-reverse delay-4">
            <Image
              src="/tech/clickhouse-logo_freelogovectors.net_.webp"
              alt="ClickHouse DB"
              title="ClickHouse DB"
              width={96}
              height={80}
              sizes="(max-width: 768px) 64px, 96px"
              className="w-14 sm:w-16 md:w-24 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 5. PostgreSQL - Lower Right (120°) */}
          <div className="absolute bottom-[28%] right-[4%] md:right-[8%] z-20 animate-float-gentle delay-5">
            <Image
              src="/tech/PostgreSQL_logo.3colors.120x120.webp"
              alt="PostgreSQL"
              title="PostgreSQL"
              width={80}
              height={80}
              sizes="(max-width: 768px) 56px, 80px"
              className="w-12 sm:w-14 md:w-20 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 6. Cloudflare - Bottom Right (150°) */}
          <div className="absolute bottom-[9%] right-[18%] md:right-[23%] z-20 animate-float-reverse delay-1">
            <Image
              src="/tech/CF_logomark.webp"
              alt="Cloudflare (Safety Tunnel)"
              title="Cloudflare (Safety Tunnel)"
              width={80}
              height={80}
              sizes="(max-width: 768px) 56px, 80px"
              className="w-12 sm:w-14 md:w-20 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 7. vLLM Engine - Bottom Center (180°) */}
          <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-20 animate-float-gentle delay-2">
            <Image
              src="/tech/vLLM-Full-Logo.webp"
              alt="vLLM Engine"
              title="vLLM Engine"
              width={112}
              height={80}
              sizes="(max-width: 768px) 80px, 112px"
              className="w-16 sm:w-20 md:w-28 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 8. Hugging Face - Bottom Left (210°) */}
          <div className="absolute bottom-[9%] left-[18%] md:left-[23%] z-20 animate-float-reverse delay-3">
            <Image
              src="/tech/png-transparent-hugging-face-logo-tech-companies.webp"
              alt="Hugging Face"
              title="Hugging Face"
              width={80}
              height={80}
              sizes="(max-width: 768px) 56px, 80px"
              className="w-12 sm:w-14 md:w-20 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 9. Qdrant Vector DB - Lower Left (240°) */}
          <div className="absolute bottom-[28%] left-[4%] md:left-[8%] z-20 animate-float-gentle delay-4">
            <Image
              src="/tech/qdrant-logo-red-black.webp"
              alt="Qdrant Vector DB"
              title="Qdrant Vector DB"
              width={112}
              height={80}
              sizes="(max-width: 768px) 80px, 112px"
              className="w-16 sm:w-20 md:w-28 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 10. LangChain - Left (270°) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[1%] sm:left-[2%] md:left-[4%] z-20 animate-float-reverse delay-5">
            <Image
              src="/tech/LangChain-Logo.webp"
              alt="LangChain"
              title="LangChain"
              width={112}
              height={80}
              sizes="(max-width: 768px) 80px, 112px"
              className="w-16 sm:w-20 md:w-28 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 11. NVIDIA - Upper Left (300°) */}
          <div className="absolute top-[28%] left-[4%] md:left-[8%] z-20 animate-float-gentle delay-1">
            <Image
              src="/tech/Nvidia-Logo-PNG-Image-Transparent.webp"
              alt="NVIDIA GPUs"
              title="NVIDIA GPUs"
              width={112}
              height={80}
              sizes="(max-width: 768px) 80px, 112px"
              className="w-16 sm:w-20 md:w-28 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>

          {/* 12. AMD - Top Left (330°) */}
          <div className="absolute top-[9%] left-[18%] md:left-[23%] z-20 animate-float-reverse delay-2">
            <Image
              src="/tech/AMD_E_Blk_RGB.webp"
              alt="AMD"
              title="AMD"
              width={96}
              height={80}
              sizes="(max-width: 768px) 64px, 96px"
              className="w-14 sm:w-16 md:w-24 h-12 sm:h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
            />
          </div>
        </div>

        {/* Technological Stack Details Grid */}
        <div className="mt-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-bold text-black">{lang === "es" ? "Arquitectura de Software e Infraestructura" : "Software & Infrastructure Architecture"}</h3>
            <p className="text-zinc-650 text-sm mt-2">{lang === "es" ? "Stack optimizado para latencia ultra-baja, seguridad de túnel y procesamiento analítico." : "An architecture optimized for sub-millisecond analytics, container safety, and AI queries."}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {/* Tech 1: Next.js */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/next-js-logo-png_seeklogo-321806.webp"
                alt="Next.js"
                width={48}
                height={48}
                sizes="48px"
                className="w-12 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Framework</span>
              <h4 className="text-sm font-extrabold text-black mt-1">Next.js</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "El framework que utilizamos." : "Hybrid server rendering."}
              </p>
            </div>

            {/* Tech 2: Docker */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/Docker-Emblem.webp"
                alt="Docker"
                width={64}
                height={48}
                sizes="64px"
                className="w-16 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Containers</span>
              <h4 className="text-sm font-extrabold text-black mt-1">Docker</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Contenedores aislados." : "Isolated container engines."}
              </p>
            </div>

            {/* Tech 3: Cloudflare */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/CF_logomark.webp"
                alt="Cloudflare"
                width={48}
                height={48}
                sizes="48px"
                className="w-12 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Safety Tunnel</span>
              <h4 className="text-sm font-extrabold text-black mt-1">Cloudflare</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Túnel seguro y CDN." : "Security tunnel & Edge CDN."}
              </p>
            </div>

            {/* Tech 4: Tailwind */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/tailwind-css-logo-png_seeklogo-434090.webp"
                alt="Tailwind CSS"
                width={48}
                height={48}
                sizes="48px"
                className="w-12 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Styling</span>
              <h4 className="text-sm font-extrabold text-black mt-1">Tailwind CSS</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Estilos limpios y eficientes." : "Utility CSS for fast style builds."}
              </p>
            </div>

            {/* Tech 5: PostgreSQL */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/PostgreSQL_logo.3colors.120x120.webp"
                alt="PostgreSQL"
                width={48}
                height={48}
                sizes="48px"
                className="w-12 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider">Database</span>
              <h4 className="text-sm font-extrabold text-black mt-1">PostgreSQL</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Base de datos primaria." : "Primary ACID storage tables."}
              </p>
            </div>

            {/* Tech 6: ClickHouse */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/clickhouse-logo_freelogovectors.net_.webp"
                alt="ClickHouse DB"
                width={48}
                height={48}
                sizes="48px"
                className="w-12 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider">Analytics</span>
              <h4 className="text-sm font-extrabold text-black mt-1">ClickHouse DB</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Base de datos de analíticas." : "Millisecond analytical engine."}
              </p>
            </div>

            {/* Tech 7: vLLM */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/vLLM-Full-Logo.webp"
                alt="vLLM"
                width={64}
                height={48}
                sizes="64px"
                className="w-16 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">AI Inference</span>
              <h4 className="text-sm font-extrabold text-black mt-1">vLLM Engine</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Inferencia LLM rápida." : "High-throughput LLM execution."}
              </p>
            </div>

            {/* Tech 8: Qdrant */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/qdrant-logo-red-black.webp"
                alt="Qdrant"
                width={64}
                height={48}
                sizes="64px"
                className="w-16 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Vector DB</span>
              <h4 className="text-sm font-extrabold text-black mt-1">Qdrant</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Base de datos vectorial." : "Vector RAG context storage."}
              </p>
            </div>

            {/* Tech 9: HuggingFace */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/png-transparent-hugging-face-logo-tech-companies.webp"
                alt="Hugging Face"
                width={48}
                height={48}
                sizes="48px"
                className="w-12 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Models</span>
              <h4 className="text-sm font-extrabold text-black mt-1">Hugging Face</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Pesos de modelos abiertos." : "Open language model pipeline."}
              </p>
            </div>

            {/* Tech 10: LangChain */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/LangChain-Logo.webp"
                alt="LangChain"
                width={64}
                height={48}
                sizes="64px"
                className="w-16 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Agents</span>
              <h4 className="text-sm font-extrabold text-black mt-1">LangChain</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Orquestación RAG." : "Orchestration layer for RAG."}
              </p>
            </div>

            {/* Tech 11: NVIDIA */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/Nvidia-Logo-PNG-Image-Transparent.webp"
                alt="NVIDIA"
                width={64}
                height={48}
                sizes="64px"
                className="w-16 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Hardware</span>
              <h4 className="text-sm font-extrabold text-black mt-1">NVIDIA GPUs</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Aceleración de Tensor Cores." : "Tensor Cores AI compute."}
              </p>
            </div>

            {/* Tech 12: AMD */}
            <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
              <Image
                src="/tech/AMD_E_Blk_RGB.webp"
                alt="AMD"
                width={56}
                height={48}
                sizes="56px"
                className="w-14 h-12 object-contain rounded-xl mb-3"
              />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Compute</span>
              <h4 className="text-sm font-extrabold text-black mt-1">AMD</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {lang === "es" ? "Servidores multi-núcleo." : "Multi-core server nodes."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
