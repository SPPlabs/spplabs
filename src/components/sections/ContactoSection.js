"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactoSection() {
  const { lang } = useLanguage();

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactResult, setContactResult] = useState(null);

  // Booking Form State
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Calendar states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [occupiedSlots, setOccupiedSlots] = useState([]);

  // Month navigation & date boundaries (current month & next month only)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59, 999);

  const currentViewMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

  const canGoPrev = currentViewMonthStart > startOfCurrentMonth;
  const canGoNext = currentViewMonthStart < startOfNextMonth;

  const fetchOccupiedSlots = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.spplabs.es";
      const res = await fetch(`${apiBase}/bookings?domain=spplabs.es`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOccupiedSlots(data.occupied || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch occupied slots:", error);
    }
  };

  useEffect(() => {
    fetchOccupiedSlots();
  }, []);

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Pad previous month days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`pad-${i}`} className="w-8 h-8"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isPast = dateObj < today;
      const isAfterNextMonth = dateObj > endOfNextMonth;
      const isSelected = bookingDate === dateStr;

      const occupiedForDay = occupiedSlots.filter((slot) => slot.date === dateStr);
      const isFullyBooked = occupiedForDay.length >= 9;
      const isDisabled = isPast || isAfterNextMonth || isFullyBooked;

      days.push(
        <button
          key={day}
          type="button"
          disabled={isDisabled}
          onClick={() => {
            if (isDisabled) return;
            setBookingDate(dateStr);
            setBookingTime(""); // reset time when date changes
          }}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
            isSelected
              ? "bg-brand-green text-white shadow-md font-extrabold cursor-pointer"
              : isPast || isAfterNextMonth
              ? "text-zinc-350 cursor-not-allowed"
              : isFullyBooked
              ? "bg-zinc-55 text-zinc-300 border border-zinc-150/60 cursor-not-allowed line-through"
              : "hover:bg-zinc-200 hover:text-black text-zinc-800 bg-white border border-zinc-100 cursor-pointer"
          }`}
          title={isFullyBooked ? (lang === "es" ? "Completo" : "Fully booked") : ""}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  // Submit handlers
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactResult(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.spplabs.es";
    const apiKey = process.env.NEXT_PUBLIC_SPP_API_KEY || "spp_api_spplabs_es_admin_key_2026_dev_placeholder";

    try {
      const res = await fetch(`${apiBase}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          domain: "spplabs.es",
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          message: contactMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to submit");

      setContactResult({ success: true, message: lang === "es" ? "¡Gracias! Su mensaje fue enviado con éxito." : "Thank you! Your message was submitted successfully." });
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactMessage("");
    } catch (err) {
      setContactResult({ success: false, message: err.message });
    } finally {
      setContactLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingResult(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.spplabs.es";
    const apiKey = process.env.NEXT_PUBLIC_SPP_API_KEY || "spp_api_spplabs_es_admin_key_2026_dev_placeholder";

    try {
      const res = await fetch(`${apiBase}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          domain: "spplabs.es",
          name: bookingName,
          email: bookingEmail,
          phone: bookingPhone,
          date: bookingDate,
          time: bookingTime,
          message: bookingMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to book");

      setBookingResult({ success: true, message: lang === "es" ? "¡Cita solicitada! La confirmaremos en breve." : "Appointment requested! We will confirm shortly." });
      setBookingName("");
      setBookingEmail("");
      setBookingPhone("");
      setBookingDate("");
      setBookingTime("");
      setBookingMessage("");
      fetchOccupiedSlots();
    } catch (err) {
      setBookingResult({ success: false, message: err.message });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <section id="contact-bookings" className="py-16 md:py-24 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3.5 py-1.5 rounded-full mb-4 inline-block">
            {lang === "es" ? "Contacto Directo" : "Contact Center"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black mt-2 leading-tight">
            {lang === "es" ? "Agende su Cita o Envíenos un Mensaje" : "Request a Meeting or Message Us"}
          </h1>
          <p className="text-zinc-650 mt-4 text-sm leading-relaxed">
            {lang === "es"
              ? "Seleccione una fecha para una agendar una llamada de consultoría, o escríbanos sus requerimientos técnicos o un mensaje directamente."
              : "Select a date to schedule a consultation call, or send us your technical requirements or a message directly."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-700 bg-zinc-100/80 px-4 py-2 rounded-full w-fit mx-auto border border-zinc-200 shadow-2xs">
            <svg className="w-4 h-4 text-brand-blue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email: <a href="mailto:info@spplabs.es" className="hover:text-black transition-colors underline">info@spplabs.es</a></span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Booking calendar */}
          <div className="lg:col-span-7 space-y-8">

            {/* Calendar component */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-green/5 rounded-bl-full pointer-events-none"></div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-black">{lang === "es" ? "Programar Consulta" : "Schedule Consultation"}</h3>
                </div>

                {bookingResult && (
                  <div className={`p-4 rounded-xl text-sm mb-6 ${
                    bookingResult.success ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"
                  }`}>
                    {bookingResult.message}
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{lang === "es" ? "Nombre" : "Name"}</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white text-black transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{lang === "es" ? "Correo Electrónico" : "Email"}</label>
                      <input
                        type="email"
                        required
                        maxLength={120}
                        value={bookingEmail}
                        onChange={(e) => setBookingEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white text-black transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{lang === "es" ? "Teléfono" : "Phone"}</label>
                      <input
                        type="tel"
                        required
                        minLength={6}
                        maxLength={30}
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        placeholder="+34 611 111 111"
                        className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white text-black transition-all"
                      />
                    </div>
                  </div>

                  {/* Interactive Calendar Component */}
                  <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        {lang === "es" ? "Seleccione Fecha y Hora" : "Select Date & Time"}
                      </span>
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          disabled={!canGoPrev}
                          onClick={() => {
                            if (!canGoPrev) return;
                            const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                            setCurrentMonth(prev);
                          }}
                          className={`p-1.5 rounded-lg transition-all ${
                            canGoPrev
                              ? "hover:bg-zinc-200 text-zinc-600 cursor-pointer"
                              : "text-zinc-300 cursor-not-allowed opacity-40"
                          }`}
                          title={!canGoPrev ? (lang === "es" ? "Mes anterior no disponible" : "Previous month not available") : ""}
                        >
                          ‹
                        </button>
                        <span className="text-xs font-bold text-zinc-850 min-w-[110px] text-center">
                          {currentMonth.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" })}
                        </span>
                        <button
                          type="button"
                          disabled={!canGoNext}
                          onClick={() => {
                            if (!canGoNext) return;
                            const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                            setCurrentMonth(next);
                          }}
                          className={`p-1.5 rounded-lg transition-all ${
                            canGoNext
                              ? "hover:bg-zinc-200 text-zinc-600 cursor-pointer"
                              : "text-zinc-300 cursor-not-allowed opacity-40"
                          }`}
                          title={!canGoNext ? (lang === "es" ? "Mes siguiente no disponible" : "Next month not available") : ""}
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    {/* Day Grid Header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 uppercase">
                      {lang === "es" ? (
                        <><div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div></>
                      ) : (
                        <><div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div></>
                      )}
                    </div>
                    
                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendarDays()}
                    </div>

                    {/* Hourly slots grid */}
                    {bookingDate ? (
                      <div className="space-y-2.5 pt-2 border-t border-zinc-200/60">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          {lang === "es" ? "Horas disponibles para" : "Slots for"} {new Date(bookingDate).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { weekday: "short", month: "short", day: "numeric" })}:
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 gap-2">
                          {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((t) => {
                            const isOccupied = occupiedSlots.some((slot) => slot.date === bookingDate && slot.time === t);
                            return (
                              <button
                                key={t}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => setBookingTime(t)}
                                className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all text-center border cursor-pointer ${
                                  isOccupied
                                    ? "bg-zinc-50 border-zinc-200 text-zinc-300 line-through cursor-not-allowed"
                                    : bookingTime === t
                                    ? "bg-brand-green border-brand-green text-white shadow-sm"
                                    : "bg-white border-zinc-200 text-zinc-800 hover:border-brand-green hover:bg-brand-green/5"
                                }`}
                                title={isOccupied ? (lang === "es" ? "Ocupado" : "Occupied") : ""}
                              >
                                {t}
                              </button>
                            );
                          })}
                        </div>
                        <input type="hidden" name="booking_date" required value={bookingDate} />
                        <input type="hidden" name="booking_time" required value={bookingTime} />
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-400 italic text-center pt-2 border-t border-zinc-200/60">
                        {lang === "es" ? "Por favor, seleccione una fecha del calendario para ver las horas." : "Please select a date from the calendar to check hours."}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{lang === "es" ? "Consulta / Nota" : "Inquiry / Note"}</label>
                    <input
                      type="text"
                      value={bookingMessage}
                      onChange={(e) => setBookingMessage(e.target.value)}
                      placeholder={lang === "es" ? "Tema de consulta (ej: SEO, consultoría frontend)" : "Inquiry focus (e.g., SEO, Frontend consulting)"}
                      className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white text-black transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full h-11 bg-black hover:bg-brand-green text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center"
                  >
                    {bookingLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      lang === "es" ? "Solicitar Cita" : "Request Booking"
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-blue/5 rounded-bl-full pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black">{lang === "es" ? "Enviar un Mensaje" : "Send a Message"}</h3>
              </div>

              {contactResult && (
                <div className={`p-4 rounded-xl text-sm mb-6 ${
                  contactResult.success ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"
                }`}>
                  {contactResult.message}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-blue focus:bg-white text-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{lang === "es" ? "Correo Electrónico" : "Email"}</label>
                  <input
                    type="email"
                    required
                    maxLength={120}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-blue focus:bg-white text-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{lang === "es" ? "Teléfono (Opcional)" : "Phone (Optional)"}</label>
                  <input
                    type="tel"
                    maxLength={30}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-blue focus:bg-white text-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{lang === "es" ? "Mensaje" : "Message"}</label>
                  <textarea
                    required
                    minLength={5}
                    maxLength={3000}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder={lang === "es" ? "Cuéntenos sobre los requisitos de su proyecto..." : "Tell us about your project requirements..."}
                    className="w-full h-28 border border-zinc-200 bg-zinc-50 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-blue focus:bg-white text-black transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full h-11 bg-black hover:bg-brand-blue text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {contactLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    lang === "es" ? "Enviar Consulta" : "Submit Query"
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
