import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  runMapsGroundedAnalysis,
  runSearchGroundedAnalysis,
  type GroundedIntelligenceRequest,
} from "./gemini.server";

// Mock @google/genai SDK
vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockImplementation(async ({ config }: any) => {
          const isMaps = config?.tools?.some((t: any) => "googleMaps" in t);
          if (isMaps) {
            return {
              text: "Institutional spatial analysis for property. High proximity to Interstate transit corridor and commercial hubs.",
              candidates: [
                {
                  content: {
                    parts: [{ text: "Mock maps analysis text" }],
                  },
                  groundingMetadata: {
                    webSearchQueries: ["commercial corridor proximity"],
                    groundingChunks: [
                      {
                        maps: {
                          name: "Central Metro Transit Hub",
                          placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
                        },
                      },
                    ],
                  },
                },
              ],
            };
          } else {
            return {
              text: "Live public records and deed transfer search indicate recent comps average $320/sqft with zero tax liens.",
              candidates: [
                {
                  content: {
                    parts: [{ text: "Mock search analysis text" }],
                  },
                  groundingMetadata: {
                    webSearchQueries: ["county tax deed comps"],
                    groundingChunks: [
                      {
                        web: {
                          title: "County Property Appraiser & Tax Collector",
                          uri: "https://countyrecords.gov/parcel/123",
                        },
                      },
                    ],
                  },
                },
              ],
            };
          }
        }),
      };
    },
  };
});

describe("Gemini Grounded Intelligence Service", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  it("executes Maps-grounded spatial analysis and parses place citations", async () => {
    const req: GroundedIntelligenceRequest = {
      type: "maps",
      address: "1424 Oak Ridge Lane",
      city: "Orlando",
      county: "Orange",
      state: "FL",
      coordinates: { lat: 28.5383, lng: -81.3792 },
    };

    const result = await runMapsGroundedAnalysis(req);
    expect(result.ok).toBe(true);
    expect(result.type).toBe("maps");
    expect(result.summary).toContain("proximity to Interstate transit corridor");
    expect(result.groundingSources).toHaveLength(1);
    expect(result.groundingSources?.[0].placeId).toBe("ChIJN1t_tDeuEmsRUsoyG83frY4");
    expect(result.groundingSources?.[0].url).toContain("place_id:ChIJN1t_tDeuEmsRUsoyG83frY4");
  });

  it("executes Search-grounded market analysis and parses web citations", async () => {
    const req: GroundedIntelligenceRequest = {
      type: "search",
      address: "5500 Grand Boulevard",
      city: "Tampa",
      state: "FL",
      apn: "09-22-19-000-001",
    };

    const result = await runSearchGroundedAnalysis(req);
    expect(result.ok).toBe(true);
    expect(result.type).toBe("search");
    expect(result.summary).toContain("recent comps average $320/sqft");
    expect(result.groundingSources).toHaveLength(1);
    expect(result.groundingSources?.[0].url).toBe("https://countyrecords.gov/parcel/123");
    expect(result.groundingSources?.[0].title).toBe("County Property Appraiser & Tax Collector");
  });
});
