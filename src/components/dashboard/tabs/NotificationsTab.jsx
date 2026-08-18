"use client";

export default function NotificationsTab({
  t,
  lang,
  currentWebsite,
  session,
  isImpersonating,
  allWebsites,
  handleSendAnnouncement,
  announcementTitle,
  setAnnouncementTitle,
  announcementMsg,
  setAnnouncementMsg,
  announcementTargetId,
  setAnnouncementTargetId,
  announcementSuccess,
  announcementSending,
  announcementsList,
  handleDeleteAnnouncement,
  petitionsList,
  handleDeletePetition,
  handleSendPetition,
  petitionMsg,
  setPetitionMsg,
  petitionSending,
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* ADMIN VIEW: Send Notifications Form */}
      {currentWebsite.domain === "spplabs.es" && (
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{ann.title}</span>
                    {session.domain === "spplabs.es" && !isImpersonating && (
                      ann.websiteId ? (
                        <span className="bg-blue-50 text-blue-700 text-[10px] px-2.5 py-0.5 rounded-md font-bold border border-blue-200/60">
                          {lang === "es" ? "Para: " : "To: "}{ann.targetDisplayName || ann.targetDomain || "Cliente"} ({ann.targetDomain || "Individual"})
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-md font-bold border border-emerald-200/60">
                          {lang === "es" ? "Global (Todos los usuarios)" : "Global (All users)"}
                        </span>
                      )
                    )}
                  </div>
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

      {/* PETITIONS SECTION */}
      {currentWebsite.domain === "spplabs.es" ? (
        /* ADMIN INBOX VIEW */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <span>📩</span>
                {lang === "es" ? "Peticiones y Solicitudes de Clientes" : "Client Support Petitions Inbox"}
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                {lang === "es" ? "Mensajes directos y solicitudes de soporte enviados por los clientes" : "Direct petitions and support requests sent by clients"}
              </p>
            </div>
            <span className="bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-full font-extrabold border border-slate-200">
              {petitionsList.length} {lang === "es" ? "peticiones" : "petitions"}
            </span>
          </div>

          {petitionsList.length === 0 ? (
            <p className="text-xs text-slate-450 italic py-8 text-center font-medium">
              {lang === "es" ? "No hay peticiones de clientes pendientes en la base de datos." : "No client support petitions received yet."}
            </p>
          ) : (
            <div className="space-y-4 mt-6">
              {petitionsList.map((pet) => (
                <div key={pet.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200/60">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                        💬
                      </span>
                      <div>
                        <span className="font-extrabold text-sm text-slate-950 block">{pet.displayName || pet.domain}</span>
                        <span className="text-[11px] font-mono font-semibold text-blue-600 block">{pet.domain}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold self-start sm:self-center">
                      {new Date(pet.createdAt).toLocaleString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-xs text-slate-800 leading-relaxed font-sans mb-4 shadow-2xs">
                    {pet.message}
                  </div>

                  <div className="flex justify-end items-center gap-2">
                    <button
                      onClick={() => handleDeletePetition(pet.id)}
                      className="text-rose-600 hover:bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      {lang === "es" ? "Resolver / Marcar Leído" : "Resolve / Mark Read"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* CLIENT VIEW: Submit Support Petition Form + Sent History */
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
                      <span className="font-bold text-slate-700">{pet.title || "Petición a SPP Labs"}</span>
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
      )}
    </div>
  );
}
