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
      className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right animate-fade-in z-50 text-slate-100"
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
      <div className={`flex items-center justify-between px-4 py-3.5 border-b border-slate-800 ${primaryColor}`}>
        <div className="flex items-center space-x-3">
          {logo ? (
            <div className="flex-shrink-0">
              {typeof logo === "string" ? (
                <img src={logo} alt="Logo" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                logo
              )}
            </div>
          ) : (
            <div className="w-7 h-7 bg-slate-800 border border-slate-700/60 rounded-full flex items-center justify-center text-xs font-black select-none">
              🤖
            </div>
          )}
          
          <div className="flex flex-col text-left">
            <span className="font-bold text-sm tracking-tight text-white leading-tight">{title}</span>
            {subtitle && (
              <span className="text-[10px] text-slate-400 font-semibold leading-normal">{subtitle}</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Clear Session History */}
          <button
            onClick={clearChat}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Clear Chat History"
            aria-label="Clear conversation history"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Close Panel */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Close Chat"
            aria-label="Close chat window"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages viewport */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto bg-slate-950/20 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {messages.map((msg, index) => (
          <Message key={index} message={msg} accentColor={accentColor} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <TypingIndicator />
          </div>
        )}

        {/* Suggested Questions (only displayed on fresh conversation session) */}
        {messages.length === 1 && !isLoading && !isStreaming && suggestedQuestions.length > 0 && (
          <SuggestedQuestions questions={suggestedQuestions} onSelect={handleSelectQuestion} />
        )}
      </div>

      {/* Footer controls & Input area */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col space-y-2">
        
        {/* Stop Generating (displays only while streaming response tokens) */}
        {isStreaming && (
          <div className="flex justify-center mb-1">
            <button
              onClick={stopGeneration}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-full text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 bg-rose-500 rounded" />
              <span>Stop Generating</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <textarea
            id="spp-chat-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Type a message..."}
            disabled={isLoading || isStreaming}
            className="flex-1 max-h-24 min-h-[38px] px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 text-slate-100 placeholder-slate-500 resize-none font-sans"
            aria-label="Chat input field"
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isStreaming}
            className={`p-2 rounded-xl text-white ${accentColor} disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all cursor-pointer`}
            aria-label="Send message"
          >
            <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
