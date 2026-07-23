(function () {
  function hasConsent() {
    try {
      return localStorage.getItem("spp_cookie_consent") === "accepted";
    } catch (e) {
      return false;
    }
  }

  let trackerInitialized = false;

  function initTracker() {
    if (trackerInitialized) return;
    if (!hasConsent()) return;
    trackerInitialized = true;

    // 1. Locate configuration from script tag
    const script = document.currentScript || document.querySelector("script[data-domain]") || document.querySelector("script[src*='tracker.js']");
    if (!script) return;

    const domain = script.getAttribute("data-domain") || window.location.hostname;
    const apiKey = script.getAttribute("data-api-key");
    const apiEndpoint = script.getAttribute("data-endpoint") || "https://api.spplabs.es/api/analytics";

    if (!apiKey) {
      console.warn("[SPP Analytics] Missing data-api-key. Analytics tracking disabled.");
      return;
    }

    // 2. Cookie Helpers
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    }

    function setCookie(name, value, days) {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = `; expires=${date.toUTCString()}`;
      }
      document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax; Secure`;
    }

    // 3. Visitor ID & Session ID Management
    let visitorId = getCookie("spp_visitor_id");
    if (!visitorId) {
      visitorId = crypto.randomUUID ? crypto.randomUUID() : generateUUID();
      setCookie("spp_visitor_id", visitorId, 365); // 1 year persistence
    }

    let sessionId = getCookie("spp_session_id");
    let isNewSession = false;
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : generateUUID();
      isNewSession = true;
    }
    // Refresh session cookie on page load (expires in 30 mins)
    setCookie("spp_session_id", sessionId, 0.02083); // 30 mins

    // Fallback UUID generator
    function generateUUID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    // 4. UTM Parameter Extraction
    function getUtmParams() {
      const params = new URLSearchParams(window.location.search);
      return {
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        utm_term: params.get("utm_term") || "",
        utm_content: params.get("utm_content") || "",
      };
    }

    // 5. Scroll Depth Tracking
    let maxScrollPercent = 0;
    window.addEventListener("scroll", function () {
      const h = document.documentElement;
      const b = document.body;
      const st = "scrollTop";
      const sh = "scrollHeight";
      const percent = Math.round(
        ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100
      );
      if (percent > maxScrollPercent) {
        maxScrollPercent = Math.min(percent, 100);
      }
    }, { passive: true });

    // 6. Page Duration tracking
    const startTime = Date.now();

    // 7. Core Event Sender
    function sendEvent(eventType, additionalData = {}) {
      const utm = getUtmParams();
      const payload = {
        website_id: domain,
        event_type: eventType,
        page_url: window.location.pathname,
        page_title: document.title,
        referrer: document.referrer,
        visitor_id: visitorId,
        session_id: sessionId,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        scroll_percent: maxScrollPercent,
        duration_ms: Date.now() - startTime,
        language: navigator.language || navigator.userLanguage || "",
        timestamp: new Date().toISOString(),
        ...utm,
        ...additionalData,
      };

      const isUnloading = additionalData.isUnload || false;
      delete payload.isUnload;

      if (isUnloading && navigator.sendBeacon) {
        payload.api_key = apiKey;
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        const beaconSent = navigator.sendBeacon(apiEndpoint, blob);
        if (beaconSent) return;
      }

      fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function (e) {
        console.debug("[SPP Analytics] Failed to send log:", e);
      });
    }

    // 8. Session Start & Auto Page View Tracking
    if (isNewSession) {
      sendEvent("session_start");
    }
    sendEvent("page_view");

    // Refresh session active timeout on interaction
    const interactionEvents = ["click", "keydown", "scroll"];
    function refreshSession() {
      setCookie("spp_session_id", sessionId, 0.02083);
    }
    interactionEvents.forEach(function (e) {
      window.addEventListener(e, refreshSession, { passive: true });
    });

    // 9. Auto Button / Link clicks, Phone, Email, WhatsApp, Downloads
    document.addEventListener("click", function (event) {
      const target = event.target.closest("a, button");
      if (!target) return;

      const btnText = target.innerText || target.value || target.ariaLabel || "";
      const isLink = target.tagName === "A";
      const href = target.getAttribute("href") || "";

      const dataAnalyticsName = target.getAttribute("data-analytics-name");
      const displayName = dataAnalyticsName || btnText.substring(0, 100).trim();

      if (isLink && href) {
        const hrefLower = href.toLowerCase();

        if (hrefLower.startsWith("tel:")) {
          sendEvent("phone_click", { button_name: displayName || href, page_url: window.location.pathname });
          return;
        }

        if (hrefLower.startsWith("mailto:")) {
          sendEvent("email_click", { button_name: displayName || href, page_url: window.location.pathname });
          return;
        }

        if (hrefLower.includes("wa.me") || hrefLower.includes("whatsapp.com") || hrefLower.includes("api.whatsapp")) {
          sendEvent("whatsapp_click", { button_name: displayName || href, page_url: window.location.pathname });
          return;
        }

        const downloadExts = /\.(pdf|zip|rar|7z|gz|tar|doc|docx|xls|xlsx|ppt|pptx|csv|exe|dmg|apk|ipa|mp3|mp4|avi|mov)(\?.*)?$/i;
        if (downloadExts.test(href)) {
          sendEvent("download", { button_name: displayName || href.split("/").pop().split("?")[0], page_url: window.location.pathname });
          return;
        }

        const isOutbound = !href.startsWith("/") && !href.startsWith("#") && !href.includes(window.location.hostname);
        if (isOutbound) {
          sendEvent("outbound_link", { button_name: displayName, page_url: window.location.pathname });
          return;
        }
      }

      sendEvent("button_click", { button_name: displayName, page_url: window.location.pathname });
    });

    // 10. Auto Form Submit Tracking
    document.addEventListener("submit", function (event) {
      const form = event.target;
      if (!form || form.tagName !== "FORM") return;

      const formName = form.getAttribute("data-analytics-form")
        || form.getAttribute("name")
        || form.getAttribute("id")
        || "unknown_form";

      sendEvent("form_submit", { form_name: formName, page_url: window.location.pathname });
    });

    // 11. Video Tracking
    function trackVideos() {
      const videos = document.querySelectorAll("video");
      videos.forEach(function (video) {
        if (video._sppTracked) return;
        video._sppTracked = true;

        let hasStarted = false;
        video.addEventListener("play", function () {
          if (!hasStarted) {
            hasStarted = true;
            sendEvent("video_start", { button_name: video.getAttribute("data-analytics-name") || video.src || "video", page_url: window.location.pathname });
          }
        });

        video.addEventListener("ended", function () {
          sendEvent("video_complete", { button_name: video.getAttribute("data-analytics-name") || video.src || "video", duration_ms: Math.round((video.duration || 0) * 1000), page_url: window.location.pathname });
        });
      });
    }

    trackVideos();
    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(function (mutations) {
        let hasNewVideo = false;
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (node.tagName === "VIDEO" || (node.querySelectorAll && node.querySelectorAll("video").length > 0)) {
              hasNewVideo = true;
            }
          });
        });
        if (hasNewVideo) trackVideos();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // 12. Page View Duration Tracking on Unload
    window.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        sendEvent("session_end", { isUnload: true });
      }
    });

    // 13. Global Helper API
    window.sppAnalytics = {
      track: function (eventName, data) {
        sendEvent(eventName, data || {});
      }
    };
  }

  // Check consent immediately or listen for user acceptance
  if (hasConsent()) {
    initTracker();
  } else {
    window.addEventListener("spp_cookie_consent_accepted", function () {
      initTracker();
    });
  }
})();
