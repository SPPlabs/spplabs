"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { translations } from "@/lib/translations";
import { SppLabsLogo } from "@/components/SppLabsLogo";
import { InlineChatbot } from "@/components/chatbot/InlineChatbot";

export default function Home() {
  const [lang, setLang] = useState("es");
  const [activeTab, setActiveTab] = useState("throughput");
  const [activePage, setActivePage] = useState("inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("spp_lang");
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("spp_lang", newLang);
  };

  const t = translations[lang] || translations.es;

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

    // Render current month days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isPast = dateObj < today;
      const isSelected = bookingDate === dateStr;

      const occupiedForDay = occupiedSlots.filter((slot) => slot.date === dateStr);
      const isFullyBooked = occupiedForDay.length >= 9;

      days.push(
        <button
          key={day}
          type="button"
          disabled={isPast || isFullyBooked}
          onClick={() => {
            setBookingDate(dateStr);
            setBookingTime(""); // reset time when date changes
          }}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
            isSelected
              ? "bg-brand-green text-white shadow-md font-extrabold"
              : isPast
              ? "text-zinc-350 cursor-not-allowed"
              : isFullyBooked
              ? "bg-zinc-55 text-zinc-300 border border-zinc-150/60 cursor-not-allowed line-through"
              : "hover:bg-zinc-200 hover:text-black text-zinc-800 bg-white border border-zinc-100"
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

  // Simulated metrics for the interactive dashboard mockup
  const metrics = {
    throughput: {
      title: lang === "es" ? "Rendimiento de Red" : "Network Throughput",
      value: "1,248.4 Mb/s",
      change: lang === "es" ? "+14.2% desde la última hora" : "+14.2% from last hour",
      isPositive: true,
      color: "blue",
      svgPath: (
        <svg viewBox="0 0 500 150" className="w-full h-40 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="3">
          <defs>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d="M0,100 L50,110 L100,85 L150,90 L200,60 L250,75 L300,45 L350,55 L400,30 L450,42 L500,20" />
          <path d="M0,100 L50,110 L100,85 L150,90 L200,60 L250,75 L300,45 L350,55 L400,30 L450,42 L500,20 L500,150 L0,150 Z" fill="url(#blueGrad)" stroke="none" />
          <circle cx="500" cy="20" r="6" fill="#2563eb" className="animate-ping" />
          <circle cx="500" cy="20" r="4" fill="#2563eb" />
        </svg>
      )
    },
    cpu: {
      title: lang === "es" ? "Uso de CPU" : "CPU Utilization",
      value: "42.8%",
      change: lang === "es" ? "-5.3% desde la última hora" : "-5.3% from last hour",
      isPositive: true,
      color: "green",
      svgPath: (
        <svg viewBox="0 0 500 150" className="w-full h-40 text-brand-green" fill="none" stroke="currentColor" strokeWidth="3">
          <defs>
            <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d="M0,130 L50,120 L100,125 L150,80 L200,95 L250,70 L300,50 L350,85 L400,60 L450,48 L500,40" />
          <path d="M0,130 L50,120 L100,125 L150,80 L200,95 L250,70 L300,50 L350,85 L400,60 L450,48 L500,40 L500,150 L0,150 Z" fill="url(#greenGrad)" stroke="none" />
          <circle cx="500" cy="40" r="6" fill="#10b981" className="animate-ping" />
          <circle cx="500" cy="40" r="4" fill="#10b981" />
        </svg>
      )
    },
    latency: {
      title: lang === "es" ? "Tiempo de Respuesta API" : "API Response Time",
      value: "14ms",
      change: lang === "es" ? "+0.4% desde la última hora" : "+0.4% from last hour",
      isPositive: false,
      color: "black",
      svgPath: (
        <svg viewBox="0 0 500 150" className="w-full h-40 text-black" fill="none" stroke="currentColor" strokeWidth="3">
          <defs>
            <linearGradient id="blackGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d="M0,45 L50,42 L100,40 L150,43 L200,41 L250,38 L300,40 L350,42 L400,39 L450,41 L500,40" />
          <path d="M0,45 L50,42 L100,40 L150,43 L200,41 L250,38 L300,40 L350,42 L400,39 L450,41 L500,40 L500,150 L0,150 Z" fill="url(#blackGrad)" stroke="none" />
          <circle cx="500" cy="40" r="6" fill="#000000" className="animate-ping" />
          <circle cx="500" cy="40" r="4" fill="#000000" />
        </svg>
      )
    }
  };

  const navItems = [
    { id: "inicio", labelEs: "Inicio", labelEn: "Inicio" },
    { id: "servicios", labelEs: "Servicios", labelEn: "Servicios" },
    { id: "tecnologia", labelEs: "Tecnología", labelEn: "Tecnología" },
    { id: "nosotros", labelEs: "Nosotros", labelEn: "Nosotros" },
    { id: "contacto", labelEs: "Contacto", labelEn: "Contacto" }
  ];

  return (
    <div className="bg-white min-h-screen text-black flex flex-col font-sans selection:bg-brand-blue selection:text-white">
      {/* Navigation */}
      <header className="border-b border-zinc-150/70 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[94rem] mx-auto px-4 sm:px-8 md:px-12 h-20 flex items-center justify-between gap-4">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActivePage("inicio"); }}
            className="flex items-center gap-3 group shrink-0 transition-transform hover:scale-[1.01]" 
            id="nav-logo"
          >
            <img src="/logo.webp" alt="SPP Labs Logo" className="w-8 h-8 object-contain" />
            <SppLabsLogo inline={true} className="text-black" />
          </a>

          {/* Desktop Navigation - Pill Box */}
          <nav className="hidden md:flex items-center bg-zinc-100/80 border border-zinc-200/60 p-1 rounded-full shadow-sm gap-0.5">
            {navItems.map((item) => {
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ease-out cursor-pointer hover:scale-[1.03] active:scale-[0.97] ${
                    active
                      ? "bg-gradient-to-r from-brand-blue to-brand-green text-white shadow-sm shadow-brand-blue/20 hover:shadow-[0_0_12px_rgba(37,99,235,0.35)]"
                      : "text-zinc-600 hover:text-black hover:bg-zinc-200/50"
                  }`}
                  id={`nav-link-${item.id}`}
                >
                  {lang === "es" ? item.labelEs : item.labelEn}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            {/* Language Switcher Link */}
            <div className="flex gap-2 text-xs font-bold bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-xl shadow-sm">
              <button
                onClick={() => changeLanguage("es")}
                className={`hover:text-brand-blue cursor-pointer transition-colors ${lang === "es" ? "text-brand-blue font-black" : "text-zinc-400"}`}
              >
                ES
              </button>
              <span className="text-zinc-200">|</span>
              <button
                onClick={() => changeLanguage("en")}
                className={`hover:text-brand-blue cursor-pointer transition-colors ${lang === "en" ? "text-brand-blue font-black" : "text-zinc-400"}`}
              >
                EN
              </button>
            </div>

            <a
              href="/signup"
              className="text-sm font-semibold text-zinc-650 hover:text-black transition-colors hidden sm:inline-block"
              id="nav-signup-link"
            >
              {t.loginRegisterLink}
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-5 h-10 text-sm font-bold bg-gradient-to-r from-brand-blue to-brand-green text-white rounded-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-sm shadow-brand-blue/15 hover:shadow-lg hover:shadow-brand-green/20 cursor-pointer"
              id="nav-cta"
            >
              {t.navLogin}
            </a>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl transition-all cursor-pointer border border-zinc-250"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 z-40 bg-zinc-950/20 backdrop-blur-xs animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
            <div 
              className="bg-white border-b border-zinc-200 shadow-xl px-6 py-8 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Items */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-extrabold tracking-wide transition-all cursor-pointer ${
                        active
                          ? "bg-gradient-to-r from-brand-blue to-brand-green text-white shadow-sm shadow-brand-blue/15"
                          : "text-zinc-650 hover:text-black hover:bg-zinc-50"
                      }`}
                      id={`nav-menu-link-${item.id}`}
                    >
                      {lang === "es" ? item.labelEs : item.labelEn}
                    </button>
                  );
                })}
              </nav>

              <hr className="border-zinc-100" />

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <a
                  href="/signup"
                  className="w-full inline-flex items-center justify-center h-12 text-sm font-bold text-zinc-700 hover:text-black hover:bg-zinc-50 border border-zinc-250 rounded-2xl transition-all cursor-pointer"
                  id="nav-menu-signup"
                >
                  {t.loginRegisterLink}
                </a>
                <a
                  href="/login"
                  className="w-full inline-flex items-center justify-center h-12 text-sm font-bold bg-gradient-to-r from-brand-blue to-brand-green text-white rounded-2xl transition-all shadow-sm cursor-pointer"
                  id="nav-menu-cta"
                >
                  {t.navLogin}
                </a>
              </div>
            </div>
          </div>
        )}

      </header>

      <main className="flex-1 bg-white">
        
        {/* ================= INICIO ================= */}
        {activePage === "inicio" && (
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-10 pb-20 md:py-32 border-b border-zinc-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                  {/* Hero Copy */}
                  <div className="lg:col-span-6 flex flex-col items-start text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 text-xs font-bold bg-white mb-6 shadow-sm">
                      <span className="text-brand-blue">IA</span>
                      <span className="text-zinc-350">•</span>
                      <span className="text-cyan-500">WEB</span>
                      <span className="text-zinc-350">•</span>
                      <span className="text-brand-blue">SEO</span>
                      <span className="text-zinc-350">•</span>
                      <span className="text-brand-green">CRM</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.08] mb-8 lowercase font-sans">
                      {lang === "es" ? (
                        <>
                          convierte <br className="hidden sm:inline" />
                          visitas en{" "}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">
                            clientes
                          </span>
                        </>
                      ) : (
                        <>
                          convert <br className="hidden sm:inline" />
                          visits into{" "}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">
                            clients
                          </span>
                        </>
                      )}
                    </h1>
                    
                    <p className="text-base sm:text-lg text-zinc-650 max-w-xl leading-relaxed mb-10">
                      {lang === "es"
                        ? "Fusión perfecta entre diseño web premium, posicionamiento estratégico y asistencia inteligente. Atrae más tráfico, automatiza tus reservas y domina tus métricas con la suite todo en uno de SPP Labs."
                        : "Perfect fusion between premium web design, strategic positioning, and intelligent assistance. Attract more traffic, automate your bookings, and master your metrics with the all-in-one suite of SPP Labs."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                      <button
                        onClick={() => setActivePage("contacto")}
                        className="btn-donate cursor-pointer inline-flex items-center justify-center font-semibold w-full sm:w-auto"
                        id="hero-primary-cta"
                      >
                        {lang === "es" ? "Contactar" : "Contact Us"}
                      </button>
                      <div className="prueba-gratis-styled-wrapper w-full sm:w-auto">
                        <div className="container">
                          <button
                            className="button w-full sm:w-auto"
                            id="hero-secondary-cta"
                            onClick={() => {
                              const el = document.getElementById("prueba-gratis");
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth" });
                              } else {
                                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                              }
                            }}
                          >
                            Prueba Gratis
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom feature badges */}
                    <div className="mt-12 sm:mt-16 pt-8 border-t border-zinc-150/60 w-full grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-zinc-600">
                      <div className="flex items-center gap-2.5 text-xs font-bold tracking-wide">
                        <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Chatbot IA</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs font-bold tracking-wide">
                        <svg className="w-5 h-5 text-brand-blue shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Web Premium</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs font-bold tracking-wide">
                        <svg className="w-5 h-5 text-cyan-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>SEO + GEO</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs font-bold tracking-wide">
                        <svg className="w-5 h-5 text-brand-blue-dark shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Reservas</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs font-bold tracking-wide">
                        <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>CRM</span>
                      </div>
                    </div>
                  </div>

                  {/* Hero Visual Mockup: Enlarged Premium Video Container */}
                  <div className="lg:col-span-6 relative w-full flex items-center justify-center py-6 lg:py-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/25 via-purple-600/20 to-brand-green/25 rounded-3xl blur-3xl -z-10 animate-pulse duration-1000"></div>
                    <div className="relative w-full max-w-2xl p-3 sm:p-4 rounded-3xl bg-gradient-to-br from-zinc-900/95 via-black to-zinc-950/95 shadow-[0_25px_60px_-15px_rgba(37,99,235,0.25)] border border-zinc-700/60 ring-1 ring-white/10 group transition-all duration-500 hover:border-zinc-500 hover:shadow-[0_25px_70px_-10px_rgba(16,185,129,0.3)]">
                      {/* Decorative High-Tech Window Header */}
                      <div className="flex items-center justify-between pb-3 px-2 mb-2 border-b border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                          <span className="w-2 h-2 rounded-full bg-brand-green animate-ping"></span>
                          <span>SPP_LABS_DEMO.MP4</span>
                        </div>
                      </div>

                      <video
                        src="/hola_necesito_una_animacion_p.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto rounded-2xl shadow-2xl border border-zinc-800/90 object-cover block"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Inline Chatbot Section */}
            <section className="py-20 bg-zinc-50 border-b border-zinc-100">
              <div className="max-w-[94rem] mx-auto px-6">
                <InlineChatbot />
                
                {/* 5 Service Cards with Floating Holographic Numbers */}
                <div className="mt-24">
                  <div className="text-center max-w-3xl mx-auto mb-16 flex justify-center items-center">
                    <img
                      src="/soluciones.png"
                      alt="Soluciones Tecnológicas SPP Labs"
                      className="max-w-md sm:max-w-xl lg:max-w-2xl h-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
                    {/* Card 1 */}
                    <div className="flex flex-col items-center">
                      <div className="card-6" aria-hidden="true">
                        <div className="card-6__holo">
                          <div className="card-6__layer card-6__layer--back">1</div>
                          <div className="card-6__layer card-6__layer--mid">1</div>
                          <div className="card-6__layer card-6__layer--front">1</div>
                        </div>
                      </div>
                      
                      <div className="service-card">
                        <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                          <div>
                            <div className="text-brand-green text-2xl mb-4">
                              <svg className="w-8 h-8 text-brand-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="text-white text-base font-extrabold mb-2">
                              {lang === "es" ? "Desarrollo Web" : "Web Development"}
                            </h4>
                            <p className="text-zinc-400 text-xs leading-relaxed">
                              {lang === "es"
                                ? "Sitios Next.js interactivos y responsivos, con velocidad de carga optimizada y soporte transaccional nativo."
                                : "Interactive, fast Next.js applications featuring optimized runtime performance and database pipelines."}
                            </p>
                          </div>
                          <span className="text-brand-green text-[9px] uppercase font-bold tracking-wider">01 // Front-End</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="flex flex-col items-center">
                      <div className="card-6" aria-hidden="true">
                        <div className="card-6__holo">
                          <div className="card-6__layer card-6__layer--back">2</div>
                          <div className="card-6__layer card-6__layer--mid">2</div>
                          <div className="card-6__layer card-6__layer--front">2</div>
                        </div>
                      </div>
                      
                      <div className="service-card">
                        <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                          <div>
                            <div className="text-brand-green text-2xl mb-4">
                              <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <h4 className="text-white text-base font-extrabold mb-2">
                              {lang === "es" ? "Optimización SEO" : "SEO Optimization"}
                            </h4>
                            <p className="text-zinc-400 text-xs leading-relaxed">
                              {lang === "es"
                                ? "Aseguramos la máxima indexación orgánica en Google a través de velocidad móvil, código semántico y metadatos limpios."
                                : "Increase organic crawl visibility with mobile speed upgrades, semantic elements, and clean meta tags."}
                            </p>
                          </div>
                          <span className="text-brand-blue text-[9px] uppercase font-bold tracking-wider">02 // Positioning</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="flex flex-col items-center">
                      <div className="card-6" aria-hidden="true">
                        <div className="card-6__holo">
                          <div className="card-6__layer card-6__layer--back">3</div>
                          <div className="card-6__layer card-6__layer--mid">3</div>
                          <div className="card-6__layer card-6__layer--front">3</div>
                        </div>
                      </div>
                      
                      <div className="service-card">
                        <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                          <div>
                            <div className="text-brand-green text-2xl mb-4">
                              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <h4 className="text-white text-base font-extrabold mb-2">
                              {lang === "es" ? "Optimización GEO" : "GEO Optimization"}
                            </h4>
                            <p className="text-zinc-400 text-xs leading-relaxed">
                              {lang === "es"
                                ? "Generative Engine Optimization. Preparamos sus datos para ser citados y sugeridos por motores de IA como Perplexity y ChatGPT."
                                : "Generative Engine Optimization. We structure your datasets to be retrieved and cited by Gemini, Claude, and ChatGPT."}
                            </p>
                          </div>
                          <span className="text-purple-400 text-[9px] uppercase font-bold tracking-wider">03 // AI Engines</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div className="flex flex-col items-center">
                      <div className="card-6" aria-hidden="true">
                        <div className="card-6__holo">
                          <div className="card-6__layer card-6__layer--back">4</div>
                          <div className="card-6__layer card-6__layer--mid">4</div>
                          <div className="card-6__layer card-6__layer--front">4</div>
                        </div>
                      </div>
                      
                      <div className="service-card">
                        <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                          <div>
                            <div className="text-brand-green text-2xl mb-4">
                              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </div>
                            <h4 className="text-white text-base font-extrabold mb-2">
                              {lang === "es" ? "Agente de IA 24/7" : "24/7 AI Chatbot"}
                            </h4>
                            <p className="text-zinc-400 text-xs leading-relaxed">
                              {lang === "es"
                                ? "Modelos RAG locales entrenados con sus manuales de negocio, respondiendo de inmediato a peticiones comerciales."
                                : "Private RAG chatbot instances trained on your documents, executing query responses locally with zero data leak."}
                            </p>
                          </div>
                          <span className="text-emerald-400 text-[9px] uppercase font-bold tracking-wider">04 // Support</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 5 */}
                    <div className="flex flex-col items-center">
                      <div className="card-6" aria-hidden="true">
                        <div className="card-6__holo">
                          <div className="card-6__layer card-6__layer--back">5</div>
                          <div className="card-6__layer card-6__layer--mid">5</div>
                          <div className="card-6__layer card-6__layer--front">5</div>
                        </div>
                      </div>
                      
                      <div className="service-card">
                        <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                          <div>
                            <div className="text-cyan-400 text-2xl mb-4">
                              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="text-white text-base font-extrabold mb-2">
                              {lang === "es" ? "Sistema de Reservas y Contacto" : "Booking & Contact System"}
                            </h4>
                            <p className="text-zinc-400 text-xs leading-relaxed">
                              {lang === "es"
                                ? "Gestión automatizada de citas en tiempo real y recepción directa de clientes potenciales integrados con CRM."
                                : "Automated real-time appointment scheduling and instant lead capture integrated into your CRM."}
                            </p>
                          </div>
                          <span className="text-cyan-400 text-[9px] uppercase font-bold tracking-wider">05 // Bookings & Leads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </>
        )}

        {/* ================= SERVICIOS ================= */}
        {activePage === "servicios" && (
          <section className="py-16 md:py-24 bg-white border-b border-zinc-100">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  {lang === "es" ? "Soluciones de Ingeniería" : "Engineering Solutions"}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black mt-3 leading-tight">
                  {lang === "es" ? "Servicios Tecnológicos de Alto Rendimiento" : "High-Performance Tech Services"}
                </h2>
                <p className="text-zinc-650 mt-4 text-base md:text-lg leading-relaxed">
                  {lang === "es" 
                    ? "Diseñamos aplicaciones web, arquitecturas analíticas y sistemas de soporte inteligente que aceleran y aseguran la operación digital de su negocio." 
                    : "We engineer customized web applications, data analytics layers, and smart AI agents designed to secure and accelerate your business operations."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Service 1: Premium Web Development */}
                <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-brand-blue transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Desarrollo Web Premium" : "Premium Web Development"}</h3>
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {lang === "es" 
                        ? "Aplicaciones a medida desarrolladas con Next.js y React. Entregamos plataformas rápidas, seguras, completamente adaptativas y listas para conectarse a sus bases de datos en tiempo real." 
                        : "Custom applications built with Next.js and React. We deliver blazing-fast, secure, fully responsive platforms connected to live transactional operations."}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-blue mt-6 block uppercase tracking-wider">React • Next.js • SSR</span>
                </div>

                {/* Service 2: SEO */}
                <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-brand-green transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Posicionamiento SEO" : "SEO Optimization"}</h3>
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {lang === "es" 
                        ? "Optimización avanzada para buscadores tradicionales. Estructura semántica, velocidad de carga óptima en móviles, indexación limpia de URLs y estructuración de meta tags para mejorar el alcance orgánico de su negocio." 
                        : "Advanced index tuning for search engines. Semantic code design, fast mobile load speeds, clean URL maps, and optimized meta configurations to lift your brand’s organic reach."}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-green mt-6 block uppercase tracking-wider">Semantic HTML • Speed • Crawlability</span>
                </div>

                {/* Service 3: GEO */}
                <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-black transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-black mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Optimización GEO (Generative Engine Optimization)" : "Generative Engine Optimization (GEO)"}</h3>
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {lang === "es" 
                        ? "El SEO del futuro. Preparamos sus datos, artículos y documentación web para ser correctamente citados y leídos por motores de búsqueda de IA como ChatGPT Search, Gemini y Perplexity, aumentando su relevancia en IA." 
                        : "SEO built for the AI era. We format, schema, and reference your business databases so large AI systems (Gemini, Perplexity, ChatGPT) extract and display your brand as the primary reference."}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-black mt-6 block uppercase tracking-wider">AI Engines • LLM Citations • Schema</span>
                </div>

                {/* Service 4: CRM */}
                <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-brand-blue transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Sistemas CRM" : "CRM System Integrations"}</h3>
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {lang === "es" 
                        ? "Conectamos formularios, reservas e historiales de clientes directamente en bases de datos PostgreSQL o ClickHouse, accesibles desde un panel administrativo privado para optimizar su embudo comercial." 
                        : "Centralize customer forms, scheduler slots, and support history directly into optimized databases, queryable from your custom secure operations panel."}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-blue mt-6 block uppercase tracking-wider">PostgreSQL • Admin Panel • Pipelines</span>
                </div>

                {/* Service 5: AI Chatbot */}
                <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-brand-green transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Chatbot de IA 24/7" : "24/7 Custom AI Chatbot"}</h3>
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {lang === "es" 
                        ? "Un asistente de inteligencia artificial entrenado con los datos de su empresa (PDFs, manuales, catálogos) para contestar al instante cualquier consulta técnica o comercial, integrado de manera local." 
                        : "Deploy dynamic chat agents trained on your documentation, operating hours, and service booklets, resolving support tickets instantly 24 hours a day."}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-green mt-6 block uppercase tracking-wider">RAG Systems • Local GPU Inference • vLLM</span>
                </div>

                {/* Service 6: Booking System */}
                <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-black transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-black mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Sistema de Reservas y Contacto" : "Contact & Booking Scheduler"}</h3>
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {lang === "es" 
                        ? "Agendador interactivo de reuniones y llamadas comerciales. Bloquea dinámicamente horas ocupadas, envía correos de confirmación y sincroniza eventos de forma segura con sus calendarios internos." 
                        : "An interactive call scheduling platform. Disables fully booked days, synchronizes with email notifications, and streams scheduled calls directly to your support logs."}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-black mt-6 block uppercase tracking-wider">Web Calendar • Dynamic Slots • Email API</span>
                </div>
              </div>

              {/* services cta */}
              <div className="mt-20 border border-zinc-200 rounded-3xl p-12 text-center bg-zinc-50/50 max-w-4xl mx-auto shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full"></div>
                <h3 className="text-2xl font-black text-black mb-3">{lang === "es" ? "¿Listo para escalar su infraestructura?" : "Ready to scale your digital workflow?"}</h3>
                <p className="text-sm text-zinc-650 mb-8 max-w-xl mx-auto">
                  {lang === "es"
                    ? "Hable con nuestros ingenieros para diseñar y cotizar un proyecto adaptado a las métricas y objetivos de su empresa."
                    : "Schedule a session with our engineering founders to map out a technical implementation plan for your site."}
                </p>
                <button
                  onClick={() => setActivePage("contacto")}
                  className="inline-flex items-center justify-center px-8 h-12 text-sm font-bold bg-black text-white rounded-lg hover:bg-brand-blue transition-colors duration-300 cursor-pointer shadow-md"
                >
                  {lang === "es" ? "Programar Consulta" : "Book Consultation Now"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ================= TECNOLOGÍA ================= */}
        {activePage === "tecnologia" && (
          <section className="py-16 md:py-24 bg-white border-b border-zinc-100">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-green/5 border border-brand-green/10 px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  {lang === "es" ? "Ecosistema Tecnológico" : "Tech Ecosystem"}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black mt-3 leading-tight">
                  {lang === "es" ? "Nuestras Tecnologías Integradas" : "Our Integrated Tech Stack"}
                </h2>
                <p className="text-zinc-650 mt-4 text-base md:text-lg leading-relaxed">
                  {lang === "es"
                    ? "Bases de datos ultra-rápidas, aceleración por hardware y orquestación de inteligencia artificial ejecutadas en nuestro núcleo."
                    : "High-throughput databases, hardware acceleration, and AI orchestration engines running at the core of our infrastructure."}
                </p>
              </div>

              {/* Circular Orbit Ecosystem Hero with Plain Logos */}
              <div className="relative my-8 py-8 flex items-center justify-center min-h-[520px] md:min-h-[600px] w-full max-w-5xl mx-auto overflow-hidden">
                {/* Background Decorative Orbital Concentric Rings */}
                <div className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-zinc-200/60 opacity-60 pointer-events-none"></div>
                <div className="absolute w-[440px] h-[440px] md:w-[540px] md:h-[540px] rounded-full border border-dashed border-zinc-200/40 pointer-events-none"></div>

                {/* CENTRAL NODE: SPP Labs Logo */}
                <div className="relative z-20 flex flex-col items-center justify-center p-6 bg-white rounded-full shadow-2xl border border-zinc-200/80 animate-float-gentle">
                  <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
                    <img
                      src="/tech/logo sin fondo.webp"
                      alt="SPP Labs Core"
                      className="w-full h-full object-contain rounded-2xl p-1"
                    />
                  </div>
                  <span className="mt-2 px-3.5 py-1 bg-slate-900 text-white font-mono font-bold text-[11px] rounded-full shadow-xs tracking-wider">
                    SPP LABS
                  </span>
                </div>

                {/* HOVERING PLAIN TECH LOGOS IN CIRCULAR ORBIT */}
                {/* 1. Next.js - Top Center (0°) */}
                <div className="absolute top-[3%] left-1/2 -translate-x-1/2 z-20 animate-float-gentle delay-1">
                  <img
                    src="/tech/next-js-logo-png_seeklogo-321806.webp"
                    alt="Next.js"
                    title="Next.js"
                    className="w-14 md:w-20 h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                </div>

                {/* 2. Tailwind CSS - Top Right (36°) */}
                <div className="absolute top-[15%] right-[12%] md:right-[16%] z-20 animate-float-reverse delay-2">
                  <img
                    src="/tech/tailwind-css-logo-png_seeklogo-434090.webp"
                    alt="Tailwind CSS"
                    title="Tailwind CSS"
                    className="w-14 md:w-20 h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                </div>

                {/* 3. ClickHouse DB - Right (72°) */}
                <div className="absolute top-1/2 -translate-y-1/2 right-[1%] md:right-[5%] z-20 animate-float-gentle delay-3">
                  <img
                    src="/tech/clickhouse-logo_freelogovectors.net_.webp"
                    alt="ClickHouse DB"
                    title="ClickHouse DB"
                    className="w-16 md:w-24 h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                </div>

                {/* 4. PostgreSQL - Bottom Right (110°) */}
                <div className="absolute bottom-[15%] right-[12%] md:right-[16%] z-20 animate-float-reverse delay-4">
                  <img
                    src="/tech/PostgreSQL_logo.3colors.120x120.webp"
                    alt="PostgreSQL"
                    title="PostgreSQL"
                    className="w-14 md:w-20 h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                </div>

                {/* 5. vLLM Engine - Bottom Center Right (150°) */}
                <div className="absolute bottom-[3%] left-[64%] -translate-x-1/2 z-20 animate-float-gentle delay-5">
                  <img
                    src="/tech/vLLM-Full-Logo.webp"
                    alt="vLLM Engine"
                    title="vLLM Engine"
                    className="w-20 md:w-28 h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                </div>

                {/* 6. Hugging Face - Bottom Center Left (210°) */}
                <div className="absolute bottom-[3%] left-[36%] -translate-x-1/2 z-20 animate-float-reverse delay-1">
                  <img
                    src="/tech/png-transparent-hugging-face-logo-tech-companies.webp"
                    alt="Hugging Face"
                    title="Hugging Face"
                    className="w-14 md:w-20 h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                </div>

                {/* 7. Qdrant Vector DB - Bottom Left (250°) */}
                <div className="absolute bottom-[15%] left-[12%] md:left-[16%] z-20 animate-float-gentle delay-2">
                  <img
                    src="/tech/qdrant-logo-red-black.webp"
                    alt="Qdrant Vector DB"
                    title="Qdrant Vector DB"
                    className="w-20 md:w-28 h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                </div>

                {/* 8. LangChain - Left (288°) */}
                <div className="absolute top-1/2 -translate-y-1/2 left-[1%] md:left-[5%] z-20 animate-float-reverse delay-3">
                  <img
                    src="/tech/LangChain-Logo.webp"
                    alt="LangChain"
                    title="LangChain"
                    className="w-20 md:w-28 h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                </div>

                {/* 9. NVIDIA - Top Left (324°) */}
                <div className="absolute top-[15%] left-[12%] md:left-[16%] z-20 animate-float-gentle delay-4">
                  <img
                    src="/tech/Nvidia-Logo-PNG-Image-Transparent.webp"
                    alt="NVIDIA GPUs"
                    title="NVIDIA GPUs"
                    className="w-20 md:w-28 h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                </div>

                {/* 10. AMD EPYC - Top Center Left (350°) */}
                <div className="absolute top-[3%] left-[34%] -translate-x-1/2 z-20 animate-float-reverse delay-5">
                  <img
                    src="/tech/AMD_E_Blk_RGB.webp"
                    alt="AMD EPYC"
                    title="AMD EPYC"
                    className="w-16 md:w-24 h-14 md:h-20 object-contain rounded-2xl bg-white p-2.5 shadow-md border border-slate-200/80 hover:scale-125 transition-transform duration-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Technological Stack Details Grid */}
              <div className="mt-16">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h3 className="text-2xl font-bold text-black">{lang === "es" ? "Arquitectura de Software e Infraestructura" : "Software & Infrastructure Architecture"}</h3>
                  <p className="text-zinc-650 text-sm mt-2">{lang === "es" ? "Stack optimizado para latencia ultra-baja y procesamiento analítico." : "An architecture optimized for sub-millisecond analytics and AI queries."}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {/* Tech 1: Next.js */}
                  <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
                    <img src="/tech/next-js-logo-png_seeklogo-321806.webp" alt="Next.js" className="w-12 h-12 object-contain rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Frontend</span>
                    <h4 className="text-sm font-extrabold text-black mt-1">Next.js</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {lang === "es" ? "Renderizado híbrido en servidor." : "Hybrid server-side rendering."}
                    </p>
                  </div>

                  {/* Tech 2: Tailwind */}
                  <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
                    <img src="/tech/tailwind-css-logo-png_seeklogo-434090.webp" alt="Tailwind CSS" className="w-12 h-12 object-contain rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Styling</span>
                    <h4 className="text-sm font-extrabold text-black mt-1">Tailwind CSS</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {lang === "es" ? "Estilos limpios y eficientes." : "Utility CSS for fast style builds."}
                    </p>
                  </div>

                  {/* Tech 3: PostgreSQL */}
                  <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
                    <img src="/tech/PostgreSQL_logo.3colors.120x120.webp" alt="PostgreSQL" className="w-12 h-12 object-contain rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider">Database</span>
                    <h4 className="text-sm font-extrabold text-black mt-1">PostgreSQL</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {lang === "es" ? "Base de datos ACID primaria." : "Primary ACID storage tables."}
                    </p>
                  </div>

                  {/* Tech 4: ClickHouse */}
                  <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
                    <img src="/tech/clickhouse-logo_freelogovectors.net_.webp" alt="ClickHouse DB" className="w-12 h-12 object-contain rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider">Analytics</span>
                    <h4 className="text-sm font-extrabold text-black mt-1">ClickHouse DB</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {lang === "es" ? "Análisis en milisegundos." : "Millisecond analytical engine."}
                    </p>
                  </div>

                  {/* Tech 5: vLLM */}
                  <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
                    <img src="/tech/vLLM-Full-Logo.webp" alt="vLLM" className="w-16 h-12 object-contain rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">AI Inference</span>
                    <h4 className="text-sm font-extrabold text-black mt-1">vLLM Engine</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {lang === "es" ? "Inferencia LLM de alta velocidad." : "High-throughput LLM execution."}
                    </p>
                  </div>

                  {/* Tech 6: Qdrant */}
                  <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
                    <img src="/tech/qdrant-logo-red-black.webp" alt="Qdrant" className="w-16 h-12 object-contain rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Vector DB</span>
                    <h4 className="text-sm font-extrabold text-black mt-1">Qdrant</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {lang === "es" ? "Búsqueda vectorial RAG." : "Vector RAG context storage."}
                    </p>
                  </div>

                  {/* Tech 7: HuggingFace */}
                  <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
                    <img src="/tech/png-transparent-hugging-face-logo-tech-companies.webp" alt="Hugging Face" className="w-12 h-12 object-contain rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Models</span>
                    <h4 className="text-sm font-extrabold text-black mt-1">Hugging Face</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {lang === "es" ? "Pesos de modelos abiertos." : "Open language model pipeline."}
                    </p>
                  </div>

                  {/* Tech 8: LangChain */}
                  <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
                    <img src="/tech/LangChain-Logo.webp" alt="LangChain" className="w-16 h-12 object-contain rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Agents</span>
                    <h4 className="text-sm font-extrabold text-black mt-1">LangChain</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {lang === "es" ? "Orquestación RAG." : "Orchestration layer for RAG."}
                    </p>
                  </div>

                  {/* Tech 9: NVIDIA */}
                  <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
                    <img src="/tech/Nvidia-Logo-PNG-Image-Transparent.webp" alt="NVIDIA" className="w-16 h-12 object-contain rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Hardware</span>
                    <h4 className="text-sm font-extrabold text-black mt-1">NVIDIA GPUs</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {lang === "es" ? "Aceleración de Tensor Cores." : "Tensor Cores AI compute."}
                    </p>
                  </div>

                  {/* Tech 10: AMD */}
                  <div className="border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col items-center text-center">
                    <img src="/tech/AMD_E_Blk_RGB.webp" alt="AMD" className="w-14 h-12 object-contain rounded-xl mb-3" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Compute</span>
                    <h4 className="text-sm font-extrabold text-black mt-1">AMD EPYC</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {lang === "es" ? "Servidores multi-núcleo." : "Multi-core server nodes."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= NOSOTROS ================= */}
        {activePage === "nosotros" && (
          <section className="py-16 md:py-24 bg-white border-b border-zinc-100">
            <div className="max-w-7xl mx-auto px-6">
              
              {/* Section 1: About us */}
              <div className="grid md:grid-cols-12 gap-12 items-center mb-24">
                <div className="md:col-span-7 space-y-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3.5 py-1.5 rounded-full inline-block">
                    {lang === "es" ? "Fundadores de SPP Labs" : "SPP Labs Founders"}
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight">
                    {lang === "es" ? "Conozca a los Hermanos SPP" : "Meet the Hermanos SPP"}
                  </h2>
                  <p className="text-zinc-650 text-base md:text-lg leading-relaxed">
                    {lang === "es"
                      ? "SPP Labs es un laboratorio de ingeniería de software e infraestructura digital fundado por los hermanos SPP. Nos apasiona construir arquitecturas web ultra rápidas, alojar datos de forma segura en servidores bare-metal dedicados y diseñar inteligencias artificiales locales útiles para el día a día empresarial."
                      : "SPP Labs is a hardware-integrated software development studio founded by the SPP brothers. Focused on data autonomy, we build hybrid web dashboards, set up local database nodes, and structure local AI chatbot pipelines."}
                  </p>
                  <p className="text-zinc-500 text-sm">
                    {lang === "es"
                      ? "Creemos firmemente en la descentralización del cómputo y en dar a las empresas el control absoluto de sus datos analíticos y modelos de lenguaje sin depender de servicios de terceros."
                      : "We strongly advocate for computation sovereignty, giving businesses complete governance over their analytic events and model inferences without SaaS dependencies."}
                  </p>
                </div>

                <div className="md:col-span-5 border border-zinc-200 rounded-3xl p-8 bg-zinc-50/50 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full"></div>
                  <h3 className="text-lg font-bold text-black mb-4">{lang === "es" ? "Nuestros Pilares" : "Our Core Ethos"}</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue font-black flex items-center justify-center shrink-0 text-xs">✓</span>
                      <div>
                        <span className="text-sm font-bold text-black block">{lang === "es" ? "Velocidad Sub-Milisegundo" : "Sub-Millisecond Performance"}</span>
                        <span className="text-xs text-zinc-500 block">{lang === "es" ? "Analíticas impulsadas por ClickHouse." : "Analytics powered directly by ClickHouse nodes."}</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-green/10 text-brand-green font-black flex items-center justify-center shrink-0 text-xs">✓</span>
                      <div>
                        <span className="text-sm font-bold text-black block">{lang === "es" ? "Modelos de IA Locales" : "Local AI Architectures"}</span>
                        <span className="text-xs text-zinc-500 block">{lang === "es" ? "Inferencia en GPUs propias." : "vLLM model hosting inside our server rack."}</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-zinc-200 text-black font-black flex items-center justify-center shrink-0 text-xs">✓</span>
                      <div>
                        <span className="text-sm font-bold text-black block">{lang === "es" ? "Soberanía Hardware" : "In-House Server Nodes"}</span>
                        <span className="text-xs text-zinc-500 block">{lang === "es" ? "Sin silos de nubes externas." : "Completely free from external SaaS clouds."}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 2: Casos de éxito */}
              <div className="border-t border-zinc-150 pt-20 mb-24">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-green/5 border border-brand-green/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
                    {lang === "es" ? "Testimonios" : "Client Success Stories"}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-black">{lang === "es" ? "Casos de Éxito y Reseñas" : "Reviews & Client Feedback"}</h3>
                  <p className="text-zinc-500 text-sm mt-2">{lang === "es" ? "Lo que opinan las empresas que han migrado su infraestructura a SPP Labs." : "Feedback from organizations that run their dashboards on SPP Labs."}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Review 1 */}
                  <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex text-amber-500 gap-1 mb-4">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <p className="text-zinc-650 text-xs leading-relaxed italic mb-6">
                      {lang === "es"
                        ? "\"Nuestras consultas de analítica web tardaban hasta 4 segundos con el proveedor anterior. Tras migrar la base de datos a ClickHouse con SPP Labs, los informes cargan al instante en 14ms. Un cambio radical.\""
                        : "\"Web analytics queries took over 4 seconds with our old dashboard. After switching to ClickHouse with SPP Labs, records render in 14ms. Our dashboard efficiency went through the roof.\""}
                    </p>
                    <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Carlos Mendoza</span>
                      <span className="text-[10px] text-zinc-400 font-mono">CTO, Logística Express</span>
                    </div>
                  </div>

                  {/* Review 2 */}
                  <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex text-amber-500 gap-1 mb-4">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <p className="text-zinc-650 text-xs leading-relaxed italic mb-6">
                      {lang === "es"
                        ? "\"El chatbot de IA configurado de forma local resuelve el 75% de las dudas habituales de soporte sobre envíos y tarifas. Ahorramos decenas de horas semanales y las respuestas son ultra-rápidas.\""
                        : "\"The custom AI chatbot resolving tickets from our data documents handles 75% of routine questions. Saving hours of human support and giving clients instant answers.\""}
                    </p>
                    <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Marta G.</span>
                      <span className="text-[10px] text-zinc-400 font-mono">COO, E-Commerce Soluciones</span>
                    </div>
                  </div>

                  {/* Review 3 */}
                  <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex text-amber-500 gap-1 mb-4">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <p className="text-zinc-650 text-xs leading-relaxed italic mb-6">
                      {lang === "es"
                        ? "\"Hacer optimización de motores de búsqueda y de motores de IA (GEO) nos posicionó de primeros en las búsquedas sugeridas de ChatGPT y Gemini en nuestro sector. Las ventas orgánicas subieron un 35%.\""
                        : "\"Implementing generative engine optimization (GEO) alongside SEO put our store on top of recommended vendors by Gemini and ChatGPT Search. Direct sales increased by 35%.\""}
                    </p>
                    <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Daniel Santos</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Founder, Clinica Dental Sol</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Comunidad */}
              <div className="border-t border-zinc-150 pt-20">
                <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/10 rounded-tr-full"></div>

                  <span className="text-xs font-bold text-brand-green uppercase tracking-wider block mb-4">
                    {lang === "es" ? "Únase a Nosotros" : "Join Our Networks"}
                  </span>
                  
                  <div className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-white to-brand-green font-mono tracking-tight mb-4">
                    30,000+
                  </div>
                  
                  <h4 className="text-xl font-bold mb-4">
                    {lang === "es" ? "Miembros Activos en Redes Sociales" : "Active Community Members"}
                  </h4>
                  
                  <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed mb-8">
                    {lang === "es"
                      ? "Nuestros canales de desarrollo, GitHub repos e infraestructura libre agrupan a más de 30,000 ingenieros e interesados. ¡Hablemos de código, servidores e IA!"
                      : "Our open source developer circles, code repos, and community chats connect more than 30,000 builders. Connect with us to talk hardware optimization, clickhouse, and LLMs."}
                  </p>

                  <div className="flex flex-wrap justify-center gap-4 text-xs font-bold">
                    <a href="#" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl transition-all flex items-center gap-2 border border-zinc-700">
                      GitHub
                    </a>
                    <a href="#" className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl transition-all flex items-center gap-2">
                      Discord
                    </a>
                    <a href="#" className="px-6 py-3 bg-zinc-900 hover:bg-black text-white rounded-xl transition-all flex items-center gap-2 border border-zinc-800">
                      Twitter / X
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ================= CONTACTO ================= */}
        {activePage === "contacto" && (
          <section id="contact-bookings" className="py-16 md:py-24 bg-white border-b border-zinc-100">
            <div className="max-w-7xl mx-auto px-6">
              
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  {lang === "es" ? "Contacto Directo" : "Contact Center"}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black mt-2 leading-tight">
                  {lang === "es" ? "Agende su Cita o Envíenos un Mensaje" : "Request a Meeting or Message Us"}
                </h2>
                <p className="text-zinc-650 mt-4 text-sm leading-relaxed">
                  {lang === "es"
                    ? "Seleccione una fecha disponible para una videollamada de consultoría, o escríbanos sus requerimientos técnicos directamente."
                    : "Pick a consultation date using our database scheduler below, or write your system integration inquiries to our team."}
                </p>
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
                              value={bookingEmail}
                              onChange={(e) => setBookingEmail(e.target.value)}
                              placeholder="jane@example.com"
                              className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white text-black transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{lang === "es" ? "Teléfono" : "Phone"}  </label>
                            <input
                              type="text"
                              required
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
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const prev = new Date(currentMonth);
                                  prev.setMonth(prev.getMonth() - 1);
                                  setCurrentMonth(prev);
                                }}
                                className="p-1.5 hover:bg-zinc-200 text-zinc-600 rounded-lg transition-all cursor-pointer"
                              >
                                ‹
                              </button>
                              <span className="text-xs font-bold text-zinc-850">
                                {currentMonth.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" })}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = new Date(currentMonth);
                                  next.setMonth(next.getMonth() + 1);
                                  setCurrentMonth(next);
                                }}
                                className="p-1.5 hover:bg-zinc-200 text-zinc-600 rounded-lg transition-all cursor-pointer"
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
                              <div className="grid grid-cols-4 gap-1.5">
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
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-blue focus:bg-white text-black transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{lang === "es" ? "Teléfono (Opcional)" : "Phone (Optional)"}</label>
                        <input
                          type="text"
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
        )}

        {/* GLOBAL GALAXY CTA SECTION (Rendered on all pages EXCEPT contacto) */}
        {activePage !== "contacto" && (
          <section id="prueba-gratis" className="py-20 md:py-28 bg-zinc-950 text-white relative overflow-hidden border-b border-zinc-900">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/15 via-purple-600/15 to-brand-green/15 pointer-events-none" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full inline-block mb-4">
                {lang === "es" ? "Promoción Especial 2026-2027" : "Special Offer 2026-2027"}
              </span>
              
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                {lang === "es" ? "Empieza tu prueba gratis hasta 2027" : "Start your free trial until 2027"}
              </h2>
              
              <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed font-medium">
                {lang === "es"
                  ? "Accede hoy mismo a nuestro ecosistema completo de Inteligencia Artificial, desarrollo web de alto rendimiento, optimización SEO/GEO y gestión CRM sin compromiso."
                  : "Get instant access to our complete AI ecosystem, high-performance web development, SEO/GEO optimization, and client CRM management risk-free."}
              </p>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setActivePage("contacto");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="galaxy-btn inline-flex items-center justify-center cursor-pointer"
                  id="cta-galaxy-btn"
                >
                  <span className="galaxy-btn__content">
                    <span className="galaxy-btn__text">
                      {lang === "es" ? "Empezar Prueba Gratis" : "Start Free Trial"}
                    </span>
                    <svg className="galaxy-btn__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24}>
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M13 14h-2a8.999 8.999 0 0 0-7.968 4.81A10.136 10.136 0 0 1 3 18C3 12.477 7.477 8 13 8V3l10 8-10 8v-5z" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="galaxy-btn__glow" />
                  <span className="galaxy-btn__stars" />
                </button>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-100 py-12 mt-auto">
        <div className="max-w-[94rem] mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div 
            onClick={() => setActivePage("inicio")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img src="/logo.webp" alt="SPP Labs Logo" className="w-6 h-6 object-contain" />
            <SppLabsLogo inline={true} className="text-black" />
            <span className="text-xs text-zinc-400">{lang === "es" ? "| © 2026 SPP Labs Inc. Todos los derechos reservados." : "| © 2026 SPP Labs Inc. All rights reserved."}</span>
          </div>

          <div className="flex items-center gap-8 text-xs font-semibold text-zinc-500">
            <a href="#" className="hover:text-black transition-colors" id="footer-link-status">{lang === "es" ? "Estado" : "Status"}</a>
            <a href="#" className="hover:text-black transition-colors" id="footer-link-privacy">{lang === "es" ? "Política de Privacidad" : "Privacy Policy"}</a>
            <a href="#" className="hover:text-black transition-colors" id="footer-link-terms">{lang === "es" ? "Términos de Servicio" : "Terms of Service"}</a>
          </div>
        </div>
      </footer>

      <Script
        defer
        src={`${process.env.NEXT_PUBLIC_API_URL || "https://api.spplabs.es"}/tracker.js`}
        data-domain="spplabs.es"
        data-api-key={process.env.NEXT_PUBLIC_SPP_API_KEY || "spp_api_spplabs_es_admin_key_2026_dev_placeholder"}
      />
    </div>
  );
}
