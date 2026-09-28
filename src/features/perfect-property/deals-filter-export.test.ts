import { describe, it, expect } from "vitest";
import { generateDealsCsv, type DealExportRow } from "@/lib/deal-memo";

describe("Deals discovery, filtering, and CRM export", () => {
  const sampleDeals: Array<{
    parcel_id: string;
    perfect_score: number;
    gross_profit: number;
    modeled_offer: number;
    full_reno_arv: number;
    recommended_scope: string;
    exit_days: number;
    parcels: {
      address: string;
      city: string;
      state: string;
      zip: string;
      county_fips: string;
      living_sqft: number;
      year_built: number;
      bedrooms: number;
      bathrooms: number;
    };
  }> = [
    {
      parcel_id: "p-chicago-01",
      perfect_score: 88,
      gross_profit: 85000,
      modeled_offer: 220000,
      full_reno_arv: 380000,
      recommended_scope: "Full Renovation",
      exit_days: 60,
      parcels: {
        address: "4821 N Damen Ave",
        city: "Chicago",
        state: "IL",
        zip: "60625",
        county_fips: "17031",
        living_sqft: 2100,
        year_built: 1965,
        bedrooms: 4,
        bathrooms: 2,
      },
    },
    {
      parcel_id: "p-chicago-02",
      perfect_score: 72,
      gross_profit: 38000,
      modeled_offer: 140000,
      full_reno_arv: 215000,
      recommended_scope: "Cosmetic",
      exit_days: 45,
      parcels: {
        address: "1520 W 18th St",
        city: "Chicago",
        state: "IL",
        zip: "60608",
        county_fips: "17031",
        living_sqft: 1400,
        year_built: 1952,
        bedrooms: 3,
        bathrooms: 1,
      },
    },
    {
      parcel_id: "p-chicago-03",
      perfect_score: 93,
      gross_profit: 110000,
      modeled_offer: 310000,
      full_reno_arv: 520000,
      recommended_scope: "Full Renovation",
      exit_days: 75,
      parcels: {
        address: "732 S Loomis St",
        city: "Chicago",
        state: "IL",
        zip: "60607",
        county_fips: "17031",
        living_sqft: 2800,
        year_built: 1978,
        bedrooms: 4,
        bathrooms: 3,
      },
    },
  ];

  it("filters deals accurately by search query across address and city", () => {
    const query = "damen";
    const filtered = sampleDeals.filter((d) =>
      d.parcels.address.toLowerCase().includes(query.toLowerCase()),
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].parcel_id).toBe("p-chicago-01");
  });

  it("filters deals by minimum profit threshold", () => {
    const minProfit = 50000;
    const filtered = sampleDeals.filter((d) => d.gross_profit >= minProfit);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((d) => d.gross_profit >= 50000)).toBe(true);
  });

  it("filters deals by minimum score threshold", () => {
    const minScore = 80;
    const filtered = sampleDeals.filter((d) => d.perfect_score >= minScore);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((d) => d.parcel_id)).toEqual(["p-chicago-01", "p-chicago-03"]);
  });

  it("filters deals by renovation strategy scope", () => {
    const cosmetic = sampleDeals.filter((d) =>
      d.recommended_scope.toLowerCase().includes("cosmetic"),
    );
    expect(cosmetic).toHaveLength(1);
    expect(cosmetic[0].parcel_id).toBe("p-chicago-02");
  });

  it("sorts deals by highest profit, highest score, and fastest turnaround", () => {
    const byProfit = [...sampleDeals].sort((a, b) => b.gross_profit - a.gross_profit);
    expect(byProfit[0].parcel_id).toBe("p-chicago-03");

    const byScore = [...sampleDeals].sort((a, b) => b.perfect_score - a.perfect_score);
    expect(byScore[0].parcel_id).toBe("p-chicago-03");

    const byTurnaround = [...sampleDeals].sort((a, b) => a.exit_days - b.exit_days);
    expect(byTurnaround[0].parcel_id).toBe("p-chicago-02"); // 45 days
  });

  it("exports deals to CSV for CRM import with full fields", () => {
    const exportRows: DealExportRow[] = sampleDeals.map((d) => ({
      parcelId: d.parcel_id,
      address: d.parcels.address,
      city: d.parcels.city,
      state: d.parcels.state,
      zip: d.parcels.zip,
      countyFips: d.parcels.county_fips,
      arv: d.full_reno_arv,
      maxOffer: d.modeled_offer,
      expectedProfit: d.gross_profit,
      dealScore: d.perfect_score,
      confidenceGrade: "A",
      strategy: d.recommended_scope,
      livingSqft: d.parcels.living_sqft,
      yearBuilt: d.parcels.year_built,
      bedrooms: d.parcels.bedrooms,
      bathrooms: d.parcels.bathrooms,
      pLossPercent: 7,
      exitDays: d.exit_days,
      warningsCount: 0,
      isSaved: true,
    }));

    const csv = generateDealsCsv(exportRows);
    expect(csv).toContain("Property Address");
    expect(csv).toContain('"4821 N Damen Ave"');
    expect(csv).toContain('"85000"');
    expect(csv).toContain('"Yes"');
    expect(csv.split("\r\n")).toHaveLength(4); // Header + 3 rows
  });
});
