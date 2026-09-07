import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseLegalNotice, ParsedNoticeSchema } from "./notice-parser.server";

// Mock @google/genai SDK
vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockImplementation(async () => {
          return {
            text: JSON.stringify({
              sale_type: "sheriff",
              case_number: "F-014922-24",
              property_address: "412 Forest Avenue",
              city: "Paramus",
              county: "Bergen",
              state: "NJ",
              zip: "07652",
              parcel_id: "Block 3204 Lot 14",
              sale_date: "2026-10-16",
              sale_time: "2:00 PM",
              sale_location: "Bergen County Administration Building",
              judgment_amount: 482750,
              opening_bid: 100,
              deposit_terms: "20% cash or cashier's check at sale",
              plaintiff: "Bank of New York Mellon",
              defendant: "Marcus A. Reynolds",
              attorney: "Fein, Such, Kahn & Shepard",
              redemption_period: "10 days",
              occupancy: "unknown",
              risks: ["10-day statutory redemption period", "Subject to prior municipal tax liens"],
              plain_english: "Single family residential parcel being sold at Bergen County sheriff auction to satisfy judgment debt.",
              verdict: "Standard first mortgage chancery foreclosure.",
              confidence: 0.95,
            }),
          };
        }),
      };
    },
  };
});

describe("ParsedNoticeSchema", () => {
  it("validates a complete notice record", () => {
    const valid = {
      sale_type: "sheriff",
      case_number: "F-1234",
      property_address: "123 Main St",
      city: "Hackensack",
      county: "Bergen",
      state: "NJ",
      zip: "07601",
      parcel_id: "12-34-56",
      sale_date: "2026-10-10",
      sale_time: "10:00 AM",
      sale_location: "County Courthouse",
      judgment_amount: 350000,
      opening_bid: 1000,
      deposit_terms: "20% down",
      plaintiff: "Wells Fargo",
      defendant: "John Doe",
      attorney: "Smith Law",
      redemption_period: "10 days",
      occupancy: "unknown",
      risks: ["Occupancy unknown", "Municipal liens possible"],
      plain_english: "Foreclosure auction for residential property.",
      verdict: "First mortgage judicial foreclosure.",
      confidence: 0.9,
    };

    const parsed = ParsedNoticeSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("defaults missing optional fields cleanly", () => {
    const minimal = {
      sale_type: "tax_deed",
      risks: ["No redemption rights"],
      plain_english: "Tax auction property.",
      verdict: "County tax sale.",
      confidence: 0.8,
    };

    const parsed = ParsedNoticeSchema.safeParse(minimal);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.property_address).toBeNull();
      expect(parsed.data.judgment_amount).toBeNull();
      expect(parsed.data.occupancy).toBe("unknown");
    }
  });
});

describe("parseLegalNotice", () => {
  beforeEach(() => {
    delete process.env.LOVABLE_API_KEY;
    process.env.GEMINI_API_KEY = "test-gemini-key";
  });

  it("rejects input that is too short", async () => {
    const res = await parseLegalNotice("Short note");
    expect(res.ok).toBe(false);
    expect(res.error).toContain("too short");
  });

  it("parses valid notice prose using Gemini API key fallback", async () => {
    const rawNotice = `SHERIFF'S SALE OF REAL ESTATE SUPERIOR COURT OF NEW JERSEY BERGEN COUNTY DOCKET NO. F-014922-24
    PLAINTIFF: BANK OF NEW YORK MELLON VS DEFENDANT: MARCUS A. REYNOLDS
    By virtue of a writ of execution I shall expose for sale on Oct 16 2026 at Bergen County Administration Building.
    Judgment amount is $482,750.00. Deposit terms: 20% in cash or certified check.`;

    const res = await parseLegalNotice(rawNotice);
    expect(res.ok).toBe(true);
    expect(res.notice).toBeDefined();
    expect(res.notice?.case_number).toBe("F-014922-24");
    expect(res.notice?.judgment_amount).toBe(482750);
  });

  it("returns clear error when no AI key is configured", async () => {
    delete process.env.LOVABLE_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const rawNotice = `SHERIFF'S SALE OF REAL ESTATE SUPERIOR COURT OF NEW JERSEY BERGEN COUNTY DOCKET NO. F-014922-24
    PLAINTIFF: BANK OF NEW YORK MELLON VS DEFENDANT: MARCUS A. REYNOLDS
    By virtue of a writ of execution I shall expose for sale on Oct 16 2026 at Bergen County Administration Building.
    Judgment amount is $482,750.00. Deposit terms: 20% in cash or certified check.`;

    const res = await parseLegalNotice(rawNotice);
    expect(res.ok).toBe(false);
    expect(res.error).toContain("The AI service is not configured");
  });
});
