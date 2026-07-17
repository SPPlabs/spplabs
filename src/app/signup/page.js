"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Success, redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center relative overflow-hidden px-4 selection:bg-brand-blue selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-brand-green/10 blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-blue/10 blur-[120px] -z-10"></div>

      {/* Back to Home Link */}
      <a
        href="/"
        className="absolute top-6 left-6 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </a>

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        {/* SPP Labs Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-12 h-12 flex items-center justify-center mb-4 group">
            <div className="absolute inset-0 bg-brand-blue rounded-xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
            <div className="absolute inset-0.5 bg-slate-950 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-brand-green rounded transform -rotate-12 group-hover:rotate-0 transition-transform duration-300"></div>
            </div>
            <div className="absolute w-2.5 h-2.5 bg-white rounded-full"></div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            SPP <span className="text-slate-500 font-medium">labs</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Activate client portal dashboard</p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-500/50 text-red-200 text-sm p-4 rounded-xl mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Website Domain
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="clientdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full h-12 bg-slate-950/80 border border-slate-800 rounded-xl px-4 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
              <div className="absolute right-4 top-3.5 text-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Registration Token
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="spp_token_••••••••••••"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full h-12 bg-slate-950/80 border border-slate-800 rounded-xl px-4 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all font-mono"
              />
              <div className="absolute right-4 top-3.5 text-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Set Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-slate-950/80 border border-slate-800 rounded-xl px-4 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
              <div className="absolute right-4 top-3.5 text-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-white text-black hover:bg-brand-green hover:text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-800 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Activate Account"
            )}
          </button>
        </form>

        <div className="border-t border-slate-800/80 mt-6 pt-6 text-center text-sm text-slate-400">
          Already registered?{" "}
          <a href="/login" className="text-brand-blue hover:text-brand-green font-semibold transition-colors duration-200">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
