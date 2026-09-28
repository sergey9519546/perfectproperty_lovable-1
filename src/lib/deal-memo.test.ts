import { describe, it, expect } from "vitest";
import { generateDealsCsv, formatDealMemoMarkdown, type DealExportRow, type DealMemoData } from "./deal-memo";

describe("deal-memo utility", () => {
  it("generates valid RFC-compliant CSV headers and rows", () => {
    const deals: DealExportRow[] = [
      {
        parcelId: "p-1001",
        address: "123 Elm St",
        city: "Chicago",
        state: "IL",
        zip: "60601",
        countyFips: "17031",
        arv: 350000,
        maxOffer: 210000,
        expectedProfit: 65000,
        dealScore: 84,
        confidenceGrade: "A",
        strategy: "Full Renovation",
        livingSqft: 1850,
        yearBuilt: 1968,
        bedrooms: 3,
        bathrooms: 2,
        pLossPercent: 8,
        typicalProfitP50: 64000,
        worstCaseProfitP5: 12000,
        exitDays: 75,
        warningsCount: 0,
        warnings: "None",
        isSaved: true,
      },
    ];

    const csv = generateDealsCsv(deals);
    expect(csv).toContain("Parcel ID,Property Address,City,State,Zip");
    expect(csv).toContain('"p-1001","123 Elm St","Chicago","IL","60601"');
    expect(csv).toContain('"350000","210000","65000","84"');
    expect(csv).toContain('"Yes"');
  });

  it("handles empty and special characters in CSV correctly", () => {
    const deals: DealExportRow[] = [
      {
        parcelId: 'p-1002, "special"',
        address: '456 "Main" Ave, Apt #2',
        city: "Los Angeles",
        state: "CA",
        arv: 600000,
        maxOffer: 400000,
        expectedProfit: 90000,
        dealScore: 78,
        confidenceGrade: "B",
        strategy: "Cosmetic",
      },
    ];

    const csv = generateDealsCsv(deals);
    expect(csv).toContain('""special"""');
    expect(csv).toContain('"456 ""Main"" Ave, Apt #2"');
  });

  it("generates structured investor deal memo markdown", () => {
    const memo: DealMemoData = {
      parcel: {
        id: "p-test-01",
        address: "742 Evergreen Terrace",
        city: "Springfield",
        state: "IL",
        zip: "62704",
        countyFips: "17031",
        livingSqft: 2200,
        yearBuilt: 1985,
        bedrooms: 4,
        bathrooms: 2.5,
        conditionGrade: "B-",
        isVacant: true,
        isAbsentee: true,
      },
      score: {
        perfectScore: 88,
        grossProfit: 85000,
        modeledOffer: 240000,
        fullRenoArv: 410000,
        renoCost: 45000,
        carryCost: 12000,
        sellingCost: 28000,
        exitDays: 65,
        confidenceGrade: "A",
        recommendedScope: "Full Renovation",
        mcProfitP5: 22000,
        mcProfitP50: 84000,
        mcPLoss: 0.05,
        skepticFlags: ["High property tax assessment ratio"],
      },
    };

    const text = formatDealMemoMarkdown(memo);
    expect(text).toContain("INVESTMENT DEAL MEMORANDUM");
    expect(text).toContain("742 Evergreen Terrace");
    expect(text).toContain("Est. Resale ARV:            $410,000");
    expect(text).toContain("Projected Net Profit:   $85,000");
    expect(text).toContain("Loss Probability:           5%");
    expect(text).toContain("High property tax assessment ratio");
    expect(text).toContain("Issue formal offer capped at $240,000");
  });
});
