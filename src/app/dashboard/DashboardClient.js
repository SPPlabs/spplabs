"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { translations } from "@/lib/translations";

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

  useEffect(() => {
    const savedLang = localStorage.getItem("spp_lang");
    if (savedLang) {
      setLang(savedLang);
    } else {
      localStorage.setItem("spp_lang", "es");
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("spp_lang", newLang);
  };

  const t = translations[lang] || translations.es;

  // Active navigation tab state
  const defaultTab = session.role === "ADMIN" && !searchParams.get("domain") ? "admin" : "overview";
  const [activeTab, setActiveTab] = useState(defaultTab);

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

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const res = await fetch(`/api/admin/analytics?domain=${currentWebsite.domain}`);
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
      fetchAnalytics();
    }
  }, [activeTab, currentWebsite.domain]);

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
        setIaSaved(true);
        setTimeout(() => setIaSaved(false), 3000);
      } else {
        const data = await res.json();
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


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-brand-blue selection:text-white">
      {/* Impersonation Alert Banner */}
      {isImpersonating && (
        <div className="bg-brand-blue text-white px-6 py-2.5 text-center text-sm font-semibold flex items-center justify-center gap-3 shadow-md z-40 relative">
          <span className="flex items-center gap-1.5">
            <svg className="w-4.5 h-4.5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Impersonation View: <span className="underline font-bold">{currentWebsite.domain}</span> ({currentWebsite.displayName})
          </span>
          <button
            onClick={() => {
              router.push("/dashboard");
              setActiveTab("admin");
            }}
            className="bg-black/35 hover:bg-black/60 text-white px-3 py-1 rounded-md text-xs font-bold transition-all border border-white/20"
          >
            Exit Impersonation
          </button>
        </div>
      )}

      {/* Main Dashboard Navigation Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="SPP Labs Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg tracking-tight">
              SPP <span className="text-slate-500 font-medium">labs</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-500 font-medium block">Logged in as</span>
              <span className="text-sm font-semibold text-slate-700">{session.domain}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 h-10 text-xs font-bold border border-slate-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Sidebar Menu */}
        <aside className="lg:col-span-3 flex flex-col justify-between min-h-[500px]">
          <div className="flex flex-col gap-2">
            {session.role === "ADMIN" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-brand-blue text-white shadow-md animate-fade-in"
                    : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-900 shadow-sm"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t.menuUsuarios}
              </button>
            )}

            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-900 shadow-sm"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              {t.menuResumen}
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-900 shadow-sm"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {t.menuAnaliticas}
            </button>

            <button
              onClick={() => setActiveTab("clientes")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
                activeTab === "clientes"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-900 shadow-sm"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {t.menuClientes}
              {(contactForms.length > 0 || bookings.length > 0) && (
                <span className="ml-auto bg-brand-blue text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {contactForms.length + bookings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("ia")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
                activeTab === "ia"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-900 shadow-sm"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {t.menuIA}
            </button>

            <button
              onClick={() => setActiveTab("notificaciones")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
                activeTab === "notificaciones"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-900 shadow-sm"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {t.menuNotificaciones}
              {announcementsList.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {announcementsList.length}
                </span>
              )}
            </button>
          </div>

          {/* Bottom Business Info Card & Language Settings Toggle */}
          <div className="border-t border-slate-200 pt-4 mt-8">
            <div className="flex items-center justify-between bg-slate-100 rounded-xl p-3 shadow-sm border border-slate-200/50">
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
                className="p-1.5 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-300/40"
                title={lang === "es" ? "Ajustes de Idioma" : "Language Settings"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-9 flex flex-col gap-6">
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
            <div className="space-y-8 animate-fade-in">
              {/* Header stats */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                <div>
                  <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider font-mono">
                    {currentWebsite.domain}
                  </span>
                  <h2 className="text-2xl font-black mt-3 text-slate-950">{t.analyticsTitle}</h2>
                  <p className="text-slate-500 text-sm mt-1">{t.analyticsSubtitle}</p>
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
                    onClick={fetchAnalytics}
                    disabled={analyticsLoading}
                    className="p-2.5 bg-slate-155 hover:bg-slate-200 border border-slate-200 text-slate-650 hover:text-slate-900 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <svg className={`w-5 h-5 ${analyticsLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3" />
                    </svg>
                  </button>
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
                <div className="space-y-6">
                  {/* Overview aggregate counters */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{t.analyticsTotalHits}</span>
                      <span className="text-2xl font-black font-mono text-slate-900">{analyticsData.overview.visitors}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{t.analyticsUniques}</span>
                      <span className="text-2xl font-black font-mono text-brand-blue">{analyticsData.overview.unique_visitors}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{t.analyticsSessions}</span>
                      <span className="text-2xl font-black font-mono text-brand-green">{analyticsData.overview.sessions}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{t.analyticsDuration}</span>
                      <span className="text-2xl font-black font-mono text-slate-900">{analyticsData.overview.avg_duration}s</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center col-span-2 lg:col-span-1 shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">{t.analyticsBounce}</span>
                      <span className="text-2xl font-black font-mono text-red-500">{analyticsData.overview.bounce_rate}%</span>
                    </div>
                  </div>

                  {/* Hourly/Daily Traffic Trend Bar Chart (pure CSS) */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">{t.analyticsTrafficVolume}</h3>
                    {analyticsData.trends.length === 0 ? (
                      <p className="text-sm text-slate-450 py-10 text-center">No trend data logged yet.</p>
                    ) : (
                      <div>
                        <div className="flex items-end justify-between gap-2 h-44 border-b border-slate-200/80 pb-2">
                          {analyticsData.trends.map((trend, idx) => {
                            const maxVal = Math.max(...analyticsData.trends.map(x => x.count), 1);
                            const heightPct = Math.round((trend.count / maxVal) * 100);
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                <span className="text-[10px] font-bold font-mono text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
                                  {trend.count}
                                </span>
                                <div
                                  style={{ height: `${Math.max(heightPct, 6)}%` }}
                                  className="w-full bg-brand-blue/35 group-hover:bg-brand-blue rounded-t-md transition-all duration-300 relative"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-all rounded-t-md"></div>
                                </div>
                                <span className="text-[9px] font-semibold text-slate-550 uppercase tracking-wide truncate max-w-[50px] sm:max-w-none">
                                  {trend.date.split("-").slice(1).join("/")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content & Traffic Sources Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Pages */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">{t.analyticsTopPages}</h3>
                      {analyticsData.topPages.length === 0 ? (
                        <p className="text-xs text-slate-450 py-6 text-center">No page views recorded.</p>
                      ) : (
                        <div className="space-y-4">
                          {analyticsData.topPages.map((p, idx) => {
                            const maxCount = Math.max(...analyticsData.topPages.map(x => x.count), 1);
                            const widthPct = Math.round((p.count / maxCount) * 100);
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="font-mono text-slate-700">{p.page_url}</span>
                                  <span className="text-slate-950 font-mono">{p.count} views</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                                  <div style={{ width: `${widthPct}%` }} className="h-full bg-brand-blue rounded-full"></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Top Referrers */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">{t.analyticsReferrers}</h3>
                      {analyticsData.referrers.length === 0 ? (
                        <p className="text-xs text-slate-450 py-6 text-center">No referrers logged.</p>
                      ) : (
                        <div className="space-y-4">
                          {analyticsData.referrers.map((r, idx) => {
                            const maxCount = Math.max(...analyticsData.referrers.map(x => x.count), 1);
                            const widthPct = Math.round((r.count / maxCount) * 100);
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-slate-700">{r.referrer}</span>
                                  <span className="text-slate-950 font-mono">{r.count} hits</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                                  <div style={{ width: `${widthPct}%` }} className="h-full bg-brand-green rounded-full"></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Countries & Systems Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Countries */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">{t.analyticsGeo}</h3>
                      {analyticsData.countries.length === 0 ? (
                        <p className="text-xs text-slate-450 py-6 text-center">No location metrics logged.</p>
                      ) : (
                        <div className="divide-y divide-slate-150">
                          {analyticsData.countries.map((c, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2.5 text-xs font-semibold text-slate-750">
                              <span className="text-slate-700">{c.country}</span>
                              <span className="bg-slate-100 border border-slate-200 font-mono text-slate-950 px-2 py-0.5 rounded">
                                {c.count} sessions
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Devices, Browsers & OS Tabular Summary */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                      {/* Devices */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">{t.analyticsDevices}</h4>
                        <div className="flex gap-2 flex-wrap">
                          {analyticsData.devices.map((d, idx) => (
                            <span key={idx} className="bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-800">
                              {d.device_type}: <span className="font-mono text-brand-blue">{d.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Browsers */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">{t.analyticsBrowsers}</h4>
                        <div className="flex gap-2 flex-wrap">
                          {analyticsData.browsers.map((b, idx) => (
                            <span key={idx} className="bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-800">
                              {b.browser}: <span className="font-mono text-brand-green">{b.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Operating Systems */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">{t.analyticsOs}</h4>
                        <div className="flex gap-2 flex-wrap">
                          {analyticsData.os.map((o, idx) => (
                            <span key={idx} className="bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-800">
                              {o.os}: <span className="font-mono text-amber-500">{o.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conversions Table */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">{t.analyticsEvents}</h3>
                    {analyticsData.conversions.length === 0 ? (
                      <p className="text-xs text-slate-450 py-6 text-center">No conversions logged.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                              <span className="text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wide">{label}</span>
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

          {/* TAB: OVERVIEW (RESUMEN) */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* Header stats */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                <div>
                  <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider font-mono">
                    {currentWebsite.domain}
                  </span>
                  <h2 className="text-2xl font-black mt-3 text-slate-950">{t.overviewTitle}</h2>
                  <p className="text-slate-500 text-sm mt-1">{t.overviewActiveSince} {currentWebsite.registeredAt ? new Date(currentWebsite.registeredAt).toLocaleDateString() : new Date(currentWebsite.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[120px]">
                    <span className="text-xs text-slate-500 font-bold block mb-1">{t.overviewTotalContacts}</span>
                    <span className="text-2xl font-black font-mono text-slate-900">{contactForms.length}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[120px]">
                    <span className="text-xs text-slate-500 font-bold block mb-1">{t.overviewTotalBookings}</span>
                    <span className="text-2xl font-black font-mono text-brand-green">{bookings.length}</span>
                  </div>
                </div>
              </div>

              {/* Data Lists Briefs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact List Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
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
                        <div key={form.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
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
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
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
                          <div key={booking.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
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
                            <p className="text-slate-650 text-xs line-clamp-1 italic">
                              "{booking.message}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* API Configuration Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-base mb-4 text-slate-900">{t.overviewDomainSettings}</h3>
                <p className="text-sm text-slate-500 mb-6">
                  {t.overviewBriefDesc}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">{t.overviewEndpoint}</span>
                    <span className="text-sm font-semibold text-slate-900 font-mono">api.spplabs.es</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">{t.overviewTotalKeys}</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {apiKeys.length} linked key(s)
                    </span>
                  </div>
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
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      let badgeColor = "bg-amber-50 border-amber-200 text-amber-700";
                      if (booking.status === "CONFIRMED") {
                        badgeColor = "bg-emerald-50 border-emerald-200 text-emerald-700";
                      } else if (booking.status === "CANCELLED") {
                        badgeColor = "bg-rose-50 border-rose-200 text-rose-700";
                      }
                      return (
                        <div key={booking.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                            <div>
                              <span className="font-bold text-lg text-slate-900 block">{booking.name}</span>
                              <span className="text-xs text-brand-green font-semibold">{booking.email}</span>
                            </div>
                            <div>
                              <span className={`font-bold text-xs px-3 py-1 rounded-full border ${badgeColor}`}>
                                {booking.status === "CONFIRMED" ? t.clientesAccept : booking.status === "CANCELLED" ? t.clientesReject : "PENDIENTE"}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4 border-y border-slate-200 py-4">
                            <div>
                              <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">{t.clientesDate}</span>
                              <span className="text-slate-900 font-mono font-bold text-sm">
                                {new Date(booking.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">{t.clientesTime}</span>
                              <span className="text-slate-900 font-mono font-bold text-sm">{booking.time}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">{t.clientesPhone}</span>
                              <span className="text-slate-700 font-mono">{booking.phone || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">{t.clientesSubmitted}</span>
                              <span className="text-slate-750 font-mono">
                                {new Date(booking.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px] mb-2">Mensaje del Cliente</span>
                            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-650 italic">
                              "{booking.message || "Sin comentarios adicionales."}"
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                            {booking.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking.id, "CONFIRMED")}
                                  className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                                >
                                  {t.clientesAccept}
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking.id, "CANCELLED")}
                                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                                >
                                  {t.clientesReject}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="ml-auto px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-650 rounded-lg text-xs font-bold transition-all cursor-pointer"
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
                        <p className="text-xs text-slate-700 leading-relaxed font-sans">{ann.message}</p>
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
                          <p className="text-slate-655 leading-relaxed italic">"{pet.message}"</p>
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
