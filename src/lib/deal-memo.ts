import { fmt$, pct, ringLabel, tierLabel } from "./format";

export interface DealExportRow {
  parcelId: string;
  address: string;
  city: string;
  state: string;
  zip?: string | null;
  countyFips?: string | null;
  arv: number;
  maxOffer: number;
  expectedProfit: number;
  dealScore: number;
  confidenceGrade: string;
  strategy: string;
  livingSqft?: number | null;
  yearBuilt?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  pLossPercent?: number | null;
  typicalProfitP50?: number | null;
  worstCaseProfitP5?: number | null;
  exitDays?: number | null;
  warningsCount?: number;
  warnings?: string;
  isSaved?: boolean;
}

/**
 * Format deals into an RFC 4180 compliant CSV string ready for download or CRM import.
 */
export function generateDealsCsv(deals: DealExportRow[]): string {
  const headers = [
    "Parcel ID",
    "Property Address",
    "City",
    "State",
    "Zip",
    "County FIPS",
    "Est ARV ($)",
    "Max Allowable Offer ($)",
    "Expected Profit ($)",
    "Deal Score (0-100)",
    "Confidence Grade",
    "Recommended Strategy",
    "Living Sqft",
    "Year Built",
    "Bedrooms",
    "Bathrooms",
    "Downside Loss Risk (%)",
    "P50 Typical Profit ($)",
    "P5 Worst Case Profit ($)",
    "Exit Days",
    "Warning Flags Count",
    "Warning Details",
    "In Saved Portfolio",
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = deals.map((d) => [
    escapeCsv(d.parcelId),
    escapeCsv(d.address),
    escapeCsv(d.city),
    escapeCsv(d.state),
    escapeCsv(d.zip || ""),
    escapeCsv(d.countyFips || ""),
    escapeCsv(d.arv),
    escapeCsv(d.maxOffer),
    escapeCsv(d.expectedProfit),
    escapeCsv(d.dealScore),
    escapeCsv(d.confidenceGrade),
    escapeCsv(d.strategy),
    escapeCsv(d.livingSqft ?? ""),
    escapeCsv(d.yearBuilt ?? ""),
    escapeCsv(d.bedrooms ?? ""),
    escapeCsv(d.bathrooms ?? ""),
    escapeCsv(d.pLossPercent != null ? `${d.pLossPercent}%` : ""),
    escapeCsv(d.typicalProfitP50 != null ? d.typicalProfitP50 : ""),
    escapeCsv(d.worstCaseProfitP5 != null ? d.worstCaseProfitP5 : ""),
    escapeCsv(d.exitDays ?? ""),
    escapeCsv(d.warningsCount ?? 0),
    escapeCsv(d.warnings || "None"),
    escapeCsv(d.isSaved ? "Yes" : "No"),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

/**
 * Trigger client-side file download for generated CSV.
 */
export function downloadCsvFile(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface DealMemoData {
  parcel: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip?: string | null;
    countyFips?: string | null;
    livingSqft?: number | null;
    yearBuilt?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    conditionGrade?: string | null;
    isVacant?: boolean | null;
    isAbsentee?: boolean | null;
  };
  score?: {
    perfectScore?: number | null;
    grossProfit?: number | null;
    modeledOffer?: number | null;
    fullRenoArv?: number | null;
    cosmeticArv?: number | null;
    asIsValue?: number | null;
    renoCost?: number | null;
    carryCost?: number | null;
    sellingCost?: number | null;
    exitDays?: number | null;
    confidenceGrade?: string | null;
    recommendedScope?: string | null;
    mcProfitP5?: number | null;
    mcProfitP50?: number | null;
    mcPLoss?: number | null;
    skepticFlags?: string[] | null;
    computedAt?: string | null;
  } | null;
}

export function formatCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return "—";
  return `$${Math.round(Number(n)).toLocaleString()}`;
}

/**
 * Formats a clean, professional text/Markdown Deal Memo for email, lenders, or CRM notes.
 */
export function formatDealMemoMarkdown(memo: DealMemoData): string {
  const p = memo.parcel;
  const s = memo.score;
  const arv = Number(s?.fullRenoArv || s?.cosmeticArv || 0);
  const maxOffer = Number(s?.modeledOffer || 0);
  const profit = Number(s?.grossProfit || 0);
  const reno = Number(s?.renoCost || 0);
  const carry = Number(s?.carryCost || 0);
  const selling = Number(s?.sellingCost || 0);
  const score = Number(s?.perfectScore || 0);
  const pLoss = s?.mcPLoss != null ? Math.round(Number(s.mcPLoss) * 100) : null;
  const flags = s?.skepticFlags || [];

  return `=======================================================
INVESTMENT DEAL MEMORANDUM & UNDERWRITING BRIEF
PROFIT PROPERTY ANALYTICS COCKPIT
Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
=======================================================

1. PROPERTY IDENTIFICATION
Address:       ${p.address}
Jurisdiction:  ${p.city}, ${p.state} ${p.zip || ""} (FIPS: ${p.countyFips || "N/A"})
Physical:      ${p.bedrooms ?? "—"} Bed / ${p.bathrooms ?? "—"} Bath | ${p.livingSqft?.toLocaleString() ?? "—"} sqft
Year Built:    ${p.yearBuilt ?? "—"} (Condition Grade: ${p.conditionGrade ?? "Standard"})
Occupancy:     ${p.isVacant ? "Vacant" : "Occupied"} | Absentee Owner: ${p.isAbsentee ? "Yes" : "No"}

2. UNDERWRITING WATERFALL & ACQUISITION CEILING
Deal Rating:   ${score}/100 (${tierLabel(score).label} · Grade ${s?.confidenceGrade || "B"})
Strategy:      ${s?.recommendedScope || "Full Renovation"}
Est. Resale ARV:            ${formatCurrency(arv)}
(-) Modeled Max Offer:      ${formatCurrency(maxOffer)} (Max Allowable Purchase)
(-) Est. Rehab Budget:      ${formatCurrency(reno)}
(-) Carry & Holding Costs:  ${formatCurrency(carry)} (~${s?.exitDays ?? 60} days)
(-) Sales & Closing Costs:  ${formatCurrency(selling)}
-------------------------------------------------------
(=) Projected Net Profit:   ${formatCurrency(profit)}
ROI on Total Capital:       ${maxOffer + reno > 0 ? pct(profit / (maxOffer + reno)) : "—"}

3. MONTE CARLO RISK SIMULATION & DOWNSIDE BOUNDS
P50 Typical Profit:         ${s?.mcProfitP50 != null ? formatCurrency(Number(s.mcProfitP50)) : "—"}
P5 Worst-Case Profit:       ${s?.mcProfitP5 != null ? formatCurrency(Number(s.mcProfitP5)) : "—"}
Loss Probability:           ${pLoss != null ? `${pLoss}%` : "—"}
Target Turnaround:          ~${s?.exitDays ?? 60} Days

4. DUE DILIGENCE AUDIT FLAGS
${flags.length > 0 ? flags.map((f, i) => `[!] Flag ${i + 1}: ${f}`).join("\n") : "[✓] Clean underwriting bounds. No critical adverse skeptic flags detected."}

5. ACQUISITION ACTION CHECKLIST
[ ] 1. Run 30-year municipal lien & water/sewer super-lien title verification.
[ ] 2. Perform on-site contractor scope walk-through to confirm rehab estimate.
[ ] 3. Validate neighborhood 90-day closed comp radius.
[ ] 4. Issue formal offer capped at ${formatCurrency(maxOffer)} with inspection contingency.

=======================================================
CONFIDENTIAL · PREPARED VIA PROFIT PROPERTY DEAL ENGINE
=======================================================`;
}
