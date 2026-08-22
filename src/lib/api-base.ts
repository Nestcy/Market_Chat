/**
 * Single source of truth for the backend origin.
 * Change this one constant to point the app at a different deployment.
 */
export const API_BASE_URL = "https://marketing-agent-rr7e.onrender.com";

/** Browser calls go through the same-origin proxy route to avoid CORS. */
export const API_PROXY_PREFIX = "/api/proxy";
