/**
 * Global fetch interceptor: when a server-fn call returns 401, route the
 * user to /auth and preserve where they were. Runs client-side only.
 */
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

let installed = false;

export function use401Interceptor() {
  const router = useRouter();
  useEffect(() => {
    if (installed || typeof window === "undefined") return;
    installed = true;

    try {
      const orig = typeof window.fetch === "function" ? window.fetch.bind(window) : undefined;
      if (!orig) return;

      const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const res = await orig(input, init);
        try {
          const url = typeof input === "string" ? input : input instanceof Request ? input.url : input?.toString?.() ?? "";
          // Only intercept our own server-fn / API traffic to avoid hijacking
          // third-party 401s (e.g. tile CDNs, analytics beacons).
          const sameOrigin = url.startsWith("/") || (typeof window !== "undefined" && url.startsWith(window.location.origin));
          const isServerFn = /\/_serverFn\/|\/api\//.test(url);
          if (res.status === 401 && sameOrigin && isServerFn && !window.location.pathname.startsWith("/auth")) {
            const next = window.location.pathname + window.location.search;
            router.navigate({ to: "/auth", search: { next } as any });
          }
        } catch {
          // Never let interception logic crash the request path.
        }
        return res;
      };

      try {
        window.fetch = interceptedFetch;
      } catch {
        try {
          Object.defineProperty(window, "fetch", {
            value: interceptedFetch,
            writable: true,
            configurable: true,
          });
        } catch {
          // If window.fetch cannot be reconfigured or overwritten in this environment, continue gracefully
        }
      }
    } catch {
      // Guard against any runtime access exception
    }
  }, [router]);
}
