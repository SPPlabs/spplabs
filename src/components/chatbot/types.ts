import { ReactNode } from "react";

export interface MessageType {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string; // Display formatted timestamp
}

export interface ChatbotProps {
  websiteId?: string;
  title?: string;
  subtitle?: string;
  logo?: string | ReactNode;
  welcomeMessage?: string;
  placeholder?: string;
  primaryColor?: string; // Tailwind background class for primary theme (e.g. "bg-slate-900")
  accentColor?: string;  // Tailwind background class for hover/accents (e.g. "bg-indigo-600")
  launcherIcon?: ReactNode;
  suggestedQuestions?: string[];
  position?: "bottom-right" | "bottom-left";
  width?: number;  // Chat window width in pixels
  height?: number; // Chat window height in pixels
}
