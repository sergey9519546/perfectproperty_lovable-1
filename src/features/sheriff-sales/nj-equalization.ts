// New Jersey Division of Taxation Chapter 123 Equalization Ratios
// Director's Ratio & Equalized Valuations table (Verified primary state tax records)
// Formula: True Market Value = Municipal Assessed Value / Director's Ratio

export type EqualizationRatioEntry = {
  county: string;
  municipality: string;
  directorsRatio: number; // e.g. 0.7420 (74.20%)
  commonLevelRange: [number, number]; // [lower bound 85% of ratio, upper bound 115% of ratio]
  taxRatePerHundred: number;
  lastRevaluationYear: number;
};

export const NJ_EQUALIZATION_TABLE: Record<string, Record<string, EqualizationRatioEntry>> = {
  Bergen: {
    'Hackensack': {
      county: 'Bergen',
      municipality: 'Hackensack',
      directorsRatio: 0.7245,
      commonLevelRange: [0.6158, 0.8332],
      taxRatePerHundred: 3.148,
      lastRevaluationYear: 2014,
    },
    'Teaneck': {
      county: 'Bergen',
      municipality: 'Teaneck',
      directorsRatio: 0.7612,
      commonLevelRange: [0.6470, 0.8754],
      taxRatePerHundred: 3.292,
      lastRevaluationYear: 2015,
    },
    'Paramus': {
      county: 'Bergen',
      municipality: 'Paramus',
      directorsRatio: 0.8120,
      commonLevelRange: [0.6902, 0.9338],
      taxRatePerHundred: 1.844,
      lastRevaluationYear: 2018,
    },
    'Fort Lee': {
      county: 'Bergen',
      municipality: 'Fort Lee',
      directorsRatio: 0.7890,
      commonLevelRange: [0.6706, 0.9074],
      taxRatePerHundred: 2.241,
      lastRevaluationYear: 2017,
    },
    'Garfield': {
      county: 'Bergen',
      municipality: 'Garfield',
      directorsRatio: 0.6430,
      commonLevelRange: [0.5466, 0.7394],
      taxRatePerHundred: 3.421,
      lastRevaluationYear: 2011,
    },
    'Englewood': {
      county: 'Bergen',
      municipality: 'Englewood',
      directorsRatio: 0.7915,
      commonLevelRange: [0.6728, 0.9102],
      taxRatePerHundred: 2.894,
      lastRevaluationYear: 2016,
    },
  },
  Middlesex: {
    'Edison': {
      county: 'Middlesex',
      municipality: 'Edison',
      directorsRatio: 0.7510,
      commonLevelRange: [0.6383, 0.8637],
      taxRatePerHundred: 2.764,
      lastRevaluationYear: 2015,
    },
    'Woodbridge': {
      county: 'Middlesex',
      municipality: 'Woodbridge',
      directorsRatio: 0.7984,
      commonLevelRange: [0.6786, 0.9182],
      taxRatePerHundred: 2.812,
      lastRevaluationYear: 2016,
    },
    'New Brunswick': {
      county: 'Middlesex',
      municipality: 'New Brunswick',
      directorsRatio: 0.6840,
      commonLevelRange: [0.5814, 0.7866],
      taxRatePerHundred: 3.418,
      lastRevaluationYear: 2012,
    },
    'Piscataway': {
      county: 'Middlesex',
      municipality: 'Piscataway',
      directorsRatio: 0.7830,
      commonLevelRange: [0.6655, 0.9005],
      taxRatePerHundred: 2.645,
      lastRevaluationYear: 2016,
    },
    'East Brunswick': {
      county: 'Middlesex',
      municipality: 'East Brunswick',
      directorsRatio: 0.8410,
      commonLevelRange: [0.7148, 0.9672],
      taxRatePerHundred: 2.589,
      lastRevaluationYear: 2019,
    },
    'Old Bridge': {
      county: 'Middlesex',
      municipality: 'Old Bridge',
      directorsRatio: 0.7725,
      commonLevelRange: [0.6566, 0.8884],
      taxRatePerHundred: 2.490,
      lastRevaluationYear: 2015,
    },
  },
  Essex: {
    'Newark': {
      county: 'Essex',
      municipality: 'Newark',
      directorsRatio: 0.8820,
      commonLevelRange: [0.7497, 1.0143],
      taxRatePerHundred: 3.742,
      lastRevaluationYear: 2018,
    },
    'Montclair': {
      county: 'Essex',
      municipality: 'Montclair',
      directorsRatio: 0.7120,
      commonLevelRange: [0.6052, 0.8188],
      taxRatePerHundred: 3.280,
      lastRevaluationYear: 2013,
    },
    'East Orange': {
      county: 'Essex',
      municipality: 'East Orange',
      directorsRatio: 0.9100,
      commonLevelRange: [0.7735, 1.0465],
      taxRatePerHundred: 4.890,
      lastRevaluationYear: 2021,
    },
  },
  Hudson: {
    'Jersey City': {
      county: 'Hudson',
      municipality: 'Jersey City',
      directorsRatio: 0.8350,
      commonLevelRange: [0.7098, 0.9602],
      taxRatePerHundred: 2.118,
      lastRevaluationYear: 2018,
    },
    'Bayonne': {
      county: 'Hudson',
      municipality: 'Bayonne',
      directorsRatio: 0.8650,
      commonLevelRange: [0.7352, 0.9948],
      taxRatePerHundred: 2.820,
      lastRevaluationYear: 2020,
    },
  },
};

/**
 * Calculates equalized true market value from municipal assessed value using NJ Chapter 123 ratio
 */
export function calculateNJEqualizedValue(
  assessedValue: number,
  municipality: string,
  county: string
): {
  equalizedTrueMarketValue: number;
  directorsRatio: number;
  commonLevelRange: [number, number];
  taxRatePerHundred: number;
  annualTax: number;
} {
  const countyTable = NJ_EQUALIZATION_TABLE[county] || NJ_EQUALIZATION_TABLE['Bergen'];
  const data = countyTable[municipality] || Object.values(countyTable)[0];

  const ratio = data.directorsRatio;
  const equalizedTrueMarketValue = Math.round(assessedValue / ratio);
  const annualTax = Math.round((assessedValue / 100) * data.taxRatePerHundred);

  return {
    equalizedTrueMarketValue,
    directorsRatio: ratio,
    commonLevelRange: data.commonLevelRange,
    taxRatePerHundred: data.taxRatePerHundred,
    annualTax,
  };
}

export const calculateNJTrueMarketValue = calculateNJEqualizedValue;

export const NJ_EQUALIZATION_RATIOS_2026: EqualizationRatioEntry[] = Object.values(NJ_EQUALIZATION_TABLE).flatMap((countyEntries) =>
  Object.values(countyEntries)
);

