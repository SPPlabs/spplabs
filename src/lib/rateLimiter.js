const trackers = new Map();

/**
 * Checks if a key is rate limited under a dynamic sliding window.
 * 
 * @param {string} key - Unique identifier to limit (e.g., IP address or IP + endpoint)
 * @param {number} limit - Maximum requests allowed within the window
 * @param {number} windowMs - Window duration in milliseconds (default: 60 seconds)
 * @returns {boolean} - True if limited, false otherwise
 */
export function isRateLimited(key, limit = 60, windowMs = 60000) {
  const now = Date.now();
  if (!trackers.has(key)) {
    trackers.set(key, []);
  }

  // Filter out timestamps outside the sliding window
  const timestamps = trackers.get(key).filter((time) => now - time < windowMs);
  
  if (timestamps.length >= limit) {
    return true; // Exceeded limit
  }

  // Record current request timestamp
  timestamps.push(now);
  trackers.set(key, timestamps);
  return false;
}
