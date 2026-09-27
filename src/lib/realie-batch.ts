/**
 * Pure helpers for minimizing Realie calls. Keeping the grouping and matching
 * logic free of database/network dependencies makes the credit-saving rules
 * deterministic and unit-testable.
 */

export type RealieBatchRequest = {
  parcel_id: string;
  apn?: string | null;
  address: string;
  city?: string | null;
  state: string;
  zip?: string | null;
  county?: string | null;
  county_fips?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type RealiePropertyLike = {
  parcelId?: string | null;
  address?: string | null;
  addressFull?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: unknown;
};

export type RealieLocationBatch<T extends RealieBatchRequest = RealieBatchRequest> = {
  requests: T[];
  latitude: number;
  longitude: number;
  radius: number;
};

const ADDRESS_TOKEN_MAP: Record<string, string> = {
  STREET: "ST",
  AVENUE: "AVE",
  BOULEVARD: "BLVD",
  ROAD: "RD",
  DRIVE: "DR",
  LANE: "LN",
  COURT: "CT",
  CIRCLE: "CIR",
  HIGHWAY: "HWY",
  PARKWAY: "PKWY",
  PLACE: "PL",
  TERRACE: "TER",
  NORTH: "N",
  SOUTH: "S",
  EAST: "E",
  WEST: "W",
  APARTMENT: "APT",
  SUITE: "STE",
};

function normalizedTokens(value: string): string[] {
  const tokens = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/#/g, " APT ")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ADDRESS_TOKEN_MAP[token] ?? token);
  return tokens.filter((token, index) => token !== tokens[index - 1]);
}

/**
 * Canonical FIPS to Realie-recognized county names.
 * Realie requires standard county names (e.g. "Cook", "Los Angeles", "New York").
 * Passing metropolitan suffixes or data-source tags like "Chicago (Cook)" or "New York (PLUTO)"
 * results in HTTP 404 from Realie's property address endpoint.
 */
export const FIPS_TO_COUNTY: Record<string, { state: string; county: string }> = {
  // Cook County, IL (Primary focus metro)
  "17031": { state: "IL", county: "Cook" },
  // California
  "06037": { state: "CA", county: "Los Angeles" },
  "06075": { state: "CA", county: "San Francisco" },
  "06073": { state: "CA", county: "San Diego" },
  "06059": { state: "CA", county: "Orange" },
  "06065": { state: "CA", county: "Riverside" },
  "06071": { state: "CA", county: "San Bernardino" },
  "06085": { state: "CA", county: "Santa Clara" },
  "06001": { state: "CA", county: "Alameda" },
  // New York (NYC Boroughs & Key Counties)
  "36061": { state: "NY", county: "New York" },
  "36005": { state: "NY", county: "Bronx" },
  "36047": { state: "NY", county: "Kings" },
  "36081": { state: "NY", county: "Queens" },
  "36085": { state: "NY", county: "Richmond" },
  "36119": { state: "NY", county: "Westchester" },
  "36059": { state: "NY", county: "Nassau" },
  "36103": { state: "NY", county: "Suffolk" },
  // Florida
  "12086": { state: "FL", county: "Miami-Dade" },
  "12011": { state: "FL", county: "Broward" },
  "12095": { state: "FL", county: "Orange" },
  "12057": { state: "FL", county: "Hillsborough" },
  "12099": { state: "FL", county: "Palm Beach" },
  "12031": { state: "FL", county: "Duval" },
  "12103": { state: "FL", county: "Pinellas" },
  // Texas
  "48201": { state: "TX", county: "Harris" },
  "48113": { state: "TX", county: "Dallas" },
  "48453": { state: "TX", county: "Travis" },
  "48439": { state: "TX", county: "Tarrant" },
  "48029": { state: "TX", county: "Bexar" },
  // Ohio
  "39035": { state: "OH", county: "Cuyahoga" },
  "39049": { state: "OH", county: "Franklin" },
  "39061": { state: "OH", county: "Hamilton" },
  // Arizona, Nevada, Washington, Georgia, Pennsylvania, Michigan, Colorado, North Carolina
  "04013": { state: "AZ", county: "Maricopa" },
  "32003": { state: "NV", county: "Clark" },
  "53033": { state: "WA", county: "King" },
  "13121": { state: "GA", county: "Fulton" },
  "42101": { state: "PA", county: "Philadelphia" },
  "26163": { state: "MI", county: "Wayne" },
  "08031": { state: "CO", county: "Denver" },
  "37119": { state: "NC", county: "Mecklenburg" },
  "25025": { state: "MA", county: "Suffolk" },
  "27053": { state: "MN", county: "Hennepin" },
  "29510": { state: "MO", county: "St. Louis City" },
  "47157": { state: "TN", county: "Shelby" },
};

export function fipsToRealieCounty(
  fips: string | null | undefined,
): { state: string; county: string } | undefined {
  if (!fips) return undefined;
  const cleanFips = String(fips).trim().padStart(5, "0");
  return FIPS_TO_COUNTY[cleanFips];
}

const NYC_BOROUGH_MAP: Record<string, string> = {
  MANHATTAN: "New York",
  BROOKLYN: "Kings",
  QUEENS: "Queens",
  BRONX: "Bronx",
  "STATEN ISLAND": "Richmond",
};

/**
 * Strips display decorations, administrative tags, and parentheticals to yield
 * the clean county name that Realie API accepts without 404ing.
 *
 * Examples:
 *   "Chicago (Cook)"       -> "Cook"
 *   "New York (PLUTO)"     -> "New York"
 *   "NYC · Manhattan"      -> "New York"
 *   "NYC · Brooklyn"       -> "Kings"
 *   "Los Angeles County"   -> "Los Angeles"
 *   "Miami-Dade County"    -> "Miami-Dade"
 *   "Cook"                 -> "Cook"
 */
export function cleanRealieCounty(
  county: string | null | undefined,
  fips?: string | null | undefined,
): string | undefined {
  if (fips) {
    const fromFips = fipsToRealieCounty(fips);
    if (fromFips) return fromFips.county;
  }
  if (!county) return undefined;

  let str = county.trim();
  if (!str) return undefined;

  // Handle "NYC · Manhattan" format
  if (str.includes("·") || str.includes("- NYC")) {
    const parts = str.split(/[·-]/).map((p) => p.trim().toUpperCase());
    for (const part of parts) {
      if (NYC_BOROUGH_MAP[part]) return NYC_BOROUGH_MAP[part];
    }
  }

  // Handle parenthetical format like "Chicago (Cook)" or "New York (PLUTO)"
  const parenMatch = str.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const outer = parenMatch[1].trim();
    const inner = parenMatch[2].trim();
    if (/^[A-Za-z\s-]+$/.test(inner) && !/^(PLUTO|GIS|TAX|ACRIS|PARCEL)$/i.test(inner)) {
      str = inner;
    } else {
      str = outer;
    }
  }

  // Strip trailing "County", "Parish", "Borough", "City and County"
  str = str
    .replace(/\s+(County|Parish|Borough|City and County)$/i, "")
    .trim();

  // Check if it's an NYC borough name directly
  const upper = str.toUpperCase();
  if (NYC_BOROUGH_MAP[upper]) {
    return NYC_BOROUGH_MAP[upper];
  }

  return str || undefined;
}

export function normalizeRealieAddress(value: string | null | undefined): string {
  return value ? normalizedTokens(value).join(" ") : "";
}

export function normalizeRealieApn(value: string | null | undefined): string {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/** Stable key shared by the negative cache and exact-lookup de-duplication. */
export function realieLookupKey(
  input: Pick<RealieBatchRequest, "address" | "state"> &
    Partial<Pick<RealieBatchRequest, "city" | "county">> & {
      unit?: string | null;
      county_fips?: string | null;
    },
): string {
  const resolvedCounty = cleanRealieCounty(input.county, input.county_fips);
  return [
    normalizeRealieAddress(input.address),
    normalizeRealieAddress(input.unit),
    normalizeRealieAddress(input.city),
    normalizeRealieAddress(resolvedCounty ?? input.county),
    String(input.state ?? "")
      .trim()
      .toUpperCase(),
  ].join("|");
}

export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusMiles = 3958.8;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Greedily builds tight geographic clusters. Singleton clusters are omitted:
 * paying for a radius search for one parcel can only be equal to or more
 * expensive than its exact-address lookup.
 */
export function buildRealieLocationBatches<T extends RealieBatchRequest>(
  requests: T[],
  options: { maxRadiusMiles?: number; maxRequests?: number; minRequests?: number } = {},
): RealieLocationBatch<T>[] {
  const maxRadius = Math.min(Math.max(options.maxRadiusMiles ?? 0.2, 0.05), 1.95);
  const maxRequests = Math.min(Math.max(Math.floor(options.maxRequests ?? 100), 2), 100);
  const minRequests = Math.max(Math.floor(options.minRequests ?? 2), 2);
  const pending = requests
    .filter(
      (request) => Number.isFinite(Number(request.lat)) && Number.isFinite(Number(request.lng)),
    )
    .sort((a, b) => a.parcel_id.localeCompare(b.parcel_id));
  const batches: RealieLocationBatch<T>[] = [];

  while (pending.length) {
    const seed = pending.shift()!;
    const cluster = [seed];

    for (let index = 0; index < pending.length && cluster.length < maxRequests;) {
      const candidate = pending[index];
      const tentative = [...cluster, candidate];
      const latitude =
        tentative.reduce((sum, request) => sum + Number(request.lat), 0) / tentative.length;
      const longitude =
        tentative.reduce((sum, request) => sum + Number(request.lng), 0) / tentative.length;
      const fits = tentative.every(
        (request) =>
          distanceMiles(latitude, longitude, Number(request.lat), Number(request.lng)) <= maxRadius,
      );
      if (fits) {
        cluster.push(candidate);
        pending.splice(index, 1);
      } else {
        index += 1;
      }
    }

    if (cluster.length < minRequests) continue;
    const latitude =
      cluster.reduce((sum, request) => sum + Number(request.lat), 0) / cluster.length;
    const longitude =
      cluster.reduce((sum, request) => sum + Number(request.lng), 0) / cluster.length;
    const furthest = Math.max(
      ...cluster.map((request) =>
        distanceMiles(latitude, longitude, Number(request.lat), Number(request.lng)),
      ),
    );
    batches.push({
      requests: cluster,
      latitude,
      longitude,
      radius: Math.min(1.99, Math.max(0.05, furthest + 0.025)),
    });
  }

  return batches;
}

function propertyAddressKeys(property: RealiePropertyLike): string[] {
  const keys = new Set<string>();
  if (property.address) keys.add(normalizeRealieAddress(property.address));
  if (property.addressFull) {
    keys.add(normalizeRealieAddress(property.addressFull));
    const streetPart = property.addressFull.split(",", 1)[0];
    if (streetPart) keys.add(normalizeRealieAddress(streetPart));
  }
  keys.delete("");
  return [...keys];
}

function matchScore(request: RealieBatchRequest, property: RealiePropertyLike): number {
  const requestApn = normalizeRealieApn(request.apn);
  const propertyApn = normalizeRealieApn(property.parcelId);
  if (requestApn && propertyApn && requestApn === propertyApn) return 100;

  const requestAddress = normalizeRealieAddress(request.address);
  if (!requestAddress || !propertyAddressKeys(property).includes(requestAddress)) return 0;

  const requestState = String(request.state ?? "")
    .trim()
    .toUpperCase();
  const propertyState = String(property.state ?? "")
    .trim()
    .toUpperCase();
  if (requestState && propertyState && requestState !== propertyState) return 0;

  const requestCity = normalizeRealieAddress(request.city);
  const propertyCity = normalizeRealieAddress(property.city);
  if (requestCity && propertyCity && requestCity !== propertyCity) return 0;

  const requestZip = String(request.zip ?? "")
    .replace(/\D/g, "")
    .slice(0, 5);
  const propertyZip = String(property.zipCode ?? "")
    .replace(/\D/g, "")
    .slice(0, 5);
  if (requestZip && propertyZip && requestZip !== propertyZip) return 0;

  return (
    60 +
    (requestState && propertyState ? 10 : 0) +
    (requestCity && propertyCity ? 10 : 0) +
    (requestZip && propertyZip ? 10 : 0)
  );
}

/**
 * Deterministically performs a one-to-one match, preferring APN and then an
 * exact normalized street/city/state/ZIP match. Fuzzy matches are deliberately
 * excluded because attaching a neighbor's facts is worse than a cache miss.
 */
export function matchRealieProperties<T extends RealiePropertyLike>(
  requests: RealieBatchRequest[],
  properties: T[],
): Map<string, T> {
  const matched = new Map<string, T>();
  const used = new Set<number>();

  for (const request of [...requests].sort((a, b) => a.parcel_id.localeCompare(b.parcel_id))) {
    const candidates = properties
      .map((property, index) => ({ property, index, score: matchScore(request, property) }))
      .filter((candidate) => candidate.score > 0 && !used.has(candidate.index))
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        const aKey = `${normalizeRealieApn(a.property.parcelId)}|${normalizeRealieAddress(a.property.addressFull ?? a.property.address)}`;
        const bKey = `${normalizeRealieApn(b.property.parcelId)}|${normalizeRealieAddress(b.property.addressFull ?? b.property.address)}`;
        return aKey.localeCompare(bKey);
      });
    const best = candidates[0];
    if (!best) continue;
    used.add(best.index);
    matched.set(request.parcel_id, best.property);
  }

  return matched;
}
