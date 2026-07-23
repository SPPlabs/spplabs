"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useChat } from "./useChat";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";

export const InlineChatbot: React.FC = () => {
  const resolvedApiKey = process.env.NEXT_PUBLIC_SPP_API_KEY || "";
  const resolvedWebsiteId = process.env.NEXT_PUBLIC_WEBSITE_ID || "spplabs.es";

  const chat = useChat(resolvedWebsiteId, resolvedApiKey, "");
  const { messages, sendMessage, clearChat, stopGeneration, isLoading, isStreaming } = chat;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState("es");

  useEffect(() => {
    const current = localStorage.getItem("spp_lang") || "es";
    setLang(current);
  }, []);

  // Listen to custom event or storage change to keep lang updated if toggled on landing page
  useEffect(() => {
    const handleStorageChange = () => {
      const current = localStorage.getItem("spp_lang") || "es";
      setLang(current);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    const messageText = input;
    setInput("");
    await sendMessage(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col font-sans text-black bg-white border border-zinc-200/80 rounded-[2.5rem] shadow-xl p-8 min-h-[420px] transition-all duration-300">
      
      {/* Top Header Control (e.g. Clear history button on the right) */}
      <div className="flex justify-end mb-4">
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black hover:text-zinc-700 border border-zinc-300 rounded-full hover:bg-zinc-50 transition-all cursor-pointer"
            title="Clear Chat History"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>{lang === "es" ? "Limpiar chat" : "Clear chat"}</span>
          </button>
        )}
      </div>

      {/* Main Conversation or Welcome Area */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center my-6 text-center">
          <h2 className="text-3xl font-black tracking-tight text-black text-center mb-4">
            {lang === "es" ? "¿En qué puedo ayudarte?" : "What can I help with?"}
          </h2>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 px-4 py-2 mb-6 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-zinc-300 text-black font-medium"
        >
          {messages.map((msg, index) => (
            <Message key={index} message={msg} accentColor="bg-black" />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <TypingIndicator />
            </div>
          )}
        </div>
      )}

      {/* Input controls & Area */}
      <div className="flex flex-col bg-transparent">
        {/* Stop Generating (displays only while streaming response tokens) */}
        {isStreaming && (
          <div className="flex justify-center mb-2">
            <button
              onClick={stopGeneration}
              className="flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-full text-[10px] font-bold text-black transition-colors shadow-sm cursor-pointer"
            >
              <span className="w-1.5 h-1.5 bg-rose-500 rounded animate-pulse" />
              <span>{lang === "es" ? "Detener generación" : "Stop Generating"}</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="w-full bg-white border border-zinc-300 rounded-[1.6rem] shadow-md p-4 flex flex-col gap-3 max-w-3xl mx-auto">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === "es" ? "Pregunta lo que quieras" : "Ask anything"}
            disabled={isLoading || isStreaming}
            className="w-full text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-black font-semibold placeholder-zinc-500 resize-none font-sans min-h-[32px] max-h-32 py-1.5"
            aria-label="Chat input field"
          />
          
          <div className="flex items-center justify-end border-t border-zinc-100 pt-3">
            {/* Submit Arrow Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isStreaming}
              className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center hover:bg-zinc-800 disabled:opacity-20 transition-all cursor-pointer shadow-sm"
              aria-label="Send message"
            >
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
        </form>

        {/* Disclaimer */}
        <span className="text-[10px] text-black font-semibold text-center mt-3 select-none leading-normal">
          Al hablar con esta IA estás aceptando nuestra{" "}
          <Link href="/politica-de-privacidad" className="underline hover:text-zinc-700">
            política de privacidad
          </Link>{" "}
          y nuestros{" "}
          <Link href="/terminos-y-condiciones" className="underline hover:text-zinc-700">
            términos y condiciones
          </Link>
        </span>
      </div>
    </div>
  );
};

