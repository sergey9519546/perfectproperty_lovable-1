// Hack 8: Assisted Lien Check Engine
// Analyzes encumbrances according to state lien priority statutes (e.g., N.J.S.A. 46:9-8; 42 Pa.C.S. § 8152)
// Identifies which liens SURVIVE sheriff sale vs which liens are EXTINGUISHED.

import type { AssistedLienCheck, JurisdictionState } from './types';

export function calculateLienSeniorityWaterfall(
  waterfall: AssistedLienCheck['waterfall'],
  modeledArv: number,
  modeledRehab: number,
  jurisdiction: JurisdictionState
): {
  survivingLiens: AssistedLienCheck['waterfall'];
  extinguishedLiens: AssistedLienCheck['waterfall'];
  totalSurvivingDebt: number;
  safeMaxBid: number;
  statutoryWarning: string;
} {
  const survivingLiens = waterfall.filter((item) => item.survivesSale);
  const extinguishedLiens = waterfall.filter((item) => !item.survivesSale);

  const totalSurvivingDebt = survivingLiens.reduce((acc, item) => acc + item.currentBalance, 0);

  // Standard 70% rule minus rehab minus required surviving debt
  const baseTarget = modeledArv * 0.70 - modeledRehab;
  const safeMaxBid = Math.max(0, Math.round(baseTarget - totalSurvivingDebt));

  const statutoryWarning =
    jurisdiction === 'NJ'
      ? 'In NJ (N.J.S.A. 54:5-1 et seq.), municipal tax, water, and sewer liens are prior to all mortgages and survive sheriff sale. Junior mortgages and judgment liens properly joined as defendants are extinguished.'
      : jurisdiction === 'PA'
      ? 'In PA (42 Pa.C.S. § 8152), judicial sales discharge junior liens. Municipal taxes and prior purchase money mortgages of first record survive.'
      : 'Federal and local real estate ad valorem taxes take senior priority by operation of law.';

  return {
    survivingLiens,
    extinguishedLiens,
    totalSurvivingDebt,
    safeMaxBid,
    statutoryWarning,
  };
}
