"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DashboardClient({
  session,
  allWebsites,
  currentWebsite,
  contactForms,
  bookings,
  apiKeys,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(session.role === "ADMIN" && !searchParams.get("domain") ? "admin" : "overview");

  // Form states for creating a new client (admin only)
  const [newDomain, setNewDomain] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [createError, setCreateError] = useState("");

  // Simulator states
  const [simType, setSimType] = useState("contact"); // contact | booking
  const [simApiKey, setSimApiKey] = useState("");
  const [simDomain, setSimDomain] = useState(currentWebsite.domain);
  const [simContactName, setSimContactName] = useState("");
  const [simContactEmail, setSimContactEmail] = useState("");
  const [simContactPhone, setSimContactPhone] = useState("");
  const [simContactMessage, setSimContactMessage] = useState("");
  const [simBookingName, setSimBookingName] = useState("");
  const [simBookingEmail, setSimBookingEmail] = useState("");
  const [simBookingPhone, setSimBookingPhone] = useState("");
  const [simBookingDate, setSimBookingDate] = useState("");
  const [simBookingTime, setSimBookingTime] = useState("");
  const [simBookingMessage, setSimBookingMessage] = useState("");
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

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
    if (!confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
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
        alert(data.message || "Failed to update booking status");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update booking status");
    }
  };

  // Handle Delete Booking
  const handleDeleteBooking = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this booking?")) return;
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete booking");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete booking");
    }
  };

  // Handle Delete Contact
  const handleDeleteContact = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this contact submission?")) return;
    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete contact submission");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete contact submission");
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

  // Run Simulator Endpoint (POST /contacts or POST /bookings)
  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    setSimResult(null);
    setSimLoading(true);

    const payload = simType === "contact"
      ? {
          domain: simDomain,
          name: simContactName,
          email: simContactEmail,
          phone: simContactPhone,
          message: simContactMessage,
        }
      : {
          domain: simDomain,
          name: simBookingName,
          email: simBookingEmail,
          phone: simBookingPhone,
          date: simBookingDate,
          time: simBookingTime,
          message: simBookingMessage,
        };

    try {
      // Determine the API base URL dynamically for local testing vs production environment
      const isLocal = window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1");
      const apiBase = isLocal
        ? `${window.location.protocol}//api.localhost:${window.location.port}`
        : (process.env.NEXT_PUBLIC_API_URL || "https://api.spplabs.es");
      
      const endpoint = `${apiBase}${simType === "contact" ? "/contacts" : "/bookings"}`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": simApiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSimResult({
        status: res.status,
        ok: res.ok,
        data,
      });

      if (res.ok) {
        // Clear inputs on success
        if (simType === "contact") {
          setSimContactName("");
          setSimContactEmail("");
          setSimContactPhone("");
          setSimContactMessage("");
        } else {
          setSimBookingName("");
          setSimBookingEmail("");
          setSimBookingPhone("");
          setSimBookingDate("");
          setSimBookingTime("");
          setSimBookingMessage("");
        }
        // Refresh dashboard data so new entry is fetched
        setTimeout(() => router.refresh(), 500);
      }
    } catch (err) {
      setSimResult({
        status: "Network Error",
        ok: false,
        data: { error: err.message },
      });
    } finally {
      setSimLoading(false);
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
        <aside className="lg:col-span-3 flex flex-col gap-2">
          {session.role === "ADMIN" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
                activeTab === "admin"
                  ? "bg-brand-blue text-white shadow-md animate-fade-in"
                  : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Admin control
            </button>
          )}

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Visitor Analytics
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            Telemetry Overview
          </button>

          <button
            onClick={() => setActiveTab("contacts")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
              activeTab === "contacts"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Forms
            {contactForms.length > 0 && (
              <span className="ml-auto bg-brand-blue text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {contactForms.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Bookings Calendar
            {bookings.length > 0 && (
              <span className="ml-auto bg-brand-green text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {bookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
              activeTab === "simulator"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            API Integration Simulator
          </button>
        </aside>

        {/* Detail Panel */}
        <main className="lg:col-span-9 flex flex-col gap-6">

          {/* TAB: ADMIN PANEL */}
          {activeTab === "admin" && session.role === "ADMIN" && (
            <div className="space-y-8 animate-fade-in">
              {/* Provision Website Form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-slate-900">Provision New Client Website</h3>
                <p className="text-sm text-slate-500 mb-6">Create a website tenant record. You will generate a signup token (for client sign up) and a secure client API key.</p>
                
                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl mb-6">
                    {createError}
                  </div>
                )}

                <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Client Domain Name
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
                      Company / Display Name
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
                        "Generate Credentials"
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
                      Client Tenant Provisioned Successfully!
                    </div>

                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      <span className="font-bold text-red-500">WARNING:</span> Copy the API key now. It is hashed using Argon2id and stored in the database, and **will not be shown again**.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Signup Token (Send manually to client)</span>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono text-slate-900 select-all">
                            {createdCredentials.signupToken}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(createdCredentials.signupToken)}
                            className="bg-white hover:bg-slate-100 border border-slate-200 text-xs px-3 py-2 rounded-lg font-bold transition-all active:scale-95 cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">API Key (For client's public website requests)</span>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono text-brand-green select-all">
                            {createdCredentials.rawApiKey}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(createdCredentials.rawApiKey)}
                            className="bg-white hover:bg-slate-100 border border-slate-200 text-xs px-3 py-2 rounded-lg font-bold transition-all active:scale-95 cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Client Directory List */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-slate-900">Provisioned Client Directory</h3>
                <p className="text-sm text-slate-500 mb-6">List of all active client websites. Click "Enter Dashboard" to verify progress and view submissions.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold">
                        <th className="pb-3 font-semibold">Client Name</th>
                        <th className="pb-3 font-semibold">Domain</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Provisioned At</th>
                        <th className="pb-3 text-right font-semibold">Action</th>
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
                                Admin Account
                              </span>
                            ) : web.passwordHash ? (
                              <span className="bg-brand-green/15 text-brand-green text-xs px-2.5 py-0.5 rounded-full font-bold">
                                Registered
                              </span>
                            ) : (
                              <span className="bg-amber-500/15 text-amber-500 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                Pending Setup
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-slate-500 text-xs">
                            {new Date(web.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 text-right">
                            {web.role !== "ADMIN" && (
                              <button
                                onClick={() => {
                                  router.push(`/dashboard?domain=${web.domain}`);
                                  setActiveTab("overview");
                                }}
                                className="bg-slate-900 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-sm"
                              >
                                Enter Dashboard
                              </button>
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
                  <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                    {currentWebsite.domain}
                  </span>
                  <h2 className="text-2xl font-black mt-3 text-slate-950">Visitor Analytics</h2>
                  <p className="text-slate-500 text-sm mt-1">Multi-tenant ClickHouse Ingestion Stats</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Real-time indicator */}
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-brand-green font-bold text-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {analyticsData?.overview?.active_visitors || 0} active users (last 5 min)
                  </div>
                  <button
                    onClick={fetchAnalytics}
                    disabled={analyticsLoading}
                    className="p-2.5 bg-slate-150 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Total Hits</span>
                      <span className="text-2xl font-black font-mono text-slate-900">{analyticsData.overview.visitors}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Unique Visitors</span>
                      <span className="text-2xl font-black font-mono text-brand-blue">{analyticsData.overview.unique_visitors}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Sessions</span>
                      <span className="text-2xl font-black font-mono text-brand-green">{analyticsData.overview.sessions}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Avg Session Duration</span>
                      <span className="text-2xl font-black font-mono text-slate-900">{analyticsData.overview.avg_duration}s</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center col-span-2 lg:col-span-1 shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Bounce Rate</span>
                      <span className="text-2xl font-black font-mono text-red-500">{analyticsData.overview.bounce_rate}%</span>
                    </div>
                  </div>

                  {/* Hourly/Daily Traffic Trend Bar Chart (pure CSS) */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Traffic volume (Last 7 Days)</h3>
                    {analyticsData.trends.length === 0 ? (
                      <p className="text-sm text-slate-450 py-10 text-center">No trend data logged yet.</p>
                    ) : (
                      <div>
                        <div className="flex items-end justify-between gap-2 h-44 border-b border-slate-200/80 pb-2">
                          {analyticsData.trends.map((t, idx) => {
                            const maxVal = Math.max(...analyticsData.trends.map(x => x.count), 1);
                            const heightPct = Math.round((t.count / maxVal) * 100);
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                <span className="text-[10px] font-bold font-mono text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
                                  {t.count}
                                </span>
                                <div
                                  style={{ height: `${Math.max(heightPct, 6)}%` }}
                                  className="w-full bg-brand-blue/35 group-hover:bg-brand-blue rounded-t-md transition-all duration-300 relative"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-all rounded-t-md"></div>
                                </div>
                                <span className="text-[9px] font-semibold text-slate-550 uppercase tracking-wide truncate max-w-[50px] sm:max-w-none">
                                  {t.date.split("-").slice(1).join("/")}
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
                      <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Top Pages</h3>
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
                      <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Traffic Sources</h3>
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
                      <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Geographic Origin</h3>
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
                        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Devices</h4>
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
                        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Browsers</h4>
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
                        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Operating Systems</h4>
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
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Conversion & Event Summaries</h3>
                    {analyticsData.conversions.length === 0 ? (
                      <p className="text-xs text-slate-450 py-6 text-center">No conversions logged.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {analyticsData.conversions.map((c, idx) => {
                          let label = c.event_type;
                          let color = "text-slate-950";
                          if (c.event_type === "form_submit") {
                            label = "Form Submissions";
                            color = "text-brand-blue";
                          } else if (c.event_type === "booking_created") {
                            label = "Bookings Created";
                            color = "text-brand-green";
                          } else if (c.event_type === "button_click") {
                            label = "Button Clicks";
                            color = "text-slate-700";
                          } else if (c.event_type === "outbound_link") {
                            label = "Outbound Links";
                            color = "text-red-500";
                          }
                          return (
                            <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                              <span className="text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wide">{label}</span>
                              <span className={`text-2xl font-black font-mono ${color}`}>{c.count}</span>
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

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Header stats */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                <div>
                  <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                    {currentWebsite.domain}
                  </span>
                  <h2 className="text-2xl font-black mt-3 text-slate-950">{currentWebsite.displayName}</h2>
                  <p className="text-slate-500 text-sm mt-1">Tenant Overview & Telemetry Stats</p>
                </div>

                <div className="flex gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[120px]">
                    <span className="text-xs text-slate-500 font-bold block mb-1">Contacts</span>
                    <span className="text-2xl font-black font-mono text-slate-900">{contactForms.length}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[120px]">
                    <span className="text-xs text-slate-500 font-bold block mb-1">Bookings</span>
                    <span className="text-2xl font-black font-mono text-brand-green">{bookings.length}</span>
                  </div>
                </div>
              </div>

              {/* Data Lists Briefs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact List Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-base text-slate-900">Recent Contacts</h3>
                    <button
                      onClick={() => setActiveTab("contacts")}
                      className="text-xs font-bold text-brand-blue hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  {contactForms.length === 0 ? (
                    <div className="text-center py-10 text-slate-450 text-sm">
                      No contacts received yet.
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
                          <span className="text-slate-500 block text-xs truncate mb-2">{form.email}</span>
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
                    <h3 className="font-bold text-base text-slate-900">Upcoming Bookings</h3>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="text-xs font-bold text-brand-green hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-10 text-slate-450 text-sm">
                      No bookings scheduled yet.
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
                                {booking.status}
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
                <h3 className="font-bold text-base mb-4 text-slate-900">API Configuration</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Integrate your business website with SPP Labs' central API database by forwarding bookings and forms.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">API Key Endpoint</span>
                    <span className="text-sm font-semibold text-slate-900 font-mono">api.spplabs.es</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Active Credentials</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {apiKeys.length} key(s) linked
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveTab("simulator")}
                    className="h-10 px-6 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Try API Simulator
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTACTS */}
          {activeTab === "contacts" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-1 text-slate-900">Contact Submissions</h3>
              <p className="text-sm text-slate-500 mb-6">List of contact form messages forwarded from client website via public API.</p>

              {contactForms.length === 0 ? (
                <div className="text-center py-20 text-slate-450 text-sm">
                  No contact forms found for this domain.
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
                          <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">Phone</span>
                          <span className="text-slate-700 font-mono">{form.phone || "Not provided"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">Form Submission ID</span>
                          <span className="text-slate-700 font-mono">{form.id}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px] mb-2">Message</span>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed font-sans">
                          {form.message}
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleDeleteContact(form.id)}
                          className="px-4 py-1.5 border border-red-200 hover:bg-red-50 text-red-655 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Delete Record
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-1 text-slate-900">Bookings & Appointments</h3>
              <p className="text-sm text-slate-500 mb-6">List of scheduled bookings forwarded from booking calendars.</p>

              {bookings.length === 0 ? (
                <div className="text-center py-20 text-slate-450 text-sm">
                  No bookings found for this domain.
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
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4 border-y border-slate-200 py-4">
                          <div>
                            <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">Appt Date</span>
                            <span className="text-slate-900 font-mono font-bold text-sm">
                              {new Date(booking.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">Appt Time</span>
                            <span className="text-slate-900 font-mono font-bold text-sm">{booking.time}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">Phone</span>
                            <span className="text-slate-700 font-mono">{booking.phone || "Not provided"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">Received</span>
                            <span className="text-slate-750 font-mono">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px] mb-2">Customer Request Note</span>
                          <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-600 italic">
                            "{booking.message || "No notes attached."}"
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                          {booking.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, "CONFIRMED")}
                                className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, "CANCELLED")}
                                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="ml-auto px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-655 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Delete Record
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: SIMULATOR */}
          {activeTab === "simulator" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-fade-in">
              <h3 className="text-lg font-bold mb-1 text-slate-900">API Integration Simulator</h3>
              <p className="text-sm text-slate-500 mb-6">
                Simulate how your external frontends forward forms to `api.spplabs.es`. Firing requests here executes real database operations and key validations.
              </p>

              <form onSubmit={handleSimulateSubmit} className="space-y-6">
                
                {/* Credentials Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sender Domain</label>
                    <input
                      type="text"
                      required
                      value={simDomain}
                      onChange={(e) => setSimDomain(e.target.value)}
                      className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Raw API Key (`spp_api_...`)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Paste your raw API key here to test validation"
                      value={simApiKey}
                      onChange={(e) => setSimApiKey(e.target.value)}
                      className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                {/* Form Type Selector */}
                <div className="flex gap-4 border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setSimType("contact")}
                    className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                      simType === "contact"
                        ? "border-brand-blue text-brand-blue"
                        : "border-transparent text-slate-450 hover:text-slate-800"
                    }`}
                  >
                    Contact Form Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimType("booking")}
                    className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                      simType === "booking"
                        ? "border-brand-green text-brand-green"
                        : "border-transparent text-slate-450 hover:text-slate-800"
                    }`}
                  >
                    Booking Calendar Post
                  </button>
                </div>

                {/* SIMULATOR INPUT FIELDS */}
                {simType === "contact" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-550 mb-2">Customer Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={simContactName}
                        onChange={(e) => setSimContactName(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-550 mb-2">Customer Email</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={simContactEmail}
                        onChange={(e) => setSimContactEmail(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-550 mb-2">Customer Phone</label>
                      <input
                        type="text"
                        placeholder="+34 600 000 000"
                        value={simContactPhone}
                        onChange={(e) => setSimContactPhone(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-550 mb-2">Message</label>
                      <textarea
                        required
                        placeholder="Hello, I want to inquire about custom software developments."
                        value={simContactMessage}
                        onChange={(e) => setSimContactMessage(e.target.value)}
                        className="w-full h-24 bg-white border border-slate-200 rounded-lg p-3 text-xs resize-none text-slate-900 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-550 mb-2">Client Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Smith"
                        value={simBookingName}
                        onChange={(e) => setSimBookingName(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-550 mb-2">Client Email</label>
                      <input
                        type="email"
                        required
                        placeholder="jane@example.com"
                        value={simBookingEmail}
                        onChange={(e) => setSimBookingEmail(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-550 mb-2">Client Phone</label>
                      <input
                        type="text"
                        placeholder="+34 611 111 111"
                        value={simBookingPhone}
                        onChange={(e) => setSimBookingPhone(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-550 mb-2">Appt Date</label>
                        <input
                          type="date"
                          required
                          value={simBookingDate}
                          onChange={(e) => setSimBookingDate(e.target.value)}
                          className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-550 mb-2">Appt Time</label>
                        <input
                          type="text"
                          required
                          placeholder="11:30"
                          value={simBookingTime}
                          onChange={(e) => setSimBookingTime(e.target.value)}
                          className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-550 mb-2">Request Note</label>
                      <textarea
                        placeholder="Requesting consult for SEO analysis."
                        value={simBookingMessage}
                        onChange={(e) => setSimBookingMessage(e.target.value)}
                        className="w-full h-24 bg-white border border-slate-200 rounded-lg p-3 text-xs resize-none text-slate-900 focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={simLoading}
                  className={`w-full md:w-auto h-11 px-8 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center cursor-pointer ${
                    simType === "contact" ? "bg-brand-blue hover:bg-brand-blue-dark text-white" : "bg-brand-green hover:bg-brand-green-dark text-white"
                  }`}
                >
                  {simLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    `Fire POST ${simType === "contact" ? "/contacts" : "/bookings"}`
                  )}
                </button>
              </form>

              {/* SIMULATOR RESPONSE CODE VIEWER */}
              {simResult && (
                <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">API Server Response</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded border font-mono ${
                      simResult.ok ? "bg-emerald-50 border-emerald-250 text-emerald-700" : "bg-rose-50 border-rose-250 text-rose-700"
                    }`}>
                      HTTP {simResult.status} {simResult.ok ? "OK" : "Error"}
                    </span>
                  </div>

                  <pre className="bg-white border border-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto text-slate-800 select-all">
                    {JSON.stringify(simResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
