"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  MailIcon,
  MegaphoneIcon,
  BotIcon,
  ClockIcon,
  UserIcon,
  ClipboardIcon,
  ClipboardCheckIcon,
} from "@/components/dashboard/DashboardIcons";
import {
  copyTextToClipboard,
  formatContactToText,
  formatBookingToText,
} from "@/lib/exportUtils";

export default function OverviewTab({
  currentWebsite,
  t,
  lang,
  contactForms,
  bookings,
  conversationsList,
  announcementsList,
  setActiveTab,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const pendingBookingsCount = bookings.filter((b) => b.status === "PENDING").length;
  const recentContactsCount = contactForms.length;
  const announcementsCount = announcementsList.length;

  const handleCopyContact = async (form) => {
    const text = formatContactToText(form, lang);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedId(form.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleCopyBooking = async (b) => {
    const text = formatBookingToText(b, lang);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedId(b.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-full">
      {/* Top Header Area & KPI Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-200/80">
        <div>
          <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-slate-200 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            {currentWebsite.domain}
          </span>
          <h2 className="text-3xl font-black mt-3 text-slate-950 tracking-tight">{t.overviewTitle}</h2>
        </div>

        {/* 3 Quick KPI Counters */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto shrink-0">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center shadow-xs flex flex-col justify-center items-center min-w-[110px] sm:min-w-[130px]">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider">{t.overviewTotalContacts}</span>
            <span className="text-2xl sm:text-3xl font-black font-sans tabular-nums text-slate-950">{contactForms.length}</span>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center shadow-xs flex flex-col justify-center items-center min-w-[110px] sm:min-w-[130px]">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider">{t.overviewTotalBookings}</span>
            <span className="text-2xl sm:text-3xl font-black font-sans tabular-nums text-slate-950">{bookings.length}</span>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center shadow-xs flex flex-col justify-center items-center min-w-[110px] sm:min-w-[130px]">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider">{t.overviewTotalConversations}</span>
            <span className="text-2xl sm:text-3xl font-black font-sans tabular-nums text-slate-950">{conversationsList.length}</span>
          </div>
        </div>
      </div>

      {/* Alert Center / Novedades y Acciones Pendientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-blue"></span>
            </span>
            {lang === "es" ? "Panel de Novedades y Alertas" : "Updates & Alert Center"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Alert: Bookings */}
          <div className={`p-5 rounded-2xl border-l-4 border transition-all flex items-center gap-4 bg-white shadow-xs ${
            pendingBookingsCount > 0 
              ? "border-l-amber-500 border-slate-200/90 text-amber-900" 
              : "border-l-slate-400 border-slate-200/90 text-slate-800"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block text-slate-500">
                {lang === "es" ? "Reservas Pendientes" : "Pending Bookings"}
              </span>
              <span className="text-base font-black block mt-0.5 text-slate-900">
                {pendingBookingsCount > 0 
                  ? (lang === "es" ? `${pendingBookingsCount} por confirmar` : `${pendingBookingsCount} to confirm`)
                  : (lang === "es" ? "Todo al día" : "All caught up")
                }
              </span>
            </div>
          </div>

          {/* Alert: Contact forms */}
          <div className={`p-5 rounded-2xl border-l-4 border transition-all flex items-center gap-4 bg-white shadow-xs ${
            recentContactsCount > 0 
              ? "border-l-blue-600 border-slate-200/90 text-blue-900" 
              : "border-l-slate-400 border-slate-200/90 text-slate-800"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
              <MailIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block text-slate-500">
                {lang === "es" ? "Mensajes Nuevos (48h)" : "New Messages (48h)"}
              </span>
              <span className="text-base font-black block mt-0.5 text-slate-900">
                {recentContactsCount > 0 
                  ? (lang === "es" ? `${recentContactsCount} mensajes nuevos` : `${recentContactsCount} new messages`)
                  : (lang === "es" ? "Sin mensajes nuevos" : "No new messages")
                }
              </span>
            </div>
          </div>

          {/* Alert: Announcements */}
          <div className="p-5 rounded-2xl border-l-4 border-l-purple-600 border border-slate-200/90 text-slate-800 flex items-center gap-4 bg-white shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 shrink-0">
              <MegaphoneIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block text-slate-500">
                {lang === "es" ? "Comunicados de SPP Labs" : "SPP Labs Announcements"}
              </span>
              <span className="text-base font-black block mt-0.5 text-slate-900">
                {announcementsCount > 0 
                  ? (lang === "es" ? `${announcementsCount} publicados` : `${announcementsCount} published`)
                  : (lang === "es" ? "Sin comunicados" : "No announcements")
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Activity Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
        {/* Recent Contacts Widget */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-950 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MailIcon className="w-4 h-4" />
                </span>
                <span>{t.clientesContactForms}</span>
              </h3>
              <button
                onClick={() => setActiveTab("clientes")}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                {t.heroCTAMore} →
              </button>
            </div>

            {contactForms.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic font-medium">
                {t.clientesNoForms}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {contactForms.slice(0, 3).map((form) => (
                  <div key={form.id} className="py-3.5 first:pt-0 last:pb-0 group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-slate-900">{form.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {new Date(form.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyContact(form)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                          title={lang === "es" ? "Copiar datos del contacto" : "Copy contact details"}
                        >
                          {copiedId === form.id ? (
                            <ClipboardCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <ClipboardIcon className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <span className="text-blue-600 block text-[11px] font-semibold truncate mb-1.5">{form.email}</span>
                    <p className="text-slate-600 text-xs line-clamp-2 pl-2.5 border-l-2 border-slate-200">
                      {form.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings Widget */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-950 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </span>
                <span>{t.clientesBookings}</span>
              </h3>
              <button
                onClick={() => setActiveTab("clientes")}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                {t.heroCTAMore} →
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic font-medium">
                {t.clientesNoBookings}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bookings.slice(0, 3).map((booking) => {
                  let badgeColor = "bg-amber-50 border-amber-200 text-amber-700";
                  if (booking.status === "CONFIRMED") {
                    badgeColor = "bg-emerald-50 border-emerald-200 text-emerald-700";
                  } else if (booking.status === "CANCELLED") {
                    badgeColor = "bg-rose-50 border-rose-200 text-rose-700";
                  }
                  return (
                    <div key={booking.id} className="py-3.5 first:pt-0 last:pb-0 group">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-xs text-slate-900">{booking.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-[9px] px-2 py-0.5 rounded-md border ${badgeColor}`}>
                            {booking.status === "CONFIRMED" ? t.clientesAccept : booking.status === "CANCELLED" ? t.clientesReject : "PENDIENTE"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBooking(booking)}
                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                            title={lang === "es" ? "Copiar detalles de la cita" : "Copy booking details"}
                          >
                            {copiedId === booking.id ? (
                              <ClipboardCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <ClipboardIcon className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] tabular-nums text-slate-500 mb-1">
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                          {booking.time}
                        </span>
                      </div>
                      {booking.message && (
                        <p className="text-slate-500 text-xs line-clamp-1 italic pl-2.5 border-l-2 border-slate-200">
                          {`"${booking.message}"`}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent AI Chats Widget */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-950 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BotIcon className="w-4 h-4" />
                </span>
                <span>{t.overviewAiConversations}</span>
              </h3>
              <button
                onClick={() => setActiveTab("ia")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                {t.heroCTAMore} →
              </button>
            </div>

            {conversationsList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic font-medium">
                {t.overviewNoConversations}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {conversationsList.slice(0, 3).map((conv) => (
                  <div key={conv.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-slate-900 truncate max-w-[160px] inline-flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{conv.visitorName || conv.visitorId}</span>
                      </span>
                      <span className="text-[9px] bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                        {conv.messageCount} msgs
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 tabular-nums block mb-1.5">
                      {new Date(conv.lastMessageAt).toLocaleString("es-ES", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {conv.firstMessageSnippet && (
                      <p className="text-slate-600 text-xs line-clamp-2 pl-2.5 border-l-2 border-slate-200 italic">
                        {`"${conv.firstMessageSnippet}"`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
