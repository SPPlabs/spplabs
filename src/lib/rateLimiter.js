/**
 * High-performance, memory-safe sliding window rate limiter.
 * Includes periodic background cleanup and maximum capacity enforcement to eliminate memory leaks.
 */

const trackers = new Map();
const MAX_TRACKER_ENTRIES = 50000;
const CLEANUP_INTERVAL_MS = 30000; // 30 seconds

// Periodic background garbage collector
let cleanupInterval = null;

function ensureCleanupTimer() {
  if (cleanupInterval) return;
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of trackers.entries()) {
      // Find latest timestamp for this key
      const latest = timestamps[timestamps.length - 1];
      // If latest timestamp is older than 5 minutes, delete the entry entirely
      if (!latest || now - latest > 300000) {
        trackers.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // unref prevents the interval from holding the Node.js process alive during shutdown
  if (cleanupInterval && typeof cleanupInterval.unref === "function") {
    cleanupInterval.unref();
  }
}

// Start timer on module initialization
ensureCleanupTimer();

/**
 * Checks if a key is rate limited under a dynamic sliding window.
 * 
 * @param {string} key - Unique identifier to limit (e.g., IP address or IP + endpoint)
 * @param {number} limit - Maximum requests allowed within the window
 * @param {number} windowMs - Window duration in milliseconds (default: 60 seconds)
 * @returns {boolean} - True if limited, false otherwise
 */
export function isRateLimited(key, limit = 60, windowMs = 60000) {
  if (!key) return false;

  const now = Date.now();
  const existing = trackers.get(key);

  // Filter out timestamps outside the sliding window
  const activeTimestamps = existing ? existing.filter((time) => now - time < windowMs) : [];

  if (activeTimestamps.length >= limit) {
    // Keep only active timestamps to prevent unbounded array growth
    trackers.set(key, activeTimestamps);
    return true; // Exceeded limit
  }

  // Safety eviction if map exceeds maximum allowed capacity (e.g. DDoS scenario)
  if (trackers.size >= MAX_TRACKER_ENTRIES && !trackers.has(key)) {
    // Evict oldest 1000 entries
    let count = 0;
    for (const [k] of trackers) {
      trackers.delete(k);
      count++;
      if (count >= 1000) break;
    }
  }

  // Record current request timestamp
  activeTimestamps.push(now);
  trackers.set(key, activeTimestamps);
  return false;
}

/**
 * Manually clears all rate limiting tracker states (useful for testing).
 */
export function resetRateLimiter() {
  trackers.clear();
}

