"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { translations } from "@/lib/translations";
import { SppLabsLogo } from "@/components/SppLabsLogo";

export default function DashboardClient({
  session,
  allWebsites,
  currentWebsite,
  contactForms,
  bookings,
  apiKeys,
  chatbotKnowledge,
  aiUsage,
  notifications,
  supportRequests,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Language state initialized from localStorage
  const [lang, setLang] = useState("es");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedLang = localStorage.getItem("spp_lang");
    if (savedLang) {
      setLang(savedLang);
    } else {
      localStorage.setItem("spp_lang", "es");
    }

    const savedTheme = localStorage.getItem("spp_theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("spp_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("spp_lang", newLang);
  };

  const t = translations[lang] || translations.es;

  // Active navigation tab state
  const defaultTab = session.role === "ADMIN" && !searchParams.get("domain") ? "admin" : "overview";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Form states for creating a new client (admin only)
  const [newDomain, setNewDomain] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [createError, setCreateError] = useState("");

  // RAG Chatbot plain text info prompt
  const [chatbotContent, setChatbotContent] = useState(chatbotKnowledge?.content || "");
  const [iaSaving, setIaSaving] = useState(false);
  const [iaSaved, setIaSaved] = useState(false);

  // User petitions support requests
  const [petitionsList, setPetitionsList] = useState(supportRequests || []);
  const [petitionMsg, setPetitionMsg] = useState("");
  const [petitionSending, setPetitionSending] = useState(false);

  // Admin Announcements Notification creation
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [announcementTargetId, setAnnouncementTargetId] = useState("");
  const [announcementSending, setAnnouncementSending] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);
  const [announcementsList, setAnnouncementsList] = useState(notifications || []);

  const isImpersonating = session.role === "ADMIN" && currentWebsite.domain !== "spplabs.es";

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("week");

  const fetchAnalytics = async (timeframeParam = analyticsTimeframe) => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const res = await fetch(`/api/admin/analytics?domain=${currentWebsite.domain}&timeframe=${timeframeParam}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to load analytics");
      setAnalyticsData(result.data);
    } catch (err) {
      setAnalyticsError(err.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics(analyticsTimeframe);
    }
  }, [activeTab, currentWebsite.domain, analyticsTimeframe]);

  // Handle Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, status) => {
    if (!confirm(`¿Está seguro de que desea cambiar el estado de esta cita a ${status === "CONFIRMED" ? "Confirmada" : "Cancelada"}?`)) return;
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Error al actualizar estado");
      }
    } catch (e) {
      console.error(e);
      alert("Error al actualizar estado");
    }
  };

  // Handle Delete Booking
  const handleDeleteBooking = async (id) => {
    if (!confirm("¿Está seguro de que desea eliminar permanentemente esta cita de reserva?")) return;
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Error al eliminar reserva");
      }
    } catch (e) {
      console.error(e);
      alert("Error al eliminar reserva");
    }
  };

  // Handle Delete Contact
  const handleDeleteContact = async (id) => {
    if (!confirm("¿Está seguro de que desea eliminar permanentemente este mensaje de contacto?")) return;
    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Error al eliminar contacto");
      }
    } catch (e) {
      console.error(e);
      alert("Error al eliminar contacto");
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  // Handle Create Client Website (Admin only)
  const handleCreateClient = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreatedCredentials(null);
    setCreateLoading(true);

    try {
      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain, displayName: newDisplayName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create client");
      }

      setCreatedCredentials(data);
      setNewDomain("");
      setNewDisplayName("");
      router.refresh();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Chatbot Knowledge RAG Prompt text update
  const handleUpdateChatbotKnowledge = async (e) => {
    e.preventDefault();
    setIaSaving(true);
    setIaSaved(false);
    try {
      const res = await fetch("/api/admin/chatbot-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: chatbotContent, domain: currentWebsite.domain }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.warning) {
          alert(data.warning);
        } else {
          setIaSaved(true);
          setTimeout(() => setIaSaved(false), 3000);
        }
      } else {
        alert(data.error || "Failed to update chatbot knowledge");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update chatbot knowledge");
    } finally {
      setIaSaving(false);
    }
  };

  // Handle sending support request / petition
  const handleSendPetition = async (e) => {
    e.preventDefault();
    if (!petitionMsg.trim()) return;
    setPetitionSending(true);
    try {
      const res = await fetch("/api/admin/petitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: petitionMsg, domain: currentWebsite.domain }),
      });
      const data = await res.json();
      if (res.ok) {
        setPetitionMsg("");
        setPetitionsList([data.supportRequest, ...petitionsList]);
      } else {
        alert(data.error || "Failed to send petition");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send petition");
    } finally {
      setPetitionSending(false);
    }
  };

  // Handle creating admin notifications
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMsg.trim()) return;
    setAnnouncementSending(true);
    setAnnouncementSuccess(false);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementMsg,
          targetWebsiteId: announcementTargetId || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncementTitle("");
        setAnnouncementMsg("");
        setAnnouncementTargetId("");
        setAnnouncementSuccess(true);
        setAnnouncementsList([data.notification, ...announcementsList]);
        setTimeout(() => setAnnouncementSuccess(false), 3000);
      } else {
        alert(data.error || "Failed to create announcement");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create announcement");
    } finally {
      setAnnouncementSending(false);
    }
  };

  // Handle administrative user account deletion
  const handleDeleteUser = async (userId) => {
    if (!confirm(t.usersDeleteConfirm)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || data.error || "Failed to delete client account");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete client account");
    }
  };

  // ========================================================
  // HELPER VISUAL COMPONENTS FOR ANALYTICS, MAPS & BOOKINGS
  // ========================================================
  
  function DonutChart({ data, title }) {
    if (!data || data.length === 0) return <p className="text-xs text-slate-400 py-6 text-center">No hay datos</p>;
    
    const total = data.reduce((acc, item) => acc + Number(item.count || 0), 0);
    const colors = [
      "#3b82f6", // Blue
      "#10b981", // Green
      "#f59e0b", // Amber
      "#ef4444", // Red
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#6b7280", // Gray
    ];

    let accumulatedPercent = 0;

    const slices = data.map((item, index) => {
      const count = Number(item.count || 0);
      const percent = total > 0 ? (count / total) * 100 : 0;
      const color = colors[index % colors.length];
      const offset = 100 - accumulatedPercent;
      accumulatedPercent += percent;

      return {
        name: item.name || item.device_type || item.browser || item.os || item.page_url || "Otro",
        count,
        percent: percent.toFixed(1),
        color,
        strokeDasharray: `${percent} ${100 - percent}`,
        strokeDashoffset: offset,
      };
    });

    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
            {slices.map((slice, idx) => (
              <circle
                key={idx}
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke={slice.color}
                strokeWidth="4.5"
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                className="transition-all duration-500 hover:stroke-[5.5] cursor-pointer"
              />
            ))}
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
            <span className="text-base font-black text-slate-900">{total}</span>
          </div>
        </div>

        <div className="mt-4 w-full space-y-1.5 max-h-36 overflow-y-auto px-2">
          {slices.slice(0, 5).map((slice, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
                <span className="truncate max-w-[120px]" title={slice.name}>{slice.name}</span>
              </div>
              <span className="font-mono text-slate-900 shrink-0">{slice.count} ({slice.percent}%)</span>
            </div>
          ))}
          {slices.length > 5 && (
            <div className="text-[10px] text-slate-400 italic text-center font-medium pt-1">
              + {slices.length - 5} {lang === "es" ? "más" : "more"}
            </div>
          )}
        </div>
      </div>
    );
  }

  function ReferralFunnel({ data }) {
    if (!data || data.length === 0) return <p className="text-xs text-slate-450 py-6 text-center">No hay datos</p>;

    const total = data.reduce((acc, item) => acc + Number(item.count || 0), 0);
    const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 5);
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

    let currentFunnelY = 80;
    const funnelHeight = 40;

    const lanes = sortedData.map((item, idx) => {
      const fraction = total > 0 ? item.count / total : 0;
      const laneWidth = Math.max(fraction * funnelHeight, 2);
      const color = colors[idx % colors.length];

      const sourceY = 20 + idx * 35;
      const destY = currentFunnelY + laneWidth / 2;
      currentFunnelY += laneWidth;

      const pathD = `M 20 ${sourceY} C 100 ${sourceY}, 100 ${destY}, 180 ${destY}`;

      return {
        name: item.referrer || "Direct / None",
        count: item.count,
        percent: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
        pathD,
        laneWidth,
        color,
        sourceY,
      };
    });

    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center w-full">
        {/* SVG Canvas for Funnel Lanes */}
        <div className="w-full md:w-1/2 h-52 relative">
          <svg viewBox="0 0 240 200" className="w-full h-full overflow-visible">
            {/* Funnel Mouth Indicator on the Right */}
            <path d="M 180 75 L 210 75 L 225 100 L 225 120 L 210 145 L 180 145 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <text x="202" y="113" fill="#64748b" className="text-[7px] font-black tracking-widest font-mono">FUNNEL</text>
            
            {/* Render bezier lanes */}
            {lanes.map((lane, idx) => (
              <g key={idx} className="group">
                <path
                  d={lane.pathD}
                  fill="none"
                  stroke={lane.color}
                  strokeWidth={lane.laneWidth}
                  strokeOpacity="0.4"
                  className="transition-all duration-300 group-hover:stroke-opacity-80"
                />
                <path
                  d={lane.pathD}
                  fill="none"
                  stroke={lane.color}
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
                <circle cx="20" cy={lane.sourceY} r="3.5" fill={lane.color} />
              </g>
            ))}
          </svg>
        </div>

        {/* Funnel Legend */}
        <div className="w-full md:w-1/2 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {lang === "es" ? "Orígenes de Tráfico" : "Traffic Sources"}
          </h4>
          {lanes.map((lane, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lane.color }}></span>
                  <span className="text-slate-800 font-medium truncate max-w-[120px]">{lane.name}</span>
                </div>
                <span className="font-mono text-slate-900">{lane.count} ({lane.percent}%)</span>
              </div>
              <div className="h-2 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${lane.percent}%`, backgroundColor: lane.color }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function BookingsCalendar({ bookings, lang, onAccept, onReject, onDelete, t }) {
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
            targetWebsiteDomain: currentWebsite.domain,
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
              const hasBooking = dayBookings.length > 0;
              const isSelected = selectedDateStr === dateStr;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all border cursor-pointer relative ${
                    isSelected 
                      ? "bg-slate-900 border-slate-900 text-white shadow-md scale-95" 
                      : hasBooking
                        ? "bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100"
                        : "bg-slate-50/50 border-slate-200/60 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <span className="text-xs font-bold block">{day}</span>
                  {hasBooking && (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-white" : "bg-emerald-500"}`}></span>
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

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden font-sans selection:bg-brand-blue selection:text-white text-slate-900">
      
      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`h-full bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 md:relative md:z-20 shadow-sm transition-all duration-300 ease-in-out ${
        sidebarOpen 
          ? "w-72 p-5" 
          : "w-0 p-0 overflow-hidden border-r-0 md:w-20 md:p-3 md:border-r md:overflow-visible"
      }`}>
        <div className="flex flex-col gap-6">
          {/* Logo & Retract/Expand Toggle Section inside side panel */}
          {sidebarOpen ? (
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src="/logo.webp" alt="SPP Labs Logo" className="w-8 h-8 object-contain shrink-0" />
                <SppLabsLogo inline={true} className="text-slate-900 truncate" />
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition-all cursor-pointer border border-slate-200/60 shrink-0"
                title={lang === "es" ? "Contraer panel" : "Collapse sidebar"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1">
              <img src="/logo.webp" alt="SPP Labs Logo" className="w-8 h-8 object-contain" />
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition-all cursor-pointer border border-slate-200/60"
                title={lang === "es" ? "Expandir panel" : "Expand sidebar"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {[
              {
                id: "overview",
                label: t.menuResumen,
                icon: (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                  </svg>
                ),
              },
              {
                id: "analytics",
                label: t.menuAnaliticas,
                icon: (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                id: "clientes",
                label: t.menuClientes,
                count: contactForms.length + bookings.length,
                icon: (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
              },
              {
                id: "ia",
                label: t.menuIA,
                icon: (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                id: "notificaciones",
                label: t.menuNotificaciones,
                count: announcementsList.length,
                icon: (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
              },
              ...(session.role === "ADMIN" && !isImpersonating ? [{
                id: "admin",
                label: t.menuUsuarios,
                icon: (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
              }] : []),
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                title={item.label}
                className={`w-full flex items-center transition-all cursor-pointer rounded-xl font-bold ${
                  sidebarOpen
                    ? "gap-3 px-4 py-3 text-left text-sm"
                    : "justify-center p-3 relative"
                } ${
                  activeTab === item.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {item.count > 0 && (
                  sidebarOpen ? (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      activeTab === item.id ? "bg-slate-800 text-white border border-slate-700" : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      {item.count}
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-900 ring-2 ring-white" />
                  )
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Zone */}
        <div className="flex flex-col gap-3">
          {sidebarOpen ? (
            <>
              {/* Business Info / Profile rectangle */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                <div className="overflow-hidden mr-2">
                  <span className="font-bold text-xs text-slate-800 block truncate" title={currentWebsite.displayName}>
                    {currentWebsite.displayName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block truncate" title={currentWebsite.domain}>
                    {currentWebsite.domain}
                  </span>
                </div>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-300/40 shrink-0"
                  title={lang === "es" ? "Ajustes de Idioma" : "Language Settings"}
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 h-10 border border-slate-200 hover:border-red-200 hover:text-red-650 hover:bg-red-50/50 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {lang === "es" ? "Cerrar Sesión" : "Sign Out"}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="w-full flex items-center justify-center p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                title={lang === "es" ? "Ajustes de Idioma" : "Language Settings"}
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 border border-slate-200 hover:border-red-200 hover:text-red-650 hover:bg-red-50/50 rounded-xl text-slate-600 transition-all cursor-pointer"
                title={lang === "es" ? "Cerrar Sesión" : "Sign Out"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN VIEWPORT */}
      <div className="flex-1 h-full flex flex-col overflow-hidden bg-slate-50 relative z-10">
        
        {/* Impersonation Info Header Bar (Clean notification overlay instead of huge block) */}
        {isImpersonating && (
          <div className="bg-brand-blue text-white px-6 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-3 shadow-sm relative z-30 animate-fade-in shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {lang === "es" 
                ? `Vista de impersonación: viendo el panel de ${currentWebsite.domain}` 
                : `Impersonation view: viewing dashboard for ${currentWebsite.domain}`}
            </span>
            <button
              onClick={() => {
                router.push("/dashboard");
                setActiveTab("admin");
              }}
              className="bg-white text-brand-blue hover:bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer shadow-sm"
            >
              {lang === "es" ? "Salir de Impersonación" : "Exit Impersonation"}
            </button>
          </div>
        )}

        {/* Minimal Top Header info panel */}
        <header className="h-16 border-b border-slate-200/80 bg-white flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200/60"
              title={sidebarOpen ? (lang === "es" ? "Ocultar panel" : "Hide sidebar") : (lang === "es" ? "Mostrar panel" : "Show sidebar")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
            <span className="text-xs font-bold text-slate-400 font-mono">
              {currentWebsite.domain}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
              {session.domain}
            </span>
          </div>
        </header>

        {/* Tab content viewport window */}
        <main className="flex-1 overflow-y-auto p-8 w-full max-w-full">
          {/* TAB: ADMIN PANEL (USUARIOS) */}
          {activeTab === "admin" && session.role === "ADMIN" && (
            <div className="space-y-8 animate-fade-in">
              {/* Provision Website Form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-slate-900">Provisionar Sitio Cliente</h3>
                <p className="text-sm text-slate-500 mb-6">{t.usersSubtitle}</p>
                
                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl mb-6">
                    {createError}
                  </div>
                )}

                <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      {t.loginDomain}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="clientdomain.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      {t.usersThName}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ACME Corporation"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                    />
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full md:w-auto h-11 px-8 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center cursor-pointer"
                    >
                      {createLoading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        "Generar Credenciales"
                      )}
                    </button>
                  </div>
                </form>

                {/* Display Credentials After Creation */}
                {createdCredentials && (
                  <div className="mt-8 bg-slate-50 border border-brand-green/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-bl-full"></div>
                    
                    <div className="flex items-center gap-2 text-brand-green font-bold text-sm mb-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ¡Cliente provisionado exitosamente!
                    </div>

                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      <span className="font-bold text-red-500">ADVERTENCIA:</span> Copie la clave API ahora. Está encriptada usando Argon2id y no se volverá a mostrar.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t.signupToken}</span>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono text-slate-900 select-all">
                            {createdCredentials.signupToken}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(createdCredentials.signupToken)}
                            className="bg-white hover:bg-slate-100 border border-slate-200 text-xs px-3 py-2 rounded-lg font-bold transition-all active:scale-95 cursor-pointer"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Clave API</span>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono text-brand-green select-all">
                            {createdCredentials.rawApiKey}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(createdCredentials.rawApiKey)}
                            className="bg-white hover:bg-slate-100 border border-slate-200 text-xs px-3 py-2 rounded-lg font-bold transition-all active:scale-95 cursor-pointer"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Client Directory List */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-slate-900">{t.usersTitle}</h3>
                <p className="text-sm text-slate-500 mb-6">{t.usersSubtitle}</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold">
                        <th className="pb-3 font-semibold">{t.usersThName}</th>
                        <th className="pb-3 font-semibold">{t.usersThDomain}</th>
                        <th className="pb-3 font-semibold">{t.usersThStatus}</th>
                        <th className="pb-3 font-semibold">{t.usersThCreated}</th>
                        <th className="pb-3 text-right font-semibold">{t.usersThAction}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {allWebsites.map((web) => (
                        <tr key={web.id} className="hover:bg-slate-50 transition-all">
                          <td className="py-3.5 font-semibold text-slate-900">{web.displayName}</td>
                          <td className="py-3.5 text-slate-650 font-mono text-xs">{web.domain}</td>
                          <td className="py-3.5">
                            {web.role === "ADMIN" ? (
                              <span className="bg-brand-blue/15 text-brand-blue text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {t.usersAdminAccount}
                              </span>
                            ) : web.passwordHash ? (
                              <span className="bg-brand-green/15 text-brand-green text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {t.usersRegistered}
                              </span>
                            ) : (
                              <span className="bg-amber-500/15 text-amber-500 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {t.usersSetupPending}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-slate-500 text-xs">
                            {new Date(web.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 text-right flex items-center justify-end gap-2">
                            {web.role !== "ADMIN" && (
                              <>
                                <button
                                  onClick={() => {
                                    router.push(`/dashboard?domain=${web.domain}`);
                                    setActiveTab("overview");
                                  }}
                                  className="bg-slate-900 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-sm"
                                >
                                  {t.usersEnterDashboard}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(web.id)}
                                  className="border border-red-200 hover:bg-red-50 text-red-650 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                                >
                                  {t.usersDeleteAccount}
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* TAB: VISITOR ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-fade-in w-full">
              {/* Header stats */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm w-full">
                <div>
                  <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider font-mono">
                    {currentWebsite.domain}
                  </span>
                  <h2 className="text-2xl font-black mt-3 text-slate-950">{t.analyticsTitle}</h2>
                  <p className="text-slate-500 text-sm mt-1">{t.analyticsSubtitle}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                  {/* Timeframe Buttons Switcher */}
                  <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/60 max-w-sm shrink-0">
                    {[
                      { key: "day", label: lang === "es" ? "Día" : "Day" },
                      { key: "week", label: lang === "es" ? "Semana" : "Week" },
                      { key: "month", label: lang === "es" ? "Mes" : "Month" },
                      { key: "year", label: lang === "es" ? "Año" : "Year" },
                      { key: "all", label: lang === "es" ? "Todo" : "All" }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setAnalyticsTimeframe(opt.key);
                          fetchAnalytics(opt.key);
                        }}
                        className={`text-center py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          analyticsTimeframe === opt.key 
                            ? "bg-white text-slate-900 shadow-sm" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Real-time indicator */}
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-brand-green font-bold text-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      {(analyticsData?.overview?.active_visitors || 0) + " " + t.analyticsActiveUsers}
                    </div>
                    <button
                      onClick={() => fetchAnalytics(analyticsTimeframe)}
                      disabled={analyticsLoading}
                      className="p-2.5 bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-650 hover:text-slate-900 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <svg className={`w-5 h-5 ${analyticsLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {analyticsLoading && !analyticsData && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-slate-500 font-bold">Querying ClickHouse tables...</span>
                </div>
              )}

              {analyticsError && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl">
                  {analyticsError}
                </div>
              )}

              {analyticsData && (
                <div className="space-y-8 w-full">
                  {/* Overview aggregate counters */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                    <div className="bg-slate-55 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{t.analyticsTotalHits}</span>
                      <span className="text-2xl font-black font-mono text-slate-900">{analyticsData.overview.visitors}</span>
                    </div>
                    <div className="bg-slate-55 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{t.analyticsUniques}</span>
                      <span className="text-2xl font-black font-mono text-brand-blue">{analyticsData.overview.unique_visitors}</span>
                    </div>
                    <div className="bg-slate-55 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{t.analyticsSessions}</span>
                      <span className="text-2xl font-black font-mono text-brand-green">{analyticsData.overview.sessions}</span>
                    </div>
                    <div className="bg-slate-55 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{t.analyticsDuration}</span>
                      <span className="text-2xl font-black font-mono text-slate-900">{analyticsData.overview.avg_duration}s</span>
                    </div>
                    <div className="bg-slate-55 border border-slate-200 rounded-2xl p-5 text-center col-span-2 lg:col-span-1 shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{t.analyticsBounce}</span>
                      <span className="text-2xl font-black font-mono text-red-500">{analyticsData.overview.bounce_rate}%</span>
                    </div>
                  </div>

                  {/* Hourly/Daily Traffic Trend Line Chart (custom SVG line area chart) */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t.analyticsTrafficVolume}</h3>
                      <span className="bg-brand-blue/10 text-brand-blue text-xs px-3 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                        {analyticsTimeframe}
                      </span>
                    </div>
                    
                    {analyticsData.trends.length === 0 ? (
                      <p className="text-sm text-slate-450 py-10 text-center">No trend data logged yet.</p>
                    ) : (
                      <div className="w-full">
                        {(() => {
                          const trendPoints = analyticsData.trends;
                          const maxVal = Math.max(...trendPoints.map(t => Number(t.count || 0)), 1);
                          const width = 800;
                          const height = 180;
                          const spacing = trendPoints.length > 1 ? width / (trendPoints.length - 1) : width;
                          
                          const pts = trendPoints.map((t, idx) => {
                            const x = idx * spacing;
                            const y = height - (Number(t.count || 0) / maxVal) * (height - 20) - 10;
                            return `${x},${y}`;
                          }).join(" ");

                          const areaPts = trendPoints.length > 0 
                            ? `0,${height} ${pts} ${width},${height}` 
                            : "";

                          return (
                            <div className="w-full overflow-x-auto">
                              <div className="min-w-[600px] p-4">
                                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
                                  <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                                    </linearGradient>
                                  </defs>
                                  {/* Area Fill */}
                                  {areaPts && <polygon points={areaPts} fill="url(#areaGrad)" />}
                                  {/* Grid Lines */}
                                  <line x1="0" y1={height - 10} x2={width} y2={height - 10} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                                  <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                                  <line x1="0" y1="10" x2={width} y2="10" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                                  
                                  {/* Stroke Line */}
                                  {pts && <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                                  
                                  {/* Interactive Points */}
                                  {trendPoints.map((t, idx) => {
                                    const x = idx * spacing;
                                    const y = height - (Number(t.count || 0) / maxVal) * (height - 20) - 10;
                                    return (
                                      <g key={idx} className="group">
                                        <circle cx={x} cy={y} r="5.5" fill="#3b82f6" stroke="#fff" strokeWidth="2.5" className="cursor-pointer transition-all group-hover:scale-125" />
                                        <text x={x} y={y - 12} fill="#1e293b" fontSize="8" fontWeight="black" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono">
                                          {t.count}
                                        </text>
                                        <text x={x} y={height + 10} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle" className="pointer-events-none">
                                          {t.date.split("-").slice(1).join("/")}
                                        </text>
                                      </g>
                                    );
                                  })}
                                </svg>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Funnel of Traffic Referrers */}
                  <ReferralFunnel data={analyticsData.referrers} />

                  {/* Geographic Location & Spain Map Inset */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-8 w-full">
                    {/* World countries grid list */}
                    <div className="w-full lg:w-1/2 space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {lang === "es" ? "Ubicación Geográfica" : "Geographic Origin"}
                      </h4>
                      <div className="divide-y divide-slate-150 max-h-48 overflow-y-auto">
                        {analyticsData.countries.map((c, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2.5 text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-2">
                              <span className="text-slate-400">🌍</span>
                              <span>{c.country}</span>
                            </span>
                            <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{c.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Spain cities map inset */}
                    {(() => {
                      const spainCitiesList = analyticsData.spainCities || [];
                      const cityMapCoords = {
                        "Madrid": { x: 95, y: 70 },
                        "Barcelona": { x: 165, y: 45 },
                        "Valencia": { x: 135, y: 85 },
                        "Sevilla": { x: 75, y: 112 },
                        "Zaragoza": { x: 128, y: 46 },
                        "Málaga": { x: 82, y: 125 },
                        "Murcia": { x: 122, y: 106 },
                        "Palma": { x: 178, y: 80 },
                        "Bilbao": { x: 95, y: 25 },
                        "Alicante": { x: 132, y: 96 },
                        "Vigo": { x: 35, y: 38 },
                        "A Coruña": { x: 38, y: 22 },
                        "Santiago de Compostela": { x: 39, y: 30 },
                        "Granada": { x: 92, y: 118 },
                        "Córdoba": { x: 80, y: 104 },
                        "Valladolid": { x: 80, y: 48 },
                        "Oviedo": { x: 68, y: 22 },
                        "Santander": { x: 85, y: 22 },
                        "San Sebastián": { x: 110, y: 24 },
                        "Pamplona": { x: 120, y: 32 },
                        "Toledo": { x: 92, y: 78 },
                        "Salamanca": { x: 72, y: 58 },
                        "Burgos": { x: 95, y: 38 },
                        "Cádiz": { x: 68, y: 128 },
                        "Badajoz": { x: 55, y: 92 },
                      };

                      return (
                        <div className="w-full lg:w-1/2 flex flex-col sm:flex-row gap-6 border-l border-slate-150 pl-0 lg:pl-8">
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                              {lang === "es" ? "Mapa de Tráfico (España)" : "Spain Traffic Map"}
                            </h4>
                            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-center relative">
                              <svg viewBox="0 0 200 150" className="w-full h-44 overflow-visible">
                                <path d="M 30 100 L 40 40 L 70 20 L 150 20 L 180 50 L 175 100 L 120 130 L 70 120 L 45 110 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.2" />
                                <path d="M 30 100 L 40 40 L 52 40 L 52 110 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                                <rect x="8" y="115" width="40" height="30" fill="none" stroke="#e2e8f0" strokeDasharray="2 2" />
                                <circle cx="18" cy="125" r="1.5" fill="#94a3b8" />
                                <circle cx="26" cy="128" r="2" fill="#94a3b8" />
                                <circle cx="34" cy="130" r="1.5" fill="#94a3b8" />

                                {spainCitiesList.map((c, idx) => {
                                  const coords = cityMapCoords[c.city];
                                  if (!coords) return null;
                                  return (
                                    <g key={idx} className="group">
                                      <circle cx={coords.x} cy={coords.y} r="7" fill="#10b981" className="animate-ping opacity-25" />
                                      <circle cx={coords.x} cy={coords.y} r="3" fill="#10b981" stroke="#fff" strokeWidth="1" />
                                      <text x={coords.x} y={coords.y - 6} fill="#1e293b" fontSize="7" fontWeight="black" textAnchor="middle" className="pointer-events-none">
                                        {c.city}
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                            </div>
                          </div>

                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                              {lang === "es" ? "Ciudades (España)" : "Cities (Spain)"}
                            </h4>
                            <div className="divide-y divide-slate-150 max-h-48 overflow-y-auto">
                              {spainCitiesList.map((c, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 text-xs font-bold text-slate-700">
                                  <span>{c.city}</span>
                                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{c.count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Pizzas / Circle Donut Charts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {/* Pages circle */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center pt-2">
                        {lang === "es" ? "Páginas más visitadas" : "Top Visited Pages"}
                      </h4>
                      <DonutChart data={analyticsData.topPages.map(p => ({ name: p.page_url, count: p.count }))} />
                    </div>

                    {/* Operating Systems circle */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center pt-2">
                        {lang === "es" ? "Sistemas Operativos" : "Operating Systems"}
                      </h4>
                      <DonutChart data={analyticsData.os.map(o => ({ name: o.os, count: o.count }))} />
                    </div>

                    {/* Devices circle */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center pt-2">
                        {lang === "es" ? "Dispositivos" : "Devices"}
                      </h4>
                      <DonutChart data={analyticsData.devices.map(d => ({ name: d.device_type, count: d.count }))} />
                    </div>

                    {/* Browsers circle */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center pt-2">
                        {lang === "es" ? "Navegadores" : "Browsers"}
                      </h4>
                      <DonutChart data={analyticsData.browsers.map(b => ({ name: b.browser, count: b.count }))} />
                    </div>
                  </div>

                  {/* Conversions Table */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm w-full">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">{t.analyticsEvents}</h3>
                    {analyticsData.conversions.length === 0 ? (
                      <p className="text-xs text-slate-450 py-6 text-center">No conversions logged.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        {analyticsData.conversions.map((conv, idx) => {
                          let label = conv.event_type;
                          let color = "text-slate-950";
                          if (conv.event_type === "form_submit") {
                            label = "Form Submissions";
                            color = "text-brand-blue";
                          } else if (conv.event_type === "booking_created") {
                            label = "Bookings Created";
                            color = "text-brand-green";
                          } else if (conv.event_type === "button_click") {
                            label = "Button Clicks";
                            color = "text-slate-700";
                          } else if (conv.event_type === "outbound_link") {
                            label = "Outbound Links";
                            color = "text-red-500";
                          }
                          return (
                            <div key={idx} className="bg-slate-55 border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                              <span className="text-xs text-slate-550 font-bold block mb-1 uppercase tracking-wide">{label}</span>
                              <span className={`text-2xl font-black font-mono ${color}`}>{conv.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in w-full">
              {/* Header stats */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm w-full">
                <div>
                  <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider font-mono">
                    {currentWebsite.domain}
                  </span>
                  <h2 className="text-2xl font-black mt-3 text-slate-950">{t.overviewTitle}</h2>
                  <p className="text-slate-550 text-sm mt-1">{t.overviewActiveSince} {currentWebsite.registeredAt ? new Date(currentWebsite.registeredAt).toLocaleDateString() : new Date(currentWebsite.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-4 shrink-0">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[130px] text-center shadow-sm">
                    <span className="text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wide">{t.overviewTotalContacts}</span>
                    <span className="text-3xl font-black font-mono text-slate-900">{contactForms.length}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[130px] text-center shadow-sm">
                    <span className="text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wide">{t.overviewTotalBookings}</span>
                    <span className="text-3xl font-black font-mono text-brand-green">{bookings.length}</span>
                  </div>
                </div>
              </div>

              {/* Alert Center / Novedades y Acciones Pendientes */}
              {(() => {
                const pendingBookingsCount = bookings.filter(b => b.status === "PENDING").length;
                const recentContactsCount = contactForms.filter(c => {
                  const created = new Date(c.createdAt).getTime();
                  return Date.now() - created < 48 * 60 * 60 * 1000;
                }).length;
                const announcementsCount = announcementsList.length;

                return (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm w-full">
                    <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-blue"></span>
                      </span>
                      {lang === "es" ? "Panel de Novedades y Alertas" : "Updates & Alert Center"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      {/* Alert: Bookings */}
                      <div className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                        pendingBookingsCount > 0 
                          ? "bg-amber-50/60 border-amber-250/70 text-amber-900" 
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}>
                        <div className="text-2xl">📅</div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
                            {lang === "es" ? "Reservas Pendientes" : "Pending Bookings"}
                          </span>
                          <span className="text-lg font-black block mt-0.5">
                            {pendingBookingsCount > 0 
                              ? (lang === "es" ? `${pendingBookingsCount} por confirmar` : `${pendingBookingsCount} to confirm`)
                              : (lang === "es" ? "Todo al día" : "All caught up")
                            }
                          </span>
                        </div>
                      </div>

                      {/* Alert: Contact forms */}
                      <div className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                        recentContactsCount > 0 
                          ? "bg-brand-blue/5 border-brand-blue/20 text-brand-blue" 
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}>
                        <div className="text-2xl">✉️</div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
                            {lang === "es" ? "Mensajes Nuevos (48h)" : "New Messages (48h)"}
                          </span>
                          <span className="text-lg font-black block mt-0.5">
                            {recentContactsCount > 0 
                              ? (lang === "es" ? `${recentContactsCount} mensajes nuevos` : `${recentContactsCount} new messages`)
                              : (lang === "es" ? "Sin mensajes nuevos" : "No new messages")
                            }
                          </span>
                        </div>
                      </div>

                      {/* Alert: Announcements */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-4">
                        <div className="text-2xl">📢</div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
                            {lang === "es" ? "Comunicados de SPP Labs" : "SPP Labs Announcements"}
                          </span>
                          <span className="text-lg font-black block mt-0.5">
                            {announcementsCount > 0 
                              ? (lang === "es" ? `${announcementsCount} publicados` : `${announcementsCount} published`)
                              : (lang === "es" ? "Sin comunicados" : "No announcements")
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Data Lists Briefs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* Contact List Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-base text-slate-900">{t.clientesContactForms}</h3>
                    <button
                      onClick={() => setActiveTab("clientes")}
                      className="text-xs font-bold text-brand-blue hover:underline cursor-pointer"
                    >
                      {t.heroCTAMore}
                    </button>
                  </div>

                  {contactForms.length === 0 ? (
                    <div className="text-center py-10 text-slate-450 text-sm">
                      {t.clientesNoForms}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contactForms.slice(0, 3).map((form) => (
                        <div key={form.id} className="bg-slate-55 border border-slate-200 rounded-xl p-4 text-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-900">{form.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(form.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-slate-550 block text-xs truncate mb-2">{form.email}</span>
                          <p className="text-slate-600 text-xs bg-white p-2 rounded-lg border border-slate-200 line-clamp-2">
                            {form.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Booking List Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-base text-slate-900">{t.clientesBookings}</h3>
                    <button
                      onClick={() => setActiveTab("clientes")}
                      className="text-xs font-bold text-brand-green hover:underline cursor-pointer"
                    >
                      {t.heroCTAMore}
                    </button>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-10 text-slate-450 text-sm">
                      {t.clientesNoBookings}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map((booking) => {
                        let badgeColor = "bg-amber-50 border-amber-200 text-amber-700";
                        if (booking.status === "CONFIRMED") {
                          badgeColor = "bg-emerald-50 border-emerald-200 text-emerald-700";
                        } else if (booking.status === "CANCELLED") {
                          badgeColor = "bg-rose-50 border-rose-200 text-rose-700";
                        }
                        return (
                          <div key={booking.id} className="bg-slate-55 border border-slate-200 rounded-xl p-4 text-sm">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-900">{booking.name}</span>
                              <span className={`font-bold text-[10px] px-2 py-0.5 rounded border ${badgeColor}`}>
                                {booking.status === "CONFIRMED" ? t.clientesAccept : booking.status === "CANCELLED" ? t.clientesReject : "PENDIENTE"}
                              </span>
                            </div>
                            <div className="flex gap-4 text-xs font-mono text-slate-500 mb-2">
                              <span>📅 {new Date(booking.date).toLocaleDateString()}</span>
                              <span>⏰ {booking.time}</span>
                            </div>
                            <p className="text-slate-655 text-xs line-clamp-1 italic">
                              "{booking.message}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLIENTES (CONTACTS & BOOKINGS COMBINED) */}
          {activeTab === "clientes" && (
            <div className="space-y-8 animate-fade-in">
              {/* Contact Submissions list */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-slate-900">{t.clientesContactForms}</h3>
                <p className="text-sm text-slate-500 mb-6">{t.clientesSubtitle}</p>

                {contactForms.length === 0 ? (
                  <div className="text-center py-10 text-slate-450 text-sm">
                    {t.clientesNoForms}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contactForms.map((form) => (
                      <div key={form.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                          <div>
                            <span className="font-bold text-lg text-slate-900 block">{form.name}</span>
                            <span className="text-xs text-brand-blue font-semibold">{form.email}</span>
                          </div>
                          <div className="text-right text-xs text-slate-500 font-mono">
                            {new Date(form.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4 border-t border-slate-200 pt-4">
                          <div>
                            <span className="text-slate-550 font-bold block uppercase tracking-wider text-[10px]">{t.clientesPhone}</span>
                            <span className="text-slate-700 font-mono">{form.phone || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-550 font-bold block uppercase tracking-wider text-[10px]">ID</span>
                            <span className="text-slate-700 font-mono">{form.id}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="text-slate-555 font-bold block uppercase tracking-wider text-[10px] mb-2">Mensaje</span>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed font-sans">
                            {form.message}
                          </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-slate-200">
                          <button
                            onClick={() => handleDeleteContact(form.id)}
                            className="px-4 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            {t.clientesDelete}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bookings calendar list */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-slate-900">{t.clientesBookings}</h3>
                <p className="text-sm text-slate-500 mb-6">{t.clientesSubtitle}</p>

                {bookings.length === 0 ? (
                  <div className="text-center py-10 text-slate-450 text-sm">
                    {t.clientesNoBookings}
                  </div>
                ) : (
                  <BookingsCalendar
                    bookings={bookings}
                    lang={lang}
                    onAccept={handleUpdateBookingStatus}
                    onReject={handleUpdateBookingStatus}
                    onDelete={handleDeleteBooking}
                    t={t}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB: IA (CHATBOT CONFIG & METRICS) */}
          {activeTab === "ia" && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-slate-900">{t.iaTitle}</h3>
                <p className="text-sm text-slate-500 mb-6">{t.iaSubtitle}</p>

                {/* Token Usage Stats */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
                  <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wide">{t.iaTokenUsage}</h4>
                  {aiUsage.length === 0 ? (
                    <p className="text-xs text-slate-450 italic py-4">{t.iaNoUsage}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white border border-slate-250/60 p-4 rounded-xl shadow-sm text-center">
                        <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider mb-1">{t.iaPromptTokens}</span>
                        <span className="text-xl font-black font-mono text-slate-900">{aiUsage.reduce((acc, u) => acc + u.promptTokens, 0)}</span>
                      </div>
                      <div className="bg-white border border-slate-250/60 p-4 rounded-xl shadow-sm text-center">
                        <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider mb-1">{t.iaCompletionTokens}</span>
                        <span className="text-xl font-black font-mono text-slate-900">{aiUsage.reduce((acc, u) => acc + u.completionTokens, 0)}</span>
                      </div>
                      <div className="bg-white border border-slate-250/60 p-4 rounded-xl shadow-sm text-center">
                        <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider mb-1">{t.iaTotalTokens}</span>
                        <span className="text-xl font-black font-mono text-brand-blue">{aiUsage.reduce((acc, u) => acc + u.totalTokens, 0)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chatbot Knowledge Plain Text Box Form */}
                <form onSubmit={handleUpdateChatbotKnowledge} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">{t.iaRagContent}</label>
                    <p className="text-xs text-slate-500 mb-3">{t.iaRagDesc}</p>
                    <textarea
                      value={chatbotContent}
                      onChange={(e) => setChatbotContent(e.target.value)}
                      placeholder={t.iaPlaceholder}
                      className="w-full h-64 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 placeholder-slate-400 font-sans focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner resize-y"
                    />
                  </div>

                  {iaSaved && (
                    <div className="text-xs text-brand-green font-bold flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 p-3 rounded-lg animate-fade-in">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.iaSavedSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={iaSaving}
                    className="h-11 px-6 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  >
                    {iaSaving ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      t.iaSave
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICACIONES Y PETICIONES */}
          {activeTab === "notificaciones" && (
            <div className="space-y-8 animate-fade-in">
              
              {/* ADMIN VIEW: Send Notifications Form */}
              {session.domain === "spplabs.es" && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-1 text-slate-950">{t.adminNotifTitle}</h3>
                  <p className="text-sm text-slate-550 mb-6">{t.adminNotifDesc}</p>

                  <form onSubmit={handleSendAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-555 mb-2">{t.adminNotifSubject}</label>
                      <input
                        type="text"
                        required
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        placeholder="Ej: Mantenimiento programado de base de datos"
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-555 mb-2">{t.adminNotifMessage}</label>
                      <textarea
                        required
                        value={announcementMsg}
                        onChange={(e) => setAnnouncementMsg(e.target.value)}
                        placeholder="Escriba aquí los detalles del comunicado..."
                        className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs resize-none focus:outline-none focus:border-brand-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-555 mb-2">{t.adminNotifTarget}</label>
                      <select
                        value={announcementTargetId}
                        onChange={(e) => setAnnouncementTargetId(e.target.value)}
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
                      >
                        <option value="">-- Todos los usuarios (Global) --</option>
                        {allWebsites.filter(w => w.domain !== "spplabs.es").map(w => (
                          <option key={w.id} value={w.id}>{w.displayName} ({w.domain})</option>
                        ))}
                      </select>
                    </div>

                    {announcementSuccess && (
                      <div className="text-xs text-brand-green font-bold bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                        {t.adminNotifSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={announcementSending}
                      className="h-10 px-6 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      {announcementSending ? "Publicando..." : t.adminNotifButton}
                    </button>
                  </form>
                </div>
              )}

              {/* Announcements received Board */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-slate-900">{t.notifAnnouncements}</h3>
                <p className="text-sm text-slate-500 mb-6">{t.notifSubtitle}</p>

                {announcementsList.length === 0 ? (
                  <p className="text-xs text-slate-450 italic py-6 text-center">{t.notifNoAnnouncements}</p>
                ) : (
                  <div className="space-y-4">
                    {announcementsList.map((ann) => (
                      <div key={ann.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm text-slate-900">{ann.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans mb-3">{ann.message}</p>
                        {session.domain === "spplabs.es" && !isImpersonating && (
                          <div className="flex justify-end pt-2 border-t border-slate-200/40">
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="text-red-550 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-100/50"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

              {/* Submit support request / petitions form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-slate-900">{t.notifCreatePetition}</h3>
                <p className="text-sm text-slate-550 mb-6">{t.notifSubtitle}</p>

                <form onSubmit={handleSendPetition} className="space-y-4">
                  <div>
                    <textarea
                      required
                      value={petitionMsg}
                      onChange={(e) => setPetitionMsg(e.target.value)}
                      placeholder={t.notifPetitionPlaceholder}
                      className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-brand-blue resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={petitionSending || !petitionMsg.trim()}
                    className="h-10 px-6 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {petitionSending ? t.notifSending : t.notifSendPetition}
                  </button>
                </form>

                {/* Sent Petitions History List */}
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">{t.notifPetitionsHistory}</h4>
                  {petitionsList.length === 0 ? (
                    <p className="text-xs text-slate-450 italic py-2">{t.notifNoPetitions}</p>
                  ) : (
                    <div className="space-y-3">
                      {petitionsList.map((pet) => (
                        <div key={pet.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-700">{pet.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {t.notifDate}: {new Date(pet.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-655 leading-relaxed italic mb-3">"{pet.message}"</p>
                          <div className="flex justify-end pt-2 border-t border-slate-200/40">
                            <button
                              onClick={() => handleDeletePetition(pet.id)}
                              className="text-red-500 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all hover:bg-red-50 px-2 py-0.5 rounded border border-red-100/30"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              {lang === "es" ? "Eliminar" : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* LANGUAGE SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900">{t.settingsTitle}</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-6">{t.settingsSelectLang}</p>

            <div className="space-y-3">
              <button
                onClick={() => changeLanguage("es")}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
                  lang === "es"
                    ? "bg-brand-blue/10 border-brand-blue text-brand-blue"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>Español (Spanish)</span>
                {lang === "es" && (
                  <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => changeLanguage("en")}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
                  lang === "en"
                    ? "bg-brand-blue/10 border-brand-blue text-brand-blue"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>English (Inglés)</span>
                {lang === "en" && (
                  <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>

            <div className="border-t border-slate-100 pt-6 mt-6">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                {lang === "es" ? "Tema del Dashboard" : "Dashboard Theme"}
              </label>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <span className="text-sm text-slate-700 font-semibold">
                  {theme === "light" 
                    ? (lang === "es" ? "Modo Claro" : "Light Mode") 
                    : (lang === "es" ? "Modo Oscuro" : "Dark Mode")}
                </span>
                <div className="toggle-switch scale-75 origin-right">
                  <label className="switch-label">
                    <input 
                      type="checkbox" 
                      className="checkbox" 
                      checked={theme === "dark"} 
                      onChange={toggleTheme}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="h-10 px-5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-all"
              >
                {t.settingsSave}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
