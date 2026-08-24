"use client";

import { useState, useEffect } from "react";
import {
  ClipboardIcon,
  ClipboardCheckIcon,
  DownloadIcon,
  CalendarDaysIcon,
} from "@/components/dashboard/DashboardIcons";
import {
  copyTextToClipboard,
  formatBookingToText,
  formatBookingsListToText,
  exportBookingsToCsv,
  exportBookingIcsFile,
  exportCalendarIcsFile,
} from "@/lib/exportUtils";

export default function BookingsCalendar({ bookings = [], lang = "es", onAccept, onReject, onDelete, t = {}, currentWebsiteDomain, router }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formTime, setFormTime] = useState("09:00");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddBooking = async (e) => {
    e.preventDefault();
    if (!selectedDateStr) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDateStr,
          time: formTime,
          name: formName,
          email: formEmail,
          phone: formPhone,
          message: formMessage,
          status: "CONFIRMED",
          targetWebsiteDomain: currentWebsiteDomain,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormName("");
        setFormEmail("");
        setFormPhone("");
        setFormMessage("");
        setFormTime("09:00");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Error al crear cita");
      }
    } catch (err) {
      console.error(err);
      alert("Error al crear cita");
    } finally {
      setIsSubmitting(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: adjustedFirstDayIndex });

  const bookingsMap = {};
  bookings.forEach(b => {
    const bDate = new Date(b.date);
    const dateStr = bDate.toISOString().split("T")[0];
    if (!bookingsMap[dateStr]) {
      bookingsMap[dateStr] = [];
    }
    bookingsMap[dateStr].push(b);
  });

  // Filter bookings belonging to the currently viewed month
  const currentMonthBookings = bookings.filter(b => {
    const d = new Date(b.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // Compute selected day bookings directly from bookingsMap
  const selectedDayBookings = selectedDateStr ? (bookingsMap[selectedDateStr] || []) : [];

  const monthsEs = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthLabel = lang === "es" ? monthsEs[month] : monthsEn[month];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(formattedDate);
  };

  // Copy single booking to clipboard
  const handleCopySingleBooking = async (b) => {
    const text = formatBookingToText(b, lang);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedId(b.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Export single booking as .ics file
  const handleExportSingleBookingIcs = (b) => {
    exportBookingIcsFile(b, currentWebsiteDomain || "SPP Labs");
  };

  // Copy month bookings
  const handleCopyMonthBookings = async () => {
    const listToCopy = currentMonthBookings.length > 0 ? currentMonthBookings : bookings;
    const title = `${monthLabel} ${year}`;
    const text = formatBookingsListToText(listToCopy, lang, title);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedId("month-bookings");
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Export month or all bookings to .ics
  const handleExportMonthIcs = () => {
    const listToExport = currentMonthBookings.length > 0 ? currentMonthBookings : bookings;
    exportCalendarIcsFile(listToExport, currentWebsiteDomain || "SPP Labs", `calendario_${monthLabel.toLowerCase()}_${year}`);
  };

  // Export month or all bookings to CSV
  const handleExportMonthCsv = () => {
    const listToExport = currentMonthBookings.length > 0 ? currentMonthBookings : bookings;
    exportBookingsToCsv(listToExport, currentWebsiteDomain || "spplabs", `${monthLabel.toLowerCase()}_${year}`);
  };

  const weekdayHeaders = lang === "es" 
    ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* Calendar Left Main Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-7 w-full space-y-6">
        {/* Calendar Header with Navigation and Export Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
              <span>{monthLabel} {year}</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {currentMonthBookings.length} {lang === "es" ? "citas este mes" : "bookings this month"}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {bookings.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCopyMonthBookings}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title={lang === "es" ? "Copiar citas del mes al portapapeles" : "Copy month bookings to clipboard"}
                >
                  {copiedId === "month-bookings" ? (
                    <>
                      <ClipboardCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">{lang === "es" ? "¡Copiado!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{lang === "es" ? "Copiar Citas" : "Copy"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportMonthIcs}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title={lang === "es" ? "Exportar a formato iCal (.ics) para Google/Apple Calendar" : "Export to iCal (.ics) for Google/Apple Calendar"}
                >
                  <DownloadIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>.ics</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportMonthCsv}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title={lang === "es" ? "Exportar en formato CSV / Excel" : "Export as CSV / Excel"}
                >
                  <DownloadIcon className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </>
            )}

            <div className="flex gap-1 ml-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer text-sm font-bold"
                aria-label="Mes anterior"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer text-sm font-bold"
                aria-label="Mes siguiente"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2.5 text-center">
          {weekdayHeaders.map(h => (
            <span key={h} className="text-xs font-bold text-slate-400 uppercase tracking-wide py-1.5">{h}</span>
          ))}

          {leadingBlanks.map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square bg-slate-50/20 rounded-xl border border-transparent"></div>
          ))}

          {daysArray.map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayBookings = bookingsMap[dateStr] || [];
            
            const pendingCount = dayBookings.filter(b => b.status === "PENDING" || b.status === "pending" || (!b.status && b.status !== "CONFIRMED" && b.status !== "CANCELLED")).length;
            const confirmedCount = dayBookings.filter(b => b.status === "CONFIRMED" || b.status === "confirmed" || b.status === "ACCEPTED").length;

            const hasPending = pendingCount > 0;
            const hasConfirmed = confirmedCount > 0;
            const isSelected = selectedDateStr === dateStr;

            let dayStyles = "bg-slate-50/50 border-slate-200/60 hover:bg-slate-100 text-slate-800";
            if (hasConfirmed) {
              dayStyles = "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 shadow-xs font-black";
            } else if (hasPending) {
              dayStyles = "bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100 font-extrabold";
            }

            if (isSelected) {
              dayStyles = "bg-slate-900 border-slate-900 text-white shadow-md scale-95 font-black";
            }

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all border cursor-pointer relative ${dayStyles}`}
              >
                <span className="text-xs font-extrabold block">{day}</span>
                
                {/* Notification Badge with Number of Pending Bookings */}
                {hasPending && (
                  <span className="absolute -top-1.5 -right-1.5 z-20 flex items-center justify-center pointer-events-none">
                    <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                    <span className="relative z-10 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] font-black leading-none shadow-sm border border-white/60">
                      {pendingCount}
                    </span>
                  </span>
                )}

                {/* Status Indicator Dot */}
                {(hasConfirmed || hasPending) && (
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isSelected ? "bg-white" : hasConfirmed ? "bg-emerald-200" : "bg-emerald-500"
                  }`}></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      <div className="lg:col-span-5 space-y-4 w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[300px] w-full">
          <h4 className="font-extrabold text-base text-slate-900 mb-4 border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              {lang === "es" ? "Reservas para la fecha:" : "Bookings for date:"}{" "}
              <span className="text-brand-blue font-mono font-bold text-sm block mt-1">
                {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { dateStyle: "long" }) : (lang === "es" ? "Seleccione un día" : "Select a day")}
              </span>
            </div>
            {selectedDateStr && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {lang === "es" ? "+ Agregar Cita" : "+ Add Event"}
              </button>
            )}
          </h4>

          {selectedDayBookings.length === 0 ? (
            <p className="text-slate-450 italic text-sm text-center py-10">
              {lang === "es" ? "No hay reservas programadas para este día." : "No bookings scheduled for this day."}
            </p>
          ) : (
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {selectedDayBookings.map((b) => {
                let statusBadge = "bg-amber-50 border-amber-200 text-amber-700";
                if (b.status === "CONFIRMED") statusBadge = "bg-emerald-50 border-emerald-200 text-emerald-700";
                if (b.status === "CANCELLED") statusBadge = "bg-rose-50 border-rose-200 text-rose-700";

                return (
                  <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-950 block">{b.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500 font-mono font-bold">{b.time}</span>
                          {b.phone && (
                            <span className="text-[11px] text-slate-400 font-mono">· {b.phone}</span>
                          )}
                        </div>
                        {b.email && (
                          <span className="text-[11px] text-blue-600 block truncate max-w-[200px]">{b.email}</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                        {b.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 border border-slate-200/80 rounded-xl italic leading-relaxed">
                      {`"${b.message || "Sin comentarios."}"`}
                    </p>

                    {/* Booking Actions Row: Copy, Export .ics, Status buttons & Delete */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200/50">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopySingleBooking(b)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                          title={lang === "es" ? "Copiar detalles de la cita al portapapeles" : "Copy booking details"}
                        >
                          {copiedId === b.id ? (
                            <>
                              <ClipboardCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-black">{lang === "es" ? "¡Copiado!" : "Copied!"}</span>
                            </>
                          ) : (
                            <>
                              <ClipboardIcon className="w-3.5 h-3.5 text-slate-500" />
                              <span>{lang === "es" ? "Copiar" : "Copy"}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportSingleBookingIcs(b)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                          title={lang === "es" ? "Descargar evento .ics para calendario" : "Download .ics event"}
                        >
                          <DownloadIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>.ics</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {b.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={() => onAccept(b.id, "CONFIRMED")}
                              className="bg-brand-green hover:bg-brand-green-dark text-white font-bold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                            >
                              {t.clientesAccept || "Aceptar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject(b.id, "CANCELLED")}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                            >
                              {t.clientesReject || "Rechazar"}
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => onDelete(b.id)}
                          className="text-red-650 hover:bg-red-50 font-semibold text-[10px] px-2 py-1 rounded-lg border border-red-100 transition-all cursor-pointer"
                          title={t.clientesDelete || "Eliminar"}
                        >
                          {t.clientesDelete || "Eliminar"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-md animate-fade-in text-slate-900">
            <div className="flex justify-between items-center mb-6">
              <h5 className="text-lg font-bold text-slate-900">
                {lang === "es" ? "Nueva Cita:" : "New Event:"} {selectedDateStr}
              </h5>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {lang === "es" ? "Hora" : "Time"}
                </label>
                <select
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {lang === "es" ? "Nombre / Cliente" : "Name / Client"}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {lang === "es" ? "Email" : "Email"}
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {lang === "es" ? "Teléfono" : "Phone"}
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +34 600 000 000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {lang === "es" ? "Detalles / Comentario" : "Details / Comment"}
                </label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  {lang === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-black text-white hover:bg-zinc-800 disabled:opacity-50 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  {isSubmitting ? (lang === "es" ? "Guardando..." : "Saving...") : (lang === "es" ? "Crear Cita" : "Create Event")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
