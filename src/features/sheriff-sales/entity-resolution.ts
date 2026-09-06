// Hack 3: Entity Resolution Engine
// De-anonymizes corporate securitization trusts, REO entities, and shell LLCs
// Maps foreclosing plaintiff prose into actual beneficial private equity sponsors, master servicers, and counsel.

import type { EntityResolution } from './types';

export const KNOWN_ENTITY_MAPPINGS: Record<string, { beneficialOwner: string; servicer: string; counsel: string; contact: string }> = {
  LSF9: {
    beneficialOwner: 'Lone Star Funds / Hudson Advisors LP (Dallas, TX)',
    servicer: 'Caliber Home Loans / Newrez LLC',
    counsel: 'Fein, Such, Kahn & Shepard, P.C. (Parsippany, NJ)',
    contact: '(973) 538-4700 / foreclosure@feinsuch.com',
  },
  MEB: {
    beneficialOwner: 'PIMCO / Bravo Tactical Opportunity Fund',
    servicer: 'Specialized Loan Servicing LLC (SLS) / Computershare',
    counsel: 'McCabe, Weisberg & Conway, LLC (Marlton, NJ)',
    contact: '(856) 810-7001 / njpleadings@mwc-law.com',
  },
  GSAMP: {
    beneficialOwner: 'Goldman Sachs Mortgage Co / Alternative Assets',
    servicer: 'PHH Mortgage Corporation / Onity Group',
    counsel: 'KML Law Group, P.C. (Mount Laurel, NJ)',
    contact: '(856) 651-3000 / pleadings@kmllawgroup.com',
  },
  TOWD_POINT: {
    beneficialOwner: 'Cerberus Capital Management LP (New York, NY)',
    servicer: 'Select Portfolio Servicing, Inc. (SPS - Salt Lake City, UT)',
    counsel: 'Stern & Eisenberg, PC (Cherry Hill, NJ)',
    contact: '(856) 667-5400 / serviceNJ@sterneisenberg.com',
  },
  CHRISTIANA: {
    beneficialOwner: 'Pretium Residential Credit Fund / Pretium Partners',
    servicer: 'Selene Finance LP (Dallas, TX)',
    counsel: 'Robertson, Anschutz, Schneid, Crane & Partners, PLLC',
    contact: '(561) 241-6901 / mail@raslg.com',
  },
  MR_COOPER: {
    beneficialOwner: 'Mr. Cooper Group Inc. (NASDAQ: COOP)',
    servicer: 'Mr. Cooper / Nationstar Mortgage',
    counsel: 'Brock & Scott, PLLC (Marlton, NJ)',
    contact: '(844) 856-6646 / efilingnj@brockandscott.com',
  },
};

/**
 * Resolves a raw legal notice plaintiff text into its true beneficial corporate owner and servicer
 */
export function resolveEntityFromLegalProse(rawPlaintiff: string): EntityResolution {
  const upper = rawPlaintiff.toUpperCase();

  if (upper.includes('LSF9') || upper.includes('VOLT') || upper.includes('HUDSON ADVISORS')) {
    const map = KNOWN_ENTITY_MAPPINGS.LSF9;
    return {
      rawEntityName: rawPlaintiff,
      trueBeneficialOwner: map.beneficialOwner,
      loanServicer: map.servicer,
      plaintiffCounselFirm: map.counsel,
      foreclosureCounselContact: map.contact,
    };
  }

  if (upper.includes('TOWD POINT') || upper.includes('CERBERUS') || upper.includes('SPS')) {
    const map = KNOWN_ENTITY_MAPPINGS.TOWD_POINT;
    return {
      rawEntityName: rawPlaintiff,
      trueBeneficialOwner: map.beneficialOwner,
      loanServicer: map.servicer,
      plaintiffCounselFirm: map.counsel,
      foreclosureCounselContact: map.contact,
    };
  }

  if (upper.includes('GSAMP') || upper.includes('GOLDMAN') || upper.includes('PHH')) {
    const map = KNOWN_ENTITY_MAPPINGS.GSAMP;
    return {
      rawEntityName: rawPlaintiff,
      trueBeneficialOwner: map.beneficialOwner,
      loanServicer: map.servicer,
      plaintiffCounselFirm: map.counsel,
      foreclosureCounselContact: map.contact,
    };
  }

  if (upper.includes('CHRISTIANA') || upper.includes('WILMINGTON SAVINGS') || upper.includes('SELENE')) {
    const map = KNOWN_ENTITY_MAPPINGS.CHRISTIANA;
    return {
      rawEntityName: rawPlaintiff,
      trueBeneficialOwner: map.beneficialOwner,
      loanServicer: map.servicer,
      plaintiffCounselFirm: map.counsel,
      foreclosureCounselContact: map.contact,
    };
  }

  if (upper.includes('MR. COOPER') || upper.includes('NATIONSTAR')) {
    const map = KNOWN_ENTITY_MAPPINGS.MR_COOPER;
    return {
      rawEntityName: rawPlaintiff,
      trueBeneficialOwner: map.beneficialOwner,
      loanServicer: map.servicer,
      plaintiffCounselFirm: map.counsel,
      foreclosureCounselContact: map.contact,
    };
  }

  return {
    rawEntityName: rawPlaintiff,
    trueBeneficialOwner: 'Institutional Mortgage Securitization Trust',
    loanServicer: 'Master Servicer Assigned per Pool & Servicing Agreement (PSA)',
    plaintiffCounselFirm: 'Designated New Jersey Chancery Foreclosure Counsel',
    foreclosureCounselContact: 'Counsel of Record on Superior Court Docket',
  };
}
