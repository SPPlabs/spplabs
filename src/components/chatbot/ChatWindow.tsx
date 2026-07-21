import React, { useState, useEffect, useRef } from "react";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ChatbotProps } from "./types";
import { UseChatReturn } from "./useChat";

interface ChatWindowProps extends Omit<ChatbotProps, "websiteId" | "apiKey"> {
  chat: UseChatReturn;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  title,
  subtitle,
  logo,
  placeholder,
  primaryColor = "bg-slate-900",
  accentColor = "bg-indigo-600",
  suggestedQuestions = [],
  width = 380,
  height = 520,
  chat,
  onClose,
}) => {
  const { messages, sendMessage, clearChat, stopGeneration, isLoading, isStreaming } = chat;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const [lang, setLang] = useState("es");

  useEffect(() => {
    const current = localStorage.getItem("spp_lang") || "es";
    setLang(current);
  }, []);

  // 1. Accessibility: Focus management on Mount
  useEffect(() => {
    const inputEl = document.getElementById("spp-chat-input");
    inputEl?.focus();

    // ESC closes chatbot
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 2. Custom Scroll Check
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    // Check if user is within 40px of the bottom
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= 40;
  };

  // Scroll to bottom if user is already at the bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  // 3. Send Message
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    const messageText = input;
    setInput("");
    isAtBottomRef.current = true; // Force scroll to bottom on user's own sent message
    await sendMessage(messageText);
  };

  // 4. Form Textarea Keys Listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 5. Click suggestion chip
  const handleSelectQuestion = async (question: string) => {
    isAtBottomRef.current = true;
    await sendMessage(question);
  };

  return (
    <div
      className="flex flex-col bg-[#f4f4f4] border border-zinc-200/80 rounded-[2.2rem] shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right animate-fade-in z-50 text-black font-sans"
      style={{
        width: "100%",
        maxWidth: `${width}px`,
        height: `${height}px`,
        maxHeight: "calc(100vh - 100px)",
      }}
      role="dialog"
      aria-label={`${title} chat window`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Top Left: Sidebar layout icon (Clear history shortcut) */}
        <button 
          onClick={clearChat}
          className="p-1 text-black hover:text-zinc-700 transition-colors cursor-pointer"
          title="Clear conversation history"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <rect width="18" height="18" x="3" y="3" rx="2.5" />
            <path d="M9 3v18" />
          </svg>
        </button>

        {/* Top Right: Profile Gradient Avatar & Close Button */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-black shadow-sm" />
          <button
            onClick={onClose}
            className="p-1 text-black hover:text-zinc-700 transition-colors cursor-pointer"
            title="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {messages.length <= 1 ? (
        <div className="flex-1 flex flex-col justify-between px-6 pt-8 pb-4">
          <div className="my-auto flex flex-col items-center text-center">
            <h2 className="text-2xl font-black tracking-tight text-black text-center mb-3 leading-tight">
              {lang === "es" ? "¿En qué puedo ayudarte?" : "What can I help with?"}
            </h2>
            {messages.length === 1 && (
              <p className="text-xs text-black font-semibold text-center leading-relaxed max-w-xs bg-white p-3 rounded-2xl border border-zinc-200 shadow-xs mb-4">
                {messages[0].content}
              </p>
            )}
          </div>
          
          <div className="w-full flex flex-col gap-2 mb-2">
            <button
              onClick={() => handleSelectQuestion("qué servicios ofrecéis?")}
              className="bg-white text-black text-xs text-left px-5 py-3.5 rounded-2xl hover:bg-zinc-100 transition-all font-bold border border-zinc-300 shadow-xs cursor-pointer flex items-center justify-between"
            >
              <span>qué servicios ofrecéis?</span>
              <svg className="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 px-6 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 text-black font-medium"
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

      {/* Footer controls & Input area */}
      <div className="flex flex-col bg-transparent pb-2">
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

        <form onSubmit={handleSend} className="mx-6 bg-white border border-zinc-300 rounded-[1.5rem] shadow-sm p-3 flex flex-col gap-2">
          <textarea
            id="spp-chat-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === "es" ? "Pregunta lo que quieras" : "Ask anything"}
            disabled={isLoading || isStreaming}
            className="w-full text-xs bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-black font-semibold placeholder-zinc-500 resize-none font-sans min-h-[24px] max-h-24 py-1"
            aria-label="Chat input field"
          />
          
          <div className="flex items-center justify-end border-t border-zinc-100 pt-2">
            {/* Submit Arrow Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isStreaming}
              className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center hover:bg-zinc-800 disabled:opacity-20 transition-all cursor-pointer shadow-sm"
              aria-label="Send message"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
        </form>

        {/* Disclaimer */}
        <span className="text-[10px] text-black font-semibold text-center mt-1 select-none leading-normal">
          {lang === "es" 
            ? "La IA puede cometer errores. Por favor, verifica las respuestas." 
            : "AI can make mistakes. Please double-check responses."}
        </span>
      </div>
    </div>
  );
}
