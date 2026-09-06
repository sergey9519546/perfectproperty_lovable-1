import type { OutcomesLedgerEntry } from './types';

export type OutcomesLedgerStats = {
  totalRecordedSales: number;
  overallWinRatePct: number;
  meanAbsoluteArvErrorPct: number;
  meanAbsoluteBidVariancePct: number;
  activeWeeklyCalibrationFactor: number;
  compoundLearningRounds: number;
  countyCalibrationFactors: Record<string, number>;
};

export const INITIAL_HISTORICAL_OUTCOMES: OutcomesLedgerEntry[] = [
  {
    saleId: 'sgs-fl-orange-2026-ca-008129',
    address: '4922 Conroy Road',
    county: 'Orange County, FL',
    auctionDate: '2026-08-04',
    predictedArv: 465000,
    predictedMaxBid: 298000,
    actualWinningBid: 284500,
    actualResaleDeedPrice: 472000,
    actualResaleDate: '2026-08-28',
    variancePct: 1.5,
    outcome: 'WIN',
    learningFactorApplied: 1.024,
    weeklyCalibrationInsight: 'Auction hammer closed 4.5% below modeled MAB. ARV verified via arm-length resale within 24 days (+1.5% variance). Increased bid headroom for Orlando Metro infill.',
  },
  {
    saleId: 'sgs-fl-hills-2026-ca-004410',
    address: '8114 N Armenia Ave',
    county: 'Hillsborough County, FL',
    auctionDate: '2026-07-28',
    predictedArv: 385000,
    predictedMaxBid: 232000,
    actualWinningBid: 231000,
    actualResaleDeedPrice: 389000,
    actualResaleDate: '2026-08-19',
    variancePct: 1.0,
    outcome: 'WIN',
    learningFactorApplied: 1.018,
    weeklyCalibrationInsight: 'Surviving county utility lien of $1,420 was accurately deducted from modeled offer; no unexpected junior lien survival. Calibration validated Tampa Bay contractor cost multiplier.',
  },
  {
    saleId: 'sgs-ca-la-2026-civ-0914',
    address: '14328 Victory Blvd',
    county: 'Los Angeles County, CA',
    auctionDate: '2026-07-16',
    predictedArv: 820000,
    predictedMaxBid: 560000,
    actualWinningBid: 574000,
    actualResaleDeedPrice: 835000,
    actualResaleDate: '2026-08-22',
    variancePct: 1.8,
    outcome: 'OUTBID',
    learningFactorApplied: 0.985,
    weeklyCalibrationInsight: 'Institutional bidder exceeded modeled MAB by $14,000. Subsequent resale confirmed ARV of $835k, but strict risk guardrails prevented overpaying. Upgraded San Fernando submarket comp weights.',
  },
  {
    saleId: 'sgs-fl-dade-2026-td-0012',
    address: '1944 NW 64th St',
    county: 'Miami-Dade County, FL',
    auctionDate: '2026-07-09',
    predictedArv: 490000,
    predictedMaxBid: 310000,
    actualWinningBid: 295000,
    actualResaleDeedPrice: 486000,
    actualResaleDate: '2026-08-14',
    variancePct: -0.8,
    outcome: 'WIN',
    learningFactorApplied: 1.031,
    weeklyCalibrationInsight: 'Tax deed auction extinguished 2 junior code enforcement citations. Modeled title clearance held up in full quiet-title action. Re-calibrated Miami-Dade tax deed clearing discounts.',
  },
  {
    saleId: 'sgs-ca-sd-2026-cv-0811',
    address: '3812 Landis St',
    county: 'San Diego County, CA',
    auctionDate: '2026-06-25',
    predictedArv: 760000,
    predictedMaxBid: 490000,
    actualWinningBid: 485000,
    actualResaleDeedPrice: 775000,
    actualResaleDate: '2026-07-30',
    variancePct: 1.9,
    outcome: 'WIN',
    learningFactorApplied: 1.020,
    weeklyCalibrationInsight: 'NAIP aerial roof inspection flagged missing tiles on rear annex; real-world rehab came in at $42,000 vs $44,500 modeled. Proven accuracy reinforces weekly computer vision reliability.',
  },
  {
    saleId: 'sgs-fl-orange-2026-ca-007892',
    address: '1205 S Bumby Ave',
    county: 'Orange County, FL',
    auctionDate: '2026-06-12',
    predictedArv: 540000,
    predictedMaxBid: 345000,
    actualWinningBid: 338000,
    actualResaleDeedPrice: 532000,
    actualResaleDate: '2026-07-18',
    variancePct: -1.4,
    outcome: 'WIN',
    learningFactorApplied: 1.015,
    weeklyCalibrationInsight: '10-day objection period under Fla. Stat. § 45.031 passed without third-party intervention. Certificate of Title issued on day 11. Model verified fast-track Florida foreclosure turnover.',
  },
];

export function computeOutcomesStats(entries: OutcomesLedgerEntry[] = INITIAL_HISTORICAL_OUTCOMES): OutcomesLedgerStats {
  const total = entries.length;
  if (total === 0) {
    return {
      totalRecordedSales: 0,
      overallWinRatePct: 0,
      meanAbsoluteArvErrorPct: 0,
      meanAbsoluteBidVariancePct: 0,
      activeWeeklyCalibrationFactor: 1.0,
      compoundLearningRounds: 0,
      countyCalibrationFactors: {},
    };
  }

  const wins = entries.filter((e) => e.outcome === 'WIN').length;
  const totalArvError = entries.reduce((acc, curr) => acc + Math.abs(curr.variancePct), 0);
  const totalBidVariance = entries.reduce((acc, curr) => {
    const diff = Math.abs(curr.actualWinningBid - curr.predictedMaxBid) / curr.predictedMaxBid;
    return acc + diff * 100;
  }, 0);

  const countyFactors: Record<string, { total: number; count: number }> = {};
  for (const item of entries) {
    if (!countyFactors[item.county]) {
      countyFactors[item.county] = { total: 0, count: 0 };
    }
    countyFactors[item.county].total += item.learningFactorApplied;
    countyFactors[item.county].count += 1;
  }

  const countyCalibrationFactors: Record<string, number> = {};
  for (const [county, data] of Object.entries(countyFactors)) {
    countyCalibrationFactors[county] = Number((data.total / data.count).toFixed(3));
  }

  const avgLearningFactor = entries.reduce((acc, curr) => acc + curr.learningFactorApplied, 0) / total;

  return {
    totalRecordedSales: total,
    overallWinRatePct: Number(((wins / total) * 100).toFixed(1)),
    meanAbsoluteArvErrorPct: Number((totalArvError / total).toFixed(2)),
    meanAbsoluteBidVariancePct: Number((totalBidVariance / total).toFixed(2)),
    activeWeeklyCalibrationFactor: Number(avgLearningFactor.toFixed(3)),
    compoundLearningRounds: total * 4, // 4 learning passes per deal (Legal, Open Data, Imagery, Underwriting)
    countyCalibrationFactors,
  };
}
