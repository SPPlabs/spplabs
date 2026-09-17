"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  MegaphoneIcon,
  InboxIcon,
  ChatBubbleIcon,
  UsersIcon,
  CheckIcon,
  GlobeAltIcon,
} from "@/components/dashboard/DashboardIcons";

export default function NotificationsTab({
  t,
  lang,
  currentWebsite,
  session,
  isImpersonating,
  allWebsites,
  handleSendAnnouncement,
  announcementTitle,
  setAnnouncementTitle,
  announcementMsg,
  setAnnouncementMsg,
  announcementTargetId,
  setAnnouncementTargetId,
  announcementSuccess,
  announcementSending,
  announcementsList,
  handleDeleteAnnouncement,
  petitionsList,
  handleDeletePetition,
  handleSendPetition,
  petitionMsg,
  setPetitionMsg,
  petitionSending,
}) {
  // SPP Labs Custom Dropdown State for Target Users
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const [targetSearchQuery, setTargetSearchQuery] = useState("");
  const targetDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (targetDropdownRef.current && !targetDropdownRef.current.contains(e.target)) {
        setIsTargetDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsTargetDropdownOpen(false);
      }
    };

    if (isTargetDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTargetDropdownOpen]);

  // Selected website helper
  const selectedTargetWebsite = useMemo(() => {
    if (!announcementTargetId) return null;
    return (allWebsites || []).find((w) => w.id === announcementTargetId) || null;
  }, [announcementTargetId, allWebsites]);

  // Filtered client websites
  const filteredClientWebsites = useMemo(() => {
    const clients = (allWebsites || []).filter((w) => w.domain !== "spplabs.es");
    if (!targetSearchQuery.trim()) return clients;
    const q = targetSearchQuery.toLowerCase().trim();
    return clients.filter(
      (w) =>
        (w.displayName && w.displayName.toLowerCase().includes(q)) ||
        (w.domain && w.domain.toLowerCase().includes(q))
    );
  }, [allWebsites, targetSearchQuery]);

  return (
    <div className="space-y-10 animate-fade-in w-full max-w-full">
      {/* ADMIN VIEW: Send Notifications Form */}
      {currentWebsite.domain === "spplabs.es" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MegaphoneIcon className="w-4.5 h-4.5" />
              </span>
              <span>{t.adminNotifTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t.adminNotifDesc}</p>
          </div>

          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">{t.adminNotifSubject}</label>
              <input
                type="text"
                required
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder={lang === "es" ? "Ej: Mantenimiento programado de base de datos" : "E.g.: Scheduled database maintenance"}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">{t.adminNotifMessage}</label>
              <textarea
                required
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                placeholder={lang === "es" ? "Escriba aquí los detalles del comunicado..." : "Write announcement details here..."}
                className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs resize-none focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* SPP Labs Custom Dropdown: Target Selection */}
            <div className="relative" ref={targetDropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {t.adminNotifTarget}
              </label>

              {/* Hidden input to ensure form consistency */}
              <input type="hidden" name="announcementTargetId" value={announcementTargetId} />

              {/* SPP Labs Trigger Button */}
              <button
                type="button"
                onClick={() => setIsTargetDropdownOpen((prev) => !prev)}
                className={`w-full min-h-[46px] bg-slate-50 hover:bg-slate-100/80 border rounded-xl px-3.5 py-2 flex items-center justify-between text-xs transition-all cursor-pointer focus:outline-none focus:bg-white shadow-2xs ${
                  isTargetDropdownOpen
                    ? "border-blue-600 ring-2 ring-blue-600/15 bg-white"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                aria-haspopup="listbox"
                aria-expanded={isTargetDropdownOpen}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  {selectedTargetWebsite ? (
                    <>
                      {selectedTargetWebsite.logoUrl ? (
                        <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white relative">
                          <Image
                            src={selectedTargetWebsite.logoUrl}
                            alt=""
                            fill
                            className="object-contain p-0.5"
                            sizes="24px"
                          />
                        </div>
                      ) : (
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-blue-200">
                          {selectedTargetWebsite.displayName?.slice(0, 2).toUpperCase() || "CL"}
                        </span>
                      )}
                      <span className="font-bold text-slate-900 truncate">
                        {selectedTargetWebsite.displayName}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded shrink-0">
                        {selectedTargetWebsite.domain}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                        <UsersIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-bold text-slate-900 truncate">
                        {lang === "es" ? "Todos los usuarios (Global)" : "All users (Global)"}
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded shrink-0">
                        {lang === "es" ? "Difusión General" : "Broadcast"}
                      </span>
                    </>
                  )}
                </div>

                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                    isTargetDropdownOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* SPP Labs Floating Menu */}
              {isTargetDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2.5 z-50 animate-fade-in flex flex-col max-w-full">
                  {/* Search / Filter Inside Dropdown */}
                  <div className="relative mb-2">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={targetSearchQuery}
                      onChange={(e) => setTargetSearchQuery(e.target.value)}
                      placeholder={lang === "es" ? "Buscar por cliente o dominio..." : "Search by client or domain..."}
                      className="w-full h-8.5 pl-8 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                    <svg
                      className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    {targetSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTargetSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Option: Global Broadcast */}
                  {(!targetSearchQuery.trim() ||
                    "todos los usuarios global broadcast".includes(targetSearchQuery.toLowerCase())) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAnnouncementTargetId("");
                        setIsTargetDropdownOpen(false);
                        setTargetSearchQuery("");
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                        !announcementTargetId
                          ? "bg-purple-50/80 border border-purple-200 text-purple-900 font-bold"
                          : "hover:bg-slate-50 border border-transparent text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          !announcementTargetId ? "bg-purple-200/80 text-purple-800 border-purple-300" : "bg-purple-100 text-purple-700 border-purple-200"
                        }`}>
                          <UsersIcon className="w-4 h-4" />
                        </span>
                        <div className="truncate">
                          <span className="font-bold text-xs block text-slate-900">
                            {lang === "es" ? "Todos los usuarios (Global)" : "All users (Global)"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {lang === "es" ? "Visible en el dashboard de todos los clientes" : "Visible on all client dashboards"}
                          </span>
                        </div>
                      </div>

                      {!announcementTargetId && (
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 ml-2 shadow-2xs">
                          <CheckIcon className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  )}

                  {/* Section Divider */}
                  <div className="my-1.5 border-t border-slate-100 flex items-center justify-between px-2 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {lang === "es" ? "Clientes registrados" : "Registered clients"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">
                      {filteredClientWebsites.length}
                    </span>
                  </div>

                  {/* Client Websites List */}
                  <div className="max-h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {filteredClientWebsites.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400 font-medium">
                        {lang === "es" ? "No se encontraron clientes con esa búsqueda" : "No clients match your search"}
                      </div>
                    ) : (
                      filteredClientWebsites.map((w) => {
                        const isSelected = announcementTargetId === w.id;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              setAnnouncementTargetId(w.id);
                              setIsTargetDropdownOpen(false);
                              setTargetSearchQuery("");
                            }}
                            className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-blue-50/80 border border-blue-200 text-blue-900 font-bold"
                                : "hover:bg-slate-50 border border-transparent text-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 truncate">
                              {w.logoUrl ? (
                                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white relative">
                                  <Image
                                    src={w.logoUrl}
                                    alt=""
                                    fill
                                    className="object-contain p-0.5"
                                    sizes="28px"
                                  />
                                </div>
                              ) : (
                                <span className={`w-7 h-7 rounded-lg font-extrabold text-[10px] flex items-center justify-center shrink-0 border ${
                                  isSelected ? "bg-blue-200/80 text-blue-800 border-blue-300" : "bg-blue-100 text-blue-700 border-blue-200"
                                }`}>
                                  {w.displayName?.slice(0, 2).toUpperCase() || "CL"}
                                </span>
                              )}
                              <div className="truncate">
                                <span className="font-bold text-xs block text-slate-900 truncate">
                                  {w.displayName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 block truncate">
                                  {w.domain}
                                </span>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-2 shadow-2xs">
                                <CheckIcon className="w-3 h-3" />
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {announcementSuccess && (
              <div className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                {t.adminNotifSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={announcementSending}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {announcementSending ? (lang === "es" ? "Publicando..." : "Publishing...") : t.adminNotifButton}
            </button>
          </form>
        </div>
      )}

      {/* Announcements received Board */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200/80">
          <div>
            <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MegaphoneIcon className="w-4.5 h-4.5" />
              </span>
              <span>{t.notifAnnouncements}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t.notifSubtitle}</p>
          </div>
          <span className="bg-slate-100 text-slate-950 text-xs px-3 py-1 rounded-full font-bold border border-slate-200 font-sans tabular-nums self-start sm:self-auto">
            {announcementsList.length} {lang === "es" ? "publicados" : "published"}
          </span>
        </div>

        {announcementsList.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-xs italic font-medium shadow-xs">
            {t.notifNoAnnouncements}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcementsList.map((ann) => (
              <div key={ann.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-950">{ann.title}</span>
                      {session.domain === "spplabs.es" && !isImpersonating && (
                        ann.websiteId ? (
                          <span className="bg-blue-50 text-blue-700 text-[10px] px-2.5 py-0.5 rounded-md font-bold border border-blue-200/60">
                            {lang === "es" ? "Para: " : "To: "}{ann.targetDisplayName || ann.targetDomain || (lang === "es" ? "Cliente" : "Client")}
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-md font-bold border border-emerald-200/60">
                            {lang === "es" ? "Global" : "Global"}
                          </span>
                        )
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans tabular-nums font-semibold shrink-0">
                      {new Date(ann.createdAt).toLocaleDateString(lang === "es" ? "es-ES" : "en-US")}
                    </span>
                  </div>
                  <div className="bg-slate-50/80 border-l-3 border-purple-500 rounded-r-xl p-3.5 text-xs text-slate-700 leading-relaxed font-sans mb-3">
                    {ann.message}
                  </div>
                </div>

                {session.domain === "spplabs.es" && !isImpersonating && (
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      {lang === "es" ? "Eliminar" : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PETITIONS SECTION */}
      <div className="pt-2 border-t border-slate-200/80">
        {currentWebsite.domain === "spplabs.es" ? (
          /* ADMIN INBOX VIEW */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200/80">
              <div>
                <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <InboxIcon className="w-4.5 h-4.5" />
                  </span>
                  <span>{lang === "es" ? "Peticiones y Solicitudes de Clientes" : "Client Support Petitions Inbox"}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {lang === "es" ? "Mensajes directos y solicitudes de soporte enviados por los clientes" : "Direct petitions and support requests sent by clients"}
                </p>
              </div>
              <span className="bg-slate-100 text-slate-950 text-xs px-3 py-1 rounded-full font-bold border border-slate-200 font-sans tabular-nums self-start sm:self-auto">
                {petitionsList.length} {lang === "es" ? "peticiones" : "petitions"}
              </span>
            </div>

            {petitionsList.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-xs italic font-medium shadow-xs">
                {lang === "es" ? "No hay peticiones de clientes pendientes en la base de datos." : "No client support petitions received yet."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {petitionsList.map((pet) => (
                  <div key={pet.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                            <ChatBubbleIcon className="w-4 h-4 text-blue-600" />
                          </span>
                          <div>
                            <span className="font-extrabold text-sm text-slate-950 block">{pet.displayName || pet.domain}</span>
                            <span className="text-[10px] font-mono font-semibold text-blue-600 block">{pet.domain}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-sans tabular-nums font-bold shrink-0">
                          {new Date(pet.createdAt).toLocaleString(lang === "es" ? "es-ES" : "en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="bg-slate-50/80 border-l-3 border-blue-500 rounded-r-xl p-3.5 text-xs text-slate-800 leading-relaxed font-sans mb-3">
                        {pet.message}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleDeletePetition(pet.id)}
                        className="text-rose-600 hover:bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        <span>{lang === "es" ? "Resolver / Marcar Leído" : "Resolve / Mark Read"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* CLIENT VIEW: Submit Support Petition Form + Sent History */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ChatBubbleIcon className="w-4.5 h-4.5" />
                </span>
                <span>{t.notifCreatePetition}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{t.notifSubtitle}</p>
            </div>

            <form onSubmit={handleSendPetition} className="space-y-4">
              <div>
                <textarea
                  required
                  value={petitionMsg}
                  onChange={(e) => setPetitionMsg(e.target.value)}
                  placeholder={t.notifPetitionPlaceholder}
                  className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={petitionSending || !petitionMsg.trim()}
                className="h-11 px-8 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {petitionSending ? t.notifSending : t.notifSendPetition}
              </button>
            </form>

            {/* Sent Petitions History List */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">{t.notifPetitionsHistory}</h4>
              {petitionsList.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">{t.notifNoPetitions}</p>
              ) : (
                <div className="space-y-3">
                  {petitionsList.map((pet) => (
                    <div key={pet.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">{pet.title || (lang === "es" ? "Petición a SPP Labs" : "Petition to SPP Labs")}</span>
                        <span className="text-[10px] text-slate-400 font-sans tabular-nums">
                          {t.notifDate}: {new Date(pet.createdAt).toLocaleDateString(lang === "es" ? "es-ES" : "en-US")}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed italic mb-3 pl-2.5 border-l-2 border-slate-300">&ldquo;{pet.message}&rdquo;</p>
                      <div className="flex justify-end pt-2 border-t border-slate-200/40">
                        <button
                          onClick={() => handleDeletePetition(pet.id)}
                          className="text-red-500 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-100"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          <span>{lang === "es" ? "Eliminar" : "Delete"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
