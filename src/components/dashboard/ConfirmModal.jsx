"use client";

import { useState, useEffect } from "react";

export default function ConfirmModal({
  isOpen = false,
  title,
  description,
  confirmText,
  cancelText,
  confirmButtonClass = "bg-rose-600 hover:bg-rose-700 text-white",
  requireInputMatch = null,
  inputLabel = null,
  onClose,
  onConfirm,
  isProcessing = false,
  lang = "es",
}) {
  const [inputValue, setInputValue] = useState("");

  const resolvedTitle = title || (lang === "es" ? "¿Estás seguro?" : "Are you sure?");
  const resolvedDesc = description || (lang === "es" ? "Esta acción no se puede deshacer." : "This action cannot be undone.");
  const resolvedConfirm = confirmText || (lang === "es" ? "Eliminar" : "Delete");
  const resolvedCancel = (cancelText && cancelText !== "Cancelar") ? cancelText : (lang === "es" ? "Cancelar" : "Cancel");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setInputValue("");
    }
  }

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape" && !isProcessing && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const isInputValid = !requireInputMatch || inputValue.trim() === requireInputMatch.trim();

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!isInputValid || isProcessing) return;
    onConfirm?.();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing && onClose) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl animate-scale-up text-center relative text-slate-900 overflow-hidden">
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/80 flex items-center justify-center mx-auto mb-4 shadow-2xs ring-4 ring-rose-50/60">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-slate-950 text-base sm:text-lg mb-2 tracking-tight">
          {resolvedTitle}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-[13px] text-slate-500 mb-6 leading-relaxed font-sans whitespace-pre-wrap">
          {resolvedDesc}
        </p>

        {/* Strict Verification Input (if required) */}
        {requireInputMatch && (
          <form onSubmit={handleSubmit} className="mb-6 text-left">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              {inputLabel || (
                lang === "es" ? (
                  <>
                    Escribe <span className="font-mono text-rose-600 font-black">{requireInputMatch}</span> para confirmar:
                  </>
                ) : (
                  <>
                    Type <span className="font-mono text-rose-600 font-black">{requireInputMatch}</span> to confirm:
                  </>
                )
              )}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={requireInputMatch}
              autoFocus
              disabled={isProcessing}
              className="w-full h-11 px-3.5 text-xs font-mono font-bold bg-slate-50 border-2 border-slate-200 focus:border-rose-600 focus:bg-white rounded-xl outline-none transition-all placeholder:text-slate-300"
            />
            <p className="text-[10px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
              {lang === "es"
                ? "Esta operación es crítica y permanente."
                : "This operation is critical and permanent."}
            </p>
          </form>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {resolvedCancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isInputValid || isProcessing}
            className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${confirmButtonClass}`}
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{lang === "es" ? "Procesando..." : "Processing..."}</span>
              </>
            ) : (
              <span>{resolvedConfirm}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
