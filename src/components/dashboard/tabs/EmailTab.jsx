"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  generateWelcomeContactHtml,
  generateBookingConfirmationHtml,
  generateBookingReminderHtml,
  generateGoogleReviewHtml,
  generateCustomEmailHtml,
} from "@/lib/emailTemplates";
import {
  MailIcon,
  StarIcon,
  CalendarIcon,
  InboxIcon,
  BoltIcon,
  PaletteIcon,
  PaperAirplaneIcon,
  EyeIcon,
  ClockIcon,
  HandWaveIcon,
  CheckIcon,
  CloseIcon,
} from "@/components/dashboard/DashboardIcons";

export default function EmailTab({
  currentWebsite,
  currentLogoUrl,
  contactForms = [],
  dashboardNotes = [],
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
  const [customLogoUrl, setCustomLogoUrl] = useState("");

  // Email Logs & Stats State
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailStats, setEmailStats] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsTimeframe, setLogsTimeframe] = useState("all");

  // Test Email State
  const [testRecipient, setTestRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Template Preview Active Tab
  const [previewTab, setPreviewTab] = useState("review"); // 'welcome' | 'booking' | 'reminder' | 'review'

  // DISPATCHER & CAMPAIGN HUB STATE
  const [dispatcherTiming, setDispatcherTiming] = useState("instant"); // 'instant' | 'scheduled'
  const [dispatcherRecipientsInput, setDispatcherRecipientsInput] = useState("");
  const [dispatcherRecipientsList, setDispatcherRecipientsList] = useState([]);
  const [dispatcherTemplate, setDispatcherTemplate] = useState("custom"); // 'custom' | 'welcome' | 'reminder' | 'review' | 'booking'
  const [dispatcherSubject, setDispatcherSubject] = useState("");
  const [dispatcherMessage, setDispatcherMessage] = useState("");
  const [dispatcherDate, setDispatcherDate] = useState("");
  const [dispatcherTime, setDispatcherTime] = useState("10:00");
  const [dispatcherGoogleReviewUrl, setDispatcherGoogleReviewUrl] = useState("");
  const [dispatcherCtaText, setDispatcherCtaText] = useState("");
  const [dispatcherCtaUrl, setDispatcherCtaUrl] = useState("");
  const [dispatcherRecipientName, setDispatcherRecipientName] = useState("");

  const [dispatcherScheduledDate, setDispatcherScheduledDate] = useState("");
  const [dispatcherScheduledTime, setDispatcherScheduledTime] = useState("09:00");

  const [dispatcherSending, setDispatcherSending] = useState(false);
  const [dispatcherResult, setDispatcherResult] = useState(null);
  const [showContactsPicker, setShowContactsPicker] = useState(false);
  const [showDispatcherPreview, setShowDispatcherPreview] = useState(false);

  // Parse emails helper
  const parseEmails = useCallback((text) => {
    if (!text) return [];
    const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const unique = [];
    matches.forEach((m) => {
      const lower = m.toLowerCase().trim();
      if (!unique.includes(lower)) unique.push(lower);
    });
    return unique;
  }, []);

  // CRM Contacts memo
  const crmContacts = useMemo(() => {
    const map = new Map();
    (contactForms || []).forEach((c) => {
      if (c.email && c.email.includes("@")) {
        const clean = c.email.trim().toLowerCase();
        if (!map.has(clean)) {
          map.set(clean, {
            email: clean,
            name: c.name || clean.split("@")[0],
            source: lang === "es" ? "Contacto Web" : "Web Contact",
          });
        }
      }
    });
    (dashboardNotes || []).forEach((n) => {
      if (n.email && n.email.includes("@")) {
        const clean = n.email.trim().toLowerCase();
        if (!map.has(clean)) {
          map.set(clean, {
            email: clean,
            name: n.title || clean.split("@")[0],
            source: lang === "es" ? "Directorio / Clientes" : "Directory / Clients",
          });
        }
      }
    });
    return Array.from(map.values());
  }, [contactForms, dashboardNotes, lang]);

  // Handle adding recipients from raw input
  const handleAddRecipientsFromInput = useCallback(() => {
    if (!dispatcherRecipientsInput.trim()) return;
    const extracted = parseEmails(dispatcherRecipientsInput);
    if (extracted.length > 0) {
      setDispatcherRecipientsList((prev) => {
        const merged = [...prev];
        extracted.forEach((email) => {
          if (!merged.includes(email)) merged.push(email);
        });
        return merged;
      });
      setDispatcherRecipientsInput("");
    }
  }, [dispatcherRecipientsInput, parseEmails]);

  const handleRemoveRecipient = useCallback((emailToRemove) => {
    setDispatcherRecipientsList((prev) => prev.filter((e) => e !== emailToRemove));
  }, []);

  const handleToggleCrmContact = useCallback((email) => {
    setDispatcherRecipientsList((prev) => {
      if (prev.includes(email)) {
        return prev.filter((e) => e !== email);
      }
      return [...prev, email];
    });
  }, []);

  const handleAddAllCrmContacts = useCallback(() => {
    setDispatcherRecipientsList((prev) => {
      const merged = [...prev];
      crmContacts.forEach((c) => {
        if (!merged.includes(c.email)) merged.push(c.email);
      });
      return merged;
    });
  }, [crmContacts]);

  // Set default scheduled dates on mount
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    setDispatcherScheduledDate(tomorrowStr);
    setDispatcherDate(tomorrowStr);
  }, []);

  // Sync Google Review URL if loaded later
  useEffect(() => {
    if (googleReviewUrl && !dispatcherGoogleReviewUrl) {
      setDispatcherGoogleReviewUrl(googleReviewUrl);
    }
  }, [googleReviewUrl, dispatcherGoogleReviewUrl]);

  // Update template selection with smart defaults
  const handleSelectDispatcherTemplate = useCallback((type) => {
    setDispatcherTemplate(type);
    const company = senderName || currentWebsite?.displayName || "SPP Labs";

    if (type === "welcome") {
      setDispatcherSubject(lang === "es" ? `¡Te damos la bienvenida a ${company}! 🌟` : `Welcome to ${company}! 🌟`);
      setDispatcherMessage(
        lang === "es"
          ? "Gracias por ponerte en contacto con nosotros. Estamos encantados de atenderte y ayudarte en todo lo que necesites."
          : "Thank you for reaching out to us. We are thrilled to assist you and help you achieve your goals."
      );
    } else if (type === "reminder") {
      setDispatcherSubject(lang === "es" ? `Recordatorio de tu cita en ${company} ⏰` : `Appointment reminder at ${company} ⏰`);
    } else if (type === "review") {
      setDispatcherSubject(
        lang === "es"
          ? `¿Qué tal fue tu experiencia con ${company}? ⭐⭐⭐⭐⭐`
          : `How was your experience with ${company}? ⭐⭐⭐⭐⭐`
      );
      if (!dispatcherGoogleReviewUrl) {
        setDispatcherGoogleReviewUrl(googleReviewUrl || `https://${currentWebsite?.domain}`);
      }
    } else if (type === "booking") {
      setDispatcherSubject(lang === "es" ? `Confirmación de cita en ${company} 📅` : `Booking confirmation at ${company} 📅`);
    } else if (type === "custom") {
      setDispatcherSubject(lang === "es" ? `Novedades importantes de ${company}` : `Important update from ${company}`);
      setDispatcherMessage("");
    }
  }, [senderName, currentWebsite?.displayName, currentWebsite?.domain, lang, dispatcherGoogleReviewUrl, googleReviewUrl]);

  // Live preview HTML for dispatcher
  const getDispatcherPreviewHtml = useCallback(() => {
    const companyName = senderName || currentWebsite?.displayName || currentWebsite?.domain || "SPP Labs";
    const clientDomain = currentWebsite?.domain || "spplabs.es";
    const logoUrl = customLogoUrl || currentLogoUrl || null;
    const recipient = dispatcherRecipientsList[0] || "cliente@ejemplo.com";
    const name = dispatcherRecipientName || recipient.split("@")[0];

    if (dispatcherTemplate === "welcome") {
      return generateWelcomeContactHtml({
        recipientName: name,
        companyName,
        clientDomain,
        brandColor,
        messageSnippet: dispatcherMessage,
        customLogoUrl: logoUrl,
      });
    }
    if (dispatcherTemplate === "reminder") {
      return generateBookingReminderHtml({
        recipientName: name,
        companyName,
        clientDomain,
        dateStr: dispatcherDate || (lang === "es" ? "Mañana" : "Tomorrow"),
        timeStr: dispatcherTime || "10:00",
        brandColor,
        customLogoUrl: logoUrl,
      });
    }
    if (dispatcherTemplate === "review") {
      return generateGoogleReviewHtml({
        recipientName: name,
        companyName,
        clientDomain,
        googleReviewUrl: dispatcherGoogleReviewUrl || googleReviewUrl || `https://${clientDomain}`,
        brandColor,
        customLogoUrl: logoUrl,
      });
    }
    if (dispatcherTemplate === "booking") {
      return generateBookingConfirmationHtml({
        recipientName: name,
        companyName,
        clientDomain,
        dateStr: dispatcherDate || (lang === "es" ? "Próximamente" : "Soon"),
        timeStr: dispatcherTime || "10:00",
        brandColor,
        customLogoUrl: logoUrl,
      });
    }

    return generateCustomEmailHtml({
      recipientName: name,
      companyName,
      clientDomain,
      brandColor,
      customLogoUrl: logoUrl,
      subject: dispatcherSubject || (lang === "es" ? "Comunicado Oficial" : "Official Notice"),
      messageBody: dispatcherMessage,
      ctaText: dispatcherCtaText || null,
      ctaUrl: dispatcherCtaUrl || null,
      badgeText: lang === "es" ? "Comunicado Oficial" : "Official Notice",
    });
  }, [
    senderName,
    currentWebsite?.displayName,
    currentWebsite?.domain,
    customLogoUrl,
    currentLogoUrl,
    dispatcherRecipientsList,
    dispatcherRecipientName,
    dispatcherTemplate,
    brandColor,
    dispatcherMessage,
    dispatcherDate,
    dispatcherTime,
    dispatcherGoogleReviewUrl,
    googleReviewUrl,
    dispatcherSubject,
    dispatcherCtaText,
    dispatcherCtaUrl,
    lang,
  ]);

  // Dispatch execution
  const handleDispatchEmails = async (e) => {
    if (e) e.preventDefault();
    setDispatcherSending(true);
    setDispatcherResult(null);

    let allRecipients = [...dispatcherRecipientsList];
    if (dispatcherRecipientsInput.trim()) {
      const extra = parseEmails(dispatcherRecipientsInput);
      extra.forEach((r) => {
        if (!allRecipients.includes(r)) allRecipients.push(r);
      });
    }

    if (allRecipients.length === 0) {
      setDispatcherResult({
        success: false,
        message: lang === "es" ? "Debes ingresar al menos un correo electrónico válido." : "Please enter at least one valid email address.",
      });
      setDispatcherSending(false);
      return;
    }

    const payload = {
      domain: currentWebsite.domain,
      recipients: allRecipients,
      timing: dispatcherTiming,
      templateType:
        dispatcherTemplate === "welcome"
          ? "WELCOME_CONTACT"
          : dispatcherTemplate === "reminder"
          ? "BOOKING_REMINDER"
          : dispatcherTemplate === "review"
          ? "GOOGLE_REVIEW_REQUEST"
          : dispatcherTemplate === "booking"
          ? "BOOKING_CONFIRMATION"
          : "CUSTOM",
      subject: dispatcherSubject,
      recipientName: dispatcherRecipientName,
      messageBody: dispatcherMessage,
      dateStr: dispatcherDate,
      timeStr: dispatcherTime,
      googleReviewUrl: dispatcherGoogleReviewUrl || googleReviewUrl,
      ctaText: dispatcherCtaText,
      ctaUrl: dispatcherCtaUrl,
    };

    if (dispatcherTiming === "scheduled") {
      if (!dispatcherScheduledDate || !dispatcherScheduledTime) {
        setDispatcherResult({
          success: false,
          message: lang === "es" ? "Por favor selecciona la fecha y hora programada." : "Please select scheduled date and time.",
        });
        setDispatcherSending(false);
        return;
      }
      payload.scheduledFor = new Date(`${dispatcherScheduledDate}T${dispatcherScheduledTime}:00`).toISOString();
    }

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setDispatcherResult({
          success: false,
          message: data.message || (lang === "es" ? "Error al procesar el envío de correos" : "Error processing email dispatch"),
        });
      } else {
        setDispatcherResult({
          success: true,
          message: data.message,
          timing: data.timing,
          total: data.totalRecipients || allRecipients.length,
          sent: data.sentCount,
          scheduled: data.scheduledCount,
          scheduledFor: data.scheduledFor,
        });

        // Clear input state on success
        setDispatcherRecipientsInput("");
        setDispatcherRecipientsList([]);

        // Automatically reload logs & stats below
        fetchLogs();
      }
    } catch (err) {
      setDispatcherResult({
        success: false,
        message: err.message || (lang === "es" ? "Error de conexión" : "Connection error"),
      });
    } finally {
      setDispatcherSending(false);
    }
  };

  // Helper to refresh logs & stats
  const fetchLogs = async (tf = logsTimeframe) => {
    if (!currentWebsite?.domain) return;
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/admin/email-logs?domain=${currentWebsite.domain}&timeframe=${tf}`);
      const data = await res.json();
      if (data.success) {
        setEmailLogs(data.data || []);
        if (data.stats) {
          setEmailStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Fetch email logs error:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleTimeframeChange = (tf) => {
    setLogsTimeframe(tf);
    fetchLogs(tf);
  };

  useEffect(() => {
    if (!currentWebsite?.domain) return;
    let isCancelled = false;

    const loadInitialData = async () => {
      setLoading(true);
      setLogsLoading(true);
      try {
        const [configRes, logsRes] = await Promise.all([
          fetch(`/api/admin/email-config?domain=${currentWebsite.domain}`),
          fetch(`/api/admin/email-logs?domain=${currentWebsite.domain}`),
        ]);

        if (isCancelled) return;

        const [configData, logsData] = await Promise.all([
          configRes.json(),
          logsRes.json(),
        ]);

        if (isCancelled) return;

        if (configData.success && configData.data) {
          const c = configData.data;
          setSenderName(c.senderName || currentWebsite?.displayName || "");
          setReplyToEmail(c.replyToEmail || "");
          setGoogleReviewUrl(c.googleReviewUrl || "");
          setEnableWelcomeEmail(c.enableWelcomeEmail !== undefined && c.enableWelcomeEmail !== null ? Boolean(c.enableWelcomeEmail) : true);
          setEnableBookingConfirm(c.enableBookingConfirm !== undefined && c.enableBookingConfirm !== null ? Boolean(c.enableBookingConfirm) : true);
          setEnableBookingReminder(c.enableBookingReminder !== undefined && c.enableBookingReminder !== null ? Boolean(c.enableBookingReminder) : true);
          setReminderHoursBefore(c.reminderHoursBefore !== undefined && c.reminderHoursBefore !== null ? Number(c.reminderHoursBefore) : 24);

          const isBookingReview = (c.enableBookingReviewRequest !== undefined && c.enableBookingReviewRequest !== null)
            ? Boolean(c.enableBookingReviewRequest)
            : ((c.enableReviewRequest !== undefined && c.enableReviewRequest !== null)
                ? Boolean(c.enableReviewRequest)
                : true);
          setEnableBookingReviewRequest(isBookingReview);

          const bookingDelay = (c.bookingReviewDelayHours !== undefined && c.bookingReviewDelayHours !== null)
            ? Number(c.bookingReviewDelayHours)
            : ((c.reviewDelayHours !== undefined && c.reviewDelayHours !== null)
                ? Number(c.reviewDelayHours)
                : 2);
          setBookingReviewDelayHours(bookingDelay);

          setEnableContactReviewRequest(c.enableContactReviewRequest !== undefined && c.enableContactReviewRequest !== null ? Boolean(c.enableContactReviewRequest) : false);
          setContactReviewDelayHours(c.contactReviewDelayHours !== undefined && c.contactReviewDelayHours !== null ? Number(c.contactReviewDelayHours) : 24);

          setBrandColor(c.brandColor || "#0284c7");
          setCustomLogoUrl(c.customLogoUrl || "");
        }

        if (logsData.success) {
          setEmailLogs(logsData.data || []);
          if (logsData.stats) {
            setEmailStats(logsData.stats);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Load email data error:", err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setLogsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, [currentWebsite?.domain, currentWebsite?.displayName]);

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
          ...(currentLogoUrl || customLogoUrl ? { customLogoUrl: currentLogoUrl || customLogoUrl } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al guardar configuración");
      }

      if (data.data) {
        const c = data.data;
        if (c.bookingReviewDelayHours !== undefined && c.bookingReviewDelayHours !== null) {
          setBookingReviewDelayHours(Number(c.bookingReviewDelayHours));
        }
        if (c.contactReviewDelayHours !== undefined && c.contactReviewDelayHours !== null) {
          setContactReviewDelayHours(Number(c.contactReviewDelayHours));
        }
        if (c.reminderHoursBefore !== undefined && c.reminderHoursBefore !== null) {
          setReminderHoursBefore(Number(c.reminderHoursBefore));
        }
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
    const logo = currentLogoUrl || customLogoUrl || currentWebsite?.logoUrl || null;

    if (previewTab === "welcome") {
      return generateWelcomeContactHtml({
        recipientName: "María García",
        companyName: compName,
        clientDomain: dom,
        brandColor,
        messageSnippet: "Hola, me gustaría solicitar más información sobre sus servicios de consultoría...",
        customLogoUrl: logo,
      });
    }

    if (previewTab === "booking") {
      return generateBookingConfirmationHtml({
        recipientName: "Carlos Rodríguez",
        companyName: compName,
        clientDomain: dom,
        dateStr: lang === "es" ? "18 de agosto de 2026" : "August 18, 2026",
        timeStr: "11:30",
        brandColor,
        customLogoUrl: logo,
      });
    }

    if (previewTab === "reminder") {
      return generateBookingReminderHtml({
        recipientName: "Carlos Rodríguez",
        companyName: compName,
        clientDomain: dom,
        dateStr: lang === "es" ? "Mañana, 18 de agosto de 2026" : "Tomorrow, August 18, 2026",
        timeStr: "11:30",
        brandColor,
        customLogoUrl: logo,
      });
    }

    // Default: Google Review Booster
    return generateGoogleReviewHtml({
      recipientName: "Carlos Rodríguez",
      companyName: compName,
      clientDomain: dom,
      googleReviewUrl: googleReviewUrl || "https://g.page/r/example/review",
      brandColor,
      customLogoUrl: logo,
    });
  };

  return (
    <div className="space-y-10 animate-fade-in w-full max-w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200/80">
        <div>
          <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider border border-blue-200/60 inline-flex items-center gap-1.5">
            <MailIcon className="w-3.5 h-3.5" />
            <span>{lang === "es" ? "Automatizaciones de Email & Reseñas Google" : "Email & Google Reviews Automation"}</span>
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
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Actualizar registros"
          >
            <svg className={`w-5 h-5 ${logsLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-6 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>{lang === "es" ? "Guardar Ajustes" : "Save Settings"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black p-4 rounded-2xl flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{lang === "es" ? "¡Configuración de correo guardada exitosamente!" : "Email settings saved successfully!"}</span>
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
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <StarIcon className="w-6 h-6 text-white" filled={true} />
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
                    <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-amber-600" />
                      <span>{lang === "es" ? "Tras completar una Cita o Reserva" : "After an Appointment or Booking"}</span>
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
                    <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <InboxIcon className="w-4 h-4 text-amber-600" />
                      <span>{lang === "es" ? "Tras Formulario de Contacto Web" : "After Web Contact Form Submission"}</span>
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
                      <option value={0}>{lang === "es" ? "Inmediatamente (al enviar el formulario)" : "Immediately (upon submission)"}</option>
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
              <BoltIcon className="w-5 h-5 text-amber-500" />
              <span>{lang === "es" ? "Secuencias de Comunicación Automatizadas" : "Automated Communication Sequences"}</span>
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
                  {lang === "es" ? "Envía fecha, hora y detalles de la cita al agendarse." : "Sends date, time and booking details immediately."}
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

            {/* Trigger 3: Booking Reminder */}
            <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    {lang === "es" ? "Recordatorio Automático Anti No-Show" : "Anti No-Show Booking Reminder"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {lang === "es" ? "Reduce cancelaciones enviando un aviso antes de la cita." : "Reduces no-shows by alerting the client prior to their visit."}
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
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200">
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
              <PaletteIcon className="w-5 h-5 text-indigo-500" />
              <span>{lang === "es" ? "Identidad de Remitente & Marca" : "Sender & Brand Identity"}</span>
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
                      aria-label={`Color ${c}`}
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
              <PaperAirplaneIcon className="w-4 h-4 text-blue-400" />
              <span>{lang === "es" ? "Enviar Correo de Prueba" : "Send Test Email"}</span>
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
                {testResult.success ? <CheckIcon className="w-4 h-4 shrink-0" /> : <CloseIcon className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
                {testResult.mock && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">DEV MOCK</span>}
              </div>
            )}
          </div>

          {/* LIVE TEMPLATE PREVIEWER */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <EyeIcon className="w-4 h-4 text-slate-700" />
                <span>{lang === "es" ? "Previsualizador en Vivo" : "Live Email Preview"}</span>
              </h4>
            </div>

            {/* Template Switcher Buttons */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-[11px] font-bold">
              <button
                onClick={() => setPreviewTab("review")}
                className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  previewTab === "review" ? "bg-white text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <StarIcon className="w-3.5 h-3.5 text-amber-500" filled={true} />
                <span>Google Review</span>
              </button>
              <button
                onClick={() => setPreviewTab("reminder")}
                className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  previewTab === "reminder" ? "bg-white text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Recordatorio Cita</span>
              </button>
              <button
                onClick={() => setPreviewTab("booking")}
                className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  previewTab === "booking" ? "bg-white text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Confirmar Cita</span>
              </button>
              <button
                onClick={() => setPreviewTab("welcome")}
                className={`py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  previewTab === "welcome" ? "bg-white text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <HandWaveIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Bienvenida Contacto</span>
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

      {/* SECTION: EMAIL CAMPAIGN & DISPATCH HUB */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in relative">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                <PaperAirplaneIcon className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-black text-slate-950">
                {lang === "es" ? "Centro de Envío y Campañas de Correo" : "Email Dispatch & Campaigns Hub"}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {lang === "es"
                ? "Envía correos instantáneamente o prográmalos para un día y hora específicos a clientes individuales o listas completas con plantillas predeterminadas o mensajes libres."
                : "Send emails instantly or schedule dispatches for a specific date and time to individual clients or full lists with pre-built templates or custom messages."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-3 py-1.5 rounded-xl font-sans">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>{lang === "es" ? "Envíos Directos & Programados" : "Instant & Scheduled Dispatch"}</span>
            </span>
          </div>
        </div>

        {/* Dispatcher Form */}
        <form onSubmit={handleDispatchEmails} className="space-y-6">
          {/* Timing / Mode Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                {lang === "es" ? "Modalidad de Entrega" : "Delivery Mode"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {dispatcherTiming === "instant"
                  ? (lang === "es" ? "Los correos se entregarán de inmediato a través de los servidores de correo." : "Emails will be dispatched immediately via mail servers.")
                  : (lang === "es" ? "Los correos quedarán en cola y se enviarán automáticamente en la fecha y hora elegida." : "Emails will be queued and sent automatically at the chosen date and time.")}
              </span>
            </div>

            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setDispatcherTiming("instant")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dispatcherTiming === "instant"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BoltIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "es" ? "Enviar Ahora" : "Send Instantly"}</span>
              </button>
              <button
                type="button"
                onClick={() => setDispatcherTiming("scheduled")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dispatcherTiming === "scheduled"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ClockIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === "es" ? "Programar Fecha & Hora" : "Schedule Date & Time"}</span>
              </button>
            </div>
          </div>

          {/* Date & Time Picker (if Scheduled) */}
          {dispatcherTiming === "scheduled" && (
            <div className="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-black text-indigo-950 uppercase tracking-wider">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <span>{lang === "es" ? "Configurar Fecha y Hora de Envío Programado" : "Configure Scheduled Date & Time"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === "es" ? "Fecha de Envío" : "Delivery Date"}
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={dispatcherScheduledDate}
                    onChange={(e) => setDispatcherScheduledDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === "es" ? "Hora de Envío (Zona horaria España / CET)" : "Delivery Time (CET)"}
                  </label>
                  <input
                    type="time"
                    required
                    value={dispatcherScheduledTime}
                    onChange={(e) => setDispatcherScheduledTime(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
              <p className="text-[11px] text-indigo-700 font-medium">
                {lang === "es"
                  ? `⏰ El correo quedará programado y el despachador automático lo enviará el ${dispatcherScheduledDate || "..."} a las ${dispatcherScheduledTime || "..."}.`
                  : `⏰ Email will be queued and automatically dispatched on ${dispatcherScheduledDate || "..."} at ${dispatcherScheduledTime || "..."}.`}
              </p>
            </div>
          )}

          {/* Recipients Section */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {lang === "es" ? "Destinatarios (Uno o Lista Múltiple)" : "Recipients (Single or Broadcast List)"}
                </span>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {dispatcherRecipientsList.length + parseEmails(dispatcherRecipientsInput).filter((e) => !dispatcherRecipientsList.includes(e)).length}{" "}
                  {lang === "es" ? "destinatario(s)" : "recipient(s)"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {crmContacts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowContactsPicker((prev) => !prev)}
                    className="text-xs font-bold text-brand-blue hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{showContactsPicker ? (lang === "es" ? "Ocultar CRM" : "Hide CRM") : (lang === "es" ? `Contactos CRM (${crmContacts.length})` : `CRM Contacts (${crmContacts.length})`)}</span>
                    <svg className={`w-3.5 h-3.5 transition-transform ${showContactsPicker ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                )}
                {dispatcherRecipientsList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDispatcherRecipientsList([])}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                  >
                    {lang === "es" ? "Limpiar Lista" : "Clear List"}
                  </button>
                )}
              </div>
            </div>

            {/* Quick CRM Contacts Drawer/Panel */}
            {showContactsPicker && crmContacts.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-fade-in shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {lang === "es" ? "Selecciona contactos de tu base de datos:" : "Select contacts from your CRM database:"}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAllCrmContacts}
                    className="px-2.5 py-1 bg-brand-blue text-white rounded-lg text-[11px] font-bold hover:bg-blue-600 transition-all cursor-pointer"
                  >
                    {lang === "es" ? "Añadir Todos los Contactos" : "Add All Contacts"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {crmContacts.map((contact) => {
                    const isSelected = dispatcherRecipientsList.includes(contact.email);
                    return (
                      <button
                        key={contact.email}
                        type="button"
                        onClick={() => handleToggleCrmContact(contact.email)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isSelected
                            ? "bg-blue-50 border-blue-300 text-blue-900 font-bold"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="truncate mr-2">
                          <span className="block truncate font-semibold">{contact.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono truncate">{contact.email}</span>
                        </div>
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 text-[10px] border ${
                          isSelected ? "bg-brand-blue text-white border-brand-blue" : "border-slate-300 bg-white"
                        }`}>
                          {isSelected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recipients Badges/Pills */}
            {dispatcherRecipientsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50/80 border border-slate-200 rounded-xl">
                {dispatcherRecipientsList.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 text-slate-800 text-xs font-semibold shadow-2xs group"
                  >
                    <span className="font-mono text-[11px]">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(email)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer font-bold ml-0.5"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input / Textarea for manual entry or paste */}
            <div className="relative">
              <textarea
                rows={2}
                value={dispatcherRecipientsInput}
                onChange={(e) => setDispatcherRecipientsInput(e.target.value)}
                onBlur={handleAddRecipientsFromInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddRecipientsFromInput();
                  }
                }}
                placeholder={
                  lang === "es"
                    ? "Escribe o pega uno o varios correos separados por comas, espacios o saltos de línea (ej. cliente@gmail.com, empresa@ejemplo.es)..."
                    : "Type or paste one or multiple emails separated by commas, spaces, or lines (e.g. client@gmail.com)..."
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all resize-y"
              />
              {dispatcherRecipientsInput.trim() && (
                <button
                  type="button"
                  onClick={handleAddRecipientsFromInput}
                  className="absolute right-2.5 bottom-3 px-3 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  {lang === "es" ? "Añadir a la lista" : "Add to list"}
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {lang === "es"
                ? "Consejo: Puedes pegar directamente listas completas de Excel o texto. El sistema filtrará automáticamente los correos válidos sin duplicados."
                : "Tip: You can paste lists from Excel or text. The system automatically validates emails and removes duplicates."}
            </p>
          </div>

          {/* Template Selector Grid */}
          <div className="space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
              {lang === "es" ? "Plantilla de Correo" : "Email Template"}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {/* Template 1: Custom */}
              <button
                type="button"
                onClick={() => handleSelectDispatcherTemplate("custom")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dispatcherTemplate === "custom"
                    ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                    : "bg-white border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                    ✉️
                  </span>
                  {dispatcherTemplate === "custom" && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block truncate">
                    {lang === "es" ? "Personalizado" : "Custom"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                    {lang === "es" ? "Mensaje libre corporativo" : "Freeform message"}
                  </span>
                </div>
              </button>

              {/* Template 2: Welcome */}
              <button
                type="button"
                onClick={() => handleSelectDispatcherTemplate("welcome")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dispatcherTemplate === "welcome"
                    ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs"
                    : "bg-white border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                    👋
                  </span>
                  {dispatcherTemplate === "welcome" && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block truncate">
                    {lang === "es" ? "Bienvenida" : "Welcome"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                    {lang === "es" ? "Saludo a nuevos clientes" : "Welcome greeting"}
                  </span>
                </div>
              </button>

              {/* Template 3: Reminder */}
              <button
                type="button"
                onClick={() => handleSelectDispatcherTemplate("reminder")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dispatcherTemplate === "reminder"
                    ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-xs"
                    : "bg-white border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
                    ⏰
                  </span>
                  {dispatcherTemplate === "reminder" && (
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block truncate">
                    {lang === "es" ? "Recordatorio" : "Reminder"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                    {lang === "es" ? "Aviso previo de cita" : "Prior appointment alert"}
                  </span>
                </div>
              </button>

              {/* Template 4: Google Review */}
              <button
                type="button"
                onClick={() => handleSelectDispatcherTemplate("review")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dispatcherTemplate === "review"
                    ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-xs"
                    : "bg-white border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-xs">
                    ⭐
                  </span>
                  {dispatcherTemplate === "review" && (
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block truncate">
                    {lang === "es" ? "Reseña Google" : "Google Review"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                    {lang === "es" ? "Solicitud 5 estrellas" : "5-star booster"}
                  </span>
                </div>
              </button>

              {/* Template 5: Booking */}
              <button
                type="button"
                onClick={() => handleSelectDispatcherTemplate("booking")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dispatcherTemplate === "booking"
                    ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-white border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                    📅
                  </span>
                  {dispatcherTemplate === "booking" && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block truncate">
                    {lang === "es" ? "Confirmación" : "Confirmation"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                    {lang === "es" ? "Confirmación de cita" : "Booking details"}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Inputs according to Template */}
          <div className="p-5 bg-slate-50/60 border border-slate-200/80 rounded-2xl space-y-4">
            {/* Subject Field */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                {lang === "es" ? "Asunto del Correo" : "Email Subject"}
              </label>
              <input
                type="text"
                required
                value={dispatcherSubject}
                onChange={(e) => setDispatcherSubject(e.target.value)}
                placeholder={lang === "es" ? "ej. Novedades y promociones exclusivas..." : "e.g. Important updates..."}
                className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-blue"
              />
            </div>

            {/* Optional Specific Fields: Reminder or Booking Confirmation */}
            {(dispatcherTemplate === "reminder" || dispatcherTemplate === "booking") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === "es" ? "Fecha de la Cita (Texto o Fecha)" : "Appointment Date"}
                  </label>
                  <input
                    type="text"
                    value={dispatcherDate}
                    onChange={(e) => setDispatcherDate(e.target.value)}
                    placeholder={lang === "es" ? "ej. 25 de Octubre o Mañana" : "e.g. October 25th"}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === "es" ? "Hora de la Cita" : "Appointment Time"}
                  </label>
                  <input
                    type="text"
                    value={dispatcherTime}
                    onChange={(e) => setDispatcherTime(e.target.value)}
                    placeholder="ej. 10:30 o 17:00"
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
            )}

            {/* Optional Specific Fields: Review */}
            {dispatcherTemplate === "review" && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {lang === "es" ? "Enlace de Reseña en Google Maps" : "Google Maps Review Link"}
                </label>
                <input
                  type="url"
                  value={dispatcherGoogleReviewUrl}
                  onChange={(e) => setDispatcherGoogleReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/..."
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                />
              </div>
            )}

            {/* Message Body Field (Custom or Welcome note) */}
            {(dispatcherTemplate === "custom" || dispatcherTemplate === "welcome") && (
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {dispatcherTemplate === "welcome"
                    ? (lang === "es" ? "Mensaje de Bienvenida Adicional (Opcional)" : "Additional Welcome Note (Optional)")
                    : (lang === "es" ? "Cuerpo del Mensaje (Párrafos)" : "Message Body")}
                </label>
                <textarea
                  rows={4}
                  value={dispatcherMessage}
                  onChange={(e) => setDispatcherMessage(e.target.value)}
                  placeholder={
                    lang === "es"
                      ? "Escribe aquí el contenido del correo. Puedes separar párrafos con un salto de línea..."
                      : "Write your email message here. Paragraphs are supported..."
                  }
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                />
              </div>
            )}

            {/* Call to Action Buttons (for Custom template) */}
            {dispatcherTemplate === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === "es" ? "Texto del Botón CTA (Opcional)" : "CTA Button Label (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={dispatcherCtaText}
                    onChange={(e) => setDispatcherCtaText(e.target.value)}
                    placeholder={lang === "es" ? "ej. Ver Oferta Especial o Reservar Ahora" : "e.g. View Offer"}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {lang === "es" ? "Enlace URL del Botón (Opcional)" : "Button URL Link (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={dispatcherCtaUrl}
                    onChange={(e) => setDispatcherCtaUrl(e.target.value)}
                    placeholder={`https://${currentWebsite?.domain || "spplabs.es"}/promocion`}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Toggle & Frame */}
          <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <EyeIcon className="w-4 h-4 text-slate-600" />
                <span>{lang === "es" ? "Vista Previa en Vivo del Correo" : "Live Email Preview Sandbox"}</span>
              </span>

              <button
                type="button"
                onClick={() => setShowDispatcherPreview((prev) => !prev)}
                className="text-xs font-bold text-brand-blue hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>{showDispatcherPreview ? (lang === "es" ? "Ocultar Vista Previa" : "Hide Preview") : (lang === "es" ? "Ver Vista Previa" : "Show Preview")}</span>
                <svg className={`w-3.5 h-3.5 transition-transform ${showDispatcherPreview ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            {showDispatcherPreview && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner h-[360px] animate-fade-in">
                <iframe
                  title="Dispatcher Email Preview"
                  srcDoc={getDispatcherPreviewHtml()}
                  className="w-full h-full border-0"
                />
              </div>
            )}
          </div>

          {/* Result Feedback Banner */}
          {dispatcherResult && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 animate-fade-in ${
                dispatcherResult.success
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-rose-50 text-rose-900 border-rose-200"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                dispatcherResult.success ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              }`}>
                {dispatcherResult.success ? "✓" : "×"}
              </span>
              <div className="space-y-1">
                <p className="font-extrabold">{dispatcherResult.message}</p>
                {dispatcherResult.success && (
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {lang === "es"
                      ? "Las estadísticas y el registro de correos situados debajo se han actualizado automáticamente."
                      : "The statistics and delivery logs below have been refreshed automatically."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-[11px] text-slate-500 font-medium">
              {dispatcherTiming === "instant"
                ? (lang === "es" ? "⚡ El envío se procesará en tiempo real para todos los destinatarios válidos." : "⚡ The dispatch will be executed in real-time.")
                : (lang === "es" ? "⏰ Se agendará en la base de datos y se enviará en el momento programado." : "⏰ Will be queued and sent at the scheduled time.")}
            </span>

            <button
              type="submit"
              disabled={dispatcherSending}
              className="w-full sm:w-auto h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-98"
            >
              {dispatcherSending ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>{lang === "es" ? "Procesando Envío..." : "Processing..."}</span>
                </>
              ) : dispatcherTiming === "instant" ? (
                <>
                  <BoltIcon className="w-4 h-4 text-amber-400" />
                  <span>
                    {lang === "es"
                      ? `Enviar Correo Ahora (${dispatcherRecipientsList.length + parseEmails(dispatcherRecipientsInput).filter((e) => !dispatcherRecipientsList.includes(e)).length})`
                      : `Send Emails Now (${dispatcherRecipientsList.length + parseEmails(dispatcherRecipientsInput).filter((e) => !dispatcherRecipientsList.includes(e)).length})`}
                  </span>
                </>
              ) : (
                <>
                  <ClockIcon className="w-4 h-4 text-indigo-400" />
                  <span>
                    {lang === "es"
                      ? `Programar Envío (${dispatcherRecipientsList.length + parseEmails(dispatcherRecipientsInput).filter((e) => !dispatcherRecipientsList.includes(e)).length})`
                      : `Schedule Dispatch (${dispatcherRecipientsList.length + parseEmails(dispatcherRecipientsInput).filter((e) => !dispatcherRecipientsList.includes(e)).length})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION: EMAIL & GOOGLE REVIEWS ANALYTICS */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MailIcon className="w-4.5 h-4.5" />
              </span>
              <span>{lang === "es" ? "Analíticas de Correos & Reseñas de Google" : "Email & Google Reviews Analytics"}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {lang === "es"
                ? "Métricas consolidadas de correos automatizados, tasa de entrega y solicitudes de reseñas de clientes."
                : "Consolidated metrics for automated emails, delivery rate, and client review requests."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-sans tabular-nums">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{lang === "es" ? "Tasa de Entrega:" : "Delivery Rate:"} {emailStats?.deliveryRate || "100.0"}%</span>
            </span>
          </div>
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Sent This Month */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {lang === "es" ? "Enviados Este Mes" : "Sent This Month"}
              </span>
              <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <PaperAirplaneIcon className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-sans tabular-nums tracking-tight">
                {(emailStats?.sentThisMonth ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {lang === "es" ? "Mes en curso" : "Current month"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              {lang === "es" ? "Confirmaciones, avisos y reseñas" : "Confirmations, alerts & reviews"}
            </p>
          </div>

          {/* KPI 2: All-Time Sent */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {lang === "es" ? "Total Histórico" : "All-Time Sent"}
              </span>
              <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckIcon className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-sans tabular-nums tracking-tight">
                {(emailStats?.sentAllTime ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {emailStats?.deliveryRate || "100.0"}% {lang === "es" ? "éxito" : "success"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              {lang === "es" ? "Correos totales entregados" : "Total delivered emails"}
            </p>
          </div>

          {/* KPI 3: Google Review Booster */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {lang === "es" ? "Booster Reseñas Google" : "Google Review Booster"}
              </span>
              <span className="w-7 h-7 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <StarIcon className="w-3.5 h-3.5" filled={true} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-sans tabular-nums tracking-tight">
                {(emailStats?.reviewRequestsThisMonth ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {(emailStats?.reviewRequestsAllTime ?? 0)} {lang === "es" ? "total" : "total"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              {lang === "es" ? "Solicitudes de 5 estrellas enviadas" : "5-star requests sent to clients"}
            </p>
          </div>

          {/* KPI 4: Pending / Scheduled */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {lang === "es" ? "En Cola / Programados" : "Scheduled in Queue"}
              </span>
              <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ClockIcon className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-sans tabular-nums tracking-tight">
                {(emailStats?.pendingCount ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {lang === "es" ? "En espera" : "Pending"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              {lang === "es" ? "Listos para su hora programada" : "Ready for their scheduled trigger"}
            </p>
          </div>
        </div>

        {/* Breakdown by Email Type Cards */}
        <div className="pt-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-3">
            {lang === "es" ? "Desglose de Envíos este Mes por Tipo:" : "Monthly Deliveries by Type:"}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <StarIcon className="w-3.5 h-3.5" filled={true} />
                </span>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Google Review</span>
                  <span className="text-[10px] text-slate-500 font-medium">{lang === "es" ? "Solicitudes enviadas" : "Requests sent"}</span>
                </div>
              </div>
              <span className="text-base font-black text-slate-950 dark:text-white font-sans tabular-nums">
                {emailStats?.reviewRequestsThisMonth ?? 0}
              </span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">{lang === "es" ? "Confirmación Cita" : "Booking Confirm"}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{lang === "es" ? "Citas recibidas" : "Bookings received"}</span>
                </div>
              </div>
              <span className="text-base font-black text-slate-950 dark:text-white font-sans tabular-nums">
                {emailStats?.bookingConfirmsThisMonth ?? 0}
              </span>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-200/70 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <ClockIcon className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">{lang === "es" ? "Recordatorio Cita" : "Anti No-Show"}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{lang === "es" ? "Avisos previos" : "Prior alerts"}</span>
                </div>
              </div>
              <span className="text-base font-black text-slate-950 dark:text-white font-sans tabular-nums">
                {emailStats?.bookingRemindersThisMonth ?? 0}
              </span>
            </div>

            <div className="bg-blue-50/60 border border-blue-200/70 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <HandWaveIcon className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">{lang === "es" ? "Bienvenida Contacto" : "Welcome Contact"}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{lang === "es" ? "Formularios web" : "Web inquiries"}</span>
                </div>
              </div>
              <span className="text-base font-black text-slate-950 dark:text-white font-sans tabular-nums">
                {emailStats?.welcomeContactsThisMonth ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* OUTBOX & RECENT DELIVERY HISTORY */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <InboxIcon className="w-5 h-5 text-slate-800" />
              <span>{lang === "es" ? "Bandeja de Salida & Historial de Envíos" : "Outbox & Delivery Logs"}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {lang === "es" ? "Trazabilidad de correos enviados y programados para esta empresa" : "Traceability of sent and scheduled emails for this business"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeframe Filter Buttons */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
              {[
                { id: "day", label: lang === "es" ? "Día" : "Day" },
                { id: "week", label: lang === "es" ? "Semana" : "Week" },
                { id: "month", label: lang === "es" ? "Mes" : "Month" },
                { id: "year", label: lang === "es" ? "Año" : "Year" },
                { id: "all", label: lang === "es" ? "Todo" : "All" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTimeframeChange(item.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    logsTimeframe === item.id
                      ? "bg-white text-slate-950 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-sans tabular-nums font-bold bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl">
              {emailLogs.length} {lang === "es" ? "registros" : "logs"}
            </span>
          </div>
        </div>

        {logsLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
            <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></span>
            {lang === "es" ? "Cargando registros..." : "Loading delivery logs..."}
          </div>
        ) : emailLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic text-xs">
            {lang === "es" ? "No hay registros de correos enviados para este período." : "No email delivery logs recorded for this period."}
          </div>
        ) : (
          <div className="border border-slate-200/90 rounded-2xl max-h-[460px] overflow-y-auto overflow-x-hidden sm:overflow-x-auto relative shadow-2xs scroll-touch-contain">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 shadow-2xs">
                {/* Mobile Header (2 column compact) */}
                <tr className="sm:hidden text-slate-500 font-black uppercase text-[9.5px] tracking-wider">
                  <th className="py-3 px-3.5 text-left">{lang === "es" ? "Envío / Destinatario" : "Delivery / Recipient"}</th>
                  <th className="py-3 px-3.5 text-right">{lang === "es" ? "Estado / Fecha" : "Status / Date"}</th>
                </tr>
                {/* Desktop Header (5 columns) */}
                <tr className="hidden sm:table-row text-slate-500 font-black uppercase text-[9.5px] tracking-wider">
                  <th className="py-3 px-3.5 whitespace-nowrap">{lang === "es" ? "Tipo" : "Type"}</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">{lang === "es" ? "Destinatario" : "Recipient"}</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">{lang === "es" ? "Asunto" : "Subject"}</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">{lang === "es" ? "Fecha / Programado" : "Date / Scheduled"}</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">{lang === "es" ? "Estado" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {emailLogs.map((log) => {
                  let badge = "bg-amber-50 text-amber-700 border-amber-200";
                  if (log.status === "SENT") badge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  if (log.status === "FAILED") badge = "bg-rose-50 text-rose-700 border-rose-200";

                  let typeLabel = log.emailType;
                  let typeIcon = null;
                  if (log.emailType === "GOOGLE_REVIEW_REQUEST") {
                    typeLabel = "Google Review";
                    typeIcon = <StarIcon className="w-3.5 h-3.5 text-amber-500" filled={true} />;
                  } else if (log.emailType === "BOOKING_REMINDER") {
                    typeLabel = lang === "es" ? "Recordatorio" : "Reminder";
                    typeIcon = <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />;
                  } else if (log.emailType === "BOOKING_CONFIRMATION") {
                    typeLabel = lang === "es" ? "Cita Confirmada" : "Booking Confirmed";
                    typeIcon = <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />;
                  } else if (log.emailType === "WELCOME_CONTACT") {
                    typeLabel = lang === "es" ? "Bienvenida" : "Welcome";
                    typeIcon = <HandWaveIcon className="w-3.5 h-3.5 text-blue-500" />;
                  } else if (log.emailType === "TEST_EMAIL") {
                    typeLabel = lang === "es" ? "Prueba" : "Test";
                    typeIcon = <PaperAirplaneIcon className="w-3.5 h-3.5 text-slate-500" />;
                  }

                  const formattedDate = new Date(log.sentAt || log.scheduledFor).toLocaleString(lang === "es" ? "es-ES" : "en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      {/* Mobile Cells (100% width, zero horizontal drift) */}
                      <td className="sm:hidden py-3 px-3.5 align-top">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs mb-0.5">
                          {typeIcon}
                          <span>{typeLabel}</span>
                        </div>
                        <span className="font-sans tabular-nums text-slate-700 text-xs block truncate max-w-[190px]">
                          {log.recipientEmail}
                        </span>
                        <span className="text-slate-400 text-[11px] block truncate max-w-[190px]">
                          {log.subject}
                        </span>
                      </td>
                      <td className="sm:hidden py-3 px-3.5 text-right align-top">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-black ${badge} mb-1`}>
                          {log.status}
                        </span>
                        <span className="font-sans tabular-nums text-[10px] text-slate-400 block">
                          {formattedDate}
                        </span>
                      </td>

                      {/* Desktop Cells (5 separate columns) */}
                      <td className="hidden sm:table-cell py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          {typeIcon}
                          <span>{typeLabel}</span>
                        </span>
                      </td>
                      <td className="hidden sm:table-cell py-3 px-3.5 font-sans tabular-nums text-slate-700 whitespace-nowrap">
                        {log.recipientEmail}
                      </td>
                      <td className="hidden sm:table-cell py-3 px-3.5 text-slate-800 whitespace-nowrap">
                        <span className="truncate block max-w-[220px]" title={log.subject}>
                          {log.subject}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell py-3 px-3.5 font-sans tabular-nums text-[11px] text-slate-500 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="hidden sm:table-cell py-3 px-3.5 text-right whitespace-nowrap">
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
