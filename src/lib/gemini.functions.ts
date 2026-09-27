import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  runMapsGroundedAnalysis,
  runSearchGroundedAnalysis,
  runPropertyNewsAndMarketUpdates,
  runSheriffLegalAnalysis,
} from "@/lib/gemini.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const fetchPropertyMarketNewsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const schema = z.object({
      address: z.string(),
      city: z.string().optional(),
      county: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      apn: z.string().optional(),
      submarket: z.string().optional(),
      userQuery: z.string().optional(),
    });
    return schema.parse(data);
  })
  .handler(async ({ data }) => {
    if (!data.address || !data.address.trim()) {
      throw new Error("A valid property address is required for search grounding.");
    }
    const result = await runPropertyNewsAndMarketUpdates(data);
    return result;
  });

export const runGroundedIntelligenceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const schema = z.object({
      type: z.enum(["maps", "search", "comprehensive"]),
      address: z.string().optional(),
      city: z.string().optional(),
      county: z.string().optional(),
      state: z.string().optional(),
      coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
      apn: z.string().optional(),
      userQuery: z.string().optional(),
    });
    return schema.parse(data);
  })
  .handler(async ({ data }) => {
    if (!data.address && !data.coordinates && !data.county) {
      throw new Error("At least one location indicator (address, coordinates, or county) is required.");
    }

    if (data.type === "maps") {
      const result = await runMapsGroundedAnalysis(data as any);
      return result;
    } else if (data.type === "search") {
      const result = await runSearchGroundedAnalysis(data as any);
      return result;
    } else {
      const [mapsResult, searchResult] = await Promise.all([
        runMapsGroundedAnalysis(data as any),
        runSearchGroundedAnalysis(data as any),
      ]);
      return {
        ok: mapsResult.ok || searchResult.ok,
        type: "comprehensive",
        maps: mapsResult,
        search: searchResult,
      };
    }
  });

export const runSheriffLegalAnalysisFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const schema = z.object({
      rawLegalNotice: z.string(),
      county: z.string().optional(),
      state: z.string().optional(),
    });
    return schema.parse(data);
  })
  .handler(async ({ data }) => {
    if (!data.rawLegalNotice || !data.rawLegalNotice.trim()) {
      throw new Error("The raw legal notice prose is required.");
    }
    const result = await runSheriffLegalAnalysis(data);
    return result;
  });
