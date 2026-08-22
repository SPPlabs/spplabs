"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { translations } from "@/lib/translations";
import { SppLabsLogo } from "@/components/SppLabsLogo";
import MonthlyReportsView from "@/components/dashboard/MonthlyReportsView";

import AdminTab from "@/components/dashboard/tabs/AdminTab";
import AnalyticsTab from "@/components/dashboard/tabs/AnalyticsTab";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import ClientesTab from "@/components/dashboard/tabs/ClientesTab";
import NotasTab from "@/components/dashboard/tabs/NotasTab";
import AiTab from "@/components/dashboard/tabs/AiTab";
import NotificationsTab from "@/components/dashboard/tabs/NotificationsTab";
import EmailTab from "@/components/dashboard/tabs/EmailTab";
import {
  SpainFlagIcon,
  UkFlagIcon,
  PhotoIcon,
  SunIcon,
  MoonIcon,
  CheckIcon,
  CloseIcon,
} from "@/components/dashboard/DashboardIcons";

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
  dashboardNotes = [],
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

  // Active navigation tab state - Everyone (admin or client) defaults to Resumen ("overview")
  const defaultTab = "overview";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const mainContainerRef = useRef(null);

  // Background heartbeat to track user dashboard activity
  useEffect(() => {
    const sendHeartbeat = () => {
      fetch("/api/user/heartbeat", { method: "POST" }).catch(() => {});
    };

    sendHeartbeat();
    window.addEventListener("focus", sendHeartbeat);

    const interval = setInterval(sendHeartbeat, 45 * 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", sendHeartbeat);
    };
  }, []);

  // Admin Website Health Uptime state
  const [websiteHealth, setWebsiteHealth] = useState({});
  const [healthLoading, setHealthLoading] = useState(false);

  const fetchWebsiteHealth = async (forceRefresh = false) => {
    if (session?.role !== "ADMIN") return;
    setHealthLoading(true);
    try {
      const res = await fetch(`/api/admin/website-health${forceRefresh ? "?refresh=true" : ""}`);
      if (res.ok) {
        const data = await res.json();
        setWebsiteHealth(data.results || {});
      }
    } catch (err) {
      console.error("[Health Check Fetch Error]:", err);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admin" && session?.role === "ADMIN") {
      fetchWebsiteHealth();
    }
  }, [activeTab, session?.role]);

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

  // Account display name state
  const [accountDisplayName, setAccountDisplayName] = useState(currentWebsite?.displayName || "");
  const [isSavingAccountName, setIsSavingAccountName] = useState(false);
  const [accountNameSaved, setAccountNameSaved] = useState(false);

  // Business Logo state
  const [currentLogoUrl, setCurrentLogoUrl] = useState(currentWebsite?.logoUrl || null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoMessage, setLogoMessage] = useState({ text: "", type: "" });
  const logoFileInputRef = useRef(null);

  // Helper: compress & convert any image to WebP & PNG in browser Canvas
  const processImageToOptimizedFormats = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          const webpBase64 = canvas.toDataURL("image/webp", 0.9);
          const pngBase64 = canvas.toDataURL("image/png");

          resolve({ webpBase64, pngBase64 });
        };
        img.onerror = () => reject(new Error("Error al procesar la imagen"));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoMessage({ text: "", type: "" });

    try {
      const { webpBase64, pngBase64 } = await processImageToOptimizedFormats(file);

      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: currentWebsite.domain,
          webpBase64,
          pngBase64,
        }),
      });

      const data = await res.json();
      if (res.ok && data.logoUrl) {
        setCurrentLogoUrl(data.logoUrl);
        setLogoMessage({
          text: lang === "es" ? "Logo actualizado correctamente" : "Logo updated successfully",
          type: "success",
        });
        setTimeout(() => setLogoMessage({ text: "", type: "" }), 4000);
      } else {
        setLogoMessage({
          text: data.message || "Error al subir el logo",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Logo upload error:", err);
      setLogoMessage({
        text: lang === "es" ? "Error al procesar la imagen" : "Error processing image",
        type: "error",
      });
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm(lang === "es" ? "¿Seguro que deseas eliminar el logo de la empresa?" : "Are you sure you want to remove the business logo?")) return;

    setIsUploadingLogo(true);
    setLogoMessage({ text: "", type: "" });

    try {
      const res = await fetch(`/api/admin/upload-logo?domain=${encodeURIComponent(currentWebsite.domain)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCurrentLogoUrl(null);
        setLogoMessage({
          text: lang === "es" ? "Logo eliminado correctamente" : "Logo removed successfully",
          type: "success",
        });
        setTimeout(() => setLogoMessage({ text: "", type: "" }), 4000);
      } else {
        const data = await res.json();
        setLogoMessage({
          text: data.message || "Error al eliminar el logo",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Logo delete error:", err);
      setLogoMessage({
        text: lang === "es" ? "Error de conexión" : "Connection error",
        type: "error",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // RAG Chatbot plain text info prompt
  const [chatbotContent, setChatbotContent] = useState(chatbotKnowledge?.content || "");
  const [iaSaving, setIaSaving] = useState(false);
  const [iaSaved, setIaSaved] = useState(false);
  const [isEditingKnowledge, setIsEditingKnowledge] = useState(false);

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

  // Mobile Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("week");

  // Independent Visitors Line Chart State & Timeframe
  const [visitorsTimeframe, setVisitorsTimeframe] = useState("week");
  const [visitorsTrends, setVisitorsTrends] = useState([]);
  const [visitorsTrendsLoading, setVisitorsTrendsLoading] = useState(false);

  // Track visited/cleared tabs for notification badges
  const [clearedTabs, setClearedTabs] = useState(new Set());
  const prevTabRef = useRef(activeTab);

  // Clear "overview" badge ONLY when switching away from overview to another tab.
  // Clear all other tabs (analytics, clientes, ia, notificaciones) when entered.
  useEffect(() => {
    if (prevTabRef.current && prevTabRef.current !== activeTab) {
      const leavingTab = prevTabRef.current;
      setClearedTabs(prev => {
        if (prev.has(leavingTab)) return prev;
        const next = new Set(prev);
        next.add(leavingTab);
        return next;
      });
    }

    if (activeTab && activeTab !== "overview") {
      setClearedTabs(prev => {
        if (prev.has(activeTab)) return prev;
        const next = new Set(prev);
        next.add(activeTab);
        return next;
      });
    }

    prevTabRef.current = activeTab;
  }, [activeTab]);

  // Mobile / Touch Active States for Info Tooltips & Chart Points
  const [activeTooltipId, setActiveTooltipId] = useState(null);
  const [activeChartPointIdx, setActiveChartPointIdx] = useState(null);

  useEffect(() => {
    const handleGlobalTap = () => {
      setActiveTooltipId(null);
      setActiveChartPointIdx(null);
    };
    window.addEventListener("click", handleGlobalTap);
    window.addEventListener("touchend", handleGlobalTap);
    return () => {
      window.removeEventListener("click", handleGlobalTap);
      window.removeEventListener("touchend", handleGlobalTap);
    };
  }, []);

  const renderInfoTooltip = (id, text, align = "center") => {
    const isOpen = activeTooltipId === id;
    
    let containerPos = "left-1/2 -translate-x-1/2";
    let arrowPos = "left-1/2 -translate-x-1/2";

    if (align === "shift-left-mobile") {
      containerPos = "right-0 left-auto translate-x-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto";
      arrowPos = "right-3 left-auto translate-x-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto";
    } else if (align === "shift-right-mobile") {
      containerPos = "left-0 translate-x-0 sm:left-1/2 sm:-translate-x-1/2";
      arrowPos = "left-3 sm:left-1/2 translate-x-0 sm:-translate-x-1/2";
    } else if (align === "shift-left" || align === "shift-left-desktop") {
      containerPos = "left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0";
      arrowPos = "left-1/2 -translate-x-1/2 sm:left-auto sm:right-3 sm:translate-x-0";
    } else if (align === "left") {
      containerPos = "left-0 sm:left-1/2 translate-x-0 sm:-translate-x-1/2";
      arrowPos = "left-3 sm:left-1/2 translate-x-0 sm:-translate-x-1/2";
    } else if (align === "right") {
      containerPos = "right-0 sm:left-1/2 left-auto sm:left-auto translate-x-0 sm:-translate-x-1/2";
      arrowPos = "right-3 sm:left-1/2 left-auto sm:left-auto translate-x-0 sm:-translate-x-1/2";
    }

    return (
      <div 
        className="relative inline-flex items-center"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setActiveTooltipId(prev => (prev === id ? null : id));
        }}
      >
        <button
          type="button"
          aria-label="Información"
          className={`p-1 rounded-full transition-all cursor-pointer flex items-center justify-center ${
            isOpen 
              ? "bg-slate-900 text-white scale-110 shadow-sm" 
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          <svg 
            className="w-4 h-4 sm:w-3.5 sm:h-3.5" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.2" 
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
          </svg>
        </button>

        {/* Tooltip Card - Elevated to highest z-index layer (z-50) */}
        <div className={`transition-all duration-200 absolute bottom-full mb-2 w-48 sm:w-56 max-w-[calc(100vw-3rem)] bg-slate-950 text-white text-[10.5px] font-medium p-3 rounded-2xl shadow-2xl z-50 leading-relaxed text-center border border-slate-700/80 ${containerPos} ${
          isOpen 
            ? "opacity-100 visible pointer-events-auto scale-100" 
            : "opacity-0 invisible pointer-events-none scale-95"
        }`}>
          {text}
          <div className={`absolute top-full -mt-1 border-4 border-transparent border-t-slate-950 ${arrowPos}`}></div>
        </div>
      </div>
    );
  };

  const fetchAnalytics = async (timeframeParam = analyticsTimeframe) => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const res = await fetch(`/api/admin/analytics?domain=${currentWebsite.domain}&timeframe=${timeframeParam}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to load analytics");
      setAnalyticsData(result.data);
      if (result?.data?.trends && (visitorsTrends.length === 0 || visitorsTimeframe === timeframeParam)) {
        setVisitorsTrends(result.data.trends);
      }
    } catch (err) {
      setAnalyticsError(err.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchVisitorsTrends = async (timeframeParam) => {
    setVisitorsTrendsLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?domain=${currentWebsite.domain}&timeframe=${timeframeParam}`);
      const result = await res.json();
      if (result?.data?.trends) {
        setVisitorsTrends(result.data.trends);
      }
    } catch (err) {
      console.error("Error fetching visitor trends:", err);
    } finally {
      setVisitorsTrendsLoading(false);
    }
  };

  // Chatbot Conversations State
  const [conversationsList, setConversationsList] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const fetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const res = await fetch(`/api/admin/conversations?domain=${currentWebsite.domain}`);
      const data = await res.json();
      if (data.success) {
        setConversationsList(data.conversations || []);
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setConversationsLoading(false);
    }
  };

  const handleDeleteConversation = async (convId) => {
    if (!confirm("¿Está seguro de que desea eliminar este registro de conversación?")) return;
    try {
      const res = await fetch(`/api/admin/conversations?id=${convId}`, { method: "DELETE" });
      if (res.ok) {
        setConversationsList(prev => prev.filter(c => c.id !== convId));
        if (selectedConversation?.id === convId) setSelectedConversation(null);
      }
    } catch (err) {
      console.error("Delete conversation error:", err);
    }
  };

  // Re-sync all domain-specific local states whenever currentWebsite or domain changes (e.g. impersonation)
  useEffect(() => {
    setChatbotContent(chatbotKnowledge?.content || "");
    setIsEditingKnowledge(false);
    setPetitionsList(supportRequests || []);
    setAnnouncementsList(notifications || []);
    setAnalyticsData(null);
    setVisitorsTrends([]);
    setConversationsList([]);
    setSelectedConversation(null);
    fetchConversations();
    fetchAnalytics(analyticsTimeframe);
  }, [currentWebsite.domain, chatbotKnowledge?.content, supportRequests, notifications]);

  useEffect(() => {
    if (activeTab === "analytics" && !analyticsData && !analyticsLoading) {
      fetchAnalytics(analyticsTimeframe);
    }
    if (activeTab === "ia" && conversationsList.length === 0 && !conversationsLoading) {
      fetchConversations();
    }
  }, [activeTab, analyticsTimeframe]);

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

  // Handle updating account display name
  const handleSaveAccountName = async (e) => {
    if (e) e.preventDefault();
    if (!accountDisplayName.trim()) return;
    setIsSavingAccountName(true);
    try {
      const res = await fetch("/api/admin/website-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: currentWebsite.domain,
          displayName: accountDisplayName.trim(),
        }),
      });
      if (res.ok) {
        currentWebsite.displayName = accountDisplayName.trim();
        setAccountNameSaved(true);
        setTimeout(() => setAccountNameSaved(false), 2500);
        router.refresh();
      }
    } catch (err) {
      console.error("Save account name error:", err);
    } finally {
      setIsSavingAccountName(false);
    }
  };

  // Handle Chatbot Knowledge RAG Prompt text update
  const handleUpdateChatbotKnowledge = async (e) => {
    e.preventDefault();
    if (chatbotContent.length > 40000) {
      alert("El contenido de la base de conocimiento no puede superar los 40,000 caracteres.");
      return;
    }
    setIaSaving(true);
    setIaSaved(false);
    try {
      const res = await fetch("/api/admin/chatbot-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: chatbotContent, domain: currentWebsite.domain }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.warning) {
          alert(data.warning);
        } else {
          setIaSaved(true);
          setIsEditingKnowledge(false);
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

  // Handle deleting announcement / notification
  const handleDeleteAnnouncement = async (id) => {
    if (!confirm(lang === "es" ? "¿Está seguro de que desea eliminar esta notificación?" : "Are you sure you want to delete this notification?")) return;
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAnnouncementsList(prev => prev.filter(item => item.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Error al eliminar notificación");
      }
    } catch (e) {
      console.error(e);
      alert("Error al eliminar notificación");
    }
  };

  // Handle deleting petition
  const handleDeletePetition = async (id) => {
    if (!confirm(lang === "es" ? "¿Está seguro de eliminar esta petición?" : "Are you sure you want to delete this petition?")) return;
    try {
      const res = await fetch(`/api/admin/petitions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPetitionsList(prev => prev.filter(item => item.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Error al eliminar petición");
      }
    } catch (e) {
      console.error(e);
      alert("Error al eliminar petición");
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
    <div className="h-screen h-[100dvh] w-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-brand-blue selection:text-white text-slate-900">
      
      {/* Desktop Sidebar (lg:flex) */}
      <aside className={`hidden lg:flex h-full bg-white border-r border-slate-200/80 flex-col justify-between shrink-0 relative z-20 shadow-sm transition-all duration-300 ease-in-out ${
        sidebarOpen 
          ? "w-72 p-5" 
          : "w-20 p-3 overflow-visible"
      }`}>
        <div className="flex flex-col gap-6">
          {/* Logo & Retract/Expand Toggle Section */}
          {sidebarOpen ? (
            <div className="flex items-center justify-between px-1 py-1">
              <Link href="/" className="flex items-center gap-3 overflow-hidden hover:opacity-85 transition-opacity cursor-pointer">
                <Image
                  src="/logo.webp"
                  alt="SPP Labs Logo"
                  width={32}
                  height={32}
                  sizes="32px"
                  className="w-8 h-8 object-contain shrink-0"
                />
                <SppLabsLogo inline={true} className="text-slate-900 truncate" />
              </Link>
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
              <Link href="/" className="flex flex-col items-center gap-3 py-1 hover:opacity-85 transition-opacity cursor-pointer">
                <Image
                  src="/logo.webp"
                  alt="SPP Labs Logo"
                  width={32}
                  height={32}
                  sizes="32px"
                  className="w-8 h-8 object-contain"
                />
              </Link>
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
            {(() => {
              const pendingBookingsCount = bookings.filter(b => b.status === "PENDING" || b.status === "pending" || (!b.status && b.status !== "CONFIRMED" && b.status !== "CANCELLED")).length;
              const recentContactsCount = contactForms.filter(c => {
                const created = new Date(c.createdAt).getTime();
                return Date.now() - created < 48 * 60 * 60 * 1000;
              }).length;

              const overviewNotifCount = clearedTabs.has("overview") ? 0 : (pendingBookingsCount + recentContactsCount + announcementsList.length);
              const clientesNotifCount = pendingBookingsCount > 0 ? pendingBookingsCount : (clearedTabs.has("clientes") ? 0 : contactForms.length);
              const iaNotifCount = clearedTabs.has("ia") ? 0 : conversationsList.length;
              const notificacionesNotifCount = clearedTabs.has("notificaciones") ? 0 : (announcementsList.length + petitionsList.length);
              const hasAnalyticsNotif = clearedTabs.has("analytics") ? false : Boolean(analyticsData || analyticsLoading);

              const navItems = [
                {
                  id: "overview",
                  label: t.menuResumen,
                  count: overviewNotifCount,
                  icon: (
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                    </svg>
                  ),
                },
                {
                  id: "analytics",
                  label: t.menuAnaliticas,
                  hasDotNoNumber: hasAnalyticsNotif,
                  icon: (
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                },
                {
                  id: "clientes",
                  label: t.menuClientes,
                  count: clientesNotifCount,
                  icon: (
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
                {
                  id: "notas",
                  label: t.menuNotas || "Notas y Equipo",
                  icon: (
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  ),
                },
                {
                  id: "ia",
                  label: t.menuIA,
                  count: iaNotifCount,
                  icon: (
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                },
                {
                  id: "notificaciones",
                  label: t.menuNotificaciones,
                  count: notificacionesNotifCount,
                  icon: (
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  ),
                },
                {
                  id: "informes",
                  label: t.menuInformes || "Informes Mensuales",
                  icon: (
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                },
                {
                  id: "email",
                  label: t.menuEmail || "Email y Reseñas",
                  icon: (
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
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
              ];

              return navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  title={item.label}
                  className={`w-full flex items-center transition-all cursor-pointer rounded-xl font-bold relative ${
                    sidebarOpen
                      ? "gap-3 px-4 py-3 text-left text-sm"
                      : "justify-center p-3"
                  } ${
                    activeTab === item.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {item.count > 0 ? (
                    <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center pointer-events-none">
                      <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                      <span className="relative z-10 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-[8.5px] font-black leading-none shadow-[0_0_8px_rgba(239,68,68,0.9)] border border-white/40">
                        {item.count}
                      </span>
                    </span>
                  ) : item.hasDotNoNumber ? (
                    <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center pointer-events-none">
                      <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                      <span className="relative z-10 w-4 h-4 rounded-full bg-gradient-to-r from-red-600 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.9)] border border-white/40" />
                    </span>
                  ) : null}
                </button>
              ));
            })()}

            {/* Special Impersonation Return Button */}
            {isImpersonating && (
              <button
                onClick={() => {
                  router.push("/dashboard?domain=spplabs.es");
                  setActiveTab("overview");
                }}
                className={`w-full flex items-center transition-all cursor-pointer rounded-xl font-black text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 ${
                  sidebarOpen ? "gap-3 px-4 py-3 text-left" : "justify-center p-3 relative"
                } mt-3 shadow-xs active:scale-95`}
                title="vuelve a spplabs.es"
              >
                <svg className="w-5 h-5 shrink-0 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 016 6v3" />
                </svg>
                {sidebarOpen && <span className="truncate">vuelve a spplabs.es</span>}
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer Zone */}
        <div className="flex flex-col gap-3">
          {sidebarOpen ? (
            <>
              {/* Business Info / Profile rectangle */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                  {currentLogoUrl ? (
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                      <img src={currentLogoUrl} alt={accountDisplayName || currentWebsite.displayName} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {(accountDisplayName || currentWebsite.displayName)?.slice(0, 2).toUpperCase() || "SP"}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <span className="font-bold text-xs text-slate-800 block truncate" title={accountDisplayName || currentWebsite.displayName}>
                      {accountDisplayName || currentWebsite.displayName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block truncate" title={currentWebsite.domain}>
                      {currentWebsite.domain}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-300/40 shrink-0"
                  title={lang === "es" ? "Ajustes de Cuenta" : "Account Settings"}
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
                className="w-full flex items-center justify-center p-2 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer overflow-hidden"
                title={lang === "es" ? "Ajustes de Cuenta" : "Account Settings"}
              >
                {currentLogoUrl ? (
                  <img src={currentLogoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                  <span className="font-bold text-xs text-slate-700">{(accountDisplayName || currentWebsite.displayName)?.slice(0, 2).toUpperCase() || "SP"}</span>
                )}
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
      <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden bg-slate-50 relative z-10 max-w-full">

        {/* STICKY MOBILE TOP HEADER (lg:hidden) */}
        {(() => {
          const pendingBookingsCount = bookings.filter(b => b.status === "PENDING" || b.status === "pending" || (!b.status && b.status !== "CONFIRMED" && b.status !== "CANCELLED")).length;
          const recentContactsCount = contactForms.filter(c => {
            const created = new Date(c.createdAt).getTime();
            return Date.now() - created < 48 * 60 * 60 * 1000;
          }).length;

          const overviewNotifCount = clearedTabs.has("overview") ? 0 : (pendingBookingsCount + recentContactsCount + announcementsList.length);
          const clientesNotifCount = pendingBookingsCount > 0 ? pendingBookingsCount : (clearedTabs.has("clientes") ? 0 : contactForms.length);
          const iaNotifCount = clearedTabs.has("ia") ? 0 : conversationsList.length;
          const notificacionesNotifCount = clearedTabs.has("notificaciones") ? 0 : (announcementsList.length + petitionsList.length);
          const hasAnalyticsNotif = clearedTabs.has("analytics") ? false : Boolean(analyticsData || analyticsLoading);

          const hasAnyActiveNotification = overviewNotifCount > 0 || clientesNotifCount > 0 || iaNotifCount > 0 || notificacionesNotifCount > 0 || hasAnalyticsNotif;

          return (
            <header className="lg:hidden bg-white border-b border-slate-200/90 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  className="relative p-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200/80"
                  aria-label="Abrir Menú Móvil"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>

                  {!mobileDrawerOpen && hasAnyActiveNotification && (
                    <span className="absolute -top-1 -right-1 z-20 flex h-3 w-3 items-center justify-center pointer-events-none">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 border border-white/60 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
                    </span>
                  )}
                </button>
                <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer">
                  <Image
                    src="/logo.webp"
                    alt="SPP Labs"
                    width={24}
                    height={24}
                    sizes="24px"
                    className="w-6 h-6 object-contain"
                  />
                  <SppLabsLogo inline={true} className="text-slate-900 text-sm" />
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 truncate max-w-[130px]">
                  {currentWebsite.domain}
                </span>
              </div>
            </header>
          );
        })()}

        {/* MOBILE SIDEBAR DRAWER OVERLAY (lg:hidden) */}
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex animate-fade-in" onClick={() => setMobileDrawerOpen(false)}>
            <aside
              className="w-72 bg-white h-full border-r border-slate-200 p-5 flex flex-col justify-between shadow-2xl animate-slide-in-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <Link href="/" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer">
                    <Image
                      src="/logo.webp"
                      alt="SPP Labs"
                      width={28}
                      height={28}
                      sizes="28px"
                      className="w-7 h-7 object-contain"
                    />
                    <SppLabsLogo inline={true} className="text-slate-900" />
                  </Link>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
                    aria-label="Cerrar menú"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {(() => {
                    const pendingBookingsCount = bookings.filter(b => b.status === "PENDING" || b.status === "pending" || (!b.status && b.status !== "CONFIRMED" && b.status !== "CANCELLED")).length;
                    const recentContactsCount = contactForms.filter(c => {
                      const created = new Date(c.createdAt).getTime();
                      return Date.now() - created < 48 * 60 * 60 * 1000;
                    }).length;

                    const overviewNotifCount = clearedTabs.has("overview") ? 0 : (pendingBookingsCount + recentContactsCount + announcementsList.length);
                    const clientesNotifCount = pendingBookingsCount > 0 ? pendingBookingsCount : (clearedTabs.has("clientes") ? 0 : contactForms.length);
                    const iaNotifCount = clearedTabs.has("ia") ? 0 : conversationsList.length;
                    const notificacionesNotifCount = clearedTabs.has("notificaciones") ? 0 : (announcementsList.length + petitionsList.length);
                    const hasAnalyticsNotif = clearedTabs.has("analytics") ? false : Boolean(analyticsData || analyticsLoading);

                    const navItems = [
                      {
                        id: "overview",
                        label: t.menuResumen,
                        count: overviewNotifCount,
                        icon: (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                          </svg>
                        ),
                      },
                      {
                        id: "analytics",
                        label: t.menuAnaliticas,
                        hasDotNoNumber: hasAnalyticsNotif,
                        icon: (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        ),
                      },
                      {
                        id: "clientes",
                        label: t.menuClientes,
                        count: clientesNotifCount,
                        icon: (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        ),
                      },
                      {
                        id: "notas",
                        label: t.menuNotas || "Notas y Equipo",
                        icon: (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        ),
                      },
                      {
                        id: "ia",
                        label: t.menuIA,
                        count: iaNotifCount,
                        icon: (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        ),
                      },
                      {
                        id: "notificaciones",
                        label: t.menuNotificaciones,
                        count: notificacionesNotifCount,
                        icon: (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        ),
                      },
                      {
                        id: "informes",
                        label: t.menuInformes || "Informes Mensuales",
                        icon: (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ),
                      },
                      {
                        id: "email",
                        label: t.menuEmail || "Email y Reseñas",
                        icon: (
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
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
                    ];

                    return navItems.map((item) => {
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileDrawerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer relative ${
                            active
                              ? "bg-slate-950 text-white shadow-md scale-[1.02]"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          {item.count > 0 ? (
                            <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center pointer-events-none">
                              <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                              <span className="relative z-10 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-[8.5px] font-black leading-none shadow-[0_0_8px_rgba(239,68,68,0.9)] border border-white/40">
                                {item.count}
                              </span>
                            </span>
                          ) : item.hasDotNoNumber ? (
                            <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center pointer-events-none">
                              <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                              <span className="relative z-10 w-4 h-4 rounded-full bg-gradient-to-r from-red-600 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.9)] border border-white/40" />
                            </span>
                          ) : null}
                        </button>
                      );
                    });
                  })()}

                  {isImpersonating && (
                    <button
                      onClick={() => {
                        router.push("/dashboard?domain=spplabs.es");
                        setActiveTab("overview");
                        setMobileDrawerOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-xs font-black bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all border border-blue-200 mt-4 cursor-pointer active:scale-98 shadow-2xs"
                    >
                      <svg className="w-5 h-5 shrink-0 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 016 6v3" />
                      </svg>
                      <span>vuelve a spplabs.es</span>
                    </button>
                  )}
                </nav>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                    {currentLogoUrl ? (
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                        <img src={currentLogoUrl} alt={accountDisplayName || currentWebsite.displayName} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {(accountDisplayName || currentWebsite.displayName)?.slice(0, 2).toUpperCase() || "SP"}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <span className="font-bold text-xs text-slate-800 block truncate" title={accountDisplayName || currentWebsite.displayName}>
                        {accountDisplayName || currentWebsite.displayName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate" title={currentWebsite.domain}>
                        {currentWebsite.domain}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowSettingsModal(true);
                      setMobileDrawerOpen(false);
                    }}
                    className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-300/40 shrink-0"
                    title={lang === "es" ? "Ajustes de Cuenta" : "Account Settings"}
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 h-10 border border-slate-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {lang === "es" ? "Cerrar Sesión" : "Sign Out"}
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Tab content viewport window */}
        <main ref={mainContainerRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-8 pb-32 sm:pb-12 w-full max-w-full touch-pan-y [overscroll-behavior-y:contain] [-webkit-overflow-scrolling:touch]">
          {/* TAB: ADMIN PANEL (USUARIOS) */}
          {activeTab === "admin" && session.role === "ADMIN" && (
            <AdminTab
              t={t}
              lang={lang}
              newDomain={newDomain}
              setNewDomain={setNewDomain}
              newDisplayName={newDisplayName}
              setNewDisplayName={setNewDisplayName}
              createLoading={createLoading}
              handleCreateClient={handleCreateClient}
              createError={createError}
              createdCredentials={createdCredentials}
              allWebsites={allWebsites}
              router={router}
              setActiveTab={setActiveTab}
              handleDeleteUser={handleDeleteUser}
              websiteHealth={websiteHealth}
              healthLoading={healthLoading}
              fetchWebsiteHealth={fetchWebsiteHealth}
            />
          )}

          {/* TAB: VISITOR ANALYTICS */}
          {activeTab === "analytics" && (
            <AnalyticsTab
              currentWebsite={currentWebsite}
              t={t}
              lang={lang}
              analyticsTimeframe={analyticsTimeframe}
              setAnalyticsTimeframe={setAnalyticsTimeframe}
              fetchAnalytics={fetchAnalytics}
              analyticsData={analyticsData}
              analyticsLoading={analyticsLoading}
              analyticsError={analyticsError}
              visitorsTimeframe={visitorsTimeframe}
              setVisitorsTimeframe={setVisitorsTimeframe}
              fetchVisitorsTrends={fetchVisitorsTrends}
              visitorsTrends={visitorsTrends}
              visitorsTrendsLoading={visitorsTrendsLoading}
              activeTooltipId={activeTooltipId}
              renderInfoTooltip={renderInfoTooltip}
              activeChartPointIdx={activeChartPointIdx}
              setActiveChartPointIdx={setActiveChartPointIdx}
            />
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <OverviewTab
              currentWebsite={currentWebsite}
              t={t}
              lang={lang}
              contactForms={contactForms}
              bookings={bookings}
              conversationsList={conversationsList}
              announcementsList={announcementsList}
              setActiveTab={setActiveTab}
            />
          )}

          {/* TAB: CLIENTES (CONTACTS & BOOKINGS COMBINED) */}
          {activeTab === "clientes" && (
            <ClientesTab
              t={t}
              lang={lang}
              contactForms={contactForms}
              bookings={bookings}
              handleDeleteContact={handleDeleteContact}
              handleUpdateBookingStatus={handleUpdateBookingStatus}
              handleDeleteBooking={handleDeleteBooking}
              currentWebsite={currentWebsite}
              router={router}
            />
          )}

          {/* TAB: NOTAS (NOTES, CLIENTS & STAFF DIRECTORY) */}
          {activeTab === "notas" && (
            <NotasTab
              t={t}
              lang={lang}
              initialNotes={dashboardNotes}
              currentWebsite={currentWebsite}
              router={router}
            />
          )}

          {/* TAB: IA (CHATBOT CONFIG & METRICS) */}
          {activeTab === "ia" && (
            <AiTab
              t={t}
              lang={lang}
              currentWebsite={currentWebsite}
              aiUsage={aiUsage}
              conversationsList={conversationsList}
              conversationsLoading={conversationsLoading}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
              handleDeleteConversation={handleDeleteConversation}
              chatbotContent={chatbotContent}
              setChatbotContent={setChatbotContent}
              isEditingKnowledge={isEditingKnowledge}
              setIsEditingKnowledge={setIsEditingKnowledge}
              chatbotKnowledge={chatbotKnowledge}
              handleUpdateChatbotKnowledge={handleUpdateChatbotKnowledge}
              iaSaved={iaSaved}
              iaSaving={iaSaving}
            />
          )}

          {/* TAB: NOTIFICACIONES Y PETICIONES */}
          {activeTab === "notificaciones" && (
            <NotificationsTab
              t={t}
              lang={lang}
              currentWebsite={currentWebsite}
              session={session}
              isImpersonating={isImpersonating}
              allWebsites={allWebsites}
              handleSendAnnouncement={handleSendAnnouncement}
              announcementTitle={announcementTitle}
              setAnnouncementTitle={setAnnouncementTitle}
              announcementMsg={announcementMsg}
              setAnnouncementMsg={setAnnouncementMsg}
              announcementTargetId={announcementTargetId}
              setAnnouncementTargetId={setAnnouncementTargetId}
              announcementSuccess={announcementSuccess}
              announcementSending={announcementSending}
              announcementsList={announcementsList}
              handleDeleteAnnouncement={handleDeleteAnnouncement}
              petitionsList={petitionsList}
              handleDeletePetition={handleDeletePetition}
              handleSendPetition={handleSendPetition}
              petitionMsg={petitionMsg}
              setPetitionMsg={setPetitionMsg}
              petitionSending={petitionSending}
            />
          )}

          {/* TAB: INFORMES MENSUALES */}
          {activeTab === "informes" && (
            <div className="space-y-8 animate-fade-in w-full">
              <MonthlyReportsView currentWebsiteDomain={currentWebsite.domain} lang={lang} />
            </div>
          )}

          {/* TAB: EMAIL & GOOGLE REVIEWS */}
          {activeTab === "email" && (
            <EmailTab
              currentWebsite={currentWebsite}
              t={t}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettingsModal(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh] sm:max-h-[85vh]">
            {/* Sticky Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{t.settingsTitle}</h3>
                <p className="text-xs text-slate-500 font-medium">{t.settingsSelectLang}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs transition-all cursor-pointer shrink-0"
                aria-label="Cerrar modal"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {/* Language Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {lang === "es" ? "Idioma del Panel" : "Dashboard Language"}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => changeLanguage("es")}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      lang === "es"
                        ? "bg-brand-blue/10 border-brand-blue text-brand-blue shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <SpainFlagIcon className="w-4 h-3 rounded-xs shadow-2xs" />
                      <span>Español</span>
                    </span>
                    {lang === "es" && (
                      <svg className="w-4 h-4 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => changeLanguage("en")}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      lang === "en"
                        ? "bg-brand-blue/10 border-brand-blue text-brand-blue shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UkFlagIcon className="w-4 h-3 rounded-xs shadow-2xs" />
                      <span>English</span>
                    </span>
                    {lang === "en" && (
                      <svg className="w-4 h-4 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Account Display Name */}
              <div className="border-t border-slate-150 pt-5">
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  {lang === "es" ? "Nombre de la Cuenta" : "Account Name"}
                </label>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  {lang === "es" ? "Nombre visible en tu panel y correos enviados." : "Visible name in your dashboard and sent emails."}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accountDisplayName}
                    onChange={(e) => setAccountDisplayName(e.target.value)}
                    placeholder="SPP Labs"
                    className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAccountName}
                    disabled={isSavingAccountName || !accountDisplayName.trim()}
                    className="h-10 px-4 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {isSavingAccountName ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : accountNameSaved ? (
                      <span className="flex items-center gap-1">
                        <CheckIcon className="w-3.5 h-3.5" />
                        <span>Guardado</span>
                      </span>
                    ) : (
                      lang === "es" ? "Guardar" : "Save"
                    )}
                  </button>
                </div>
              </div>

              {/* Business Logo Section */}
              <div className="border-t border-slate-150 pt-5">
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  {lang === "es" ? "Logo de la Empresa" : "Business Logo"}
                </label>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  {lang === "es"
                    ? "Sube tu logo (PNG, JPG, SVG o WebP). Se optimizará y convertirá automáticamente para el panel y los correos."
                    : "Upload your logo (PNG, JPG, SVG or WebP). It will be automatically optimized and converted for dashboard and emails."}
                </p>

                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                  {/* Preview Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                    {currentLogoUrl ? (
                      <img src={currentLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-slate-100 text-slate-400 flex flex-col items-center justify-center text-[10px] font-bold">
                        <PhotoIcon className="w-5 h-5 mb-0.5 text-slate-400" />
                        <span>Sin logo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                        id="logo-file-input"
                      />
                      <label
                        htmlFor="logo-file-input"
                        className={`px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                          isUploadingLogo ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {isUploadingLogo ? (
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        )}
                        <span>{currentLogoUrl ? (lang === "es" ? "Cambiar Logo" : "Change Logo") : (lang === "es" ? "Subir Logo" : "Upload Logo")}</span>
                      </label>

                      {currentLogoUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteLogo}
                          disabled={isUploadingLogo}
                          className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          title={lang === "es" ? "Eliminar Logo" : "Remove Logo"}
                        >
                          {lang === "es" ? "Eliminar" : "Remove"}
                        </button>
                      )}
                    </div>

                    {logoMessage.text && (
                      <span className={`text-[11px] font-semibold ${logoMessage.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
                        {logoMessage.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="border-t border-slate-150 pt-5">
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  {lang === "es" ? "Tema del Dashboard" : "Dashboard Theme"}
                </label>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    {theme === "light" ? (
                      <>
                        <SunIcon className="w-4 h-4 text-amber-500" />
                        <span>{lang === "es" ? "Modo Claro" : "Light Mode"}</span>
                      </>
                    ) : (
                      <>
                        <MoonIcon className="w-4 h-4 text-indigo-400" />
                        <span>{lang === "es" ? "Modo Oscuro" : "Dark Mode"}</span>
                      </>
                    )}
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
            </div>

            {/* Sticky Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="h-10 px-6 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
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
