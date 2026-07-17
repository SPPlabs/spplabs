"use client";

import { useState } from "react";
import Script from "next/script";

export default function Home() {
  const [activeTab, setActiveTab] = useState("throughput");

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

      setContactResult({ success: true, message: "Thank you! Your message was submitted successfully." });
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

      setBookingResult({ success: true, message: "Appointment requested! We will confirm shortly." });
      setBookingName("");
      setBookingEmail("");
      setBookingPhone("");
      setBookingDate("");
      setBookingTime("");
      setBookingMessage("");
    } catch (err) {
      setBookingResult({ success: false, message: err.message });
    } finally {
      setBookingLoading(false);
    }
  };

  // Simulated metrics for the interactive dashboard mockup
  const metrics = {
    throughput: {
      title: "Network Throughput",
      value: "1,248.4 Mb/s",
      change: "+14.2% from last hour",
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
          {/* Pulsing indicator */}
          <circle cx="500" cy="20" r="6" fill="#2563eb" className="animate-ping" />
          <circle cx="500" cy="20" r="4" fill="#2563eb" />
        </svg>
      )
    },
    cpu: {
      title: "CPU Utilization",
      value: "42.8%",
      change: "-5.3% from last hour",
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
      title: "API Response Time",
      value: "14ms",
      change: "+0.4% from last hour",
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

  return (
    <div className="bg-white min-h-screen text-black flex flex-col font-sans selection:bg-brand-blue selection:text-white">
      {/* Navigation */}
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group" id="nav-logo">
            {/* SPP Labs Logo */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-brand-blue rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
              <div className="absolute inset-0.5 bg-white rounded-md flex items-center justify-center">
                <div className="w-4.5 h-4.5 bg-brand-green rounded transform -rotate-12 group-hover:rotate-0 transition-transform duration-300"></div>
              </div>
              <div className="absolute w-2 h-2 bg-black rounded-full"></div>
            </div>
            <span className="font-bold text-xl tracking-tight">
              SPP <span className="text-zinc-500 font-medium">labs</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors" id="nav-link-features">Features</a>
            <a href="#demo" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors" id="nav-link-demo">Demo Telemetry</a>
            <a href="#pricing" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors" id="nav-link-pricing">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/signup"
              className="text-sm font-semibold text-zinc-600 hover:text-black transition-colors"
              id="nav-signup-link"
            >
              Sign Up
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-5 h-10 text-sm font-bold bg-black text-white rounded-lg hover:bg-brand-blue transition-colors duration-300 shadow-sm hover:shadow-md cursor-pointer"
              id="nav-cta"
            >
              Dashboard Login
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 md:py-32 border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-12 gap-16 items-center">
              {/* Hero Copy */}
              <div className="md:col-span-7 flex flex-col items-start text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-700 bg-white mb-6">
                  <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                  <span>Version 4.0 is live</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.1] mb-8">
                  Operations & Analytics, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-black to-brand-green">
                    engineered for scale.
                  </span>
                </h1>
                
                <p className="text-lg text-zinc-600 max-w-xl leading-relaxed mb-10">
                  Deploy, analyze, and optimize your systems in real-time. A unified developer workspace designed to streamline infrastructure telemetry and engineering workflows.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center px-8 h-13 text-base font-semibold bg-black text-white rounded-lg hover:bg-brand-blue transition-colors duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                    id="hero-primary-cta"
                  >
                    Dashboard Portal
                  </a>
                  <a
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 h-13 text-base font-semibold bg-white text-black border border-zinc-300 rounded-lg hover:border-black transition-colors duration-300 cursor-pointer"
                    id="hero-secondary-cta"
                  >
                    Register Tenant
                  </a>
                </div>

                <div className="mt-12 flex items-center gap-8 text-zinc-500 text-xs font-semibold tracking-wider uppercase">
                  <span>No credit card required</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                  <span>14-day free trial</span>
                </div>
              </div>

              {/* Hero Visual Mockup */}
              <div className="md:col-span-5 relative w-full">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 via-transparent to-brand-green/10 rounded-3xl blur-3xl -z-10"></div>
                <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-xl relative">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-zinc-200"></span>
                      <span className="w-3 h-3 rounded-full bg-zinc-200"></span>
                      <span className="w-3 h-3 rounded-full bg-zinc-200"></span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">spplabs-cluster-01</span>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-zinc-100 rounded-xl p-4">
                        <span className="text-xs text-zinc-500 font-medium block mb-1">Status</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-green"></span>
                          <span className="text-sm font-bold">Operational</span>
                        </div>
                      </div>
                      <div className="border border-zinc-100 rounded-xl p-4">
                        <span className="text-xs text-zinc-500 font-medium block mb-1">Uptime</span>
                        <span className="text-sm font-bold font-mono">99.998%</span>
                      </div>
                    </div>

                    <div className="border border-zinc-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-zinc-500 font-medium">Memory Load</span>
                        <span className="text-xs font-bold text-brand-blue font-mono">31.2%</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-blue h-full rounded-full" style={{ width: "31.2%" }}></div>
                      </div>
                    </div>

                    <div className="border border-zinc-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-zinc-500 font-medium">Network IO</span>
                        <span className="text-xs font-bold text-brand-green font-mono">Normal</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-green h-full rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="py-24 bg-white border-b border-zinc-100 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-4">Core Infrastructure</h2>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                Everything you need to orchestrate telemetry at scale.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="border border-zinc-200 bg-white rounded-2xl p-8 hover:border-brand-blue transition-all duration-300 group hover:shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Instant Telemetry</h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Query and visual infrastructure events in real-time. Gather sub-millisecond telemetry from edge devices and containerized APIs with native visual dashboards.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="border border-zinc-200 bg-white rounded-2xl p-8 hover:border-brand-green transition-all duration-300 group hover:shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Workflows & Triggers</h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Automate standard operational procedures. Bind actions directly to metric triggers to automatically scale containers, purge caches, or rerun deployments.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="border border-zinc-200 bg-white rounded-2xl p-8 hover:border-black transition-all duration-300 group hover:shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-black mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Secure Perimeter</h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  Leverage end-to-end transport encryption, isolated query namespaces, and hardware key attestation. Compliance-ready posture standard out of the box.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Showcase Section */}
        <section id="demo" className="py-24 bg-white border-b border-zinc-100 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-green mb-4 block">Interactive Telemetry</span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mb-6">
                  Monitor your infrastructure metrics interactively.
                </h2>
                <p className="text-zinc-600 mb-8 leading-relaxed">
                  Toggle through the metrics panels to inspect real-time platform updates. SPP Labs isolates event data to give you high-fidelity insights immediately.
                </p>

                {/* Tab Controls */}
                <div className="space-y-3">
                  {Object.keys(metrics).map((tabKey) => {
                    const isActive = activeTab === tabKey;
                    return (
                      <button
                        key={tabKey}
                        onClick={() => setActiveTab(tabKey)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                          isActive
                            ? "border-black bg-zinc-50 shadow-sm"
                            : "border-zinc-200 hover:border-zinc-400 bg-white"
                        }`}
                        id={`tab-control-${tabKey}`}
                      >
                        <div>
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            isActive
                              ? tabKey === "throughput"
                                ? "text-brand-blue"
                                : tabKey === "cpu"
                                ? "text-brand-green"
                                : "text-black"
                              : "text-zinc-400"
                          }`}>
                            {metrics[tabKey].title}
                          </span>
                          <span className="block text-lg font-bold text-black mt-1">
                            {metrics[tabKey].value}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${
                            metrics[tabKey].isPositive ? "text-brand-green" : "text-brand-blue"
                          }`}>
                            {metrics[tabKey].change}
                          </span>
                          <svg className={`w-4 h-4 ${isActive ? "text-black" : "text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Metric Graph Render Display */}
              <div className="lg:col-span-7 border border-zinc-200 bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-8">
                  <div className="flex items-center gap-4">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      activeTab === "throughput" ? "bg-brand-blue" : activeTab === "cpu" ? "bg-brand-green" : "bg-black"
                    } animate-pulse`}></span>
                    <span className="font-bold text-sm text-black">
                      {metrics[activeTab].title} Live Monitor
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-md border border-zinc-150">
                    <span>Source: US-East-1</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-black tracking-tight text-black font-mono">
                    {metrics[activeTab].value}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Telemetry updated 2 seconds ago
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
                  {metrics[activeTab].svgPath}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Pricing Section */}
        <section id="pricing" className="py-24 bg-white border-b border-zinc-100 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-green mb-4">Pricing Plans</h2>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                Simple, transparent tiers built for telemetry operations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Pricing 1 */}
              <div className="border border-zinc-200 bg-white rounded-2xl p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">Developer</h3>
                  <p className="text-zinc-500 text-sm mb-6">Great for individual apps and personal research.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-black font-mono">$0</span>
                    <span className="text-zinc-500 text-sm">/ month</span>
                  </div>
                  <ul className="space-y-4 border-t border-zinc-100 pt-6">
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>1 Million data points / mo</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>3 Day log retention</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>1 Connected application</span>
                    </li>
                  </ul>
                </div>
                <button className="mt-8 w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 text-black border border-zinc-200 rounded-lg text-sm font-semibold transition-colors duration-200">
                  Deploy Free Cluster
                </button>
              </div>

              {/* Pricing 2 */}
              <div className="border-2 border-black bg-white rounded-2xl p-8 flex flex-col justify-between relative shadow-lg">
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Popular
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">Scale</h3>
                  <p className="text-zinc-500 text-sm mb-6">Designed for expanding workloads and small teams.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-black font-mono">$49</span>
                    <span className="text-zinc-500 text-sm">/ month</span>
                  </div>
                  <ul className="space-y-4 border-t border-zinc-100 pt-6">
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>50 Million data points / mo</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>30 Day log retention</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>10 Connected applications</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Slack & Webhook alerting</span>
                    </li>
                  </ul>
                </div>
                <button className="mt-8 w-full py-3 px-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-sm font-semibold transition-colors duration-200 shadow-md">
                  Get Started
                </button>
              </div>

              {/* Pricing 3 */}
              <div className="border border-zinc-200 bg-white rounded-2xl p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">Enterprise</h3>
                  <p className="text-zinc-500 text-sm mb-6">Tailored for complex environments needing custom SLA.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-black font-mono">Custom</span>
                  </div>
                  <ul className="space-y-4 border-t border-zinc-100 pt-6">
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Unlimited data ingestion</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Custom log retention schema</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Dedicated query cluster</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-700">
                      <svg className="w-5 h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>24/7 Phone & Slack support</span>
                    </li>
                  </ul>
                </div>
                <button className="mt-8 w-full py-3 px-4 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors duration-200">
                  Talk to Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Bookings Section */}
        <section id="contact-bookings" className="py-24 bg-zinc-50 border-y border-zinc-100 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-4 block">Get in Touch</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                Connect with our team or book a consultation
              </h2>
              <p className="text-zinc-600 mt-4 text-sm leading-relaxed">
                Submit a general inquiry or select a convenient date and time to reserve a consulting call directly into our operations database.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-stretch">
              
              {/* Card 1: Contact Form */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-blue/5 rounded-bl-full pointer-events-none"></div>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-black">Send a Message</h3>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email</label>
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
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Phone (Optional)</label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+34 600 000 000"
                          className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-blue focus:bg-white text-black transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Message</label>
                      <textarea
                        required
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Tell us about your project requirements..."
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
                        "Submit Query"
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Card 2: Booking Form */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-green/5 rounded-bl-full pointer-events-none"></div>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-black">Schedule Consultation</h3>
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
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Name</label>
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
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email</label>
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
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Phone</label>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Select Date</label>
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white text-black transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Preferred Time</label>
                        <input
                          type="text"
                          required
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          placeholder="e.g. 10:00 or 15:30"
                          className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-green focus:bg-white text-black transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Inquiry / Note</label>
                      <input
                        type="text"
                        value={bookingMessage}
                        onChange={(e) => setBookingMessage(e.target.value)}
                        placeholder="Inquiry focus (e.g., SEO, Frontend consulting)"
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
                        "Request Booking"
                      )}
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Clean Call To Action Banner */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center border border-zinc-200 rounded-3xl p-16 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-green/5 rounded-tr-full"></div>
            
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mb-6">
              Orchestrate your operations today.
            </h2>
            <p className="text-zinc-600 max-w-lg mx-auto mb-10 text-sm leading-relaxed">
              Unlock millisecond query execution, automated scaling rules, and structured workflows. Try SPP Labs for 14 days free.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-8 h-12 text-sm font-bold bg-black text-white rounded-lg hover:bg-brand-blue transition-colors duration-300 cursor-pointer"
                id="footer-banner-cta-primary"
              >
                Access Dashboard
              </a>
              <a
                href="/signup"
                className="inline-flex items-center justify-center px-8 h-12 text-sm font-bold bg-white text-black border border-zinc-300 rounded-lg hover:border-black transition-colors duration-300 cursor-pointer"
                id="footer-banner-cta-secondary"
              >
                Register Account
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-base tracking-tight text-black">
              SPP <span className="text-zinc-500 font-medium">labs</span>
            </span>
            <span className="text-xs text-zinc-400">| © 2026 SPP Labs Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-8 text-xs font-semibold text-zinc-500">
            <a href="#" className="hover:text-black transition-colors" id="footer-link-status">Status</a>
            <a href="#" className="hover:text-black transition-colors" id="footer-link-privacy">Privacy Policy</a>
            <a href="#" className="hover:text-black transition-colors" id="footer-link-terms">Terms of Service</a>
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
