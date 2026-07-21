import React from "react";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ questions, onSelect }) => {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-3.5 px-1.5 select-none animate-fade-in">
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-[11px] font-bold text-black rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          {q}
        </button>
      ))}
    </div>
  );
};
