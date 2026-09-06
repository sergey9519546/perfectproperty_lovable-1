import { createFileRoute } from "@tanstack/react-router";
import {
  runMapsGroundedAnalysis,
  runSearchGroundedAnalysis,
  type GroundedIntelligenceRequest,
} from "@/lib/gemini.server";

export const Route = createFileRoute("/api/gemini/grounded-intelligence")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as GroundedIntelligenceRequest;

          if (!body.address && !body.coordinates && !body.county) {
            return Response.json(
              {
                ok: false,
                error: "At least one location indicator (address, coordinates, or county) is required.",
              },
              { status: 400 },
            );
          }

          if (body.type === "maps") {
            const result = await runMapsGroundedAnalysis(body);
            return Response.json(result);
          } else if (body.type === "search") {
            const result = await runSearchGroundedAnalysis(body);
            return Response.json(result);
          } else {
            // Comprehensive mode runs both in parallel
            const [mapsResult, searchResult] = await Promise.all([
              runMapsGroundedAnalysis(body),
              runSearchGroundedAnalysis(body),
            ]);

            return Response.json({
              ok: mapsResult.ok || searchResult.ok,
              type: "comprehensive",
              maps: mapsResult,
              search: searchResult,
            });
          }
        } catch (error) {
          console.error("Grounded intelligence API error:", error);
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
