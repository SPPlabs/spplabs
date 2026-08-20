"use client";

import { useState, useMemo } from "react";
import {
  DocumentTextIcon,
  UsersIcon,
  UserCheckIcon,
  BriefcaseIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  TrashIcon,
  CloseIcon,
} from "@/components/dashboard/DashboardIcons";

export default function NotasTab({
  t,
  lang,
  initialNotes = [],
  currentWebsite,
  router,
}) {
  const isEs = lang === "es";

  // Notes state
  const [notes, setNotes] = useState(initialNotes);
  const [activeTypeFilter, setActiveTypeFilter] = useState("ALL"); // "ALL" | "NOTE" | "CLIENT" | "STAFF"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState("ALL"); // "ALL" or tag string

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form Fields
  const [formType, setFormType] = useState("NOTE"); // "NOTE" | "CLIENT" | "STAFF"
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formTag, setFormTag] = useState("General");
  const [formColor, setFormColor] = useState("slate");
  const [formPinned, setFormPinned] = useState(false);

  // Preset options
  const defaultTags = [
    "General",
    isEs ? "Urgente" : "Urgent",
    isEs ? "Idea" : "Idea",
    isEs ? "En progreso" : "In Progress",
    isEs ? "Importante" : "Important",
    isEs ? "Completado" : "Completed",
  ];

  const colorOptions = [
    { id: "slate", label: isEs ? "Gris Neutro" : "Slate", bg: "bg-slate-100", border: "border-slate-300", ring: "ring-slate-400" },
    { id: "blue", label: isEs ? "Azul" : "Blue", bg: "bg-blue-100", border: "border-blue-300", ring: "ring-blue-500" },
    { id: "indigo", label: isEs ? "Índigo" : "Indigo", bg: "bg-indigo-100", border: "border-indigo-300", ring: "ring-indigo-500" },
    { id: "emerald", label: isEs ? "Verde" : "Emerald", bg: "bg-emerald-100", border: "border-emerald-300", ring: "ring-emerald-500" },
    { id: "amber", label: isEs ? "Ámbar / Oro" : "Amber", bg: "bg-amber-100", border: "border-amber-300", ring: "ring-amber-500" },
    { id: "rose", label: isEs ? "Rojo / Rosa" : "Rose", bg: "bg-rose-100", border: "border-rose-300", ring: "ring-rose-500" },
    { id: "purple", label: isEs ? "Púrpura" : "Purple", bg: "bg-purple-100", border: "border-purple-300", ring: "ring-purple-500" },
  ];

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: notes.length,
      note: notes.filter((n) => n.type === "NOTE").length,
      client: notes.filter((n) => n.type === "CLIENT").length,
      staff: notes.filter((n) => n.type === "STAFF").length,
    };
  }, [notes]);

  // Unique tags for filter bar
  const availableTags = useMemo(() => {
    const set = new Set();
    notes.forEach((n) => {
      if (n.tag && n.tag.trim()) set.add(n.tag.trim());
    });
    return Array.from(set);
  }, [notes]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Type filter
      if (activeTypeFilter !== "ALL" && note.type !== activeTypeFilter) {
        return false;
      }
      // Tag filter
      if (selectedTagFilter !== "ALL" && note.tag !== selectedTagFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = note.title?.toLowerCase().includes(q);
        const inContent = note.content?.toLowerCase().includes(q);
        const inEmail = note.email?.toLowerCase().includes(q);
        const inPhone = note.phone?.toLowerCase().includes(q);
        const inRole = note.role?.toLowerCase().includes(q);
        const inTag = note.tag?.toLowerCase().includes(q);
        if (!inTitle && !inContent && !inEmail && !inPhone && !inRole && !inTag) {
          return false;
        }
      }
      return true;
    });
  }, [notes, activeTypeFilter, selectedTagFilter, searchQuery]);

  // Open creation modal
  const handleOpenCreate = (preselectedType = "NOTE") => {
    setIsEditing(false);
    setEditingNoteId(null);
    setFormType(preselectedType);
    setFormTitle("");
    setFormContent("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("");
    setFormTag("General");
    setFormColor(preselectedType === "CLIENT" ? "blue" : preselectedType === "STAFF" ? "emerald" : "slate");
    setFormPinned(false);
    setIsFormModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (note, e) => {
    if (e) e.stopPropagation();
    setIsEditing(true);
    setEditingNoteId(note.id);
    setFormType(note.type || "NOTE");
    setFormTitle(note.title || "");
    setFormContent(note.content || "");
    setFormEmail(note.email || "");
    setFormPhone(note.phone || "");
    setFormRole(note.role || "");
    setFormTag(note.tag || "General");
    setFormColor(note.color || "slate");
    setFormPinned(Boolean(note.pinned));
    if (viewingNote) setViewingNote(null);
    setIsFormModalOpen(true);
  };

  // Submit create or edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        domain: currentWebsite.domain,
        type: formType,
        title: formTitle.trim(),
        content: formContent.trim(),
        email: formEmail.trim() || null,
        phone: formPhone.trim() || null,
        role: formRole.trim() || null,
        tag: formTag.trim() || "General",
        color: formColor,
        pinned: formPinned,
      };

      if (isEditing && editingNoteId) {
        payload.id = editingNoteId;
        const res = await fetch("/api/admin/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setNotes((prev) => prev.map((n) => (n.id === editingNoteId ? data.note : n)));
          setIsFormModalOpen(false);
          router.refresh();
        } else {
          alert(data.message || "Error al actualizar la nota");
        }
      } else {
        const res = await fetch("/api/admin/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setNotes((prev) => [data.note, ...prev]);
          setIsFormModalOpen(false);
          router.refresh();
        } else {
          alert(data.message || "Error al crear la nota");
        }
      }
    } catch (err) {
      console.error("Save note error:", err);
      alert("Error al guardar la nota");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Pin directly from card
  const handleTogglePin = async (note, e) => {
    if (e) e.stopPropagation();
    try {
      const newPinned = !note.pinned;
      const res = await fetch("/api/admin/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: note.id,
          pinned: newPinned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, pinned: newPinned } : n)));
        if (viewingNote && viewingNote.id === note.id) {
          setViewingNote((prev) => ({ ...prev, pinned: newPinned }));
        }
      }
    } catch (err) {
      console.error("Pin toggle error:", err);
    }
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    try {
      const res = await fetch(`/api/admin/notes?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        if (viewingNote?.id === id) setViewingNote(null);
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        alert(data.message || "Error al eliminar");
      }
    } catch (err) {
      console.error("Delete note error:", err);
      alert("Error al eliminar la nota");
    }
  };

  // Helper styles based on color & type
  const getCardColorClasses = (color) => {
    const base = "bg-white transition-all duration-200";
    switch (color) {
      case "blue":
        return `${base} border-blue-200/90 hover:border-blue-400 hover:shadow-blue-500/5`;
      case "indigo":
        return `${base} border-indigo-200/90 hover:border-indigo-400 hover:shadow-indigo-500/5`;
      case "emerald":
        return `${base} border-emerald-200/90 hover:border-emerald-400 hover:shadow-emerald-500/5`;
      case "amber":
        return `${base} border-amber-200/90 hover:border-amber-400 hover:shadow-amber-500/5`;
      case "rose":
        return `${base} border-rose-200/90 hover:border-rose-400 hover:shadow-rose-500/5`;
      case "purple":
        return `${base} border-purple-200/90 hover:border-purple-400 hover:shadow-purple-500/5`;
      default:
        return `${base} border-slate-200 hover:border-slate-350 hover:shadow-slate-500/5`;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "CLIENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <UsersIcon className="w-3 h-3 text-blue-600" />
            <span>{isEs ? "Cliente" : "Client"}</span>
          </span>
        );
      case "STAFF":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheckIcon className="w-3 h-3 text-emerald-600" />
            <span>{isEs ? "Equipo" : "Staff"}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            <DocumentTextIcon className="w-3 h-3 text-indigo-600" />
            <span>{isEs ? "Nota" : "Note"}</span>
          </span>
        );
    }
  };

  const getTagBadge = (tag) => {
    if (!tag) return null;
    let colorClass = "bg-slate-100 text-slate-700 border-slate-200";
    const lower = tag.toLowerCase();
    if (lower.includes("urgente") || lower.includes("urgent")) {
      colorClass = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
    } else if (lower.includes("idea")) {
      colorClass = "bg-amber-50 text-amber-700 border-amber-200 font-bold";
    } else if (lower.includes("progreso") || lower.includes("progress")) {
      colorClass = "bg-blue-50 text-blue-700 border-blue-200 font-bold";
    } else if (lower.includes("importante") || lower.includes("important")) {
      colorClass = "bg-purple-50 text-purple-700 border-purple-200 font-bold";
    } else if (lower.includes("completado") || lower.includes("completed")) {
      colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
    }

    return (
      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${colorClass}`}>
        #{tag}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-full">
      {/* Header & Primary Action Bar */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                {isEs ? "Notas y Directorio" : "Notes & Directory"}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed font-medium">
              {isEs
                ? "Libreta unificada para apuntes rápidos, fichas de clientes y notas de empleados o equipo de trabajo."
                : "Unified notebook for quick notes, client records, and team staff memos."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenCreate("NOTE")}
              className="px-5 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>{isEs ? "Nueva Nota" : "New Note"}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search Input */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTypeFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTypeFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {isEs ? "Todo" : "All"} ({counts.all})
            </button>

            <button
              type="button"
              onClick={() => setActiveTypeFilter("NOTE")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTypeFilter === "NOTE"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-50/60 border border-indigo-200/60 text-indigo-700 hover:bg-indigo-100/60"
              }`}
            >
              <DocumentTextIcon className="w-3.5 h-3.5" />
              <span>{isEs ? "Notas" : "Notes"} ({counts.note})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTypeFilter("CLIENT")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTypeFilter === "CLIENT"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-blue-50/60 border border-blue-200/60 text-blue-700 hover:bg-blue-100/60"
              }`}
            >
              <UsersIcon className="w-3.5 h-3.5" />
              <span>{isEs ? "Clientes" : "Clients"} ({counts.client})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTypeFilter("STAFF")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTypeFilter === "STAFF"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50/60 border border-emerald-200/60 text-emerald-700 hover:bg-emerald-100/60"
              }`}
            >
              <UserCheckIcon className="w-3.5 h-3.5" />
              <span>{isEs ? "Equipo" : "Staff"} ({counts.staff})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEs ? "Buscar nota, cliente o empleado..." : "Search note, client or staff..."}
              className="w-full h-10 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all shadow-2xs"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer text-xs"
                aria-label="Limpiar búsqueda"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Optional Tag Filter Row (if tags exist) */}
        {availableTags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              {isEs ? "Etiquetas:" : "Tags:"}
            </span>
            <button
              type="button"
              onClick={() => setSelectedTagFilter("ALL")}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                selectedTagFilter === "ALL"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isEs ? "Todas" : "All"}
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                  selectedTagFilter === tag
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Notes */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {isEs ? "No hay notas que coincidan" : "No matching notes"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            {isEs
              ? "Crea una nueva nota general, ficha de cliente o miembro del equipo para empezar a organizar tu trabajo."
              : "Create a new general note, client record or staff member to start organizing your work."}
          </p>
          <button
            type="button"
            onClick={() => handleOpenCreate(activeTypeFilter === "ALL" ? "NOTE" : activeTypeFilter)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>+</span>
            <span>{isEs ? "Crear Primera Entrada" : "Create First Entry"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredNotes.map((note) => {
            const cardClasses = getCardColorClasses(note.color);
            const isPinned = Boolean(note.pinned);

            return (
              <div
                key={note.id}
                onClick={() => setViewingNote(note)}
                className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between cursor-pointer group hover:shadow-md relative ${cardClasses}`}
              >
                {/* Top Row: Type Badge, Tag & Action Icons */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getTypeBadge(note.type)}
                      {getTagBadge(note.tag)}
                      {isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                          <PinIcon className="w-2.5 h-2.5 text-amber-700" />
                          <span>{isEs ? "Fijada" : "Pinned"}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Pin Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(note, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isPinned
                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                        title={isPinned ? (isEs ? "Desfijar nota" : "Unpin note") : (isEs ? "Fijar al inicio" : "Pin to top")}
                      >
                        <PinIcon className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(note, e)}
                        className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title={isEs ? "Editar" : "Edit"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(note.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={isEs ? "Eliminar" : "Delete"}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title / Name */}
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1.5 leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
                    {note.title}
                  </h4>

                  {/* Contact / Role metadata (if Client or Staff) */}
                  {(note.role || note.email || note.phone) && (
                    <div className="space-y-1 mb-3 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                      {note.role && (
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <BriefcaseIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate">{note.role}</span>
                        </div>
                      )}
                      {note.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                          <MailIcon className="w-3.5 h-3.5 text-slate-400" />
                          <a
                            href={`mailto:${note.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline hover:text-brand-blue truncate"
                          >
                            {note.email}
                          </a>
                        </div>
                      )}
                      {note.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                          <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                          <a
                            href={`tel:${note.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline hover:text-brand-blue truncate"
                          >
                            {note.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content Preview */}
                  {note.content && (
                    <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3 mb-4 whitespace-pre-line">
                      {note.content}
                    </p>
                  )}
                </div>

                {/* Footer: Timestamp */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>
                    {new Date(note.updatedAt || note.createdAt).toLocaleString(isEs ? "es-ES" : "en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-slate-400 group-hover:text-brand-blue font-sans font-bold text-[11px] transition-colors">
                    {isEs ? "Ver detalle →" : "View →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isEditing
                    ? isEs ? "Editar Entrada" : "Edit Entry"
                    : isEs ? "Nueva Entrada en Libreta" : "New Entry"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEs ? "Elige el tipo de ficha y completa los datos." : "Choose entry type and fill details."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                aria-label="Cerrar modal"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Type Switcher */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {isEs ? "Tipo de Entrada" : "Entry Type"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("NOTE");
                      if (formColor === "slate") setFormColor("slate");
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      formType === "NOTE"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>{isEs ? "Nota" : "Note"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType("CLIENT");
                      if (formColor === "slate") setFormColor("blue");
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      formType === "CLIENT"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <UsersIcon className="w-4 h-4" />
                    <span>{isEs ? "Cliente" : "Client"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType("STAFF");
                      if (formColor === "slate") setFormColor("emerald");
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      formType === "STAFF"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <UserCheckIcon className="w-4 h-4" />
                    <span>{isEs ? "Equipo" : "Staff"}</span>
                  </button>
                </div>
              </div>

              {/* Title / Name Field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {formType === "NOTE"
                    ? isEs ? "Título de la Nota *" : "Note Title *"
                    : formType === "CLIENT"
                    ? isEs ? "Nombre del Cliente / Empresa *" : "Client / Company Name *"
                    : isEs ? "Nombre del Empleado *" : "Staff Member Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={
                    formType === "NOTE"
                      ? isEs ? "Ej. Plan de lanzamiento Septiembre" : "e.g. September launch roadmap"
                      : formType === "CLIENT"
                      ? isEs ? "Ej. Carlos Ruiz (Clínica Dental)" : "e.g. Carlos Ruiz (Dental Clinic)"
                      : isEs ? "Ej. Marcos García" : "e.g. Mark Johnson"
                  }
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>

              {/* Dynamic Metadata Fields for Client & Staff */}
              {formType !== "NOTE" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      {formType === "CLIENT"
                        ? isEs ? "Empresa o Cargo" : "Company / Position"
                        : isEs ? "Puesto o Rol" : "Job Role / Department"}
                    </label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder={
                        formType === "CLIENT"
                          ? isEs ? "Ej. Director Ejecutivo / Cliente VIP" : "e.g. CEO / VIP Client"
                          : isEs ? "Ej. Desarrollador Frontend" : "e.g. Frontend Developer"
                      }
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      {isEs ? "Teléfono" : "Phone"}
                    </label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+34 600 000 000"
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      {isEs ? "Correo Electrónico" : "Email Address"}
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="contacto@ejemplo.es"
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Content Textarea */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {formType === "NOTE"
                    ? isEs ? "Contenido / Apuntes" : "Content / Notes"
                    : formType === "CLIENT"
                    ? isEs ? "Notas del Cliente / Historial / Acuerdos" : "Client Notes / Deal Status / History"
                    : isEs ? "Observaciones / Tareas Asignadas" : "Staff Notes / Assigned Tasks"}
                </label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder={
                    isEs
                      ? "Escribe aquí cualquier apunte, información relevante, enlaces o tareas pendientes..."
                      : "Write any notes, important details, links or pending tasks..."
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all leading-relaxed font-sans"
                />
              </div>

              {/* Tag & Color Chooser */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                {/* Tag Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {isEs ? "Etiqueta" : "Tag"}
                  </label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="General, Urgente, Idea..."
                    list="tag-options"
                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white"
                  />
                  <datalist id="tag-options">
                    {defaultTags.map((dt) => (
                      <option key={dt} value={dt} />
                    ))}
                  </datalist>
                </div>

                {/* Color Chooser */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {isEs ? "Color de la Ficha" : "Card Accent Color"}
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {colorOptions.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setFormColor(col.id)}
                        className={`w-6 h-6 rounded-full ${col.bg} ${col.border} border transition-all cursor-pointer ${
                          formColor === col.id ? `ring-2 ${col.ring} scale-110 shadow-xs` : "hover:scale-105"
                        }`}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Pin Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <PinIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isEs ? "Fijar al inicio" : "Pin to top"}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isEs ? "Mantiene esta nota siempre en los primeros puestos." : "Keep this note at the top of the list."}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formPinned}
                  onChange={(e) => setFormPinned(e.target.checked)}
                  className="w-4 h-4 text-brand-blue rounded border-slate-300 cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {isEs ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formTitle.trim()}
                  className="px-6 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>{isEs ? "Guardar Nota" : "Save Note"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {viewingNote && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTypeBadge(viewingNote.type)}
                {getTagBadge(viewingNote.tag)}
                {viewingNote.pinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                    <PinIcon className="w-2.5 h-2.5 text-amber-700" />
                    <span>{isEs ? "Fijada" : "Pinned"}</span>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setViewingNote(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                aria-label="Cerrar modal"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <h2 className="text-xl font-black text-slate-950 leading-snug">
                {viewingNote.title}
              </h2>

              {/* Metadata Box if Client / Staff */}
              {(viewingNote.role || viewingNote.email || viewingNote.phone) && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
                  {viewingNote.role && (
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <BriefcaseIcon className="w-4 h-4 text-slate-500" />
                      <span>{viewingNote.role}</span>
                    </div>
                  )}
                  {viewingNote.email && (
                    <div className="flex items-center gap-2 text-slate-600 font-mono">
                      <MailIcon className="w-4 h-4 text-slate-400" />
                      <a href={`mailto:${viewingNote.email}`} className="text-brand-blue hover:underline">
                        {viewingNote.email}
                      </a>
                    </div>
                  )}
                  {viewingNote.phone && (
                    <div className="flex items-center gap-2 text-slate-600 font-mono">
                      <PhoneIcon className="w-4 h-4 text-slate-400" />
                      <a href={`tel:${viewingNote.phone}`} className="text-brand-blue hover:underline">
                        {viewingNote.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Full Content */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  {isEs ? "Contenido y Observaciones" : "Content & Notes"}
                </span>
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {viewingNote.content || (
                    <span className="text-slate-400 italic">
                      {isEs ? "Sin contenido de texto adicional." : "No additional text content."}
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 flex justify-between">
                <span>
                  {isEs ? "Creado: " : "Created: "}
                  {new Date(viewingNote.createdAt).toLocaleString(isEs ? "es-ES" : "en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>
                  {isEs ? "Actualizado: " : "Updated: "}
                  {new Date(viewingNote.updatedAt || viewingNote.createdAt).toLocaleString(isEs ? "es-ES" : "en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(viewingNote.id)}
                className="px-3.5 py-2 text-rose-600 hover:bg-rose-100/70 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <TrashIcon className="w-4 h-4" />
                <span>{isEs ? "Eliminar" : "Delete"}</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(viewingNote)}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  <span>{isEs ? "Editar" : "Edit"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scale-up text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              {isEs ? "¿Eliminar esta entrada?" : "Delete this entry?"}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {isEs
                ? "Esta acción no se puede deshacer. La nota se borrará permanentemente."
                : "This action cannot be undone. The note will be permanently deleted."}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {isEs ? "Cancelar" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteNote(deleteConfirmId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isEs ? "Eliminar" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
