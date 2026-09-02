"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@/components/chatbot/Message";
import { TypingIndicator } from "@/components/chatbot/TypingIndicator";
import { BotIcon, RefreshIcon, SendIcon, BrainIcon } from "@/components/dashboard/DashboardIcons";

export default function DashboardChatbot({
  currentWebsite,
  lang = "es",
  t = {},
  chatbotKnowledge,
}) {
  const domain = currentWebsite?.domain || "spplabs.es";
  const websiteName = currentWebsite?.title || currentWebsite?.name || domain;
  const logoUrl = currentWebsite?.logoUrl;
  const knowledgeLength = chatbotKnowledge?.content?.length || 0;
  const storageKey = `spp_dashboard_chat_preview_${domain}`;

  // Initialize messages lazily from storage or default greeting
  const [messages, setMessages] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem(`spp_dashboard_chat_preview_${domain}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback
    }

    const welcomeMsg = lang === "es"
      ? `¡Hola! Soy el asistente virtual de ${websiteName}. Estoy conectado a la base de conocimiento de tu empresa. ¿En qué puedo ayudarte hoy?`
      : `Hello! I am the virtual assistant for ${websiteName}. I am connected to your company's knowledge base. How can I help you today?`;

    return [
      {
        role: "assistant",
        content: welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [enableThinking, setEnableThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(false);

  const scrollRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Persist messages in session storage
  useEffect(() => {
    if (messages.length > 0 && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {
        // Storage failover
      }
    }
  }, [messages, storageKey]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isStreaming]);

  // Stop generation
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsLoading(false);

      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
          updated[updated.length - 1].content += "\n\n*(Generación detenida)*";
        }
        return updated;
      });
    }
  }, []);

  // Clear chat
  const handleClear = () => {
    handleStop();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(storageKey);
    }
    const welcomeMsg = lang === "es"
      ? `¡Hola! Soy el asistente virtual de ${websiteName}. Estoy conectado a la base de conocimiento de tu empresa. ¿En qué puedo ayudarte hoy?`
      : `Hello! I am the virtual assistant for ${websiteName}. I am connected to your company's knowledge base. How can I help you today?`;

    setMessages([
      {
        role: "assistant",
        content: welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Send message
  const handleSend = async (textToSend) => {
    const text = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!text || isLoading || isStreaming) return;

    if (text.length > 150) {
      setError(lang === "es" ? "El mensaje no puede superar los 150 caracteres." : "Message cannot exceed 150 characters.");
      return;
    }

    setError(null);
    setInput("");
    setIsLoading(true);
    setIsStreaming(false);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = {
      role: "user",
      content: text,
      timestamp,
    };

    setMessages((prev) => [...prev, userMsg]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          website_id: domain,
          message: text,
          preview_mode: true, // Counts tokens, skips visitor transcript logging & monthly chat reports
          enable_thinking: enableThinking,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = `Error del servidor (${response.status})`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch {
          // Response is not JSON
        }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") || response.body) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No se pudo iniciar el stream de respuesta.");
        }

        setIsLoading(false);
        setIsStreaming(true);

        const assistantMsg = {
          role: "assistant",
          content: "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        const decoder = new TextDecoder();
        let streamAccumulator = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          streamAccumulator = `${streamAccumulator}${chunkText}`;
          const currentContent = streamAccumulator;

          setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: currentContent,
              };
            }
            return updated;
          });
        }
      } else {
        const data = await response.json();
        const content = data.content || data.message || JSON.stringify(data);
        setIsLoading(false);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || (lang === "es" ? "Error al conectar con el chatbot" : "Error connecting to chatbot"));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = lang === "es"
    ? [
        "¿Qué servicios ofrecéis?",
        "¿Cómo puedo reservar una cita o contactar?",
        "¿Cuáles son vuestros horarios de atención?",
      ]
    : [
        "What services do you offer?",
        "How can I book an appointment or contact you?",
        "What are your business hours?",
      ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 w-full animate-fade-in">
      {/* Top Header Information & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          {logoUrl && !logoError ? (
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-200/80 bg-white p-1 shadow-2xs shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={websiteName}
                onError={() => setLogoError(true)}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-sm shrink-0 font-black text-sm">
              <BotIcon className="w-5 h-5 text-blue-400" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-base text-slate-950 flex items-center gap-2">
                <span>{websiteName}</span>
                <span className="text-xs font-semibold text-slate-400 font-mono">· Chatbot IA</span>
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {lang === "es" ? "RAG Activo" : "Active RAG"}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
              <span>{lang === "es" ? "Base de conocimiento:" : "Knowledge base:"}</span>
              <span className="font-mono font-bold text-slate-700">
                {knowledgeLength.toLocaleString()} {lang === "es" ? "caracteres sincronizados" : "synced chars"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {/* Thinking Mode Toggle (Internal Dashboard Simulator only) */}
          <button
            type="button"
            onClick={() => setEnableThinking((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
              enableThinking
                ? "bg-violet-50 text-violet-700 border-violet-300 ring-2 ring-violet-200/50"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
            title={
              lang === "es"
                ? "Activar proceso de razonamiento paso a paso de la IA (solo disponible en este probador interno)"
                : "Enable AI step-by-step reasoning (internal test simulator only)"
            }
          >
            <BrainIcon className={`w-3.5 h-3.5 ${enableThinking ? "text-violet-600 animate-pulse" : "text-slate-500"}`} />
            <span>{lang === "es" ? "Pensar" : "Thinking"}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                enableThinking ? "bg-violet-600" : "bg-slate-300"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title={lang === "es" ? "Reiniciar conversación del simulador" : "Reset simulator conversation"}
          >
            <RefreshIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === "es" ? "Reiniciar Chat" : "Reset Chat"}</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-6 min-h-[320px] max-h-[460px] overflow-y-auto space-y-4 text-xs shadow-inner"
      >
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg} accentColor="bg-slate-900" />
        ))}

        {isLoading && (
          <div className="flex justify-start items-center">
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      {messages.length <= 2 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {lang === "es" ? "Preguntas sugeridas:" : "Suggested questions:"}
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q)}
                disabled={isLoading || isStreaming}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-950 rounded-xl text-xs font-medium transition-all shadow-2xs cursor-pointer text-left disabled:opacity-50"
              >
                {q} &rarr;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Alert if any */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center justify-between animate-fade-in">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="p-1 text-rose-500 hover:text-rose-800">
            &times;
          </button>
        </div>
      )}

      {/* Input Message Area */}
      <div className="space-y-2">
        <div className="relative flex items-end gap-2 bg-white border-2 border-slate-200 focus-within:border-slate-900 rounded-2xl p-2 transition-all shadow-2xs">
          <textarea
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 150) setInput(val);
            }}
            onKeyDown={handleKeyDown}
            maxLength={150}
            rows={2}
            placeholder={
              lang === "es"
                ? `Pregunta al asistente de ${websiteName}... (Enter para enviar)`
                : `Ask ${websiteName}'s assistant... (Enter to send)`
            }
            className="w-full bg-transparent resize-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none p-2 leading-relaxed"
          />

          <div className="flex items-center gap-2 pb-1 pr-1">

            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                title="Detener respuesta"
              >
                <span className="w-2 h-2 rounded-xs bg-white"></span>
                <span>{lang === "es" ? "Detener" : "Stop"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-slate-900 hover:bg-black disabled:opacity-40 disabled:hover:bg-slate-900 text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                title={lang === "es" ? "Enviar mensaje" : "Send message"}
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block"></span>
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Security & Token Notice */}
        <p className="text-[11px] text-slate-400 leading-relaxed italic px-1">
          {lang === "es"
            ? "ℹ️ Modo Simulador: Las preguntas realizadas aquí consumen tokens de tu cuenta en tiempo real, pero no se registran en el historial de visitantes ni en las métricas de los informes mensuales."
            : "ℹ️ Simulator Mode: Questions asked here consume tokens from your account in real-time, but are not recorded in visitor chat history or monthly report metrics."}
        </p>
      </div>
    </div>
  );
}
