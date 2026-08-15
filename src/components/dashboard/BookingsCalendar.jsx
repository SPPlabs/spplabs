"use client";

import { useState, useEffect } from "react";

export default function BookingsCalendar({ bookings, lang, onAccept, onReject, onDelete, t, currentWebsiteDomain, router }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayBookings, setSelectedDayBookings] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState("");

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

  useEffect(() => {
    if (selectedDateStr) {
      setSelectedDayBookings(bookingsMap[selectedDateStr] || []);
    }
  }, [bookings, selectedDateStr]);

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
    setSelectedDayBookings(bookingsMap[formattedDate] || []);
  };

  const weekdayHeaders = lang === "es" 
    ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-7 w-full">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-extrabold text-lg text-slate-900">{monthLabel} {year}</h4>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer text-sm font-bold"
            >
              &larr;
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer text-sm font-bold"
            >
              &rarr;
            </button>
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
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {selectedDayBookings.map((b) => {
                let statusBadge = "bg-amber-50 border-amber-200 text-amber-700";
                if (b.status === "CONFIRMED") statusBadge = "bg-emerald-50 border-emerald-200 text-emerald-700";
                if (b.status === "CANCELLED") statusBadge = "bg-rose-50 border-rose-200 text-rose-700";

                return (
                  <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-950 block">{b.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{b.time}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                        {b.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2 border border-slate-200 rounded-lg italic">
                      "{b.message || "Sin comentarios."}"
                    </p>

                    <div className="flex gap-2 pt-2 border-t border-slate-200/50">
                      {b.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => onAccept(b.id, "CONFIRMED")}
                            className="bg-brand-green hover:bg-brand-green-dark text-white font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer"
                          >
                            {t.clientesAccept}
                          </button>
                          <button
                            onClick={() => onReject(b.id, "CANCELLED")}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer"
                          >
                            {t.clientesReject}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDelete(b.id)}
                        className="ml-auto text-red-650 hover:bg-red-50 font-semibold text-[10px] px-2.5 py-1 rounded border border-red-100"
                      >
                        {t.clientesDelete}
                      </button>
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
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-705 cursor-pointer"
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
