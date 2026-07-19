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
          className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-750 border border-slate-700/50 text-[10px] font-semibold text-slate-300 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          {q}
        </button>
      ))}
    </div>
  );
};
