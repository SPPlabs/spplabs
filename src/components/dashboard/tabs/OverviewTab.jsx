"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  MailIcon,
  MegaphoneIcon,
  BotIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  WhatsAppIcon,
  ChatBubbleIcon,
  ClipboardIcon,
  ClipboardCheckIcon,
} from "@/components/dashboard/DashboardIcons";
import {
  copyTextToClipboard,
  formatContactToText,
  formatBookingToText,
} from "@/lib/exportUtils";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
              <div className="space-y-3">
                {contactForms.slice(0, 3).map((form) => (
                  <div
                    key={form.id}
                    className="p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {getInitials(form.name)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs text-slate-900 block truncate">
                            {form.name}
                          </span>
                          <span className="text-[10px] text-slate-400 tabular-nums flex items-center gap-1">
                            <ClockIcon className="w-3 h-3 text-slate-400" />
                            {new Date(form.createdAt).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyContact(form)}
                          className="p-1 hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
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

                    {/* Contact Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      {form.email && (
                        <a
                          href={`mailto:${form.email}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200/80 rounded-lg font-bold text-blue-600 hover:text-blue-800 transition-colors truncate max-w-[180px]"
                          title={form.email}
                        >
                          <MailIcon className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{form.email}</span>
                        </a>
                      )}
                      {form.phone && (
                        <div className="inline-flex items-center gap-1">
                          <a
                            href={`tel:${form.phone}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200/80 rounded-lg font-mono font-bold text-slate-700 hover:text-emerald-600 transition-colors"
                            title={form.phone}
                          >
                            <PhoneIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{form.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${form.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                            title="WhatsApp"
                          >
                            <WhatsAppIcon className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Message Preview */}
                    {form.message && (
                      <p className="text-slate-600 text-xs line-clamp-2 italic bg-white/80 p-2 rounded-xl border border-slate-200/60 leading-relaxed">
                        {`"${form.message}"`}
                      </p>
                    )}
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
              <div className="space-y-3">
                {bookings.slice(0, 3).map((booking) => {
                  const isConfirmed = booking.status === "CONFIRMED";
                  const isCancelled = booking.status === "CANCELLED";

                  return (
                    <div
                      key={booking.id}
                      className="p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-2xs ${
                              isConfirmed
                                ? "bg-gradient-to-br from-emerald-500 to-teal-700"
                                : isCancelled
                                ? "bg-gradient-to-br from-rose-500 to-red-700"
                                : "bg-gradient-to-br from-amber-500 to-orange-600"
                            }`}
                          >
                            {getInitials(booking.name)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-xs text-slate-900 block truncate">
                              {booking.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] tabular-nums font-sans mt-0.5">
                              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200/60">
                                <ClockIcon className="w-2.5 h-2.5 text-slate-400" />
                                {booking.time}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500 font-medium">
                                {new Date(booking.date).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`font-black text-[9px] uppercase px-2 py-0.5 rounded-full border ${
                              isConfirmed
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : isCancelled
                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}
                          >
                            {isConfirmed ? (lang === "es" ? "Confirmada" : "Confirmed") : isCancelled ? (lang === "es" ? "Cancelada" : "Cancelled") : (lang === "es" ? "Pendiente" : "Pending")}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopyBooking(booking)}
                            className="p-1 hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
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

                      {/* Contact and Phone/WhatsApp if available */}
                      {(booking.email || booking.phone) && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          {booking.email && (
                            <a
                              href={`mailto:${booking.email}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200/80 rounded-lg font-bold text-blue-600 hover:text-blue-800 transition-colors truncate max-w-[170px]"
                              title={booking.email}
                            >
                              <MailIcon className="w-3 h-3 text-blue-500 shrink-0" />
                              <span className="truncate">{booking.email}</span>
                            </a>
                          )}
                          {booking.phone && (
                            <div className="inline-flex items-center gap-1">
                              <a
                                href={`tel:${booking.phone}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200/80 rounded-lg font-mono font-bold text-slate-700 hover:text-emerald-600 transition-colors"
                                title={booking.phone}
                              >
                                <PhoneIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{booking.phone}</span>
                              </a>
                              <a
                                href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                                title="WhatsApp"
                              >
                                <WhatsAppIcon className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {booking.message && (
                        <p className="text-slate-600 text-xs line-clamp-1 italic bg-white/80 p-2 rounded-xl border border-slate-200/60 leading-relaxed">
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
              <div className="space-y-3">
                {conversationsList.slice(0, 3).map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          <BotIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs text-slate-900 block truncate">
                            {conv.visitorName || conv.visitorId}
                          </span>
                          <span className="text-[10px] text-slate-400 tabular-nums flex items-center gap-1">
                            <ClockIcon className="w-3 h-3 text-slate-400" />
                            {new Date(conv.lastMessageAt).toLocaleString(lang === "es" ? "es-ES" : "en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9.5px] bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                        {conv.messageCount} msgs
                      </span>
                    </div>

                    {conv.firstMessageSnippet && (
                      <p className="text-slate-600 text-xs line-clamp-2 italic bg-white/80 p-2 rounded-xl border border-slate-200/60 leading-relaxed">
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
