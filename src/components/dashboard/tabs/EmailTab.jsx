"use client";

import { useState, useEffect } from "react";
import {
  generateWelcomeContactHtml,
  generateBookingConfirmationHtml,
  generateBookingReminderHtml,
  generateGoogleReviewHtml,
} from "@/lib/emailTemplates";

export default function EmailTab({
  currentWebsite,
  t,
  lang,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Form State
  const [senderName, setSenderName] = useState(currentWebsite?.displayName || "");
  const [replyToEmail, setReplyToEmail] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [enableWelcomeEmail, setEnableWelcomeEmail] = useState(true);
  const [enableBookingConfirm, setEnableBookingConfirm] = useState(true);
  const [enableBookingReminder, setEnableBookingReminder] = useState(true);
  const [reminderHoursBefore, setReminderHoursBefore] = useState(24);
  
  // Google Review Booster Triggers (Citas & Contactos)
  const [enableBookingReviewRequest, setEnableBookingReviewRequest] = useState(true);
  const [bookingReviewDelayHours, setBookingReviewDelayHours] = useState(2);
  const [enableContactReviewRequest, setEnableContactReviewRequest] = useState(false);
  const [contactReviewDelayHours, setContactReviewDelayHours] = useState(24);
  
  const [brandColor, setBrandColor] = useState("#0284c7");

  // Email Logs State
  const [emailLogs, setEmailLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Test Email State
  const [testRecipient, setTestRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Template Preview Active Tab
  const [previewTab, setPreviewTab] = useState("review"); // 'welcome' | 'booking' | 'reminder' | 'review'

  // Fetch email config
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/email-config?domain=${currentWebsite?.domain}`);
      const data = await res.json();
      if (data.success && data.data) {
        const c = data.data;
        setSenderName(c.senderName || currentWebsite?.displayName || "");
        setReplyToEmail(c.replyToEmail || "");
        setGoogleReviewUrl(c.googleReviewUrl || "");
        setEnableWelcomeEmail(c.enableWelcomeEmail !== undefined ? c.enableWelcomeEmail : true);
        setEnableBookingConfirm(c.enableBookingConfirm !== undefined ? c.enableBookingConfirm : true);
        setEnableBookingReminder(c.enableBookingReminder !== undefined ? c.enableBookingReminder : true);
        setReminderHoursBefore(c.reminderHoursBefore || 24);
        
        // Review Triggers
        const isBookingReview = c.enableBookingReviewRequest !== undefined ? c.enableBookingReviewRequest : (c.enableReviewRequest !== undefined ? c.enableReviewRequest : true);
        setEnableBookingReviewRequest(isBookingReview);
        setBookingReviewDelayHours(c.bookingReviewDelayHours || c.reviewDelayHours || 2);
        
        setEnableContactReviewRequest(Boolean(c.enableContactReviewRequest));
        setContactReviewDelayHours(c.contactReviewDelayHours || 24);

        setBrandColor(c.brandColor || "#0284c7");
      }
    } catch (err) {
      console.error("Fetch email config error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch email logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/admin/email-logs?domain=${currentWebsite?.domain}`);
      const data = await res.json();
      if (data.success) {
        setEmailLogs(data.data || []);
      }
    } catch (err) {
      console.error("Fetch email logs error:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (currentWebsite?.domain) {
      fetchConfig();
      fetchLogs();
    }
  }, [currentWebsite?.domain]);

  const handleSaveConfig = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/email-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: currentWebsite?.domain,
          senderName,
          replyToEmail,
          googleReviewUrl,
          enableWelcomeEmail,
          enableBookingConfirm,
          enableBookingReminder,
          reminderHoursBefore: Number(reminderHoursBefore),
          enableReviewRequest: enableBookingReviewRequest,
          reviewDelayHours: Number(bookingReviewDelayHours),
          enableBookingReviewRequest,
          bookingReviewDelayHours: Number(bookingReviewDelayHours),
          enableContactReviewRequest,
          contactReviewDelayHours: Number(contactReviewDelayHours),
          brandColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al guardar configuración");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testRecipient || !testRecipient.includes("@")) return;

    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/email-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: currentWebsite?.domain,
          testEmail: testRecipient,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult({
          success: true,
          message: data.message || `Correo de prueba enviado a ${testRecipient}`,
          mock: data.mock,
        });
        setTestRecipient("");
        fetchLogs();
      } else {
        setTestResult({
          success: false,
          message: data.message || "Error al enviar el correo de prueba",
        });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setSendingTest(false);
    }
  };

  // Generate preview HTML string
  const getPreviewHtml = () => {
    const compName = senderName || currentWebsite?.displayName || "Empresa Demo";
    const dom = currentWebsite?.domain || "spplabs.es";

    if (previewTab === "welcome") {
      return generateWelcomeContactHtml({
        recipientName: "María García",
        companyName: compName,
        clientDomain: dom,
        brandColor,
        messageSnippet: "Hola, me gustaría solicitar más información sobre sus servicios de consultoría...",
      });
    }

    if (previewTab === "booking") {
      return generateBookingConfirmationHtml({
        recipientName: "Carlos Rodríguez",
        companyName: compName,
        clientDomain: dom,
        dateStr: "18 de agosto de 2026",
        timeStr: "11:30",
        brandColor,
      });
    }

    if (previewTab === "reminder") {
      return generateBookingReminderHtml({
        recipientName: "Carlos Rodríguez",
        companyName: compName,
        clientDomain: dom,
        dateStr: "Mañana, 18 de agosto de 2026",
        timeStr: "11:30",
        brandColor,
      });
    }

    // Default: Google Review Booster
    return generateGoogleReviewHtml({
      recipientName: "Carlos Rodríguez",
      companyName: compName,
      clientDomain: dom,
      googleReviewUrl: googleReviewUrl || "https://g.page/r/example/review",
      brandColor,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-full">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm w-full">
        <div>
          <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider font-mono border border-blue-200/60 inline-flex items-center gap-1.5">
            <span>✉️</span>
            {lang === "es" ? "Automatizaciones de Email & Reseñas Google" : "Email & Google Reviews Automation"}
          </span>
          <h2 className="text-3xl font-black mt-3 text-slate-950 tracking-tight">
            {lang === "es" ? "Email & Google Review Booster" : "Email & Google Review Booster"}
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            {lang === "es"
              ? "Configura los envíos automáticos de bienvenida, recordatorios de citas y solicitudes de reseñas en Google Maps para "
              : "Configure automated welcome emails, appointment reminders, and Google Maps review boosters for "}
            <strong>{currentWebsite?.domain}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchLogs}
            disabled={logsLoading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Actualizar registros"
          >
            <svg className={`w-5 h-5 ${logsLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-6 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {lang === "es" ? "Guardar Ajustes" : "Save Settings"}
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black p-4 rounded-2xl flex items-center gap-2 animate-fade-in shadow-xs">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {lang === "es" ? "¡Configuración de correo guardada exitosamente!" : "Email settings saved successfully!"}
        </div>
      )}

      {saveError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-4 rounded-2xl animate-fade-in">
          {saveError}
        </div>
      )}

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Left Column: Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* GOOGLE REVIEW BOOSTER CARD */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-2 border-amber-300/80 rounded-3xl p-6 shadow-sm relative overflow-hidden space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  ⭐
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">
                    {lang === "es" ? "Google Review Booster" : "Google Review Booster"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === "es" ? "Multiplica tus reseñas de 5 estrellas en Google Maps en piloto automático." : "Boost your 5-star Google Maps reviews automatically."}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-black uppercase bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full">
                  {lang === "es" ? "2 Disparadores Disponibles" : "2 Triggers Available"}
                </span>
              </div>
            </div>

            {/* Google Review URL Input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                {lang === "es" ? "Enlace directo de Reseñas de Google Maps" : "Direct Google Maps Review Link"}
              </label>
              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://g.page/r/XXXXXXXXX/review"
                className="w-full h-11 bg-white border border-slate-300 rounded-xl px-4 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
              <p className="text-[10.5px] text-slate-400 mt-1">
                {lang === "es"
                  ? "Tip: Obtén este enlace directo desde tu panel de Google Business Profile (icono 'Solicitar reseñas')."
                  : "Tip: Get this direct review link from your Google Business Profile dashboard."}
              </p>
            </div>

            {/* The 2 Configurable Options for Review Requests */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                {lang === "es" ? "Opciones de Envío de Reseñas:" : "Review Request Triggers:"}
              </span>

              {/* OPTION 1: BOOKING / APPOINTMENTS */}
              <div className="p-4 bg-white/90 border border-amber-200/80 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>📅</span>
                      {lang === "es" ? "Tras completar una Cita o Reserva" : "After an Appointment or Booking"}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {lang === "es" ? "Envía la solicitud de valoración cuando el cliente haya asistido a su cita." : "Sends review request after the client has attended their booking."}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={enableBookingReviewRequest}
                      onChange={(e) => setEnableBookingReviewRequest(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {enableBookingReviewRequest && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-amber-100">
                    <span className="text-xs font-bold text-slate-700">
                      {lang === "es" ? "Tiempo de envío post-cita:" : "Send delay after booking:"}
                    </span>
                    <select
                      value={bookingReviewDelayHours}
                      onChange={(e) => setBookingReviewDelayHours(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      <option value={1}>{lang === "es" ? "1 hora después" : "1 hour after"}</option>
                      <option value={2}>{lang === "es" ? "2 horas después (Recomendado)" : "2 hours after (Recommended)"}</option>
                      <option value={4}>{lang === "es" ? "4 horas después" : "4 hours after"}</option>
                      <option value={24}>{lang === "es" ? "24 horas después" : "24 hours after"}</option>
                    </select>
                  </div>
                )}
              </div>

              {/* OPTION 2: CONTACT FORMS */}
              <div className="p-4 bg-white/90 border border-amber-200/80 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>📩</span>
                      {lang === "es" ? "Tras Formulario de Contacto Web" : "After Web Contact Form Submission"}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {lang === "es" ? "Envía la solicitud de reseña tras responder o atender una consulta web." : "Sends review request after answering a website inquiry."}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={enableContactReviewRequest}
                      onChange={(e) => setEnableContactReviewRequest(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {enableContactReviewRequest && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-amber-100">
                    <span className="text-xs font-bold text-slate-700">
                      {lang === "es" ? "Tiempo de envío tras el contacto:" : "Send delay after contact:"}
                    </span>
                    <select
                      value={contactReviewDelayHours}
                      onChange={(e) => setContactReviewDelayHours(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      <option value={0}>{lang === "es" ? "⚡ Inmediatamente (al enviar el formulario)" : "⚡ Immediately (upon submission)"}</option>
                      <option value={1}>{lang === "es" ? "1 hora después" : "1 hour after"}</option>
                      <option value={12}>{lang === "es" ? "12 horas después" : "12 hours after"}</option>
                      <option value={24}>{lang === "es" ? "24 horas después (1 día - Recomendado)" : "24 hours after (1 day - Recommended)"}</option>
                      <option value={48}>{lang === "es" ? "48 horas después (2 días)" : "48 hours after (2 days)"}</option>
                      <option value={72}>{lang === "es" ? "72 horas después (3 días)" : "72 hours after (3 days)"}</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AUTOMATION TRIGGERS CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-black text-slate-950 pb-3 border-b border-slate-100 flex items-center gap-2">
              <span>⚡</span>
              {lang === "es" ? "Secuencias de Comunicación Automatizadas" : "Automated Communication Sequences"}
            </h3>

            {/* Trigger 1: Welcome Contact Email */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <div>
                <span className="font-extrabold text-sm text-slate-900 block">
                  {lang === "es" ? "Email de Confirmación de Contacto" : "Contact Confirmation Email"}
                </span>
                <span className="text-xs text-slate-500">
                  {lang === "es" ? "Envío instantáneo cuando un usuario envía el formulario web." : "Instant delivery upon contact form submission."}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={enableWelcomeEmail}
                  onChange={(e) => setEnableWelcomeEmail(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Trigger 2: Booking Confirmation */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <div>
                <span className="font-extrabold text-sm text-slate-900 block">
                  {lang === "es" ? "Confirmación Inmediata de Reserva" : "Instant Booking Confirmation"}
                </span>
                <span className="text-xs text-slate-500">
                  {lang === "es" ? "Envía los detalles de fecha y hora reservada al cliente." : "Sends booking date and time details to the client."}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={enableBookingConfirm}
                  onChange={(e) => setEnableBookingConfirm(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Trigger 3: Appointment Reminder */}
            <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    {lang === "es" ? "Recordatorio Automático de Cita" : "Automated Appointment Reminder"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {lang === "es" ? "Reduce no-shows recordando la cita con antelación." : "Reduces no-shows by reminding clients in advance."}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableBookingReminder}
                    onChange={(e) => setEnableBookingReminder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {enableBookingReminder && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                  <span className="text-xs font-bold text-slate-600">
                    {lang === "es" ? "Antelación del recordatorio:" : "Reminder notice:"}
                  </span>
                  <select
                    value={reminderHoursBefore}
                    onChange={(e) => setReminderHoursBefore(Number(e.target.value))}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  >
                    <option value={2}>{lang === "es" ? "2 horas antes" : "2 hours before"}</option>
                    <option value={12}>{lang === "es" ? "12 horas antes" : "12 hours before"}</option>
                    <option value={24}>{lang === "es" ? "24 horas antes (1 día)" : "24 hours before (1 day)"}</option>
                    <option value={48}>{lang === "es" ? "48 horas antes (2 días)" : "48 hours before (2 days)"}</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* SENDER & BRANDING CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-950 pb-3 border-b border-slate-100 flex items-center gap-2">
              <span>🎨</span>
              {lang === "es" ? "Identidad de Remitente & Marca" : "Sender & Brand Identity"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {lang === "es" ? "Nombre del Remitente" : "Sender Name"}
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Clínica Dental Sonrisas"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {lang === "es" ? "Email de Respuesta (Reply-To)" : "Reply-To Email"}
                </label>
                <input
                  type="email"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  placeholder="contacto@tuempresa.com"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {lang === "es" ? "Color de Acento en Plantillas" : "Brand Accent Color"}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-32 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono text-slate-900 uppercase font-bold"
                />
                <div className="flex gap-2">
                  {["#0284c7", "#10b981", "#8b5cf6", "#f59e0b", "#0f172a"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBrandColor(c)}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-xs cursor-pointer"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Email Previewer & Test Sender */}
        <div className="lg:col-span-5 space-y-6">
          {/* SEND TEST EMAIL BOX */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-md space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <span>🚀</span>
              {lang === "es" ? "Enviar Correo de Prueba" : "Send Test Email"}
            </h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {lang === "es"
                ? "Envía un email de test en tiempo real a tu bandeja de entrada para verificar cómo lo verán tus clientes."
                : "Send a live test email to your inbox to check how your clients will see it."}
            </p>

            <form onSubmit={handleSendTestEmail} className="flex gap-2">
              <input
                type="email"
                required
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="tu-email@gmail.com"
                className="flex-1 h-10 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={sendingTest}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {sendingTest ? "..." : (lang === "es" ? "Probar" : "Test")}
              </button>
            </form>

            {testResult && (
              <div className={`text-xs p-3 rounded-xl font-bold flex items-center gap-2 ${
                testResult.success ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}>
                {testResult.success ? "✓" : "✕"} {testResult.message}
                {testResult.mock && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">DEV MOCK</span>}
              </div>
            )}
          </div>

          {/* LIVE TEMPLATE PREVIEWER */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span>👁️</span>
                {lang === "es" ? "Previsualizador en Vivo" : "Live Email Preview"}
              </h4>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                HTML Responsive
              </span>
            </div>

            {/* Template Switcher Buttons */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-[11px] font-bold">
              <button
                onClick={() => setPreviewTab("review")}
                className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer text-center ${
                  previewTab === "review" ? "bg-white text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                ⭐ Google Review
              </button>
              <button
                onClick={() => setPreviewTab("reminder")}
                className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer text-center ${
                  previewTab === "reminder" ? "bg-white text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                ⏰ Recordatorio Cita
              </button>
              <button
                onClick={() => setPreviewTab("booking")}
                className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer text-center ${
                  previewTab === "booking" ? "bg-white text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                📅 Confirmar Cita
              </button>
              <button
                onClick={() => setPreviewTab("welcome")}
                className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer text-center ${
                  previewTab === "welcome" ? "bg-white text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                👋 Bienvenida Contacto
              </button>
            </div>

            {/* Rendered HTML Sandbox Frame */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-inner h-[380px]">
              <iframe
                title="Email Preview"
                srcDoc={getPreviewHtml()}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* OUTBOX & RECENT DELIVERY HISTORY */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <span>📬</span>
              {lang === "es" ? "Bandeja de Salida & Historial de Envíos" : "Outbox & Delivery Logs"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {lang === "es" ? "Trazabilidad de correos enviados y programados para esta empresa" : "Traceability of sent and scheduled emails for this business"}
            </p>
          </div>

          <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-xl">
            {emailLogs.length} {lang === "es" ? "registros" : "logs"}
          </span>
        </div>

        {emailLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic text-xs">
            {lang === "es" ? "No hay registros de correos enviados todavía." : "No email delivery logs recorded yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[9.5px] tracking-wider">
                  <th className="pb-3">{lang === "es" ? "Tipo" : "Type"}</th>
                  <th className="pb-3">{lang === "es" ? "Destinatario" : "Recipient"}</th>
                  <th className="pb-3">{lang === "es" ? "Asunto" : "Subject"}</th>
                  <th className="pb-3">{lang === "es" ? "Fecha / Programado" : "Date / Scheduled"}</th>
                  <th className="pb-3 text-right">{lang === "es" ? "Estado" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emailLogs.map((log) => {
                  let badge = "bg-amber-50 text-amber-700 border-amber-200";
                  if (log.status === "SENT") badge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  if (log.status === "FAILED") badge = "bg-rose-50 text-rose-700 border-rose-200";

                  let typeLabel = log.emailType;
                  if (log.emailType === "GOOGLE_REVIEW_REQUEST") typeLabel = "⭐ Google Review";
                  if (log.emailType === "BOOKING_REMINDER") typeLabel = "⏰ Recordatorio";
                  if (log.emailType === "BOOKING_CONFIRMATION") typeLabel = "📅 Cita Confirmada";
                  if (log.emailType === "WELCOME_CONTACT") typeLabel = "👋 Bienvenida";
                  if (log.emailType === "TEST_EMAIL") typeLabel = "🚀 Prueba";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-slate-900">{typeLabel}</td>
                      <td className="py-3 font-mono text-slate-600">{log.recipientEmail}</td>
                      <td className="py-3 text-slate-800 truncate max-w-[200px]">{log.subject}</td>
                      <td className="py-3 font-mono text-[11px] text-slate-500">
                        {new Date(log.sentAt || log.scheduledFor).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black ${badge}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
