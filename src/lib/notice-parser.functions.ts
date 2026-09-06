import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { parseLegalNotice as runParse } from "./notice-parser.server";

export const parseNotice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ text: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => runParse(data.text));

export const listDistressSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("distress_sources")
      .select("key, label, category, tier, url, spider, notes, enabled")
      .order("category")
      .order("label");
    if (error) throw new Error(error.message);
    return data ?? [];
  });
