import React, { useState } from "react";
import { MessageType } from "./types";

interface MessageProps {
  message: MessageType;
  accentColor: string;
}

export const Message: React.FC<MessageProps> = ({ message, accentColor }) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  // Copy helper for assistant completions
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  return (
    <div className={`flex w-full mb-4 group ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        
        {/* Message Bubble Container */}
        <div className="relative flex items-start">
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isUser
                ? "bg-[#e3e3e2] text-zinc-900 rounded-tr-none border border-zinc-300/20 shadow-sm"
                : "text-zinc-850 px-1 py-1"
            }`}
          >
            {renderMarkdown(message.content)}
          </div>

          {/* Copy Button for Assistant messages */}
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="absolute -right-8 top-1 p-1 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md text-zinc-400 hover:text-zinc-650 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm cursor-pointer"
              title="Copy response"
            >
              {copied ? (
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[9px] text-zinc-400 mt-1 font-medium select-none px-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};

/**
 * Custom lightweight Markdown parser for formatting chatbot content.
 * Supports bold, italics, headers, lists, links, inline code, blocks, and tables.
 */
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      // Code block
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : "";
      const code = match ? match[2] : part.slice(3, -3);

      return (
        <pre
          key={index}
          className="bg-slate-950 text-slate-100 p-3 rounded-lg overflow-x-auto text-[10px] my-2 font-mono border border-slate-800 relative group"
        >
          {language && (
            <span className="absolute top-1.5 right-2 text-[9px] text-slate-500 font-bold uppercase tracking-wider select-none">
              {language}
            </span>
          )}
          <code>{code}</code>
        </pre>
      );
    }

    // Inline elements: split by lines to handle headers, lists, tables, etc.
    const lines = part.split("\n");
    let isInsideTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const parsedLines: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table Row Parsing
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        const cells = line
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        if (line.includes("---")) {
          // Divider line, skip
          continue;
        }

        if (!isInsideTable) {
          isInsideTable = true;
          tableHeaders = cells;
          continue;
        } else {
          tableRows.push(cells);
          continue;
        }
      }

      // Close table if we just left one
      if (isInsideTable && (!line.trim().startsWith("|") || !line.trim().endsWith("|"))) {
        isInsideTable = false;
        const currentHeaders = [...tableHeaders];
        const currentRows = [...tableRows];
        tableHeaders = [];
        tableRows = [];

        parsedLines.push(
          <div key={`table-${i}`} className="overflow-x-auto my-2 border border-slate-700/60 rounded-lg">
            <table className="min-w-full divide-y divide-slate-700/60 text-[11px] font-sans">
              <thead className="bg-slate-905">
                <tr>
                  {currentHeaders.map((h, idx) => (
                    <th key={idx} className="px-2.5 py-1.5 text-left font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {currentRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2.5 py-1.5 text-slate-300">
                        {parseInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Headings
      if (line.startsWith("# ")) {
        parsedLines.push(
          <h1 key={i} className="text-sm font-black text-black mt-3 mb-1 font-sans">
            {parseInlineMarkdown(line.slice(2))}
          </h1>
        );
        continue;
      }
      if (line.startsWith("## ")) {
        parsedLines.push(
          <h2 key={i} className="text-xs font-black text-black mt-2.5 mb-1 font-sans">
            {parseInlineMarkdown(line.slice(3))}
          </h2>
        );
        continue;
      }
      if (line.startsWith("### ")) {
        parsedLines.push(
          <h3 key={i} className="text-[11px] font-bold text-black mt-2 mb-0.5 font-sans">
            {parseInlineMarkdown(line.slice(4))}
          </h3>
        );
        continue;
      }

      // Bullet lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        parsedLines.push(
          <li key={i} className="ml-3.5 list-disc text-xs text-black font-semibold my-0.5 font-sans">
            {parseInlineMarkdown(line.trim().slice(2))}
          </li>
        );
        continue;
      }

      // Numbered lists
      const numberedMatch = line.trim().match(/^(\d+)\.\s(.*)$/);
      if (numberedMatch) {
        parsedLines.push(
          <li key={i} className="ml-3.5 list-decimal text-xs text-black font-semibold my-0.5 font-sans">
            {parseInlineMarkdown(numberedMatch[2])}
          </li>
        );
        continue;
      }

      // Blank Lines
      if (line.trim() === "") {
        parsedLines.push(<div key={i} className="h-1.5" />);
        continue;
      }

      // Normal text
      parsedLines.push(
        <p key={i} className="text-xs text-black font-semibold my-0.5 leading-relaxed font-sans">
          {parseInlineMarkdown(line)}
        </p>
      );
    }

    // Edge case: if loop ends but table is still open
    if (isInsideTable) {
      const currentHeaders = [...tableHeaders];
      const currentRows = [...tableRows];
      parsedLines.push(
        <div key="table-final" className="overflow-x-auto my-2 border border-zinc-300 rounded-lg">
          <table className="min-w-full divide-y divide-zinc-200 text-[11px] font-sans">
            <thead className="bg-zinc-100">
              <tr>
                {currentHeaders.map((h, idx) => (
                  <th key={idx} className="px-2.5 py-1.5 text-left font-bold text-black uppercase tracking-wider border-b border-zinc-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {currentRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-2.5 py-1.5 text-black font-semibold">
                      {parseInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return parsedLines;
  });
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  let parts: React.ReactNode[] = [text];

  // 1. Inline Code (ticks)
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const split = part.split(/(`[^`]+`)/g);
    return split.map((s) => {
      if (s.startsWith("`") && s.endsWith("`")) {
        return <code key={s} className="bg-zinc-100 text-black font-bold px-1 py-0.5 rounded font-mono text-[10px] border border-zinc-300">{s.slice(1, -1)}</code>;
      }
      return s;
    });
  });

  // 2. Bold (**)
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const split = part.split(/(\*\*[^*]+\*\*)/g);
    return split.map((s) => {
      if (s.startsWith("**") && s.endsWith("**")) {
        return <strong key={s} className="font-black text-black">{s.slice(2, -2)}</strong>;
      }
      return s;
    });
  });

  // 3. Italic (*)
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const split = part.split(/(\*[^*]+\*)/g);
    return split.map((s) => {
      if (s.startsWith("*") && s.endsWith("*")) {
        return <em key={s} className="italic font-bold text-black">{s.slice(1, -1)}</em>;
      }
      return s;
    });
  });

  // 4. Links: [text](url)
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const split = part.split(/(\[[^\]]+\]\([^)]+\))/g);
    return split.map((s) => {
      const match = s.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <a
            key={s}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black font-black underline transition-colors"
          >
            {match[1]}
          </a>
        );
      }
      return s;
    });
  });

  return parts;
}
