"use client";

import React, { useState, useEffect } from "react";
import { ChatWindow } from "./ChatWindow";
import { useChat } from "./useChat";
import { ChatbotProps } from "./types";

export const Chatbot: React.FC<ChatbotProps> = ({
  websiteId = "spplabs.es",
  title = "SPP Labs Support",
  subtitle = "AI Chat Assistant",
  logo,
  welcomeMessage = "Hi! 👋 How can I help you today?",
  placeholder = "Ask me anything...",
  primaryColor = "bg-white",
  accentColor = "bg-slate-900",
  launcherIcon,
  suggestedQuestions = ["Services", "Pricing", "AI Chatbots", "Contact"],
  position = "bottom-left",
  width = 380,
  height = 620,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Resolve client-side configuration variables
  const resolvedApiKey = process.env.NEXT_PUBLIC_SPP_API_KEY || "";
  const resolvedWebsiteId = process.env.NEXT_PUBLIC_WEBSITE_ID || websiteId;

  const chat = useChat(resolvedWebsiteId, resolvedApiKey, welcomeMessage);
  const { messages } = chat;

  // Trigger unread indicator dot if messages list changes while chat is closed
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasUnread(true);
    }
  }, [messages.length, isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const positionClasses = position === "bottom-left" ? "bottom-5 left-5 items-start" : "bottom-5 right-5 items-end";

  return (
    <div className={`fixed z-50 flex flex-col space-y-4 font-sans ${positionClasses}`}>
      
      {/* Active Chat Interface Panel */}
      {isOpen && (
        <ChatWindow
          title={title}
          subtitle={subtitle}
          logo={logo}
          placeholder={placeholder}
          primaryColor={primaryColor}
          accentColor={accentColor}
          suggestedQuestions={suggestedQuestions}
          width={width}
          height={height}
          chat={chat}
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* Floating Action Button (Launcher) */}
      <button
        onClick={handleToggle}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-white focus:outline-none hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${accentColor}`}
        aria-label="Toggle chat assistant"
        aria-expanded={isOpen}
      >
        {/* Unread indicator dot badge */}
        {hasUnread && !isOpen && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border border-slate-900"></span>
          </span>
        )}

        {isOpen ? (
          // Close Icon
          <svg className="w-6 h-6 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : launcherIcon ? (
          // Custom Icon
          <div className="animate-fade-in">{launcherIcon}</div>
        ) : (
          // Chat Icon
          <svg className="w-6 h-6 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
};
