import React from "react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1.5 px-4 py-3 bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-none max-w-[80px]">
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
};
