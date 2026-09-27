import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { runDailyMetroSpiders } from "@/lib/metro-spiders.server";

function verify(secret: string, header: string | null): boolean {
  if (!header) return false;
  const a = Buffer.from(secret, "utf8");
  const b = Buffer.from(header.trim(), "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/run-metro-spiders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET || process.env.SCRAPY_INGEST_SECRET;
        const header = request.headers.get("x-cron-secret") || request.headers.get("x-signature");
        if (secret && !verify(secret, header)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const url = new URL(request.url);
        const fips = url.searchParams.get("county_fips") || "17031";

        try {
          const result = await runDailyMetroSpiders(fips);
          return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: err.message, status: "FAIL" }, null, 2),
            {
              status: 500,
              headers: { "content-type": "application/json" },
            },
          );
        }
      },
    },
  },
});
