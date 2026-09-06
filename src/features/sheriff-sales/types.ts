export type SaleType =
  | 'sheriff_foreclosure'
  | 'tax_deed'
  | 'government_surplus'
  | 'us_marshal';

export type JurisdictionState = 'NJ' | 'PA' | 'OH' | 'FL' | 'TX' | 'CA';

export type StatutoryRedemptionInfo = {
  periodDays: number;
  rule: string;
  citation: string;
  equityProtectionNote: string;
};

export type SeniorLienExposure = {
  delinquentPropertyTaxes: number;
  municipalAssessments: number;
  codeEnforcementFines: number;
  seniorMortgageStatus: 'FORECLOSING_SENIOR' | 'SURVIVING_SENIOR' | 'NONE';
  survivingSeniorAmount: number;
  totalSeniorBurden: number;
  notes: string;
};

export type LegalProseExtraction = {
  rawNoticeText: string;
  plaintiff: string;
  defendant: string;
  caseNumber: string;
  courtDocket: string;
  statute: string;
  writExecutionDate: string;
  finalJudgmentAmount: number;
  statutoryRedemption: StatutoryRedemptionInfo;
  seniorLiens: SeniorLienExposure;
  titleCloudRisk: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type OpenDataAttributes = {
  apn: string;
  countyAppraiserMarketValue: number;
  countyAssessedValue: number;
  annualAdValoremTax: number;
  delinquentTaxYears: number[];
  delinquentTaxTotal: number;
  lastDeedDate: string;
  lastDeedPrice: number;
  deedBookPage: string;
  zoningCode: string;
  zoningDescription: string;
  legalLotDescription: string;
  floodZone: string;
  openDataLicense: string;
  primaryPortalUrl: string;
};

export type OpenImageryAnalysis = {
  aerialSource: string; // e.g. "USDA NAIP 1.0m Multi-Spectral Aerial Ortho"
  imageryDate: string; // e.g. "August 2026 / 2026 Flyover"
  resolutionMeters: number;
  roofWearScore: number; // 0 - 100
  roofType: string;
  structuralIntegrityRating: 'EXCELLENT' | 'MODERATE' | 'SEVERE_DEFERRED_MAINTENANCE';
  lotAccessStatus: 'DEDICATED_PUBLIC_ROAD' | 'PRIVATE_EASEMENT' | 'LANDLOCKED_FLAG';
  imageryObservations: string[];
};

export type NJEqualizationData = {
  municipality: string;
  county: string;
  directorsRatio: number; // e.g. 0.784 (78.4%)
  commonLevelRange: [number, number]; // [lower, upper]
  equalizedTrueMarketValue: number;
  taxRatePerHundred: number;
};

export type EntityResolution = {
  rawEntityName: string;
  trueBeneficialOwner: string;
  loanServicer: string;
  plaintiffCounselFirm: string;
  foreclosureCounselContact: string;
};

export type DailyStatusCapture = {
  currentStatus:
    | 'ACTIVE_SCHEDULED'
    | 'ADJOURNED_PLAINTIFF'
    | 'ADJOURNED_DEFENDANT_STATUTORY'
    | 'BANKRUPTCY_STAY'
    | 'SETTLED_REDEEMED'
    | 'SOLD_THIRD_PARTY'
    | 'SOLD_PLAINTIFF_REO';
  lastStatusCheck: string;
  statutoryAdjournmentCount: number; // e.g. NJ 2x 30-day statutory adjournments
  adjournmentHistory: Array<{ date: string; requestedBy: string; reason: string }>;
  bankruptcyDocketNumber?: string;
  bankruptcyChapter?: '7' | '13' | '11';
  bankruptcyStayActive: boolean;
};

export type CompsAndMarginPanel = {
  recentComps: Array<{
    address: string;
    saleDate: string;
    salePrice: number;
    sqft: number;
    pricePerSqft: number;
    distanceMiles: number;
    condition: string;
  }>;
  submarketMedianPpsf: number;
  modeledRehabTier: 'LIGHT_COSMETIC' | 'MEDIUM_UPDATE' | 'HEAVY_MECHANICAL' | 'GUT_REHAB';
  modeledRehabEstimate: number;
  holdingAndCarryingCosts: number;
  maximumAllowableBid: number; // MAB formula: ARV * 0.70 - Rehab - Holding
  netSpreadDollars: number;
  netMarginPercent: number;
};

export type FlipScoreAndEndGamePanel = {
  flipScore: number; // 0 - 100
  estimatedTurnaroundDays: number;
  fixAndFlipIrr: number;
  brrrrRentalYield: number;
  wholetailMargin: number;
  recommendedExitStrategy: 'FIX_AND_FLIP' | 'BRRRR_RENTAL' | 'WHOLETAIL_DISPOSITION' | 'NOTE_TAKEOUT';
  sensitivityMatrix: Array<{
    discountPct: number;
    purchaseBid: number;
    projectedRoi: number;
  }>;
};

export type ResaleDemandMeterPanel = {
  submarketAbsorptionRateMonths: number;
  averageDaysOnMarket: number;
  buyerLiquidityIndex: number; // 0 - 100
  schoolDistrictRating: number; // 1 - 10
  demandVerdict: 'EXTREME_SELLER_MARKET' | 'BALANCED_STABLE' | 'BUYER_MARKET_CAUTION';
};

export type TheCatchPanel = {
  seniorSurvivingLiens: Array<{
    type: string;
    holder: string;
    amount: number;
    survivesSale: boolean;
    legalBasis: string;
  }>;
  municipalTaxCertificate: {
    hasCertificate: boolean;
    certificateNumber?: string;
    redemptionAmount?: number;
  };
  codeViolations: Array<{
    violationType: string;
    fineAmount: number;
    openDate: string;
  }>;
  irsRedemptionPeriodDays: number; // 120 days under 26 U.S.C. § 7425
  occupancyStatus:
    | 'VACANT_CONFIRMED'
    | 'OWNER_OCCUPIED_EVICTION_REQ'
    | 'TENANT_OCCUPIED_NJ_ANTI_EVICTION'
    | 'UNKNOWN';
  overallTitleCloudRisk: 'PRISTINE_INSURABLE' | 'STANDARD_FORECLOSURE_RISK' | 'HIGH_CLOUD_TITLE_HAZARD';
};

export type AssistedLienCheck = {
  waterfall: Array<{
    position: number;
    lienHolder: string;
    originalAmount: number;
    currentBalance: number;
    recordingDate: string;
    lienType:
      | 'FIRST_MORTGAGE'
      | 'SECOND_HELOC'
      | 'MUNICIPAL_TAX'
      | 'WATER_SEWER'
      | 'JUDGMENT'
      | 'IRS_TAX_LIEN'
      | 'HOA_SUPERLIEN';
    survivesSale: boolean;
    justification: string;
  }>;
  totalSurvivingDebtRequired: number;
  safeMaxBidAfterSurvivingDebt: number;
};

export type BidCard = {
  caseNumber: string;
  sheriffNumber: string;
  propertyAddress: string;
  auctionDateTime: string;
  sheriffSaleLocation: string;
  requiredDepositPercent: number; // e.g. 20% NJ, 10% PA
  requiredDepositDollars: number;
  openingBid: number;
  plaintiffUpsetLimit: number;
  ceilingBidHardStop: number;
  checklist: Array<{
    item: string;
    checked: boolean;
    warning?: string;
  }>;
};

export type RealizedMarginTracking = {
  auctionWinningBid: number;
  winningBidderType: 'THIRD_PARTY_INVESTOR' | 'PLAINTIFF_BANK';
  sheriffDeedRecordingDate: string;
  armsLengthFlipDate: string;
  armsLengthFlipPrice: number;
  grossRealizedSpread: number;
  realizedHoldDays: number;
  realizedAnnualizedIrr: number;
};

export type AIWorkforceAgentEvaluations = {
  legalProseReader: {
    agentName: string;
    verdict: string;
    titleRiskGrade: 'A' | 'B' | 'C' | 'D';
    clearedForBidding: boolean;
    statutorySummary: string;
  };
  openDataCorrelator: {
    agentName: string;
    submarketMedianArv: number;
    submarketPricePerSqft: number;
    compsAnalyzed: number;
    assessmentRatio: number;
    taxDelinquencyWarning: string | null;
  };
  openImageryInspector: {
    agentName: string;
    estimatedCurbAppealRating: number; // 1-10
    structuralRiskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    exteriorRehabMultiplier: number;
    aerialFlags: string[];
  };
  dealUnderwriter: {
    agentName: string;
    modeledArv: number;
    modeledRehabCost: number;
    holdingAndClosingCosts: number;
    minimumUpsetBid: number;
    maximumAllowableBid: number; // MAB
    expectedGrossProfit: number;
    expectedNetMarginPct: number;
    perfectScore: number; // 0 - 100
    riskTier: 'RING_1_PRIORITY' | 'RING_2_SELECTIVE' | 'CAUTION_HIGH_RISK';
    executiveSummary: string;
  };
};

export type OutcomesLedgerEntry = {
  saleId: string;
  address: string;
  county: string;
  auctionDate: string;
  predictedArv: number;
  predictedMaxBid: number;
  actualWinningBid: number;
  actualResaleDeedPrice?: number;
  actualResaleDate?: string;
  variancePct: number;
  outcome: 'WIN' | 'LOSS' | 'OUTBID' | 'SCRATCH';
  learningFactorApplied: number;
  weeklyCalibrationInsight: string;
};

export type VerificationSource = {
  statuteCitation: string;
  statuteTitle: string;
  primaryUrl: string;
  jurisdiction: string;
  verifiedMonthYear: string; // "August 2026"
  legalBasis: string;
};

export type SheriffGovSale = {
  id: string;
  caseNumber: string;
  sheriffNumber?: string;
  saleType: SaleType;
  jurisdictionState: JurisdictionState;
  county: string;
  court: string;
  auctionDate: string;
  auctionTime: string;
  auctionPlatform: string;
  auctionUrl: string;
  depositRequirement: string;
  depositPercent: number; // e.g. 20%
  parcel: {
    address: string;
    city: string;
    state: JurisdictionState;
    zip: string;
    coordinates: [number, number]; // [lng, lat]
    livingSqft: number;
    bedrooms: number;
    bathrooms: number;
    lotSizeAcres: number;
    yearBuilt: number;
    propertyType: string;
    block?: string;
    lot?: string;
  };
  legalProse: LegalProseExtraction;
  openData: OpenDataAttributes;
  openImagery: OpenImageryAnalysis;
  aiWorkforce: AIWorkforceAgentEvaluations;
  outcomesLedger: OutcomesLedgerEntry;
  verifiedAugust2026: boolean;

  // Build Sequence Modules
  njEqualization?: NJEqualizationData;
  entityResolution: EntityResolution;
  dailyStatus: DailyStatusCapture;
  compsAndMargin: CompsAndMarginPanel;
  flipScoreAndEndGame: FlipScoreAndEndGamePanel;
  resaleDemandMeter: ResaleDemandMeterPanel;
  theCatch: TheCatchPanel;
  assistedLienCheck: AssistedLienCheck;
  bidCard: BidCard;
  realizedMargin?: RealizedMarginTracking;
};

export type OpenSourceCostBreakdown = {
  publicNoticesAndDockets: { cost: number; source: string; notes: string };
  openGisAndParcels: { cost: number; source: string; notes: string };
  openAerialImagery: { cost: number; source: string; notes: string };
  serverlessHostingAndDb: { cost: number; source: string; notes: string };
  geminiFlashAiReasoning: { cost: number; source: string; notes: string };
  totalMonthlySpend: number;
};

export type CountyCoverage = {
  countyName: string;
  state: JurisdictionState;
  sourceType: 'CIVILVIEW' | 'COUNTYSUITE' | 'PDF_CRAWLER' | 'REALAUCTION' | 'TEXAS_SMART_SEARCH' | 'OPA_PORTAL';
  activeCount: number;
  adjournedCount: number;
  medianSpread: number;
  depositRule: string;
  nextAuctionDate: string;
  sheriffOfficeAddress: string;
  sheriffWebsiteUrl: string;
  verifiedAugust2026Statute: string;
};

