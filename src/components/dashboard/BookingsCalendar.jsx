"use client";

import { useState } from "react";
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

// Clean Google G Icon
function GoogleGIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function BookingsCalendar({
  bookings = [],
  externalCalendarEvents = [],
  googleCalendarConnection = null,
  lang = "es",
  onAccept,
  onReject,
  onDelete,
  t = {},
  currentWebsiteDomain,
  router,
}) {
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

  // Google Calendar sync & disconnect state
  const [isSyncingGcal, setIsSyncingGcal] = useState(false);
  const [isDisconnectingGcal, setIsDisconnectingGcal] = useState(false);
  const [gcalFeedback, setGcalFeedback] = useState(null);

  const handleSyncGoogleCalendar = async () => {
    setIsSyncingGcal(true);
    setGcalFeedback(null);
    try {
      const res = await fetch("/api/integrations/google-calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetWebsiteDomain: currentWebsiteDomain }),
      });
      const data = await res.json();
      if (res.ok) {
        setGcalFeedback({
          type: "success",
          message:
            lang === "es"
              ? `Sincronizado: ${data.data?.upsertedCount || 0} eventos actualizados.`
              : `Synced: ${data.data?.upsertedCount || 0} events updated.`,
        });
        if (router) router.refresh();
      } else {
        setGcalFeedback({
          type: "error",
          message: data.message || (lang === "es" ? "Error al sincronizar" : "Sync error"),
        });
      }
    } catch {
      setGcalFeedback({
        type: "error",
        message: lang === "es" ? "Error de conexión" : "Connection error",
      });
    } finally {
      setIsSyncingGcal(false);
      setTimeout(() => setGcalFeedback(null), 5000);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    if (
      !confirm(
        lang === "es"
          ? "¿Estás seguro de que deseas desconectar Google Calendar? Las citas de SPP Labs se conservarán."
          : "Are you sure you want to disconnect Google Calendar? Your SPP Labs bookings will be preserved."
      )
    ) {
      return;
    }

    setIsDisconnectingGcal(true);
    try {
      const res = await fetch("/api/integrations/google-calendar/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetWebsiteDomain: currentWebsiteDomain }),
      });
      if (res.ok) {
        setGcalFeedback({
          type: "success",
          message:
            lang === "es" ? "Google Calendar desconectado." : "Google Calendar disconnected.",
        });
        if (router) router.refresh();
      }
    } catch {
      alert(lang === "es" ? "Error al desconectar" : "Error disconnecting");
    } finally {
      setIsDisconnectingGcal(false);
    }
  };

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
        if (router) router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || (lang === "es" ? "Error al crear cita" : "Error creating booking"));
      }
    } catch (err) {
      console.error(err);
      alert(lang === "es" ? "Error al crear cita" : "Error creating booking");
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

  // Set of native Google Event IDs from SPP Labs bookings to prevent UI duplicates
  const nativeGoogleEventIds = new Set(
    bookings.map((b) => b.googleEventId).filter(Boolean)
  );

  // Map SPP Labs Bookings by Date (YYYY-MM-DD)
  const bookingsMap = {};
  bookings.forEach((b) => {
    let dateStr = "";
    if (typeof b.date === "string") {
      dateStr = b.date.split("T")[0];
    } else if (b.date instanceof Date) {
      dateStr = b.date.toISOString().split("T")[0];
    }
    if (dateStr) {
      if (!bookingsMap[dateStr]) {
        bookingsMap[dateStr] = [];
      }
      bookingsMap[dateStr].push(b);
    }
  });

  // Filter out any external event that corresponds to a native SPP Labs booking
  const uniqueExternalEvents = externalCalendarEvents.filter(
    (e) => !nativeGoogleEventIds.has(e.googleEventId)
  );

  // Map External Google Calendar Events by Date (YYYY-MM-DD in local time)
  const externalEventsMap = {};
  uniqueExternalEvents.forEach((e) => {
    const eDate = new Date(e.startDateTime);
    if (!isNaN(eDate.getTime())) {
      const y = eDate.getFullYear();
      const m = String(eDate.getMonth() + 1).padStart(2, "0");
      const d = String(eDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      if (!externalEventsMap[dateStr]) {
        externalEventsMap[dateStr] = [];
      }
      externalEventsMap[dateStr].push(e);
    }
  });

  // Filter bookings belonging to currently viewed month
  const currentMonthBookings = bookings.filter((b) => {
    const d = new Date(b.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const selectedDayBookings = selectedDateStr ? bookingsMap[selectedDateStr] || [] : [];
  const selectedDayExternalEvents = selectedDateStr ? externalEventsMap[selectedDateStr] || [] : [];

  const monthsEs = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const monthsEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthLabel = lang === "es" ? monthsEs[month] : monthsEn[month];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDateStr(formattedDate);
  };

  const handleCopySingleBooking = async (b) => {
    const text = formatBookingToText(b, lang);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedId(b.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleExportSingleBookingIcs = (b) => {
    exportBookingIcsFile(b, currentWebsiteDomain || "SPP Labs");
  };

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

  const handleExportMonthIcs = () => {
    const listToExport = currentMonthBookings.length > 0 ? currentMonthBookings : bookings;
    exportCalendarIcsFile(
      listToExport,
      currentWebsiteDomain || "SPP Labs",
      `calendario_${monthLabel.toLowerCase()}_${year}`
    );
  };

  const handleExportMonthCsv = () => {
    const listToExport = currentMonthBookings.length > 0 ? currentMonthBookings : bookings;
    exportBookingsToCsv(
      listToExport,
      currentWebsiteDomain || "spplabs",
      `${monthLabel.toLowerCase()}_${year}`
    );
  };

  const weekdayHeaders =
    lang === "es"
      ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6 w-full">
      {/* 1. Google Calendar Integration Banner / Status Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
            <GoogleGIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-sm sm:text-base text-white">Google Calendar</h4>
              {googleCalendarConnection ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {lang === "es" ? "Conectado" : "Connected"}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
                  {lang === "es" ? "No conectado" : "Not connected"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">
              {googleCalendarConnection
                ? `${googleCalendarConnection.googleAccountEmail || "Cuenta vinculada"} · ${
                    lang === "es"
                      ? "Sincronización bidireccional activa."
                      : "Bi-directional sync active."
                  }`
                : lang === "es"
                ? "Sincroniza tus reservas automáticamente y bloquea tus citas de Google en la web."
                : "Sync appointments automatically and block Google Calendar busy hours on website."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {googleCalendarConnection ? (
            <>
              <button
                type="button"
                onClick={handleSyncGoogleCalendar}
                disabled={isSyncingGcal}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                title={lang === "es" ? "Sincronizar ahora con Google Calendar" : "Sync now with Google Calendar"}
              >
                <svg
                  className={`w-3.5 h-3.5 ${isSyncingGcal ? "animate-spin text-blue-400" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                <span>{isSyncingGcal ? (lang === "es" ? "Sincronizando..." : "Syncing...") : (lang === "es" ? "Sincronizar" : "Sync")}</span>
              </button>

              <button
                type="button"
                onClick={handleDisconnectGoogleCalendar}
                disabled={isDisconnectingGcal}
                className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isDisconnectingGcal ? (lang === "es" ? "Desconectando..." : "Disconnecting...") : (lang === "es" ? "Desconectar" : "Disconnect")}
              </button>
            </>
          ) : (
            <a
              href={`/api/integrations/google-calendar/auth${
                currentWebsiteDomain ? `?domain=${encodeURIComponent(currentWebsiteDomain)}` : ""
              }`}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <GoogleGIcon className="w-4 h-4" />
              <span>{lang === "es" ? "Conectar con Google Calendar" : "Connect Google Calendar"}</span>
            </a>
          )}
        </div>
      </div>

      {gcalFeedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in ${
            gcalFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{gcalFeedback.type === "success" ? "✓" : "⚠"}</span>
          <span>{gcalFeedback.message}</span>
        </div>
      )}

      {/* 2. Main Calendar & Day Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Calendar Left Main Grid */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-7 w-full space-y-6">
          {/* Calendar Header with Navigation and Export Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h4 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
                <span>
                  {monthLabel} {year}
                </span>
              </h4>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-slate-400 font-mono">
                  {currentMonthBookings.length} {lang === "es" ? "citas este mes" : "bookings this month"}
                </span>
                {uniqueExternalEvents.length > 0 && (
                  <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                    {uniqueExternalEvents.length} {lang === "es" ? "eventos de Google" : "Google events"}
                  </span>
                )}
              </div>
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
                        <span className="text-emerald-600 font-bold">{lang === "es" ? "¡Copiado!" : "Copied!"}</span>
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
                    title={lang === "es" ? "Exportar a formato iCal (.ics) para Google/Apple Calendar" : "Export to iCal (.ics)"}
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
            {weekdayHeaders.map((h) => (
              <span key={h} className="text-xs font-bold text-slate-400 uppercase tracking-wide py-1.5">
                {h}
              </span>
            ))}

            {leadingBlanks.map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square bg-slate-50/20 rounded-xl border border-transparent" />
            ))}

            {daysArray.map((day) => {
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayBookings = bookingsMap[dateStr] || [];
              const dayExternalEvents = externalEventsMap[dateStr] || [];

              const pendingCount = dayBookings.filter(
                (b) =>
                  b.status === "PENDING" ||
                  b.status === "pending" ||
                  (!b.status && b.status !== "CONFIRMED" && b.status !== "CANCELLED")
              ).length;
              const confirmedCount = dayBookings.filter(
                (b) => b.status === "CONFIRMED" || b.status === "confirmed" || b.status === "ACCEPTED"
              ).length;

              const hasPending = pendingCount > 0;
              const hasConfirmed = confirmedCount > 0;
              const hasExternal = dayExternalEvents.length > 0;
              const isSelected = selectedDateStr === dateStr;

              let dayStyles = "bg-slate-50/50 border-slate-200/60 hover:bg-slate-100 text-slate-800";
              if (hasConfirmed) {
                dayStyles = "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 shadow-xs font-black";
              } else if (hasPending) {
                dayStyles = "bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100 font-extrabold";
              } else if (hasExternal) {
                dayStyles = "bg-indigo-50 border-indigo-200 text-indigo-950 hover:bg-indigo-100 font-bold";
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

                  {/* Status Indicator Dots */}
                  <div className="flex items-center gap-1">
                    {(hasConfirmed || hasPending) && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isSelected ? "bg-white" : hasConfirmed ? "bg-emerald-200" : "bg-emerald-500"
                        }`}
                      />
                    )}
                    {hasExternal && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isSelected ? "bg-indigo-300" : "bg-indigo-500"
                        }`}
                        title="Evento en Google Calendar"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="lg:col-span-5 space-y-4 w-full">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[300px] w-full">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  {lang === "es" ? "Agenda del día:" : "Day Schedule:"}
                </h4>
                <span className="text-brand-blue font-mono font-bold text-xs block mt-0.5">
                  {selectedDateStr
                    ? new Date(selectedDateStr).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                        dateStyle: "full",
                      })
                    : lang === "es"
                    ? "Selecciona un día en el calendario"
                    : "Select a day in calendar"}
                </span>
              </div>
              {selectedDateStr && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {lang === "es" ? "+ Cita" : "+ Event"}
                </button>
              )}
            </div>

            {selectedDayBookings.length === 0 && selectedDayExternalEvents.length === 0 ? (
              <p className="text-slate-450 italic text-sm text-center py-12">
                {selectedDateStr
                  ? lang === "es"
                    ? "No hay reservas ni eventos programados para este día."
                    : "No bookings or events scheduled for this day."
                  : lang === "es"
                  ? "Haz clic en cualquier día del calendario para ver sus citas."
                  : "Click any day in the calendar to view its schedule."}
              </p>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {/* 1. SPP Labs Web Bookings */}
                {selectedDayBookings.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {lang === "es" ? "Citas de la Web (SPP Labs)" : "Website Bookings (SPP Labs)"} (
                      {selectedDayBookings.length})
                    </span>

                    {selectedDayBookings.map((b) => {
                      let statusBadge = "bg-amber-50 border-amber-200 text-amber-700";
                      if (b.status === "CONFIRMED") statusBadge = "bg-emerald-50 border-emerald-200 text-emerald-700";
                      if (b.status === "CANCELLED") statusBadge = "bg-rose-50 border-rose-200 text-rose-700";

                      return (
                        <div
                          key={b.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs"
                        >
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
                                <span className="text-[11px] text-blue-600 block truncate max-w-[200px]">
                                  {b.email}
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                              {b.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 bg-white p-2.5 border border-slate-200/80 rounded-xl italic leading-relaxed">
                            {`"${b.message || "Sin comentarios."}"`}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200/50">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopySingleBooking(b)}
                                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                title={lang === "es" ? "Copiar cita" : "Copy"}
                              >
                                {copiedId === b.id ? (
                                  <>
                                    <ClipboardCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600 font-black">
                                      {lang === "es" ? "¡Copiado!" : "Copied!"}
                                    </span>
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
                                title={lang === "es" ? "Descargar .ics" : "Download .ics"}
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

                {/* 2. External Google Calendar Events */}
                {selectedDayExternalEvents.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                      <GoogleGIcon className="w-3.5 h-3.5" />
                      {lang === "es" ? "Eventos de Google Calendar" : "Google Calendar Events"} (
                      {selectedDayExternalEvents.length})
                    </span>

                    {selectedDayExternalEvents.map((ext) => {
                      const startTime = ext.isAllDay
                        ? lang === "es" ? "Todo el día" : "All day"
                        : new Date(ext.startDateTime).toLocaleTimeString(lang === "es" ? "es-ES" : "en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                      const endTime = ext.isAllDay
                        ? ""
                        : new Date(ext.endDateTime).toLocaleTimeString(lang === "es" ? "es-ES" : "en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                      return (
                        <div
                          key={ext.id}
                          className="bg-indigo-50/50 border border-indigo-200/80 rounded-2xl p-3.5 space-y-1.5 shadow-2xs"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs block">{ext.title}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0">
                              Google
                            </span>
                          </div>

                          <div className="text-xs text-indigo-900 font-mono font-bold">
                            {startTime} {endTime ? ` - ${endTime}` : ""}
                          </div>

                          {ext.description && (
                            <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-xl border border-indigo-100 leading-relaxed line-clamp-2">
                              {ext.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-md animate-fade-in text-slate-900">
            <div className="flex justify-between items-center mb-6">
              <h5 className="text-lg font-bold text-slate-900">
                {lang === "es" ? "Nueva Cita:" : "New Booking:"} {selectedDateStr}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-blue"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = String(i).padStart(2, "0");
                    return (
                      <optgroup key={h} label={`${h}:00`}>
                        <option value={`${h}:00`}>{h}:00</option>
                        <option value={`${h}:30`}>{h}:30</option>
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {lang === "es" ? "Nombre completo" : "Full Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="juan@ejemplo.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {lang === "es" ? "Teléfono" : "Phone"}
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {lang === "es" ? "Comentarios / Servicio" : "Message / Service"}
                </label>
                <textarea
                  rows={2}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder={lang === "es" ? "Detalles de la cita..." : "Booking details..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {lang === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSubmitting
                    ? lang === "es" ? "Guardando..." : "Saving..."
                    : lang === "es" ? "Guardar Cita" : "Save Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
