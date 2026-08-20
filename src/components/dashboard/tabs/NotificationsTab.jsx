"use client";

import { MegaphoneIcon, InboxIcon, ChatBubbleIcon } from "@/components/dashboard/DashboardIcons";

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
    <div className="space-y-10 animate-fade-in w-full max-w-full">
      {/* ADMIN VIEW: Send Notifications Form */}
      {currentWebsite.domain === "spplabs.es" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MegaphoneIcon className="w-4.5 h-4.5" />
              </span>
              <span>{t.adminNotifTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t.adminNotifDesc}</p>
          </div>

          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">{t.adminNotifSubject}</label>
              <input
                type="text"
                required
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Ej: Mantenimiento programado de base de datos"
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">{t.adminNotifMessage}</label>
              <textarea
                required
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                placeholder="Escriba aquí los detalles del comunicado..."
                className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs resize-none focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">{t.adminNotifTarget}</label>
              <select
                value={announcementTargetId}
                onChange={(e) => setAnnouncementTargetId(e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              >
                <option value="">-- Todos los usuarios (Global) --</option>
                {allWebsites.filter(w => w.domain !== "spplabs.es").map(w => (
                  <option key={w.id} value={w.id}>{w.displayName} ({w.domain})</option>
                ))}
              </select>
            </div>

            {announcementSuccess && (
              <div className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                {t.adminNotifSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={announcementSending}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {announcementSending ? "Publicando..." : t.adminNotifButton}
            </button>
          </form>
        </div>
      )}

      {/* Announcements received Board */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200/80">
          <div>
            <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MegaphoneIcon className="w-4.5 h-4.5" />
              </span>
              <span>{t.notifAnnouncements}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t.notifSubtitle}</p>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold border border-slate-200 font-mono self-start sm:self-auto">
            {announcementsList.length} {lang === "es" ? "publicados" : "published"}
          </span>
        </div>

        {announcementsList.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-xs italic font-medium shadow-xs">
            {t.notifNoAnnouncements}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcementsList.map((ann) => (
              <div key={ann.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-950">{ann.title}</span>
                      {session.domain === "spplabs.es" && !isImpersonating && (
                        ann.websiteId ? (
                          <span className="bg-blue-50 text-blue-700 text-[10px] px-2.5 py-0.5 rounded-md font-bold border border-blue-200/60">
                            {lang === "es" ? "Para: " : "To: "}{ann.targetDisplayName || ann.targetDomain || "Cliente"}
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-md font-bold border border-emerald-200/60">
                            {lang === "es" ? "Global" : "Global"}
                          </span>
                        )
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold shrink-0">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-slate-50/80 border-l-3 border-purple-500 rounded-r-xl p-3.5 text-xs text-slate-700 leading-relaxed font-sans mb-3">
                    {ann.message}
                  </div>
                </div>

                {session.domain === "spplabs.es" && !isImpersonating && (
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
      <div className="pt-2 border-t border-slate-200/80">
        {currentWebsite.domain === "spplabs.es" ? (
          /* ADMIN INBOX VIEW */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200/80">
              <div>
                <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <InboxIcon className="w-4.5 h-4.5" />
                  </span>
                  <span>{lang === "es" ? "Peticiones y Solicitudes de Clientes" : "Client Support Petitions Inbox"}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {lang === "es" ? "Mensajes directos y solicitudes de soporte enviados por los clientes" : "Direct petitions and support requests sent by clients"}
                </p>
              </div>
              <span className="bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-full font-bold border border-slate-200 font-mono self-start sm:self-auto">
                {petitionsList.length} {lang === "es" ? "peticiones" : "petitions"}
              </span>
            </div>

            {petitionsList.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-xs italic font-medium shadow-xs">
                {lang === "es" ? "No hay peticiones de clientes pendientes en la base de datos." : "No client support petitions received yet."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {petitionsList.map((pet) => (
                  <div key={pet.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                            <ChatBubbleIcon className="w-4 h-4 text-blue-600" />
                          </span>
                          <div>
                            <span className="font-extrabold text-sm text-slate-950 block">{pet.displayName || pet.domain}</span>
                            <span className="text-[10px] font-mono font-semibold text-blue-600 block">{pet.domain}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold shrink-0">
                          {new Date(pet.createdAt).toLocaleString("es-ES", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="bg-slate-50/80 border-l-3 border-blue-500 rounded-r-xl p-3.5 text-xs text-slate-800 leading-relaxed font-sans mb-3">
                        {pet.message}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleDeletePetition(pet.id)}
                        className="text-rose-600 hover:bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        <span>{lang === "es" ? "Resolver / Marcar Leído" : "Resolve / Mark Read"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* CLIENT VIEW: Submit Support Petition Form + Sent History */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ChatBubbleIcon className="w-4.5 h-4.5" />
                </span>
                <span>{t.notifCreatePetition}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{t.notifSubtitle}</p>
            </div>

            <form onSubmit={handleSendPetition} className="space-y-4">
              <div>
                <textarea
                  required
                  value={petitionMsg}
                  onChange={(e) => setPetitionMsg(e.target.value)}
                  placeholder={t.notifPetitionPlaceholder}
                  className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={petitionSending || !petitionMsg.trim()}
                className="h-11 px-8 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {petitionSending ? t.notifSending : t.notifSendPetition}
              </button>
            </form>

            {/* Sent Petitions History List */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">{t.notifPetitionsHistory}</h4>
              {petitionsList.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">{t.notifNoPetitions}</p>
              ) : (
                <div className="space-y-3">
                  {petitionsList.map((pet) => (
                    <div key={pet.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">{pet.title || "Petición a SPP Labs"}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t.notifDate}: {new Date(pet.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed italic mb-3 pl-2.5 border-l-2 border-slate-300">"{pet.message}"</p>
                      <div className="flex justify-end pt-2 border-t border-slate-200/40">
                        <button
                          onClick={() => handleDeletePetition(pet.id)}
                          className="text-red-500 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-100"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          <span>{lang === "es" ? "Eliminar" : "Delete"}</span>
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
    </div>
  );
}
