import { createFileRoute } from "@tanstack/react-router";
import { API_BASE_URL } from "@/lib/api-base";

// Same-origin proxy to the Railway/Render backend so the browser is never subject to
// the backend's CORS configuration. Path after /api/proxy/ is forwarded as-is.
async function forward(request: Request, splat: string) {
  const incoming = new URL(request.url);
  const target = `${API_BASE_URL}/${splat}${incoming.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");

  let bodyBuffer: ArrayBuffer | undefined = undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    bodyBuffer = await request.arrayBuffer();
  }

  const MAX_ATTEMPTS = 7;
  const RETRY_DELAYS_MS = [2000, 4000, 6000, 8000, 10000, 15000, 20000]; // ~65s total retry delay window

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000);
    if (request.signal?.aborted) {
      clearTimeout(timeoutId);
      break;
    }
    request.signal?.addEventListener("abort", () => controller.abort());

    try {
      const init: RequestInit = {
        method: request.method,
        headers,
        signal: controller.signal,
        body: bodyBuffer,
      };

      const response = await fetch(target, init);
      clearTimeout(timeoutId);

      // If backend returned success or client error (4xx), return it directly.
      // If backend/gateway returned 502/503/504 (cold start), retry unless last attempt.
      if (response.status < 500 || attempt === MAX_ATTEMPTS - 1) {
        const body = await response.arrayBuffer();
        return new Response(body, {
          status: response.status,
          headers: {
            "content-type": response.headers.get("content-type") ?? "application/json",
          },
        });
      }

      console.warn(
        `[API Proxy Attempt ${attempt + 1}/${MAX_ATTEMPTS}] ${target} returned status ${response.status}. Retrying in ${RETRY_DELAYS_MS[attempt]}ms...`,
      );
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(
        `[API Proxy Attempt ${attempt + 1}/${MAX_ATTEMPTS}] Fetch to ${target} failed:`,
        err,
      );
      if (attempt === MAX_ATTEMPTS - 1) break;
    }

    if (request.signal?.aborted) break;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt] || 5000));
  }

  return new Response(
    JSON.stringify({
      error: "upstream_unreachable",
      message: "The backend server is waking up from sleep. Please wait a moment and try again.",
      target,
    }),
    {
      status: 502,
      headers: { "content-type": "application/json" },
    },
  );
}

export const Route = createFileRoute("/api/proxy/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => forward(request, params._splat ?? ""),
      POST: ({ request, params }) => forward(request, params._splat ?? ""),
    },
  },
});
