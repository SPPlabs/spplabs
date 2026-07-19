"use client";

import React from "react";
import dynamic from "next/dynamic";

// Asynchronously load the Chatbot component on client-side only to prevent SSR hydration mismatches
const DynamicChatbot = dynamic(
  () => import("./Chatbot").then((mod) => mod.Chatbot),
  { ssr: false }
);

interface ChatbotProviderProps {
  children?: React.ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <DynamicChatbot />
    </>
  );
};
