"use client";

import { useState } from "react";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function ChatbotIaServicePage() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  // Simulated interactive chat messages for demo
  const [messages, setMessages] = useState([
    { sender: "bot", text: isEs ? "👋 ¡Hola! Soy el asistente de IA de Tu Empresa. ¿En qué puedo ayudarte hoy?" : "👋 Hi! I am your AI assistant. How can I help your business today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const samplePrompts = [
    { label: isEs ? "Servicios & Precios" : "Services & Pricing", botReply: isEs ? "Ofrecemos desarrollo web premium, CRM con analíticas y asistentes de IA a medida. ¿Te gustaría solicitar una propuesta rápida?" : "We offer web engineering, custom CRM dashboards, and 24/7 AI assistants. Would you like a fast proposal?" },
    { label: isEs ? "Horarios de Atención" : "Business Hours", botReply: isEs ? "Nuestro equipo humano atiende de Lunes a Viernes de 09:00 a 19:00, ¡pero yo respondo tus preguntas las 24 horas del día!" : "Our human team works Monday to Friday 09:00 to 19:00, but I answer your questions 24 hours a day!" },
    { label: isEs ? "Agendar Demostración" : "Book a Demo", botReply: isEs ? "¡Excelente! Déjame tu teléfono o email y agendaremos una llamada en el horario que mejor te convenga." : "Great! Leave your phone or email and we will schedule a live demo call." },
  ];

  const handleSimulatedPrompt = (prompt) => {
    if (isTyping) return;
    setMessages(prev => [...prev, { sender: "user", text: prompt.label }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: "bot", text: prompt.botReply }]);
      setIsTyping(false);
    }, 600);
  };

  const benefits = [
    { num: "01", title: isEs ? "Respuesta Instantánea sin Demoras" : "Instant 2-Second Responses", desc: isEs ? "Tus clientes reciben información precisa en menos de 2 segundos sin esperar a horarios de oficina." : "Prospects get instant answers in under 2 seconds without waiting for office hours." },
    { num: "02", title: isEs ? "Entrenado con Tus Datos" : "Trained on Company Data", desc: isEs ? "Cargamos catálogos, listas de precios, horarios y FAQs para respuestas 100% personalizadas." : "We index product catalogs, price sheets, and FAQs for fully customized responses." },
    { num: "03", title: isEs ? "Captación de Leads Automatizada" : "Automated Lead Capture", desc: isEs ? "El chatbot solicita el email y teléfono del visitante enviando el contacto directamente a tu CRM." : "The AI collects visitor email and phone details, streaming contacts into your CRM." },
  ];

  const faqs = [
    { q: isEs ? "¿El chatbot comete errores o alucina respuestas?" : "Does the chatbot hallucinate false answers?", a: isEs ? "No. Utilizamos una arquitectura RAG (Retrieval-Augmented Generation) que restringe al chatbot a responder estrictamente con la información verificada de su empresa." : "No. We deploy strict RAG architecture restricting the AI to verified company documents." },
    { q: isEs ? "¿Qué pasa si un usuario hace una pregunta no registrada?" : "What happens if a user asks an unknown question?", a: isEs ? "El chatbot responde cortésmente que derivará la consulta al equipo humano y solicita sus datos de contacto para atenderlo." : "The AI politely offers to route the request to a human manager and captures contact details." },
    { q: isEs ? "¿Es fácil instalar el chatbot en mi sitio web?" : "Is installing the chatbot on my site easy?", a: isEs ? "Muy fácil. Se instala mediante un script ligero de una sola línea compatible con cualquier CMS o framework web." : "Simple. It installs via a single lightweight script tag compatible with any framework." },
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
            <span className="text-slate-900 font-bold">{isEs ? "Chatbot de IA 24/7" : "AI Chatbot 24/7"}</span>
          </nav>

          {/* Hero Header */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              {isEs ? "Atención Comercial Automatizada 24/7" : "Automated 24/7 Sales Support"}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              {isEs ? "Chatbot de IA Entrenado para " : "Custom AI Chatbot Trained to "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                {isEs ? "Vender y Atender" : "Engage & Convert"}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
              {isEs
                ? "Implementa un asistente de Inteligencia Artificial que responde preguntas sobre tu empresa, soluciona dudas comerciales al instante y ayuda a cerrar ventas incluso cuando tu equipo está descansando."
                : "Deploy an AI assistant that answers company queries, resolves commercial doubts, and captures sales leads 24 hours a day."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isEs ? "Probar Chatbot para Tu Empresa" : "Get AI Chatbot"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Interactive Live Chatbot Simulator (Client-Side State Only) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6 flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                  {isEs ? "SIMULADOR EN TIEMPO REAL" : "LIVE CHAT SIMULATOR"}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  {isEs ? "Interactúa con el Asistente de IA" : "Test Live Conversation Flow"}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                🟢 {isEs ? "IA Activa las 24 Horas" : "AI Active 24/7"}
              </div>
            </div>

            {/* Quick Prompt Trigger Chips */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-2">{isEs ? "Haz una pregunta de prueba:" : "Try a prompt sample:"}</span>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSimulatedPrompt(p)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-all cursor-pointer active:scale-95"
                  >
                    💬 {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chatbox Window */}
            <div className="bg-slate-950 rounded-2xl p-6 text-white shadow-xl max-w-xl mx-auto space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                  IA
                </div>
                <div>
                  <span className="font-bold text-sm block">{isEs ? "Asistente Virtual" : "AI Virtual Assistant"}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">{isEs ? "En línea • Respuestas en 0.2s" : "Online • Sub-second speed"}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs max-h-[240px] overflow-y-auto pr-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      m.sender === "user"
                        ? "bg-emerald-600 text-white ml-auto text-right"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="bg-slate-800 text-slate-400 p-3 rounded-xl max-w-[40%] text-xs font-mono animate-pulse">
                    {isEs ? "IA escribiendo..." : "AI typing..."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Benefits Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {benefits.map((b, idx) => (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mb-6 font-mono">
                  {b.num}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{b.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQs Accordion */}
          <div className="max-w-3xl mx-auto mb-24 space-y-6">
            <h3 className="text-2xl font-black text-center text-slate-950">{isEs ? "Preguntas Frecuentes sobre el Chatbot de IA" : "AI Chatbot FAQ"}</h3>
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
            <h3 className="text-3xl font-black mb-4">{isEs ? "¿Quieres un Asistente Virtual para Tu Empresa?" : "Want an AI Assistant for Your Company?"}</h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              {isEs ? "Configuramos y desplegamos tu chatbot de IA listo para atender a tus clientes en tiempo récord." : "We configure and deploy custom AI agents trained on your business data."}
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              {isEs ? "Solicitar Demostración de Chatbot" : "Request AI Chatbot Demo"}
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
