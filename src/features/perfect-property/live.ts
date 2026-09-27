import type { RankedParcelRow } from './live-types'
import { fmt$, ringLabel, tierLabel } from '@/lib/format'

export type LiveLayerMode = 'Opportunity score' | 'Expected profit' | 'Loss risk' | 'Deal odds'
export type LiveRegionFilter = 'Cook County, IL' | 'California' | 'New York' | 'All regions'

export type AssetClass = 'residential' | 'commercial' | 'vacant_land'
export type AssetClassFilter = 'all' | 'residential' | 'commercial' | 'vacant_land'

export function normalizeAssetClass(val?: string | null): AssetClass {
  if (!val) return 'residential'
  const s = val.toLowerCase().replace(/[\s-]+/g, '_')
  if (s.includes('vacant') || s.includes('land') || s.includes('lot')) return 'vacant_land'
  if (s.includes('commercial') || s.includes('retail') || s.includes('office') || s.includes('mixed')) return 'commercial'
  return 'residential'
}

export function assetClassDisplayName(assetClass: AssetClass): string {
  switch (assetClass) {
    case 'residential':
      return 'Residential'
    case 'commercial':
      return 'Commercial'
    case 'vacant_land':
      return 'Vacant Land'
    default:
      return 'Residential'
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

export function filterParcels(
  parcels: WorkspaceParcel[],
  region: LiveRegionFilter,
  assetClassFilter: AssetClassFilter = 'all',
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
    const target = assetClassFilter.toLowerCase().replace(/[\s-]+/g, '_')
    result = result.filter((p) => {
      const pClass = p.assetClass.toLowerCase().replace(/[\s-]+/g, '_')
      if (target === 'vacant_land') {
        return (
          pClass === 'vacant_land' ||
          pClass === 'vacant-land' ||
          pClass.includes('vacant') ||
          pClass.includes('land')
        )
      }
      return pClass === target
    })
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