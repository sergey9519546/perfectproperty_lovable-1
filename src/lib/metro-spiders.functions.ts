import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/integrations/supabase/require-admin";

export const fireDailyMetroSpidersFn = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: { county_fips?: string }) =>
    z.object({ county_fips: z.string().default("17031") }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const { runDailyMetroSpiders } = await import("./metro-spiders.server");
    return runDailyMetroSpiders(data.county_fips);
  });
