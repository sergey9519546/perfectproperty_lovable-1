import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

/**
 * Server-side legal sale-notice parser.
 *
 * Takes the raw prose of a sheriff / trustee / tax sale notice and returns a
 * structured, strictly validated record plus a plain-English read of the risks.
 * Runs on the Lovable AI gateway — no client-side model calls, no API key in
 * the browser.
 */

export const ParsedNoticeSchema = z.object({
  sale_type: z
    .enum(["sheriff", "trustee", "tax_lien", "tax_deed", "hoa", "probate", "other"])
    .default("other"),
  case_number: z.string().nullable().default(null),
  property_address: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
  county: z.string().nullable().default(null),
  state: z.string().nullable().default(null),
  zip: z.string().nullable().default(null),
  parcel_id: z.string().nullable().default(null),
  sale_date: z.string().nullable().default(null),
  sale_time: z.string().nullable().default(null),
  sale_location: z.string().nullable().default(null),
  judgment_amount: z.number().nullable().default(null),
  opening_bid: z.number().nullable().default(null),
  deposit_terms: z.string().nullable().default(null),
  plaintiff: z.string().nullable().default(null),
  defendant: z.string().nullable().default(null),
  attorney: z.string().nullable().default(null),
  redemption_period: z.string().nullable().default(null),
  occupancy: z.enum(["occupied", "vacant", "unknown"]).default("unknown"),
  risks: z.array(z.string()).default([]),
  plain_english: z.string().default(""),
  verdict: z.string().default(""),
  confidence: z.number().min(0).max(1).default(0.5),
});

export type ParsedNotice = z.infer<typeof ParsedNoticeSchema>;

export interface ParseNoticeResult {
  ok: boolean;
  notice?: ParsedNotice;
  error?: string;
}

const SYSTEM_PROMPT = `You extract structured data from US foreclosure, sheriff, trustee, and tax sale notices.

Rules:
- Only use facts present in the notice. If a field is not stated, return null. Never invent numbers, dates, or names.
- Money fields are plain numbers (no $ or commas).
- Dates are ISO (YYYY-MM-DD) when a year is stated, otherwise return the literal text.
- "risks": 3-6 short, concrete, buyer-relevant risks specific to this notice and its state (e.g. redemption rights, senior liens, occupancy, deposit forfeiture, as-is condition).
- "plain_english": 110-150 words, plain language, no jargon, no legal advice, no earnings claims. Explain what is being sold, on what terms, and what could go wrong.
- "verdict": one sentence, plain language.
- "confidence": 0-1, how complete the notice was.
Return JSON only.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    sale_type: {
      type: "string",
      enum: ["sheriff", "trustee", "tax_lien", "tax_deed", "hoa", "probate", "other"],
    },
    case_number: { type: ["string", "null"] },
    property_address: { type: ["string", "null"] },
    city: { type: ["string", "null"] },
    county: { type: ["string", "null"] },
    state: { type: ["string", "null"] },
    zip: { type: ["string", "null"] },
    parcel_id: { type: ["string", "null"] },
    sale_date: { type: ["string", "null"] },
    sale_time: { type: ["string", "null"] },
    sale_location: { type: ["string", "null"] },
    judgment_amount: { type: ["number", "null"] },
    opening_bid: { type: ["number", "null"] },
    deposit_terms: { type: ["string", "null"] },
    plaintiff: { type: ["string", "null"] },
    defendant: { type: ["string", "null"] },
    attorney: { type: ["string", "null"] },
    redemption_period: { type: ["string", "null"] },
    occupancy: { type: "string", enum: ["occupied", "vacant", "unknown"] },
    risks: { type: "array", items: { type: "string" } },
    plain_english: { type: "string" },
    verdict: { type: "string" },
    confidence: { type: "number" },
  },
  required: ["sale_type", "risks", "plain_english", "verdict", "confidence"],
  additionalProperties: false,
} as const;

export async function parseLegalNotice(rawNotice: string): Promise<ParseNoticeResult> {
  const text = rawNotice.trim();
  if (text.length < 40) {
    return { ok: false, error: "Paste the full notice — that looks too short to read." };
  }
  if (text.length > 24000) {
    return { ok: false, error: "That notice is too long. Paste the sale notice section only." };
  }

  const lovableKey = process.env["LOVABLE_API_KEY"];
  const geminiKey = process.env["GEMINI_API_KEY"];

  if (!lovableKey && !geminiKey) {
    return { ok: false, error: "The AI service is not configured on the server. GEMINI_API_KEY or LOVABLE_API_KEY required." };
  }

  let content: string | undefined;

  if (lovableKey) {
    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "parsed_notice", strict: true, schema: RESPONSE_SCHEMA },
          },
        }),
      });
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Could not reach the AI service." };
    }

    if (res.status === 429) {
      return { ok: false, error: "Too many requests right now — try again in a minute." };
    }
    if (res.status === 402) {
      return { ok: false, error: "AI credits are exhausted for this workspace." };
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `AI service error ${res.status}: ${detail.slice(0, 200)}` };
    }

    const payload = (await res.json().catch(() => null)) as
      | { choices?: Array<{ message?: { content?: string } }> }
      | null;
    content = payload?.choices?.[0]?.message?.content;
  } else if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: text,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
        },
      });
      content = response.text;
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Could not reach Gemini service." };
    }
  }
  if (!content) {
    return { ok: false, error: "The AI service returned an empty response." };
  }

  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch {
    return { ok: false, error: "The AI response could not be read." };
  }

  const parsed = ParsedNoticeSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: "The extracted notice failed validation." };
  }

  return { ok: true, notice: parsed.data };
}
