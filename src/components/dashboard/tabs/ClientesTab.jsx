"use client";

import BookingsCalendar from "@/components/dashboard/BookingsCalendar";

export default function ClientesTab({
  t,
  lang,
  contactForms,
  bookings,
  handleDeleteContact,
  handleUpdateBookingStatus,
  handleDeleteBooking,
  currentWebsite,
  router,
}) {
  return (
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

        <BookingsCalendar
          bookings={bookings}
          lang={lang}
          onAccept={handleUpdateBookingStatus}
          onReject={handleUpdateBookingStatus}
          onDelete={handleDeleteBooking}
          t={t}
          currentWebsiteDomain={currentWebsite?.domain}
          router={router}
        />
      </div>
    </div>
  );
}
