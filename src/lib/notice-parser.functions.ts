import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const NoticeInput = z.object({
  text: z.string().trim().min(80, "Paste the full notice — that looks too short.").max(20_000),
});

/** Parse a pasted sheriff/trustee/tax sale notice into a structured record. */
export const parseLegalNotice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => NoticeInput.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { parseNoticeText } = await import("@/lib/notice-parser.server");
    return await parseNoticeText(data.text);
  });

/** Directory of the distressed-property sources the pipeline crawls. */
export const listDistressSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("distress_sources")
      .select("key, label, category, tier, url, notes, enabled")
      .order("category", { ascending: true })
      .order("label", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
