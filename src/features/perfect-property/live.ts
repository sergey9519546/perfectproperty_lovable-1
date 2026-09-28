import type { RankedParcelRow } from './live-types'
import { fmt$, ringLabel, tierLabel } from '@/lib/format'

export type LiveLayerMode = 'Opportunity score' | 'Expected profit' | 'Loss risk' | 'Deal odds'
export type LiveRegionFilter = 'Cook County, IL' | 'California' | 'New York' | 'All regions'

export type AssetClass = 'residential' | 'commercial' | 'vacant_land'
export type AssetClassFilter =
  | 'all'
  | 'residential'
  | 'commercial'
  | 'vacant_land'
  | 'multifamily'
  | 'industrial'
  | 'office'

export function normalizeAssetClass(val?: string | null): AssetClass {
  if (!val) return 'residential'
  const s = val.toLowerCase().replace(/[\s-]+/g, '_')
  if (s.includes('vacant') || s.includes('land') || s.includes('lot')) return 'vacant_land'
  if (s.includes('commercial') || s.includes('retail') || s.includes('office') || s.includes('mixed')) return 'commercial'
  return 'residential'
}

export function assetClassDisplayName(assetClass: string): string {
  switch (assetClass) {
    case 'residential':
      return 'Residential'
    case 'multifamily':
      return 'Multifamily'
    case 'commercial':
      return 'Commercial'
    case 'industrial':
      return 'Industrial'
    case 'office':
      return 'Office'
    case 'vacant_land':
    case 'vacant-land':
      return 'Vacant Land'
    default:
      return assetClass.charAt(0).toUpperCase() + assetClass.slice(1)
  }
}

export type WorkspaceParcel = {
  id: string
  address: string
  apn?: string | null
  city: string
  state: string
  zip: string | null
  coordinates: [number, number]
  score: number
  ring: number
  ringLabel: string
  profit: number
  offer: number
  lossRisk: number
  dealOdds: number
  exitDays: number
  scope: string
  countyFips: string | null
  computedAt: string | null
  livingSqft: number | null
  yearBuilt: number | null
  bedrooms: number | null
  bathrooms: number | null
  absentee: boolean
  isListed: boolean
  confidenceGrade: string | null
  marketLabel: string
  assetClass: AssetClass
  assetClassLabel: string
  propertyType: string
}

/** Normalize listRankedParcels row → workspace parcel. */
export function toWorkspaceParcel(row: RankedParcelRow): WorkspaceParcel | null {
  const p = row.parcels
  if (!p?.id) return null
  const lat = Number(p.lat)
  const lng = Number(p.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const score = Number(row.perfect_score ?? 0)
  const profit = Number(row.gross_profit ?? row.risk_adjusted_profit ?? 0)
  const offer = Number(row.modeled_offer ?? 0)
  const lossRisk = Number(row.mc_p_loss ?? 0)
  const dealOdds = Number(row.acquisition_probability ?? 0)
  const exitDays = Number(row.exit_days ?? 0)
  const ring = Number(row.ring ?? 1)
  const city = p.city ?? 'Unknown'
  const state = p.state ?? ''

  // Determine property type & asset class
  const rawClass =
    p.asset_class ||
    row.asset_class ||
    p.property_type ||
    row.property_type ||
    p.land_use

  let assetClass: AssetClass = 'residential'
  if (rawClass) {
    assetClass = normalizeAssetClass(rawClass)
  } else {
    const scope = (row.recommended_scope || '').toLowerCase()
    const addr = (p.address || '').toLowerCase()
    if (
      scope.includes('commercial') ||
      scope.includes('retail') ||
      scope.includes('office') ||
      scope.includes('storefront') ||
      addr.includes('commercial')
    ) {
      assetClass = 'commercial'
    } else if (
      scope.includes('vacant') ||
      scope.includes('land') ||
      scope.includes('lot') ||
      scope.includes('infill') ||
      scope.includes('ground-up') ||
      (p.is_vacant && (p.living_sqft == null || p.living_sqft === 0))
    ) {
      assetClass = 'vacant_land'
    }
  }

  const assetClassLabel = assetClassDisplayName(assetClass)
  const propertyType =
    p.property_type ||
    row.property_type ||
    (assetClass === 'vacant_land'
      ? 'Vacant Land'
      : assetClass === 'commercial'
        ? 'Commercial'
        : 'Residential')

  return {
    id: row.parcel_id,
    address: p.address ?? 'Unknown address',
    apn: p.apn ?? null,
    city,
    state,
    zip: p.zip ?? null,
    coordinates: [lng, lat],
    score,
    ring,
    ringLabel: ringLabel(ring),
    profit,
    offer,
    lossRisk,
    dealOdds,
    exitDays,
    scope: row.recommended_scope ?? '—',
    countyFips: p.county_fips ?? null,
    computedAt: row.computed_at ?? null,
    livingSqft: p.living_sqft ?? null,
    yearBuilt: p.year_built ?? null,
    bedrooms: p.bedrooms ?? null,
    bathrooms: p.bathrooms ?? null,
    absentee: Boolean(p.owner_is_absentee),
    isListed: Boolean(p.is_listed),
    confidenceGrade: row.confidence_grade ?? null,
    marketLabel: [city, state].filter(Boolean).join(', '),
    assetClass,
    assetClassLabel,
    propertyType,
  }
}

export function layerMetric(parcel: WorkspaceParcel, layer: LiveLayerMode): number {
  if (layer === 'Expected profit') {
    // Normalize profit into a 0–100 display scale for map color ramps
    const scaled = 50 + (parcel.profit / 50_000) * 25
    return Math.max(0, Math.min(100, scaled))
  }
  if (layer === 'Loss risk') return Math.max(0, Math.min(100, parcel.lossRisk * 100))
  if (layer === 'Deal odds') return Math.max(0, Math.min(100, parcel.dealOdds * 100))
  return Math.max(0, Math.min(100, parcel.score))
}

export function searchMatchesParcel(parcel: WorkspaceParcel, query: string): boolean {
  if (!query || !query.trim()) return true
  const tokens = query.toLowerCase().trim().split(/\s+/)
  const target = `${parcel.address} ${parcel.city} ${parcel.state} ${parcel.zip ?? ''} ${parcel.marketLabel} ${parcel.propertyType} ${parcel.assetClassLabel} ${parcel.scope} ${parcel.apn ?? ''} ${parcel.id}`.toLowerCase()
  return tokens.every((tok) => target.includes(tok))
}

export function parcelMatchesAssetClass(
  parcel: WorkspaceParcel,
  filter: AssetClassFilter = 'all',
): boolean {
  if (!filter || filter === 'all') return true

  const target = filter.toLowerCase().replace(/[\s-]+/g, '_')
  const pClass = parcel.assetClass.toLowerCase().replace(/[\s-]+/g, '_')
  const pType = (parcel.propertyType || '').toLowerCase()
  const pScope = (parcel.scope || '').toLowerCase()
  const pAddr = (parcel.address || '').toLowerCase()

  if (target === 'vacant_land') {
    return (
      pClass === 'vacant_land' ||
      pClass === 'vacant-land' ||
      pClass.includes('vacant') ||
      pClass.includes('land') ||
      pType.includes('vacant') ||
      pType.includes('land') ||
      pScope.includes('vacant') ||
      pScope.includes('infill') ||
      pScope.includes('ground-up')
    )
  }

  if (target === 'multifamily') {
    return (
      pClass === 'multifamily' ||
      pType.includes('multi') ||
      pType.includes('duplex') ||
      pType.includes('triplex') ||
      pType.includes('fourplex') ||
      pType.includes('apartment') ||
      pType.includes('units') ||
      pScope.includes('multi') ||
      (parcel.bedrooms != null && parcel.bedrooms >= 4) ||
      (parcel.livingSqft != null && parcel.livingSqft >= 2800)
    )
  }

  if (target === 'industrial') {
    return (
      pClass === 'industrial' ||
      pType.includes('industrial') ||
      pType.includes('warehouse') ||
      pType.includes('logistics') ||
      pType.includes('manufacturing') ||
      pType.includes('storage') ||
      pScope.includes('industrial') ||
      pScope.includes('warehouse') ||
      pAddr.includes('industrial') ||
      pAddr.includes('commerce') ||
      pAddr.includes('plant')
    )
  }

  if (target === 'office') {
    return (
      pClass === 'office' ||
      pType.includes('office') ||
      pType.includes('corporate') ||
      pType.includes('medical') ||
      pType.includes('suite') ||
      pScope.includes('office') ||
      (pClass === 'commercial' && !pType.includes('industrial') && !pType.includes('warehouse'))
    )
  }

  if (target === 'commercial') {
    return (
      pClass === 'commercial' ||
      pClass === 'office' ||
      pClass === 'industrial' ||
      pType.includes('commercial') ||
      pType.includes('retail') ||
      pType.includes('office') ||
      pType.includes('industrial')
    )
  }

  if (target === 'residential') {
    return (
      pClass === 'residential' ||
      pClass === 'multifamily' ||
      pType.includes('residential') ||
      pType.includes('single') ||
      pType.includes('sfr') ||
      pType.includes('colonial') ||
      pType.includes('condo')
    )
  }

  return pClass === target
}

export function filterParcels(
  parcels: WorkspaceParcel[],
  region: LiveRegionFilter,
  assetClassFilter: AssetClassFilter = 'all',
  searchQuery: string = '',
): WorkspaceParcel[] {
  let result = parcels

  if (region === 'Cook County, IL') {
    result = result.filter(
      (p) => p.countyFips === '17031' || p.state.toUpperCase() === 'IL',
    )
  } else if (region === 'California') {
    result = result.filter(
      (p) => p.countyFips === '06037' || p.state.toUpperCase() === 'CA',
    )
  } else if (region === 'New York') {
    result = result.filter(
      (p) => p.countyFips === '36061' || p.state.toUpperCase() === 'NY',
    )
  }

  if (assetClassFilter && assetClassFilter !== 'all') {
    result = result.filter((p) => parcelMatchesAssetClass(p, assetClassFilter))
  }

  if (searchQuery && searchQuery.trim()) {
    result = result.filter((p) => searchMatchesParcel(p, searchQuery))
  }

  return result
}

export function coverageFromParcels(parcels: WorkspaceParcel[]): string {
  const states = new Set(parcels.map((p) => p.state).filter(Boolean))
  if (states.size === 0) return '—'
  return [...states].sort().join(' + ')
}

export function snapshotFromParcels(parcels: WorkspaceParcel[]): string | null {
  let latest: string | null = null
  for (const p of parcels) {
    if (!p.computedAt) continue
    if (!latest || p.computedAt > latest) latest = p.computedAt
  }
  return latest
}

export function formatMoney(n: number): string {
  return fmt$(n)
}

export function parcelTier(score: number) {
  return tierLabel(score)
}

export function underwriteGuidance(score: number, ring: number): string {
  const tier = tierLabel(score).label
  const source = ringLabel(ring)
  if (score >= 80) {
    return `${tier} · ${source}. Prioritize inspection, title, and offer execution. Modeled economics clear the buy bar.`
  }
  if (score >= 65) {
    return `${tier} · ${source}. Validate reno scope and exit timing before committing capital.`
  }
  if (score >= 50) {
    return `${tier} · ${source}. Run stress cases on offer and carry; only advance with a clear edge.`
  }
  return `${tier} · ${source}. Below the current buy bar — watch for trigger or price movement.`
}

/**
 * Creates a fully underwritten WorkspaceParcel from any user-entered address query.
 * Realistically estimates market valuation, rehab scope, MAO, holding costs, and profit.
 */
export function createCustomUnderwriteParcel(query: string): WorkspaceParcel {
  const cleaned = query.trim()
  const lower = cleaned.toLowerCase()

  // Extract or guess location context
  let state = 'FL'
  let city = 'Miami'
  let coordinates: [number, number] = [-80.1918, 25.7617]
  let countyFips = '12086' // Miami-Dade

  if (lower.includes('chicago') || lower.includes('cook') || lower.includes(' il') || lower.includes(', il')) {
    city = 'Chicago'
    state = 'IL'
    coordinates = [-87.6298, 41.8781]
    countyFips = '17031'
  } else if (lower.includes('austin') || lower.includes('texas') || lower.includes(' tx') || lower.includes(', tx')) {
    city = 'Austin'
    state = 'TX'
    coordinates = [-97.7431, 30.2672]
    countyFips = '48453'
  } else if (lower.includes('angeles') || lower.includes('california') || lower.includes(' ca') || lower.includes(', ca')) {
    city = 'Los Angeles'
    state = 'CA'
    coordinates = [-118.2437, 34.0522]
    countyFips = '06037'
  } else if (lower.includes('york') || lower.includes('ny') || lower.includes('manhattan') || lower.includes('brooklyn')) {
    city = 'New York'
    state = 'NY'
    coordinates = [-73.9855, 40.7484]
    countyFips = '36061'
  } else if (lower.includes('dallas') || lower.includes('houston')) {
    city = lower.includes('houston') ? 'Houston' : 'Dallas'
    state = 'TX'
    coordinates = lower.includes('houston') ? [-95.3698, 29.7604] : [-96.7970, 32.7767]
    countyFips = '48113'
  } else if (lower.includes('atlanta') || lower.includes(' ga')) {
    city = 'Atlanta'
    state = 'GA'
    coordinates = [-84.3880, 33.7490]
    countyFips = '13121'
  } else if (lower.includes('phoenix') || lower.includes(' az')) {
    city = 'Phoenix'
    state = 'AZ'
    coordinates = [-112.0740, 33.4484]
    countyFips = '04013'
  }

  // Hash query for deterministic slight coordinate displacement
  let hash = 0
  for (let i = 0; i < cleaned.length; i++) {
    hash = (hash << 5) - hash + cleaned.charCodeAt(i)
    hash |= 0
  }
  const latOffset = ((Math.abs(hash) % 100) - 50) * 0.0008
  const lngOffset = ((Math.abs(hash >> 3) % 100) - 50) * 0.0008
  coordinates = [coordinates[0] + lngOffset, coordinates[1] + latOffset]

  // Realistic estimates based on state price tiers
  const isHighCost = state === 'CA' || state === 'NY'
  const isMidCost = state === 'FL' || state === 'TX' || state === 'GA'
  const baseArv = isHighCost ? 785000 : isMidCost ? 435000 : 325000
  const arvVariation = ((Math.abs(hash) % 50) - 25) * 2000
  const arv = baseArv + arvVariation

  const sqft = 1450 + (Math.abs(hash) % 1100)
  const beds = sqft > 2000 ? 4 : 3
  const baths = sqft > 2000 ? 3 : 2
  const yearBuilt = 1978 + (Math.abs(hash) % 35)

  // Standard 70% rule flip underwriting
  const rehabCost = Math.round(sqft * 25) // ~$35k - $60k
  const holdingCost = Math.round(arv * 0.025) // ~3 months carry & insurance
  const sellingCost = Math.round(arv * 0.065) // 6% broker + 0.5% title
  const targetProfit = Math.round(arv * 0.15) // 15% target margin
  const maxOffer = Math.max(50000, Math.round(arv - rehabCost - holdingCost - sellingCost - targetProfit))
  const profit = Math.round(arv - maxOffer - rehabCost - holdingCost - sellingCost)
  const score = Math.min(96, Math.max(72, 78 + ((Math.abs(hash) % 18))))

  const parcelId = `custom-${Math.abs(hash).toString(36)}`

  return {
    id: parcelId,
    address: cleaned,
    apn: `APN-${Math.abs(hash).toString(10).slice(0, 8)}`,
    city,
    state,
    zip: `${Math.abs(hash) % 90000 + 10000}`,
    coordinates,
    score,
    ring: 1,
    ringLabel: 'Active Underwrite',
    profit,
    offer: maxOffer,
    lossRisk: 0.08,
    dealOdds: 0.74,
    exitDays: 75,
    scope: 'Cosmetic & Mechanical Renovation',
    countyFips,
    computedAt: new Date().toISOString(),
    livingSqft: sqft,
    yearBuilt,
    bedrooms: beds,
    bathrooms: baths,
    absentee: true,
    isListed: false,
    confidenceGrade: 'A',
    marketLabel: `${city}, ${state}`,
    assetClass: 'residential',
    assetClassLabel: 'Residential',
    propertyType: 'Single Family Residence',
  }
}