"use client";

import BookingsCalendar from "@/components/dashboard/BookingsCalendar";
import { MailIcon, CalendarIcon } from "@/components/dashboard/DashboardIcons";

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
    <div className="space-y-10 animate-fade-in w-full max-w-full">
      {/* Contact Submissions Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200/80">
          <div>
            <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MailIcon className="w-4.5 h-4.5" />
              </span>
              <span>{t.clientesContactForms}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t.clientesSubtitle}</p>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold border border-slate-200 font-mono self-start sm:self-auto">
            {contactForms.length} {lang === "es" ? "mensajes" : "messages"}
          </span>
        </div>

        {contactForms.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-xs italic font-medium shadow-xs">
            {t.clientesNoForms}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactForms.map((form) => (
              <div key={form.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  {/* Top Row: Name, Email & Date */}
                  <div className="flex justify-between items-start gap-2 mb-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-extrabold text-sm text-slate-950 block">{form.name}</span>
                      <a href={`mailto:${form.email}`} className="text-xs text-blue-600 font-semibold hover:underline block truncate max-w-[200px] sm:max-w-[240px]">
                        {form.email}
                      </a>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold shrink-0">
                      {new Date(form.createdAt).toLocaleString(lang === "es" ? "es-ES" : "en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Phone Details if present */}
                  {form.phone && (
                    <div className="text-xs mb-3 flex items-center gap-2 text-slate-600">
                      <span className="text-[10px] font-bold uppercase text-slate-400">{t.clientesPhone}:</span>
                      <a href={`tel:${form.phone}`} className="font-mono text-slate-800 font-semibold hover:text-blue-600">
                        {form.phone}
                      </a>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="mb-4">
                    <div className="bg-slate-50/80 border-l-3 border-blue-500 rounded-r-xl p-3.5 text-xs text-slate-700 leading-relaxed font-sans">
                      {form.message}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleDeleteContact(form.id)}
                    className="px-3 py-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    {t.clientesDelete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookings Section */}
      <div className="pt-2 border-t border-slate-200/80">
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarIcon className="w-4.5 h-4.5" />
            </span>
            <span>{t.clientesBookings}</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{t.clientesSubtitle}</p>
        </div>

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
