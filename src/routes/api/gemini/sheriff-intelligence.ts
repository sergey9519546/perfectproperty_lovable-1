import { createFileRoute } from "@tanstack/react-router";
import {
  runSheriffLegalAnalysis,
  type SheriffLegalAnalysisRequest,
} from "@/lib/gemini.server";

export const Route = createFileRoute("/api/gemini/sheriff-intelligence")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as SheriffLegalAnalysisRequest;

          if (!body.rawLegalNotice || !body.rawLegalNotice.trim()) {
            return Response.json(
              {
                ok: false,
                error: "The raw legal notice prose is required.",
              },
              { status: 400 },
            );
          }

          const result = await runSheriffLegalAnalysis(body);
          return Response.json(result);
        } catch (error) {
          console.error("Sheriff intelligence API error:", error);
          return Response.json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "Internal server error during analysis",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
