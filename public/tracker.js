(function () {
  // 1. Locate configuration from script tag
  const script = document.currentScript;
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
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : generateUUID();
  }
  // Refresh session cookie on page load (expires in 30 mins)
  setCookie("spp_session_id", sessionId, 0.02083); // 30 mins (0.02083 days)

  // Fallback UUID generator if crypto.randomUUID is not available
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
      timestamp: new Date().toISOString(),
      ...utm,
      ...additionalData,
    };

    // Use sendBeacon if unloading, otherwise standard fetch
    const isUnloading = additionalData.isUnload || false;
    delete payload.isUnload;

    if (isUnloading && navigator.sendBeacon) {
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
      keepalive: true, // keeps request alive even if window is closed
    }).catch(function (e) {
      console.debug("[SPP Analytics] Failed to send log:", e);
    });
  }

  // 8. Auto Page View Tracking
  sendEvent("page_view");

  // Refresh session active timeout on interaction
  const interactionEvents = ["click", "keydown", "scroll"];
  function refreshSession() {
    setCookie("spp_session_id", sessionId, 0.02083);
  }
  interactionEvents.forEach(e => {
    window.addEventListener(e, refreshSession, { passive: true });
  });

  // 9. Auto Button / Link clicks and Outbound links tracking
  document.addEventListener("click", function (event) {
    const target = event.target.closest("a, button");
    if (!target) return;

    const btnText = target.innerText || target.value || target.ariaLabel || "";
    
    // Check if link is outbound
    const isLink = target.tagName === "A";
    const href = target.getAttribute("href") || "";
    const isOutbound = isLink && href && !href.startsWith("/") && !href.startsWith("#") && !href.includes(window.location.hostname);

    const eventName = isOutbound ? "outbound_link" : "button_click";
    
    const clickData = {
      button_name: btnText.substring(0, 100).trim(),
      page_url: window.location.pathname,
    };

    if (isOutbound) {
      clickData.message = `Outbound link click to: ${href}`;
    }

    // Capture user custom data attributes: data-analytics-name="MyButton"
    const dataAnalyticsName = target.getAttribute("data-analytics-name");
    if (dataAnalyticsName) {
      clickData.button_name = dataAnalyticsName;
    }

    sendEvent(eventName, clickData);
  });

  // 10. Page View Duration Tracking on Unload
  window.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      sendEvent("session_end", { isUnload: true });
    }
  });

  // Bind tracker global for custom events
  window.sppAnalytics = {
    track: function (eventName, data = {}) {
      sendEvent(eventName, data);
    }
  };
})();
