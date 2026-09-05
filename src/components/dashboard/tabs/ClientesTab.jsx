"use client";

import { useState, useMemo } from "react";
import BookingsCalendar from "@/components/dashboard/BookingsCalendar";
import {
  MailIcon,
  CalendarIcon,
  ClipboardIcon,
  ClipboardCheckIcon,
  DownloadIcon,
  PhoneIcon,
  WhatsAppIcon,
  ClockIcon,
  ChatBubbleIcon,
  PaperAirplaneIcon,
  TrashIcon,
  CheckIcon,
  CloseIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UsersIcon,
} from "@/components/dashboard/DashboardIcons";
import {
  copyTextToClipboard,
  formatContactToText,
  formatContactsListToText,
  exportContactsToCsv,
  formatBookingToText,
  exportBookingIcsFile,
  formatWhatsAppUrl,
} from "@/lib/exportUtils";

// Helper to get initials from a person's name
function getInitials(name) {
  if (!name || typeof name !== "string") return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ClientesTab({
  t,
  lang,
  contactForms = [],
  bookings = [],
  handleDeleteContact,
  handleUpdateBookingStatus,
  handleDeleteBooking,
  currentWebsite,
  router,
  googleCalendarConnection = null,
  externalCalendarEvents = [],
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [contactSearch, setContactSearch] = useState("");

  // Bookings View Controls: "calendar" vs "list"
  const [bookingsViewMode, setBookingsViewMode] = useState("calendar"); // 'calendar' | 'list'
  const [bookingsSearch, setBookingsSearch] = useState("");
  const [bookingsFilter, setBookingsFilter] = useState("ALL"); // 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'

  // Clipboard handlers
  const handleCopySingleContact = async (form) => {
    const text = formatContactToText(form, lang);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedId(form.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleCopyAllContacts = async () => {
    const text = formatContactsListToText(contactForms, lang, currentWebsite?.domain);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedId("all-contacts");
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleCopySingleBooking = async (booking) => {
    const text = formatBookingToText(booking, lang);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedId(booking.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleExportSingleBookingIcs = (booking) => {
    exportBookingIcsFile(booking, currentWebsite?.displayName || currentWebsite?.domain || "SPP Labs");
  };

  const handleExportContactsCsv = () => {
    exportContactsToCsv(contactForms, currentWebsite?.domain || "empresa");
  };

  // Filtered contact forms based on search query
  const filteredContacts = useMemo(() => {
    const query = contactSearch.trim().toLowerCase();
    if (!query) return contactForms;
    return contactForms.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(query);
      const emailMatch = c.email?.toLowerCase().includes(query);
      const phoneMatch = c.phone?.toLowerCase().includes(query);
      const messageMatch = c.message?.toLowerCase().includes(query);
      return nameMatch || emailMatch || phoneMatch || messageMatch;
    });
  }, [contactForms, contactSearch]);

  // Filtered bookings based on search query and status filter
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (bookingsFilter !== "ALL" && b.status !== bookingsFilter) {
        return false;
      }
      // Search query
      const query = bookingsSearch.trim().toLowerCase();
      if (!query) return true;
      const nameMatch = b.name?.toLowerCase().includes(query);
      const emailMatch = b.email?.toLowerCase().includes(query);
      const phoneMatch = b.phone?.toLowerCase().includes(query);
      const messageMatch = b.message?.toLowerCase().includes(query);
      const dateMatch = b.date?.toLowerCase().includes(query);
      return nameMatch || emailMatch || phoneMatch || messageMatch || dateMatch;
    });
  }, [bookings, bookingsSearch, bookingsFilter]);

  // Counts for booking filters
  const pendingBookingsCount = useMemo(() => bookings.filter((b) => b.status === "PENDING").length, [bookings]);
  const confirmedBookingsCount = useMemo(() => bookings.filter((b) => b.status === "CONFIRMED").length, [bookings]);
  const cancelledBookingsCount = useMemo(() => bookings.filter((b) => b.status === "CANCELLED").length, [bookings]);

  return (
    <div className="space-y-12 animate-fade-in w-full max-w-full">
      {/* SECTION 1: CONTACT SUBMISSIONS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
                <MailIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                  <span>{t.clientesContactForms}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t.clientesSubtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            <span className="bg-slate-100 text-slate-900 text-xs px-3 py-1.5 rounded-xl font-black border border-slate-200 font-sans tabular-nums">
              {contactForms.length} {lang === "es" ? "mensajes recibidos" : "messages received"}
            </span>

            {contactForms.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCopyAllContacts}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title={lang === "es" ? "Copiar todos los mensajes al portapapeles" : "Copy all messages to clipboard"}
                >
                  {copiedId === "all-contacts" ? (
                    <>
                      <ClipboardCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-black">{lang === "es" ? "¡Copiado!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{lang === "es" ? "Copiar Todo" : "Copy All"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportContactsCsv}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title={lang === "es" ? "Descargar en formato CSV / Excel" : "Download as CSV / Excel"}
                >
                  <DownloadIcon className="w-3.5 h-3.5" />
                  <span>{lang === "es" ? "Exportar CSV" : "Export CSV"}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search filter if there are contacts */}
        {contactForms.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder={lang === "es" ? "Buscar por nombre, email, teléfono o mensaje..." : "Search by name, email, phone or message..."}
                className="w-full h-10 bg-white border border-slate-200 rounded-xl pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              {contactSearch && (
                <button
                  type="button"
                  onClick={() => setContactSearch("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {contactSearch && (
              <span className="text-xs font-semibold text-slate-500">
                {filteredContacts.length} {lang === "es" ? "encontrados" : "found"}
              </span>
            )}
          </div>
        )}

        {contactForms.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-400 text-xs italic font-medium shadow-xs">
            {t.clientesNoForms}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center text-slate-500 text-xs shadow-xs space-y-2">
            <p className="font-bold">{lang === "es" ? "No se encontraron mensajes con esa búsqueda." : "No messages match your search criteria."}</p>
            <button
              type="button"
              onClick={() => setContactSearch("")}
              className="text-blue-600 font-bold hover:underline cursor-pointer text-xs"
            >
              {lang === "es" ? "Limpiar filtro de búsqueda" : "Clear search filter"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredContacts.map((form) => (
              <div
                key={form.id}
                className="bg-white border border-slate-200/90 hover:border-blue-300/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Card Header: Avatar, Name, Status Badge, and Date */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Initials Avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs ring-2 ring-blue-100">
                        {getInitials(form.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm sm:text-base text-slate-950 truncate block">
                            {form.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            {lang === "es" ? "Formulario Web" : "Web Form"}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans tabular-nums flex items-center gap-1.5 mt-0.5">
                          <ClockIcon className="w-3 h-3 text-slate-400 shrink-0" />
                          {new Date(form.createdAt).toLocaleString(lang === "es" ? "es-ES" : "en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Structured Contact Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Email Card */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                          <MailIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block leading-none mb-1">
                            Email
                          </span>
                          <a
                            href={`mailto:${form.email}`}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600 block truncate transition-colors"
                            title={form.email}
                          >
                            {form.email}
                          </a>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyTextToClipboard(form.email)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
                        title={lang === "es" ? "Copiar email" : "Copy email"}
                      >
                        <ClipboardIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Phone Card */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            form.phone ? "bg-emerald-100/70 text-emerald-700" : "bg-slate-200/60 text-slate-400"
                          }`}
                        >
                          <PhoneIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block leading-none mb-1">
                            {lang === "es" ? "Teléfono" : "Phone"}
                          </span>
                          {form.phone ? (
                            <a
                              href={`tel:${form.phone}`}
                              className="text-xs font-mono font-bold text-slate-900 hover:text-emerald-600 block truncate transition-colors"
                              title={form.phone}
                            >
                              {form.phone}
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic block">
                              {lang === "es" ? "No indicado" : "Not provided"}
                            </span>
                          )}
                        </div>
                      </div>

                      {form.phone && (
                        <a
                          href={formatWhatsAppUrl(form.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs"
                          title={lang === "es" ? "Abrir chat de WhatsApp" : "Open WhatsApp chat"}
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Structured Client Message Box */}
                  <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ChatBubbleIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>{lang === "es" ? "Mensaje del cliente:" : "Client message:"}</span>
                    </span>
                    <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                      {form.message || (lang === "es" ? "Sin mensaje escrito." : "No message provided.")}
                    </p>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopySingleContact(form)}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title={lang === "es" ? "Copiar todos los datos de este contacto" : "Copy contact details"}
                    >
                      {copiedId === form.id ? (
                        <>
                          <ClipboardCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-black">{lang === "es" ? "¡Copiado!" : "Copied!"}</span>
                        </>
                      ) : (
                        <>
                          <ClipboardIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lang === "es" ? "Copiar Datos" : "Copy"}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`mailto:${form.email}?subject=${encodeURIComponent(
                        lang === "es"
                          ? `Respuesta a tu consulta en ${currentWebsite?.displayName || currentWebsite?.domain}`
                          : `Reply to your inquiry at ${currentWebsite?.displayName || currentWebsite?.domain}`
                      )}`}
                      className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/70 text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <PaperAirplaneIcon className="w-3.5 h-3.5" />
                      <span>{lang === "es" ? "Responder" : "Reply"}</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteContact(form.id)}
                    className="px-3 py-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title={t.clientesDelete}
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.clientesDelete}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: BOOKINGS / CITAS */}
      <section className="pt-6 border-t border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                  <span>{t.clientesBookings}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t.clientesSubtitle}</p>
              </div>
            </div>
          </div>

          {/* View Mode Switcher: Calendar vs List */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto border border-slate-200/70">
            <button
              type="button"
              onClick={() => setBookingsViewMode("calendar")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                bookingsViewMode === "calendar"
                  ? "bg-white text-slate-950 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4 text-emerald-600" />
              <span>{lang === "es" ? "Vista Calendario" : "Calendar View"}</span>
            </button>
            <button
              type="button"
              onClick={() => setBookingsViewMode("list")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                bookingsViewMode === "list"
                  ? "bg-white text-slate-950 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UsersIcon className="w-4 h-4 text-indigo-600" />
              <span>{lang === "es" ? "Todas las Citas" : "All Bookings"}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-200 text-slate-800">
                {bookings.length}
              </span>
            </button>
          </div>
        </div>

        {/* View Mode 1: Calendar View */}
        {bookingsViewMode === "calendar" && (
          <BookingsCalendar
            bookings={bookings}
            lang={lang}
            onAccept={handleUpdateBookingStatus}
            onReject={handleUpdateBookingStatus}
            onDelete={handleDeleteBooking}
            t={t}
            currentWebsiteDomain={currentWebsite?.domain}
            router={router}
            googleCalendarConnection={googleCalendarConnection}
            externalCalendarEvents={externalCalendarEvents}
          />
        )}

        {/* View Mode 2: Structured List View of All Bookings */}
        {bookingsViewMode === "list" && (
          <div className="space-y-6">
            {/* Search & Status Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                <button
                  type="button"
                  onClick={() => setBookingsFilter("ALL")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    bookingsFilter === "ALL"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {lang === "es" ? "Todas" : "All"} ({bookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingsFilter("PENDING")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    bookingsFilter === "PENDING"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-amber-50/80 border border-amber-200 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>{lang === "es" ? "Pendientes" : "Pending"}</span>
                  <span>({pendingBookingsCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingsFilter("CONFIRMED")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    bookingsFilter === "CONFIRMED"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50/80 border border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                  <span>{lang === "es" ? "Confirmadas" : "Confirmed"}</span>
                  <span>({confirmedBookingsCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingsFilter("CANCELLED")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    bookingsFilter === "CANCELLED"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-rose-50/80 border border-rose-200 text-rose-800 hover:bg-rose-100"
                  }`}
                >
                  {lang === "es" ? "Canceladas" : "Cancelled"} ({cancelledBookingsCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  value={bookingsSearch}
                  onChange={(e) => setBookingsSearch(e.target.value)}
                  placeholder={lang === "es" ? "Buscar por cliente, fecha..." : "Search by client, date..."}
                  className="w-full h-10 bg-white border border-slate-200 rounded-xl pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                {bookingsSearch && (
                  <button
                    type="button"
                    onClick={() => setBookingsSearch("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Bookings List Cards Grid */}
            {filteredBookings.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-400 text-xs shadow-xs space-y-2">
                <p className="font-bold">{lang === "es" ? "No se encontraron citas con los filtros seleccionados." : "No bookings match the selected filters."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredBookings.map((b) => {
                  const isPending = b.status === "PENDING";
                  const isConfirmed = b.status === "CONFIRMED";
                  const isCancelled = b.status === "CANCELLED";

                  return (
                    <div
                      key={b.id}
                      className="bg-white border border-slate-200/90 hover:border-emerald-300/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Header: Avatar, Name, Schedule and Status Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ring-2 ${
                                isConfirmed
                                  ? "bg-gradient-to-br from-emerald-500 to-teal-700 ring-emerald-100"
                                  : isCancelled
                                  ? "bg-gradient-to-br from-rose-500 to-red-700 ring-rose-100"
                                  : "bg-gradient-to-br from-amber-500 to-orange-600 ring-amber-100"
                              }`}
                            >
                              {getInitials(b.name)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-950 text-sm sm:text-base block truncate">
                                {b.name}
                              </span>
                              <div className="flex items-center gap-2 text-xs font-sans tabular-nums mt-0.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                                  <ClockIcon className="w-3 h-3 text-slate-500" />
                                  {b.time}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600 font-bold inline-flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3 text-slate-400" />
                                  {new Date(b.date).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Pill */}
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 inline-flex items-center gap-1.5 ${
                              isConfirmed
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isCancelled
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isConfirmed
                                  ? "bg-emerald-500"
                                  : isCancelled
                                  ? "bg-rose-500"
                                  : "bg-amber-500 animate-ping"
                              }`}
                            />
                            {isConfirmed
                              ? (lang === "es" ? "Confirmada" : "Confirmed")
                              : isCancelled
                              ? (lang === "es" ? "Cancelada" : "Cancelled")
                              : (lang === "es" ? "Pendiente" : "Pending")}
                          </span>
                        </div>

                        {/* Structured Contact Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Email */}
                          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                                <MailIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block leading-none mb-1">
                                  Email
                                </span>
                                <a
                                  href={`mailto:${b.email}`}
                                  className="text-xs font-bold text-slate-900 hover:text-blue-600 block truncate transition-colors"
                                  title={b.email}
                                >
                                  {b.email || (lang === "es" ? "Sin email" : "No email")}
                                </a>
                              </div>
                            </div>
                            {b.email && (
                              <button
                                type="button"
                                onClick={() => copyTextToClipboard(b.email)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
                                title={lang === "es" ? "Copiar email" : "Copy email"}
                              >
                                <ClipboardIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Phone */}
                          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  b.phone ? "bg-emerald-100/70 text-emerald-700" : "bg-slate-200/60 text-slate-400"
                                }`}
                              >
                                <PhoneIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block leading-none mb-1">
                                  {lang === "es" ? "Teléfono" : "Phone"}
                                </span>
                                {b.phone ? (
                                  <a
                                    href={`tel:${b.phone}`}
                                    className="text-xs font-mono font-bold text-slate-900 hover:text-emerald-600 block truncate transition-colors"
                                  >
                                    {b.phone}
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400 italic block">
                                    {lang === "es" ? "No indicado" : "Not provided"}
                                  </span>
                                )}
                              </div>
                            </div>

                            {b.phone && (
                              <a
                                href={formatWhatsAppUrl(b.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs"
                                title="WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Motivo / Notas de la Cita */}
                        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <DocumentTextIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lang === "es" ? "Motivo o notas de la cita:" : "Reason or notes:"}</span>
                          </span>
                          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-sans">
                            {b.message ? (
                              `"${b.message}"`
                            ) : (
                              <span className="text-slate-400 italic">{lang === "es" ? "Sin comentarios o notas adicionales." : "No additional notes."}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopySingleBooking(b)}
                            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            title={lang === "es" ? "Copiar datos de la cita" : "Copy booking"}
                          >
                            {copiedId === b.id ? (
                              <>
                                <ClipboardCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">{lang === "es" ? "¡Copiado!" : "Copied!"}</span>
                              </>
                            ) : (
                              <>
                                <ClipboardIcon className="w-3.5 h-3.5 text-slate-400" />
                                <span>{lang === "es" ? "Copiar Cita" : "Copy"}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportSingleBookingIcs(b)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            title={lang === "es" ? "Descargar archivo .ics" : "Download .ics file"}
                          >
                            <DownloadIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>.ics</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b.id, "CONFIRMED")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1"
                              >
                                <CheckIcon className="w-3.5 h-3.5" />
                                <span>{t.clientesAccept || "Aceptar"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b.id, "CANCELLED")}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1"
                              >
                                <CloseIcon className="w-3.5 h-3.5" />
                                <span>{t.clientesReject || "Rechazar"}</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(b.id)}
                            className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                            title={t.clientesDelete || "Eliminar"}
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
