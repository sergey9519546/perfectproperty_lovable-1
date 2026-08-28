/**
 * Server-only legal notice parser.
 *
 * Takes the raw text of a sheriff sale / trustee sale / tax sale notice and
 * turns it into a structured record plus a plain-English risk read, using the
 * Lovable AI gateway. Never returns free-form model text to the client without
 * passing it through the Zod schema below.
 */
import { z } from "zod";

export const ParsedNoticeSchema = z.object({
  property_address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
  parcel_or_lot: z.string().nullable(),
  sale_date: z.string().nullable(),
  sale_time: z.string().nullable(),
  sale_type: z.string().nullable(),
  plaintiff_or_seller: z.string().nullable(),
  defendant: z.string().nullable(),
  judgment_amount: z.number().nullable(),
  deposit_terms: z.string().nullable(),
  attorney: z.string().nullable(),
  case_number: z.string().nullable(),
  subject_to: z.string().nullable(),
  redemption_note: z.string().nullable(),
  risks: z.array(z.string()).max(6).default([]),
  plain_english: z.string(),
  confidence: z.number().min(0).max(1),
});

export type ParsedNotice = z.infer<typeof ParsedNoticeSchema>;

const SYSTEM_PROMPT = `You extract structured data from US real-estate legal notices
(sheriff sales, trustee/deed-of-trust sales, tax sales, probate notices).

Rules:
- Return ONLY a JSON object, no markdown fences, no commentary.
- Use null for any field the notice does not clearly state. Never invent values.
- judgment_amount is a plain number in dollars (no symbols, no commas) or null.
- sale_date is ISO YYYY-MM-DD when a date is stated, otherwise null.
- risks: up to 6 short, concrete buyer risks grounded in the notice text
  (e.g. "Sold subject to a senior first mortgage", "12-month redemption period").
- plain_english: 90-150 words, everyday language, name the concrete numbers,
  end with a one-line verdict. No legal advice, no earnings promises.
- confidence: 0-1, how completely the notice text supported the extraction.

JSON keys: property_address, city, state, zip, parcel_or_lot, sale_date,
sale_time, sale_type, plaintiff_or_seller, defendant, judgment_amount,
deposit_terms, attorney, case_number, subject_to, redemption_note, risks,
plain_english, confidence.`;

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

export async function parseNoticeText(noticeText: string): Promise<ParsedNotice> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: noticeText.slice(0, 20_000) },
      ],
    }),
  });

  if (res.status === 429) throw new Error("Too many requests right now — try again in a minute.");
  if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
  if (!res.ok) throw new Error(`Notice parsing failed (${res.status}).`);

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) throw new Error("The parser returned an empty response.");

  let raw: unknown;
  try {
    raw = extractJson(content);
  } catch {
    throw new Error("Could not read the parser response. Try pasting a cleaner notice.");
  }

  const parsed = ParsedNoticeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("The parsed notice was incomplete. Try again with the full notice text.");
  }
  return parsed.data;
}
