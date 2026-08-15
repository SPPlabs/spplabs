"use client";

export default function OverviewTab({
  currentWebsite,
  t,
  lang,
  contactForms,
  bookings,
  conversationsList,
  announcementsList,
  setActiveTab,
}) {
  const pendingBookingsCount = bookings.filter(b => b.status === "PENDING").length;
  const recentContactsCount = contactForms.filter(c => {
    const created = new Date(c.createdAt).getTime();
    return Date.now() - created < 48 * 60 * 60 * 1000;
  }).length;
  const announcementsCount = announcementsList.length;

  return (
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

        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto shrink-0 mt-2 md:mt-0">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 sm:p-4 text-center shadow-sm flex flex-col justify-center items-center">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider leading-tight">{t.overviewTotalContacts}</span>
            <span className="text-xl sm:text-3xl font-black font-mono text-slate-900">{contactForms.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 sm:p-4 text-center shadow-sm flex flex-col justify-center items-center">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider leading-tight">{t.overviewTotalBookings}</span>
            <span className="text-xl sm:text-3xl font-black font-mono text-brand-green">{bookings.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 sm:p-4 text-center shadow-sm flex flex-col justify-center items-center">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold block mb-1 uppercase tracking-wider leading-tight">{t.overviewTotalConversations}</span>
            <span className="text-xl sm:text-3xl font-black font-mono text-indigo-600">{conversationsList.length}</span>
          </div>
        </div>
      </div>

      {/* Alert Center / Novedades y Acciones Pendientes */}
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

      {/* Data Lists Briefs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
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

        {/* AI Conversation List Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base text-slate-900">{t.overviewAiConversations}</h3>
            <button
              onClick={() => setActiveTab("ia")}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              {t.heroCTAMore}
            </button>
          </div>

          {conversationsList.length === 0 ? (
            <div className="text-center py-10 text-slate-450 text-sm">
              {t.overviewNoConversations}
            </div>
          ) : (
            <div className="space-y-4">
              {conversationsList.slice(0, 3).map((conv) => (
                <div key={conv.id} className="bg-slate-55 border border-slate-200 rounded-xl p-4 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900 truncate max-w-[160px]">👤 {conv.visitorName || conv.visitorId}</span>
                    <span className="text-[10px] bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-bold px-2 py-0.5 rounded">
                      {conv.messageCount} msgs
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mb-2">
                    {new Date(conv.lastMessageAt).toLocaleString("es-ES")}
                  </span>
                  <p className="text-slate-600 text-xs bg-white p-2 rounded-lg border border-slate-200 line-clamp-2 italic">
                    "{conv.firstMessageSnippet}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
