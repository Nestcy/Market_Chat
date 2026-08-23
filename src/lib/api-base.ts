/**
 * Single source of truth for the backend origin.
 * Reads from environment variables (API_BASE_URL, BACKEND_URL, VITE_API_BASE_URL)
 * or falls back to the default deployment.
 */
export const API_BASE_URL =
  (typeof process !== "undefined" && (process.env.API_BASE_URL || process.env.BACKEND_URL)) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "https://marketing-agent-rr7e.onrender.com";

/** Browser calls go through the same-origin proxy route to avoid CORS. */
export const API_PROXY_PREFIX = "/api/proxy";
