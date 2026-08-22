"use client";

import { BoltIcon, UsersIcon } from "@/components/dashboard/DashboardIcons";

export default function AdminTab({
  t,
  lang = "es",
  newDomain,
  setNewDomain,
  newDisplayName,
  setNewDisplayName,
  createLoading,
  handleCreateClient,
  createError,
  createdCredentials,
  allWebsites = [],
  router,
  setActiveTab,
  handleDeleteUser,
  websiteHealth = {},
  healthLoading = false,
  fetchWebsiteHealth,
}) {
  // Helper to format relative time for last active presence
  const renderPresenceBadge = (web) => {
    if (!web.lastActiveAt) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
          <span>{t.usersPresenceNever || "Nunca"}</span>
        </span>
      );
    }

    const diffMs = Date.now() - new Date(web.lastActiveAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    // Active in last 3 minutes: Online
    if (diffMins < 3) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span>{t.usersPresenceOnline || "En línea"}</span>
        </span>
      );
    }

    // Active in last 20 minutes: Away / Idle
    if (diffMins < 20) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>
            {t.usersPresenceIdle || "Ausente"} ({diffMins}m)
          </span>
        </span>
      );
    }

    // Active today: Hours ago
    if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
          <span>
            {lang === "es" ? `Hace ${hours}h` : `${hours}h ago`}
          </span>
        </span>
      );
    }

    // Older: Date
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
        <span>{new Date(web.lastActiveAt).toLocaleDateString()}</span>
      </span>
    );
  };

  // Helper to render Website Uptime Status Badge
  const renderWebsiteStatusBadge = (domain) => {
    const health = websiteHealth[domain];

    if (healthLoading && !health) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium animate-pulse">
          <svg className="w-3.5 h-3.5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{t.usersWebChecking || "Comprobando..."}</span>
        </span>
      );
    }

    if (!health) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
          <span>Pendiente</span>
        </span>
      );
    }

    if (health.isOnline) {
      return (
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs cursor-help"
          title={`HTTP ${health.statusCode} • Latencia: ${health.latencyMs}ms`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{t.usersWebOnline || "Operativo"}</span>
          <span className="text-[10px] text-emerald-600 font-mono font-normal">
            ({health.latencyMs}ms)
          </span>
        </span>
      );
    }

    // Down or unreachable
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full cursor-help"
        title={`Error: ${health.error || "Inaccesible"}`}
      >
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        <span>{t.usersWebOffline || "Caído"}</span>
        {health.error && (
          <span className="text-[10px] text-red-600 font-mono font-normal truncate max-w-[90px]">
            ({health.error})
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in w-full max-w-full">
      {/* Provision Website Form */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BoltIcon className="w-4.5 h-4.5" />
            </span>
            <span>Provisionar Sitio Cliente</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{t.usersSubtitle}</p>
        </div>

        {createError && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-bold p-4 rounded-xl mb-6">
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {t.loginDomain}
            </label>
            <input
              type="text"
              required
              placeholder="clientdomain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {t.usersThName}
            </label>
            <input
              type="text"
              required
              placeholder="ACME Corporation"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={createLoading}
              className="w-full md:w-auto h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
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
          <div className="mt-8 bg-slate-50 border border-emerald-300 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-4">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ¡Cliente provisionado exitosamente!
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
              <span className="font-bold text-red-500">ADVERTENCIA:</span> Copie la clave API ahora. Está encriptada usando Argon2id y no se volverá a mostrar.
            </p>

            <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t.signupToken}</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono text-slate-900 select-all">
                    {createdCredentials.signupToken}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(createdCredentials.signupToken)}
                    className="bg-white hover:bg-slate-100 border border-slate-200 text-xs px-3.5 py-2 rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Clave API</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono text-emerald-700 font-bold select-all">
                    {createdCredentials.rawApiKey}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(createdCredentials.rawApiKey)}
                    className="bg-white hover:bg-slate-100 border border-slate-200 text-xs px-3.5 py-2 rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UsersIcon className="w-4.5 h-4.5" />
              </span>
              <span>{t.usersTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t.usersSubtitle}</p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {fetchWebsiteHealth && (
              <button
                onClick={() => fetchWebsiteHealth(true)}
                disabled={healthLoading}
                className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-60 active:scale-95 shadow-2xs"
                title={t.usersRefreshHealth || "Recomprobar Estado Web"}
              >
                <svg
                  className={`w-3.5 h-3.5 text-slate-500 ${healthLoading ? "animate-spin text-blue-600" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>{healthLoading ? (t.usersWebChecking || "Comprobando...") : (t.usersRefreshHealth || "Recomprobar")}</span>
              </button>
            )}

            <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-bold border border-slate-200 font-mono">
              {allWebsites.length} {lang === "es" ? "empresas" : "businesses"}
            </span>
          </div>
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">{t.usersThName}</th>
                <th className="pb-3 font-semibold">{t.usersThDomain}</th>
                <th className="pb-3 font-semibold">{t.usersThPresence || "Presencia Panel"}</th>
                <th className="pb-3 font-semibold">{t.usersThWebsiteStatus || "Estado Web"}</th>
                <th className="pb-3 font-semibold">{t.usersThStatus}</th>
                <th className="pb-3 font-semibold">{t.usersThCreated}</th>
                <th className="pb-3 text-right font-semibold">{t.usersThAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {allWebsites.map((web) => (
                <tr key={web.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="py-3.5 font-bold text-slate-900">{web.displayName}</td>
                  <td className="py-3.5 text-slate-600 font-mono text-xs">
                    <a
                      href={`https://${web.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{web.domain}</span>
                      <svg className="w-3 h-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </td>

                  {/* Presence Indicator */}
                  <td className="py-3.5">
                    {renderPresenceBadge(web)}
                  </td>

                  {/* Website Uptime Indicator */}
                  <td className="py-3.5">
                    {renderWebsiteStatusBadge(web.domain)}
                  </td>

                  {/* Account Setup Status */}
                  <td className="py-3.5">
                    {web.role === "ADMIN" ? (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {t.usersAdminAccount}
                      </span>
                    ) : web.passwordHash ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {t.usersRegistered}
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {t.usersSetupPending}
                      </span>
                    )}
                  </td>

                  {/* Created At */}
                  <td className="py-3.5 text-slate-500 text-xs font-mono">
                    {new Date(web.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-right">
                    {web.role !== "ADMIN" && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            router.push(`/dashboard?domain=${web.domain}`);
                            setActiveTab("overview");
                          }}
                          className="bg-slate-900 hover:bg-black text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          {t.usersEnterDashboard}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(web.id)}
                          className="border border-red-200 hover:bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer active:scale-95"
                        >
                          {t.usersDeleteAccount}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE & TABLET CARDS VIEW */}
        <div className="lg:hidden space-y-4">
          {allWebsites.map((web) => (
            <div key={web.id} className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{web.displayName}</h4>
                  <a
                    href={`https://${web.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline font-mono mt-0.5 inline-flex items-center gap-1 truncate"
                  >
                    <span>{web.domain}</span>
                    <svg className="w-3 h-3 opacity-60 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
                <div className="shrink-0">
                  {web.role === "ADMIN" ? (
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      {t.usersAdminAccount}
                    </span>
                  ) : web.passwordHash ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      {t.usersRegistered}
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      {t.usersSetupPending}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Indicators Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 bg-white/70 rounded-xl p-2.5 border border-slate-200/40">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    {t.usersThPresence || "Presencia Panel"}
                  </span>
                  <div>{renderPresenceBadge(web)}</div>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    {t.usersThWebsiteStatus || "Estado Web"}
                  </span>
                  <div>{renderWebsiteStatusBadge(web.domain)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>{t.usersThCreated}: <strong className="text-slate-700 font-mono">{new Date(web.createdAt).toLocaleDateString()}</strong></span>
              </div>

              {web.role !== "ADMIN" && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      router.push(`/dashboard?domain=${web.domain}`);
                      setActiveTab("overview");
                    }}
                    className="flex-1 bg-slate-900 hover:bg-black text-white text-xs px-3 py-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {t.usersEnterDashboard}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(web.id)}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-xl font-bold transition-all cursor-pointer active:scale-98 shrink-0"
                  >
                    {t.usersDeleteAccount}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
