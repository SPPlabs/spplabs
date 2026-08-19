"use client";

export default function AdminTab({
  t,
  newDomain,
  setNewDomain,
  newDisplayName,
  setNewDisplayName,
  createLoading,
  handleCreateClient,
  createError,
  createdCredentials,
  allWebsites,
  router,
  setActiveTab,
  handleDeleteUser,
}) {
  return (
    <div className="space-y-10 animate-fade-in w-full max-w-full">
      {/* Provision Website Form */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
            <span>⚡</span> Provisionar Sitio Cliente
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <span>👥</span> {t.usersTitle}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t.usersSubtitle}</p>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold border border-slate-200 font-mono self-start sm:self-auto">
            {allWebsites.length} {lang === "es" ? "empresas" : "businesses"}
          </span>
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
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

        {/* MOBILE CARDS VIEW */}
        <div className="md:hidden space-y-3.5">
          {allWebsites.map((web) => (
            <div key={web.id} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{web.displayName}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{web.domain}</p>
                </div>
                <div className="shrink-0">
                  {web.role === "ADMIN" ? (
                    <span className="bg-brand-blue/15 text-brand-blue text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      {t.usersAdminAccount}
                    </span>
                  ) : web.passwordHash ? (
                    <span className="bg-brand-green/15 text-brand-green text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      {t.usersRegistered}
                    </span>
                  ) : (
                    <span className="bg-amber-500/15 text-amber-500 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      {t.usersSetupPending}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                <span>{t.usersThCreated}: <strong className="text-slate-700">{new Date(web.createdAt).toLocaleDateString()}</strong></span>
              </div>

              {web.role !== "ADMIN" && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      router.push(`/dashboard?domain=${web.domain}`);
                      setActiveTab("overview");
                    }}
                    className="flex-1 bg-slate-900 hover:bg-black text-white text-xs px-3 py-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {t.usersEnterDashboard}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(web.id)}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 text-xs px-3 py-2.5 rounded-xl font-bold transition-all cursor-pointer active:scale-98 shrink-0"
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
