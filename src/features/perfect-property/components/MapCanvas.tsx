import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapCanvasSkeleton } from "@/components/ui/skeleton-loaders";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowsOut,
  Crosshair,
  Eye,
  EyeSlash,
  Globe,
  Key,
  MagnifyingGlass,
  Minus,
  Plus,
  Stack,
  X,
  Check,
  House,
  Buildings,
  Tree,
  SquaresFour,
  Factory,
  Briefcase,
} from '@phosphor-icons/react'
import type { LiveLayerMode, LiveRegionFilter, WorkspaceParcel, AssetClassFilter } from '../live'
import { layerMetric, filterParcels, assetClassDisplayName, searchMatchesParcel, parcelMatchesAssetClass } from '../live'
import { formatShortDate } from '../data'
import { useIsMac } from '@/hooks/use-is-mac'
import { fmt$ } from '@/lib/format'
import {
  GMP_ATTRIBUTION_ID,
  DEFAULT_MAP_ID,
  LIGHT_MAP_STYLE,
  DEMO_KEY_URL,
  BILLING_ENABLE_URL,
  BILLING_DOCS_URL,
  getGoogleMapsApiKey,
  setGoogleMapsApiKey,
  isGoogleMapsBillingError,
  setGoogleMapsBillingError,
  onGoogleMapsStatusChange,
} from '@/lib/google-maps'

type Props = {
  parcels: WorkspaceParcel[]
  selected: WorkspaceParcel | null
  onSelect: (parcel: WorkspaceParcel) => void
  region: LiveRegionFilter
  onRegionChange: (region: LiveRegionFilter) => void
  layer: LiveLayerMode
  onLayerChange: (layer: LiveLayerMode) => void
  snapshotIso: string | null
  loading?: boolean
  isRefreshing?: boolean
  error?: string | null
  onRetry?: () => void
  /** Total unfiltered live parcels (before region filter) */
  totalCount?: number
  onOpenDeals?: () => void
  onOpenAdmin?: () => void
  assetClass?: AssetClassFilter
  onAssetClassChange?: (assetClass: AssetClassFilter) => void
  allParcels?: WorkspaceParcel[]
  searchQuery?: string
  onSearchQueryChange?: (query: string) => void
}

const layerModes: LiveLayerMode[] = ['Opportunity score', 'Expected profit', 'Loss risk', 'Deal odds']
const DEFAULT_CENTER = { lat: 33.2, lng: -99.2 }
const DEFAULT_ZOOM = 3.5

function tierColor(score: number): string {
  if (score >= 80) return '#2F5FFF' // royal blue — exceptional
  if (score >= 65) return '#10B981' // emerald — strong
  if (score >= 50) return '#64748B' // slate — viable
  return '#94A3B8' // light slate — baseline
}

type MapTypeOption = 'roadmap' | 'satellite' | 'hybrid' | 'terrain'

/**
 * Controller subcomponent that binds useMap() to handle programmatic camera actions
 */
function MapCameraController({
  selected,
  parcels,
  onRegisterControls,
}: {
  selected: WorkspaceParcel | null
  parcels: WorkspaceParcel[]
  onRegisterControls: (controls: {
    zoomIn: () => void
    zoomOut: () => void
    resetView: () => void
    fitParcels: () => void
    focusOnParcel: (parcel: WorkspaceParcel) => void
  }) => void
}) {
  const map = useMap()
  const prevSelectedId = useRef<string | null>(null)

  const zoomIn = useCallback(() => {
    if (!map) return
    const z = map.getZoom() || DEFAULT_ZOOM
    map.setZoom(z + 1)
  }, [map])

  const zoomOut = useCallback(() => {
    if (!map) return
    const z = map.getZoom() || DEFAULT_ZOOM
    map.setZoom(Math.max(2, z - 1))
  }, [map])

  const resetView = useCallback(() => {
    if (!map) return
    map.panTo(DEFAULT_CENTER)
    map.setZoom(window.innerWidth < 640 ? 2.5 : DEFAULT_ZOOM)
  }, [map])

  const fitParcels = useCallback(() => {
    if (!map || parcels.length === 0) return
    const bounds = new google.maps.LatLngBounds()
    parcels.forEach((p) => {
      bounds.extend({ lat: p.coordinates[1], lng: p.coordinates[0] })
    })
    map.fitBounds(bounds, { top: 70, right: 70, bottom: 70, left: 70 })
  }, [map, parcels])

  const focusOnParcel = useCallback(
    (parcel: WorkspaceParcel) => {
      if (!map) return
      map.panTo({ lat: parcel.coordinates[1], lng: parcel.coordinates[0] })
      const currentZoom = map.getZoom() || 0
      if (currentZoom < 12) {
        map.setZoom(12)
      }
    },
    [map],
  )

  useEffect(() => {
    onRegisterControls({ zoomIn, zoomOut, resetView, fitParcels, focusOnParcel })
  }, [onRegisterControls, zoomIn, zoomOut, resetView, fitParcels, focusOnParcel])

  // Fit bounds whenever the parcel set materially changes
  useEffect(() => {
    if (!map || parcels.length === 0) return
    fitParcels()
  }, [map, parcels.length, fitParcels])

  // Fly to selected parcel
  useEffect(() => {
    if (!map || !selected) return
    const id = selected.id
    if (prevSelectedId.current !== id) {
      prevSelectedId.current = id
      map.panTo({ lat: selected.coordinates[1], lng: selected.coordinates[0] })
      if ((map.getZoom() || 0) < 12) {
        map.setZoom(12)
      }
    }
  }, [map, selected])

  return null
}

interface ParcelMarkerProps {
  parcel: WorkspaceParcel
  isSelected: boolean
  isHovered: boolean
  metricVal: number
  color: string
  activeAssetClass?: AssetClassFilter
  onClick: (parcel: WorkspaceParcel) => void
  onMouseEnter: (parcel: WorkspaceParcel) => void
  onMouseLeave: () => void
}

const ParcelMarker = React.memo(function ParcelMarker({
  parcel,
  isSelected,
  isHovered,
  metricVal,
  color,
  activeAssetClass = 'all',
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ParcelMarkerProps) {
  const matchesCategory = parcelMatchesAssetClass(parcel, activeAssetClass)
  const assetClassKebab = parcel.assetClass === 'vacant_land' ? 'vacant-land' : parcel.assetClass

  return (
    <AdvancedMarker
      position={{ lat: parcel.coordinates[1], lng: parcel.coordinates[0] }}
      onClick={() => onClick(parcel)}
      title={`${parcel.address} — ${parcel.score.toFixed(1)} score (${parcel.assetClassLabel})`}
    >
      <div
        data-asset-class={parcel.assetClass}
        data-asset-class-kebab={assetClassKebab}
        data-parcel-id={parcel.id}
        data-property-type={parcel.assetClass}
        data-active-asset-class={activeAssetClass}
        data-matches-category={matchesCategory ? 'true' : 'false'}
        data-filtered={!matchesCategory ? 'true' : 'false'}
        onMouseEnter={() => onMouseEnter(parcel)}
        onMouseLeave={onMouseLeave}
        className={`marker-parcel relative flex items-center justify-center cursor-pointer transition-all duration-200 ease-out will-change-transform marker-${assetClassKebab} marker-type-${parcel.assetClass} ${
          matchesCategory
            ? 'marker-active marker-highlighted opacity-100 scale-100'
            : 'marker-dimmed marker-filtered-out opacity-25 grayscale scale-75 pointer-events-none'
        } ${
          isSelected ? 'marker-selected scale-125 z-50' : isHovered ? 'marker-hovered scale-110 z-40' : 'z-10'
        }`}
      >
        {/* Support selectors querying vacant_land, vacant-land or vacant land */}
        {parcel.assetClass === 'vacant_land' && (
          <span data-asset-class="vacant-land" className="contents">
            <span data-asset-class="vacant land" className="contents" />
          </span>
        )}
        {isSelected && (
          <>
            <span
              className="absolute -inset-3 rounded-full animate-ping opacity-60 pointer-events-none"
              style={{ backgroundColor: color, animationDuration: '1.6s' }}
            />
            <span
              className="absolute -inset-2.5 rounded-full animate-pulse opacity-60 pointer-events-none"
              style={{
                boxShadow: `0 0 16px 3px ${color}`,
                border: `1.5px solid ${color}`,
              }}
            />
          </>
        )}
        <div
          className={`marker-badge relative flex items-center justify-center rounded-full font-mono text-[10px] font-bold text-white shadow-md transition-all select-none ${
            matchesCategory ? 'ring-1 ring-white/60' : 'ring-0 opacity-60'
          }`}
          style={{
            width: isSelected ? 32 : 24,
            height: isSelected ? 32 : 24,
            backgroundColor: color,
            border: isSelected ? '2.5px solid #ffffff' : '1.5px solid rgba(255,255,255,0.85)',
            boxShadow: isSelected
              ? `0 0 16px 3px ${color}, 0 4px 10px rgba(0,0,0,0.5)`
              : `0 0 8px ${color}66`,
          }}
        >
          {Math.round(metricVal)}
        </div>
      </div>
    </AdvancedMarker>
  )
})

export function MapCanvas(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isMac = useIsMac()
  const [layersOpen, setLayersOpen] = useState(false)
  const [mapType, setMapType] = useState<MapTypeOption>('roadmap')
  const [hoveredParcel, setHoveredParcel] = useState<WorkspaceParcel | null>(null)
  const [activeInfoWindowParcel, setActiveInfoWindowParcel] = useState<WorkspaceParcel | null>(null)
  const [apiKey, setApiKey] = useState<string>(() => getGoogleMapsApiKey())
  const [keyModalOpen, setKeyModalOpen] = useState(false)
  const [tempKeyInput, setTempKeyInput] = useState('')
  const [keySavedToast, setKeySavedToast] = useState(false)
  const [isBillingError, setIsBillingError] = useState(() => isGoogleMapsBillingError())
  const [billingBannerDismissed, setBillingBannerDismissed] = useState(false)
  const [internalAssetClass, setInternalAssetClass] = useState<AssetClassFilter>('all')
  const { assetClass: propAssetClass, onAssetClassChange } = props
  const activeAssetClass = propAssetClass ?? internalAssetClass

  // Search Bar state & refs
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchActiveIndex, setSearchActiveIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchDropdownRef = useRef<HTMLDivElement>(null)

  const { searchQuery: propSearchQuery, onSearchQueryChange } = props
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery

  const handleSearchChange = useCallback(
    (val: string) => {
      if (onSearchQueryChange) {
        onSearchQueryChange(val)
      } else {
        setInternalSearchQuery(val)
      }
      setSearchActiveIndex(-1)
    },
    [onSearchQueryChange],
  )

  const handleSearchClear = useCallback(() => {
    handleSearchChange('')
    searchInputRef.current?.focus()
  }, [handleSearchChange])

  const handleAssetClassToggle = useCallback(
    (target: AssetClassFilter) => {
      // If already active, toggle back to 'all' (unless already 'all')
      const next = activeAssetClass === target && target !== 'all' ? 'all' : target
      if (onAssetClassChange) {
        onAssetClassChange(next)
      } else {
        setInternalAssetClass(next)
      }
    },
    [activeAssetClass, onAssetClassChange],
  )

  // Calculate parcel counts per asset class for the current region
  const baseParcelsForCounts = useMemo(() => {
    if (props.allParcels) {
      return filterParcels(props.allParcels, props.region, 'all')
    }
    return props.parcels
  }, [props.allParcels, props.parcels, props.region])

  const assetClassCounts = useMemo(() => {
    return {
      all: baseParcelsForCounts.length,
      residential: baseParcelsForCounts.filter((p) => p.assetClass === 'residential').length,
      multifamily: baseParcelsForCounts.filter((p) => parcelMatchesAssetClass(p, 'multifamily')).length,
      industrial: baseParcelsForCounts.filter((p) => parcelMatchesAssetClass(p, 'industrial')).length,
      office: baseParcelsForCounts.filter((p) => parcelMatchesAssetClass(p, 'office')).length,
      commercial: baseParcelsForCounts.filter((p) => p.assetClass === 'commercial').length,
      vacant_land: baseParcelsForCounts.filter((p) => p.assetClass === 'vacant_land').length,
    }
  }, [baseParcelsForCounts])

  // Matching parcels for search autocomplete and dropdown
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return []
    // First, find in current base parcels for region & asset filter
    const local = baseParcelsForCounts.filter((p) => searchMatchesParcel(p, searchQuery))
    if (local.length > 0) return local

    // Second, search in allParcels across all regions & asset classes
    if (props.allParcels) {
      return props.allParcels.filter((p) => searchMatchesParcel(p, searchQuery))
    }
    return []
  }, [baseParcelsForCounts, props.allParcels, searchQuery])

  const handleSelectSearchResult = useCallback(
    (parcel: WorkspaceParcel) => {
      // If parcel belongs to another region, switch region so it renders
      if (props.region !== 'All regions') {
        const inCurrentRegion = props.parcels.some((p) => p.id === parcel.id)
        if (!inCurrentRegion) {
          if (parcel.state === 'IL') props.onRegionChange('Cook County, IL')
          else if (parcel.state === 'CA') props.onRegionChange('California')
          else if (parcel.state === 'NY') props.onRegionChange('New York')
          else props.onRegionChange('All regions')
        }
      }

      // If parcel belongs to another asset class and asset filter is active, reset to 'all' or match
      if (activeAssetClass !== 'all' && parcel.assetClass !== activeAssetClass) {
        if (props.onAssetClassChange) {
          props.onAssetClassChange('all')
        } else {
          setInternalAssetClass('all')
        }
      }

      props.onSelect(parcel)
      setActiveInfoWindowParcel(parcel)
      cameraControlsRef.current?.focusOnParcel(parcel)
      setIsSearchFocused(false)

      const panelEl = document.getElementById('property-details-panel')
      if (panelEl) {
        panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        panelEl.focus({ preventScroll: true })
      }
    },
    [props, activeAssetClass],
  )

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!searchMatches.length) return
        setSearchActiveIndex((prev) => (prev + 1) % Math.min(searchMatches.length, 8))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!searchMatches.length) return
        setSearchActiveIndex((prev) => (prev <= 0 ? Math.min(searchMatches.length, 8) - 1 : prev - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const targetIndex = searchActiveIndex >= 0 ? searchActiveIndex : 0
        const target = searchMatches[targetIndex]
        if (target) {
          handleSelectSearchResult(target)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        if (searchQuery) {
          handleSearchClear()
        } else {
          setIsSearchFocused(false)
          searchInputRef.current?.blur()
        }
      }
    },
    [searchMatches, searchActiveIndex, handleSelectSearchResult, searchQuery, handleSearchClear],
  )

  // Close search suggestions on click outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(target) &&
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(target)
      ) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [])

  // Press "/" to jump to property search input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !(document.activeElement as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Keep InfoWindow valid if selected parcel changes
  useEffect(() => {
    if (activeInfoWindowParcel && !props.parcels.some((p) => p.id === activeInfoWindowParcel.id)) {
      setActiveInfoWindowParcel(null)
    }
  }, [props.parcels, activeInfoWindowParcel])

  // Camera control ref callbacks
  const cameraControlsRef = useRef<{
    zoomIn: () => void
    zoomOut: () => void
    resetView: () => void
    fitParcels: () => void
    focusOnParcel: (parcel: WorkspaceParcel) => void
  }>({
    zoomIn: () => {},
    zoomOut: () => {},
    resetView: () => {},
    fitParcels: () => {},
    focusOnParcel: () => {},
  })

  const handleRegisterControls = useCallback(
    (controls: {
      zoomIn: () => void
      zoomOut: () => void
      resetView: () => void
      fitParcels: () => void
      focusOnParcel: (parcel: WorkspaceParcel) => void
    }) => {
      cameraControlsRef.current = controls
    },
    [],
  )

  const handleMarkerClick = useCallback(
    (parcel: WorkspaceParcel) => {
      props.onSelect(parcel)
      setActiveInfoWindowParcel(parcel)
      cameraControlsRef.current?.focusOnParcel(parcel)

      const panelEl = document.getElementById('property-details-panel')
      if (panelEl) {
        panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        panelEl.focus({ preventScroll: true })
      }
    },
    [props],
  )

  const handleMarkerMouseEnter = useCallback((p: WorkspaceParcel) => {
    setHoveredParcel(p)
  }, [])

  const handleMarkerMouseLeave = useCallback(() => {
    setHoveredParcel(null)
  }, [])

  const handleSaveApiKey = () => {
    const trimmed = tempKeyInput.trim()
    setGoogleMapsApiKey(trimmed)
    setApiKey(trimmed)
    setIsBillingError(false)
    setGoogleMapsBillingError(false)
    setBillingBannerDismissed(false)
    setKeyModalOpen(false)
    setKeySavedToast(true)
    setTimeout(() => setKeySavedToast(false), 3000)
  }

  // Subscribe to global Google Maps billing error changes
  useEffect(() => {
    return onGoogleMapsStatusChange((isErr) => {
      setIsBillingError(isErr)
    })
  }, [])

  // Optimize marker payload to maintain 60 FPS: cap at 150 top parcels if dataset is huge
  const activeParcels = useMemo(() => {
    let list = props.parcels
    if (!props.onAssetClassChange && activeAssetClass !== 'all') {
      list = filterParcels(props.parcels, props.region, activeAssetClass)
    }
    if (searchQuery.trim()) {
      const filtered = list.filter((p) => searchMatchesParcel(p, searchQuery))
      if (filtered.length > 0) return filtered
      // If nothing in filtered list, check allParcels
      if (props.allParcels) {
        const globalFiltered = props.allParcels.filter((p) => searchMatchesParcel(p, searchQuery))
        if (globalFiltered.length > 0) return globalFiltered
      }
      return []
    }
    return list
  }, [props.parcels, props.region, props.onAssetClassChange, activeAssetClass, searchQuery, props.allParcels])

  const displayParcels = useMemo(() => {
    if (activeParcels.length <= 150) return activeParcels
    return [...activeParcels].sort((a, b) => b.score - a.score).slice(0, 150)
  }, [activeParcels])

  const mapBusy = props.loading && props.parcels.length === 0

  if (mapBusy) {
    return (
      <section ref={containerRef} className="relative min-h-0 w-full h-full overflow-hidden bg-background">
        <MapCanvasSkeleton />
      </section>
    )
  }

  return (
    <section ref={containerRef} className="relative min-h-0 w-full h-full overflow-hidden bg-background">
      {/* Google Maps APIProvider & Map */}
      <APIProvider
        apiKey={apiKey}
        libraries={['marker', 'places', 'geometry']}
        onError={(err) => {
          console.warn('[Google Maps Platform APIProvider Error]:', err)
          const msg = String((err as unknown as { message?: string })?.message || err || '')
          if (
            msg.includes('BillingNotEnabledMapError') ||
            msg.includes('billing') ||
            msg.includes('gm_authFailure')
          ) {
            setIsBillingError(true)
            setGoogleMapsBillingError(true)
          }
        }}
      >
        <div className="absolute inset-0 w-full h-full">
          <GoogleMap
            mapId={DEFAULT_MAP_ID}
            internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={window.innerWidth < 640 ? 2.5 : DEFAULT_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={true}
            mapTypeId={mapType}
            styles={mapType === 'roadmap' ? LIGHT_MAP_STYLE : undefined}
            style={{ width: '100%', height: '100%' }}
          >
            <MapCameraController
              selected={props.selected}
              parcels={props.parcels}
              onRegisterControls={handleRegisterControls}
            />

            {/* Render Advanced Markers with hardware-accelerated transitions */}
            {displayParcels.map((parcel) => (
              <ParcelMarker
                key={parcel.id}
                parcel={parcel}
                isSelected={props.selected?.id === parcel.id}
                isHovered={hoveredParcel?.id === parcel.id}
                metricVal={layerMetric(parcel, props.layer)}
                color={tierColor(parcel.score)}
                activeAssetClass={activeAssetClass}
                onClick={handleMarkerClick}
                onMouseEnter={handleMarkerMouseEnter}
                onMouseLeave={handleMarkerMouseLeave}
              />
            ))}

            {/* InfoWindow for active clicked parcel */}
            {activeInfoWindowParcel && (
              <InfoWindow
                position={{
                  lat: activeInfoWindowParcel.coordinates[1],
                  lng: activeInfoWindowParcel.coordinates[0],
                }}
                onCloseClick={() => setActiveInfoWindowParcel(null)}
                headerContent={
                  <div className="font-sans font-bold text-zinc-900 text-xs truncate max-w-[240px]">
                    {activeInfoWindowParcel.address}
                  </div>
                }
              >
                <div
                  data-asset-class={activeInfoWindowParcel.assetClass}
                  className="p-1.5 text-xs text-zinc-700 font-sans space-y-2 min-w-[240px] max-w-[280px]"
                >
                  {/* Location & Score Header */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-200 pb-1.5">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{activeInfoWindowParcel.marketLabel}</span>
                      <span
                        data-asset-class={activeInfoWindowParcel.assetClass}
                        className="rounded bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 text-[9px] font-semibold"
                      >
                        {activeInfoWindowParcel.assetClassLabel}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-blue-600 shrink-0 ml-1">
                      ★ {activeInfoWindowParcel.score.toFixed(1)}
                    </span>
                  </div>

                  {/* Property Specs: Square Footage, Beds, Baths, Year */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-600 bg-zinc-50 border border-zinc-200/70 rounded-lg p-2">
                    <span className="font-semibold text-zinc-900">
                      {activeInfoWindowParcel.livingSqft != null && activeInfoWindowParcel.livingSqft > 0
                        ? `${activeInfoWindowParcel.livingSqft.toLocaleString()} sqft`
                        : 'Sqft N/A'}
                    </span>
                    {(activeInfoWindowParcel.bedrooms != null || activeInfoWindowParcel.bathrooms != null) && (
                      <>
                        <span className="text-zinc-300">•</span>
                        <span>
                          {activeInfoWindowParcel.bedrooms ?? '—'} bd / {activeInfoWindowParcel.bathrooms ?? '—'} ba
                        </span>
                      </>
                    )}
                    {activeInfoWindowParcel.yearBuilt != null && activeInfoWindowParcel.yearBuilt > 0 && (
                      <>
                        <span className="text-zinc-300">•</span>
                        <span>Built {activeInfoWindowParcel.yearBuilt}</span>
                      </>
                    )}
                  </div>

                  {/* Pricing & Profit Details */}
                  <div className="grid grid-cols-2 gap-2 py-1 text-[11px]">
                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-lg p-2">
                      <span className="text-zinc-400 block text-[10px] font-medium uppercase tracking-wider">Modeled Offer</span>
                      <span className="font-bold text-zinc-900 text-[13px]">{fmt$(activeInfoWindowParcel.offer)}</span>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-lg p-2">
                      <span className="text-emerald-700 block text-[10px] font-medium uppercase tracking-wider">Exp. Profit</span>
                      <span className="font-bold text-emerald-600 text-[13px]">+{fmt$(activeInfoWindowParcel.profit)}</span>
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 px-0.5">
                    <span>Odds: <strong className="text-zinc-800">{Math.round(activeInfoWindowParcel.dealOdds * 100)}%</strong></span>
                    <span>Loss Risk: <strong className={activeInfoWindowParcel.lossRisk > 0.2 ? 'text-rose-600' : 'text-zinc-800'}>{Math.round(activeInfoWindowParcel.lossRisk * 100)}%</strong></span>
                    <span>Scope: <strong className="text-zinc-800">{activeInfoWindowParcel.scope || 'Light'}</strong></span>
                  </div>

                  {/* Action CTA */}
                  <Button
                    type="button"
                    onClick={() => {
                      props.onSelect(activeInfoWindowParcel)
                      const panelEl = document.getElementById('property-details-panel')
                      if (panelEl) {
                        panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                        panelEl.focus({ preventScroll: true })
                      }
                    }}
                    className="w-full mt-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-center font-semibold text-white hover:bg-zinc-800 transition-colors text-[11px] shadow-xs cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>View in Underwriting Panel</span>
                    <span>→</span>
                  </Button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </APIProvider>

      {/* Top filter bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center gap-2 border-b border-border bg-card/90 p-2.5 shadow-inset-border backdrop-blur-md">
        {/* Region Filters */}
        {(['Cook County, IL', 'California', 'New York', 'All regions'] as LiveRegionFilter[]).map((item) => (
          <FilterButton
            key={item}
            active={props.region === item}
            onClick={() => props.onRegionChange(item)}
          >
            {item}
          </FilterButton>
        ))}

        <span className="mx-0.5 h-6 w-px bg-card/10 hidden sm:inline-block" />

        {/* Property Type (Asset Class) Filter System */}
        <div
          id="opportunity-map-asset-class-filter-group"
          role="group"
          aria-label="Filter opportunity map by property type"
          className="flex items-center gap-1 rounded-md border border-border bg-muted/60 p-0.5"
        >
          <button
            type="button"
            data-asset-class="all"
            aria-label="All property types"
            aria-pressed={activeAssetClass === 'all'}
            onClick={() => handleAssetClassToggle('all')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeAssetClass === 'all'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <SquaresFour size={13} weight={activeAssetClass === 'all' ? 'bold' : 'regular'} />
            <span>All</span>
            <span className="rounded-full bg-muted/90 px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
              {assetClassCounts.all}
            </span>
          </button>

          <button
            type="button"
            data-asset-class="multifamily"
            aria-label="Filter multifamily properties"
            aria-pressed={activeAssetClass === 'multifamily'}
            onClick={() => handleAssetClassToggle('multifamily')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeAssetClass === 'multifamily'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <Buildings size={13} weight={activeAssetClass === 'multifamily' ? 'bold' : 'regular'} />
            <span>Multifamily</span>
            <span className="rounded-full bg-muted/90 px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
              {assetClassCounts.multifamily}
            </span>
          </button>

          <button
            type="button"
            data-asset-class="industrial"
            aria-label="Filter industrial properties"
            aria-pressed={activeAssetClass === 'industrial'}
            onClick={() => handleAssetClassToggle('industrial')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeAssetClass === 'industrial'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <Factory size={13} weight={activeAssetClass === 'industrial' ? 'bold' : 'regular'} />
            <span>Industrial</span>
            <span className="rounded-full bg-muted/90 px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
              {assetClassCounts.industrial}
            </span>
          </button>

          <button
            type="button"
            data-asset-class="office"
            aria-label="Filter office properties"
            aria-pressed={activeAssetClass === 'office'}
            onClick={() => handleAssetClassToggle('office')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeAssetClass === 'office'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <Briefcase size={13} weight={activeAssetClass === 'office' ? 'bold' : 'regular'} />
            <span>Office</span>
            <span className="rounded-full bg-muted/90 px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
              {assetClassCounts.office}
            </span>
          </button>

          <button
            type="button"
            data-asset-class="residential"
            aria-label="Filter residential properties"
            aria-pressed={activeAssetClass === 'residential'}
            onClick={() => handleAssetClassToggle('residential')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeAssetClass === 'residential'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <House size={13} weight={activeAssetClass === 'residential' ? 'bold' : 'regular'} />
            <span>Residential</span>
            <span className="rounded-full bg-muted/90 px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
              {assetClassCounts.residential}
            </span>
          </button>

          <button
            type="button"
            data-asset-class="commercial"
            aria-label="Filter commercial properties"
            aria-pressed={activeAssetClass === 'commercial'}
            onClick={() => handleAssetClassToggle('commercial')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeAssetClass === 'commercial'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <Buildings size={13} weight={activeAssetClass === 'commercial' ? 'bold' : 'regular'} />
            <span>Commercial</span>
            <span className="rounded-full bg-muted/90 px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
              {assetClassCounts.commercial}
            </span>
          </button>

          <button
            type="button"
            data-asset-class="vacant-land"
            data-asset-class-kebab="vacant-land"
            aria-label="Filter vacant land properties"
            aria-pressed={activeAssetClass === 'vacant_land'}
            onClick={() => handleAssetClassToggle('vacant_land')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeAssetClass === 'vacant_land'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <span data-asset-class="vacant_land" className="inline-flex items-center gap-1.5">
              <span data-asset-class="vacant land" className="inline-flex items-center gap-1.5">
                <Tree size={13} weight={activeAssetClass === 'vacant_land' ? 'bold' : 'regular'} />
                <span>Vacant Land</span>
                <span className="rounded-full bg-muted/90 px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                  {assetClassCounts.vacant_land}
                </span>
              </span>
            </span>
          </button>
        </div>

        <span className="mx-0.5 h-6 w-px bg-card/10 hidden sm:inline-block" />

        {/* Map Property Search Bar */}
        <div
          id="map-property-search-container"
          data-testid="map-property-search"
          role="search"
          className="relative flex items-center flex-1 min-w-[200px] sm:min-w-[240px] md:min-w-[260px] max-w-sm"
        >
          <div className="relative w-full flex items-center">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground flex items-center">
              <MagnifyingGlass size={14} className={searchQuery ? 'text-primary' : 'text-muted-foreground'} />
            </div>

            <Input
              ref={searchInputRef}
              id="map-property-search-input"
              data-testid="map-property-search-input"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isSearchFocused && searchMatches.length > 0}
              aria-controls="map-search-results"
              value={searchQuery}
              onChange={(e) => {
                handleSearchChange(e.target.value)
                if (!isSearchFocused) setIsSearchFocused(true)
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search properties by address or name…"
              aria-label="Search properties by address or name"
              className="h-8 pl-8 pr-16 text-xs bg-muted/50 border-border placeholder:text-muted-foreground/70 focus-visible:ring-primary/30 focus-visible:bg-card transition-colors rounded-md w-full"
            />

            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <>
                  <span
                    data-testid="map-search-count-badge"
                    className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                  >
                    {searchMatches.length}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    id="map-property-search-clear-btn"
                    data-testid="map-property-search-clear-btn"
                    onClick={handleSearchClear}
                    aria-label="Clear search"
                    className="h-5 w-5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer p-0"
                  >
                    <X size={12} />
                  </Button>
                </>
              ) : (
                <kbd
                  aria-hidden="true"
                  className="hidden sm:inline-flex items-center text-[10px] font-mono text-muted-foreground/60 bg-muted/40 border border-border/50 px-1 py-0.5 rounded pointer-events-none"
                >
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <motion.div
                ref={searchDropdownRef}
                id="map-search-results"
                data-testid="map-search-results"
                role="listbox"
                aria-label="Search suggestions"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-80 overflow-y-auto rounded-lg border border-border bg-card/95 shadow-xl backdrop-blur-md p-1 divide-y divide-border/50"
              >
                {searchMatches.length > 0 ? (
                  <>
                    <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Matching Properties ({searchMatches.length})</span>
                      <span className="hidden sm:inline text-[9px] text-muted-foreground/60">
                        ↑↓ to navigate · ↵ to select
                      </span>
                    </div>
                    <div className="pt-0.5 space-y-0.5">
                      {searchMatches.slice(0, 8).map((parcel, idx) => {
                        const isCrossRegion =
                          props.region !== 'All regions' &&
                          !props.parcels.some((p) => p.id === parcel.id)
                        const isCrossAsset =
                          activeAssetClass !== 'all' &&
                          parcel.assetClass !== activeAssetClass

                        return (
                          <div
                            key={parcel.id}
                            id={`map-search-item-${parcel.id}`}
                            data-testid="map-search-result-item"
                            data-parcel-id={parcel.id}
                            role="option"
                            aria-selected={idx === searchActiveIndex}
                            onClick={() => handleSelectSearchResult(parcel)}
                            onMouseEnter={() => setSearchActiveIndex(idx)}
                            className={`flex items-center justify-between gap-2.5 rounded-md px-2.5 py-2 text-xs cursor-pointer transition-colors ${
                              idx === searchActiveIndex
                                ? 'bg-primary/10 text-foreground'
                                : 'hover:bg-muted/80 text-foreground'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 font-medium truncate">
                                {parcel.assetClass === 'commercial' ? (
                                  <Buildings size={13} className="text-amber-500 shrink-0" />
                                ) : parcel.assetClass === 'vacant_land' ? (
                                  <Tree size={13} className="text-emerald-500 shrink-0" />
                                ) : (
                                  <House size={13} className="text-primary shrink-0" />
                                )}
                                <span className="truncate">{parcel.address}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                                <span>{parcel.city}, {parcel.state}</span>
                                <span>·</span>
                                <span>{parcel.assetClassLabel}</span>
                                {(isCrossRegion || isCrossAsset) && (
                                  <span className="ml-1 text-[10px] font-mono text-primary bg-primary/10 px-1 py-0.2 rounded">
                                    {isCrossRegion ? parcel.state : parcel.assetClassLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div
                                className="font-mono font-bold text-xs"
                                style={{ color: tierColor(parcel.score) }}
                              >
                                {parcel.score.toFixed(1)}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {fmt$(parcel.profit)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-foreground font-medium">
                      No properties found matching "{searchQuery}"
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Check spelling or search by address, city, or property name.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSearchClear}
                      className="mt-2.5 text-xs h-7 px-2.5"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="mx-0.5 h-6 w-px bg-card/10 hidden sm:inline-block" />

        {/* Map Type Quick Switcher (Roadmap, Satellite, Terrain) */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-muted/60 p-0.5">
          {(
            [
              ['roadmap', 'Vector'],
              ['satellite', 'Satellite'],
              ['hybrid', 'Hybrid'],
              ['terrain', 'Terrain'],
            ] as const
          ).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => setMapType(type)}
              className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                mapType === type
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Refreshing & Snapshot indicator */}
        <div className="ml-auto flex items-center gap-2">
          {/* Google Maps API status indicator */}
          <Button
            type="button"
            onClick={() => {
              setTempKeyInput(apiKey)
              setKeyModalOpen(true)
            }}
            title={
              isBillingError
                ? 'Google Cloud Billing Not Enabled - Click to resolve'
                : apiKey
                  ? 'Google Maps Connected (Click to configure)'
                  : 'Configure Google Maps API Key'
            }
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-mono transition-colors ${
              isBillingError
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                : apiKey
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Globe size={13} className={isBillingError ? 'animate-pulse text-amber-400' : ''} />
            <span className="max-sm:hidden">
              {isBillingError ? 'Billing Required' : apiKey ? 'Google Maps Live' : 'Maps Demo Mode'}
            </span>
            <Key size={11} className="opacity-70" />
          </Button>

          {props.isRefreshing ? (
            <span className="filter-button inline-flex items-center gap-2 max-lg:hidden text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Refreshing…
            </span>
          ) : props.snapshotIso ? (
            <time
              dateTime={props.snapshotIso}
              aria-label={`Data snapshot ${formatShortDate(props.snapshotIso)}`}
              className="filter-button inline-flex items-center max-lg:hidden"
            >
              {formatShortDate(props.snapshotIso)}
            </time>
          ) : (
            <span className="filter-button inline-flex items-center max-lg:hidden text-muted-foreground">
              No snapshot
            </span>
          )}
        </div>
      </div>

      {/* Google Cloud Billing Notice Banner if BillingNotEnabledMapError detected */}
      <AnimatePresence>
        {isBillingError && !billingBannerDismissed && (
          <motion.div
            id="gmp-billing-notice-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[52px] inset-x-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-card/95 p-3 text-xs text-foreground shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs">
                !
              </span>
              <div>
                <p className="font-semibold text-foreground">Google Maps Platform: Cloud Billing Not Enabled</p>
                <p className="text-[11px] text-muted-foreground">
                  The active API key encountered <code className="font-mono text-amber-500 font-medium">BillingNotEnabledMapError</code>. Link a billing account to your Google Cloud project or switch your key.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={BILLING_ENABLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <span>Enable Cloud Billing</span>
                <ArrowsOut size={12} />
              </a>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempKeyInput(apiKey)
                  setKeyModalOpen(true)
                }}
                className="h-7 text-xs"
              >
                Change Key
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setBillingBannerDismissed(true)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss notice"
              >
                <X size={14} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left map camera controls */}
      <div className="absolute left-3 top-20 z-20 grid gap-1 rounded-md border border-border bg-card/95 p-1 shadow-map-controls">
        <MapButton label="Zoom in" onClick={() => cameraControlsRef.current.zoomIn()}>
          <Plus size={18} />
        </MapButton>
        <MapButton label="Zoom out" onClick={() => cameraControlsRef.current.zoomOut()}>
          <Minus size={18} />
        </MapButton>
        <MapButton label="Reset view" onClick={() => cameraControlsRef.current.resetView()}>
          <Crosshair size={18} />
        </MapButton>
        <MapButton
          label="Fullscreen"
          onClick={() => {
            if (containerRef.current?.requestFullscreen) {
              containerRef.current.requestFullscreen()
            }
          }}
        >
          <ArrowsOut size={18} />
        </MapButton>
      </div>

      {/* Right Layer Dropdown */}
      <div className="absolute right-3 top-20 z-20 w-[210px] max-sm:right-6">
        <Button
          type="button"
          className="control-button w-full justify-between"
          aria-expanded={layersOpen}
          aria-controls="map-layer-options"
          onClick={() => setLayersOpen((open) => !open)}
        >
          <span className="flex items-center gap-2">
            <Stack size={17} className="text-primary" />
            {props.layer}
          </span>
        </Button>
        <AnimatePresence>
          {layersOpen && (
            <motion.div
              id="map-layer-options"
              aria-label="Map data layers"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 210, damping: 24 }}
              className="mt-1 overflow-hidden rounded-md border border-border bg-card/95 p-1 shadow-map-panel backdrop-blur-md"
            >
              {layerModes.map((mode) => (
                <Button
                  key={mode}
                  onClick={() => {
                    props.onLayerChange(mode)
                    setLayersOpen(false)
                  }}
                  type="button"
                  aria-pressed={mode === props.layer}
                  className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm ${
                    mode === props.layer
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {mode === props.layer ? <Eye size={15} /> : <EyeSlash size={15} />} {mode}
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Score Tier Legend */}
      <div className="absolute bottom-7 left-3 z-20 w-[170px] border border-border bg-card/95 p-3 text-xs shadow-md backdrop-blur-md rounded-lg">
        <div className="mb-2 font-semibold text-foreground flex items-center justify-between">
          <span>{props.layer}</span>
          <span className="text-[10px] text-muted-foreground">{props.parcels.length} parcels</span>
        </div>
        {[
          [80, 'Exceptional', '#2F5FFF'],
          [65, 'Strong', '#10B981'],
          [50, 'Viable', '#64748B'],
          [20, 'Baseline', '#94A3B8'],
        ].map(([val, label, col]) => (
          <div key={label as string} className="flex items-center gap-2 py-0.5 text-muted-foreground">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: col as string }}
            />
            <span className="font-mono font-medium">{val}+</span>
            <span className="ml-auto font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Floating Asset Class Controls on the Opportunity Map */}
      <div
        id="floating-asset-class-controls"
        data-testid="floating-asset-class-controls"
        role="toolbar"
        aria-label="Filter opportunity map markers by asset class"
        className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-md transition-all max-sm:bottom-20 max-sm:max-w-[95vw] max-sm:overflow-x-auto"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 max-sm:hidden">
          Asset Class
        </span>

        {[
          { id: 'all', label: 'All', icon: SquaresFour, count: assetClassCounts.all },
          { id: 'multifamily', label: 'Multifamily', icon: Buildings, count: assetClassCounts.multifamily },
          { id: 'industrial', label: 'Industrial', icon: Factory, count: assetClassCounts.industrial },
          { id: 'office', label: 'Office', icon: Briefcase, count: assetClassCounts.office },
          { id: 'residential', label: 'Residential', icon: House, count: assetClassCounts.residential },
          { id: 'commercial', label: 'Commercial', icon: Buildings, count: assetClassCounts.commercial },
          { id: 'vacant_land', label: 'Vacant Land', icon: Tree, count: assetClassCounts.vacant_land },
        ].map(({ id, label, icon: Icon, count }) => {
          const isActive = activeAssetClass === id
          return (
            <button
              key={id}
              type="button"
              data-asset-class={id}
              data-asset-class-kebab={id === 'vacant_land' ? 'vacant-land' : id}
              aria-label={`Filter by ${label}`}
              aria-pressed={isActive}
              onClick={() => handleAssetClassToggle(id as AssetClassFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs scale-102 ring-1 ring-primary/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              <Icon size={14} weight={isActive ? 'bold' : 'regular'} />
              <span>{label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bottom Search shortcut pill */}
      <button
        type="button"
        onClick={() => searchInputRef.current?.focus()}
        className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-md max-sm:hidden transition-colors hover:bg-card cursor-pointer"
      >
        <MagnifyingGlass size={15} className="text-primary" />
        <span>
          Press{' '}
          <kbd className="mx-1 rounded-sm border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            /
          </kbd>{' '}
          or{' '}
          <kbd className="mx-1 rounded-sm border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>{' '}
          to search properties
        </span>
      </button>

      {/* Loading Skeleton Overlay */}
      {mapBusy && (
        <div
          className="absolute inset-0 z-30 grid place-items-center bg-background/80 backdrop-blur-xs"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="w-[320px] space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <Globe size={18} className="animate-spin text-primary" />
              <span>Loading Google Maps parcels…</span>
            </div>
            <div className="skeleton h-4 w-2/3 mx-auto" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-4/5 mx-auto" />
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {props.error && !mapBusy && (
        <div id="map-error-overlay" className="absolute inset-0 z-30 grid place-items-center bg-background/85 p-8 text-center backdrop-blur-xs">
          <div id="map-error-card" className="max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <p className="font-semibold text-foreground">Live parcel data could not be loaded</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {props.error ?? 'Check the network connection, then try again.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {props.onRetry ? (
                <Button type="button" className="primary-button" onClick={props.onRetry}>
                  Retry connection
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="text-xs"
                onClick={() => props.onRegionChange('All regions')}
              >
                View all regions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Parcels Overlay */}
      {!props.loading && props.parcels.length === 0 && !props.error && (
        <div id="map-empty-overlay" className="absolute inset-0 z-30 grid place-items-center bg-background/80 p-8 text-center backdrop-blur-xs">
          <div id="map-empty-card" className="max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            {(props.totalCount ?? 0) === 0 ? (
              <>
                <p className="font-semibold text-foreground">No LIVE scored parcels yet</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  The workspace reads <span className="font-mono text-muted-foreground/80">parcel_scores</span> with{' '}
                  <span className="font-mono text-muted-foreground/80">data_source=LIVE</span>. Ingest counties and run
                  underwriting to populate this Google Map.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {props.onOpenDeals ? (
                    <Button type="button" className="primary-button" onClick={props.onOpenDeals}>
                      Open ranked deals
                    </Button>
                  ) : null}
                  {props.onOpenAdmin ? (
                    <Button type="button" className="control-button" onClick={props.onOpenAdmin}>
                      Open admin pipeline
                    </Button>
                  ) : null}
                  {props.onRetry ? (
                    <Button type="button" className="control-button" onClick={props.onRetry}>
                      Refresh
                    </Button>
                  ) : null}
                </div>
              </>
            ) : searchQuery.trim() && activeParcels.length === 0 ? (
              <>
                <p className="font-semibold text-foreground">
                  No properties found matching "{searchQuery}"
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  We couldn't find any scored properties matching your search query in {props.region}. Try adjusting your keywords or clearing the search.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    id="map-empty-search-clear-btn"
                    data-testid="map-empty-search-clear-btn"
                    className="primary-button text-xs"
                    onClick={handleSearchClear}
                  >
                    Clear search
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs"
                    onClick={() => props.onRegionChange('All regions')}
                  >
                    Search all regions
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-foreground">
                  {activeAssetClass !== 'all'
                    ? `No ${assetClassDisplayName(activeAssetClass as any)} properties in ${props.region}`
                    : 'No parcels in this region'}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {activeAssetClass !== 'all'
                    ? `There are currently no scored properties matching '${assetClassDisplayName(activeAssetClass as any)}' under this regional filter. Switch property type or view all regions.`
                    : `${(props.totalCount ?? 0).toLocaleString()} live parcels loaded — try All regions or switch state filter.`}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {activeAssetClass !== 'all' && (
                    <Button
                      type="button"
                      className="primary-button"
                      onClick={() => handleAssetClassToggle('all')}
                    >
                      Show all property types
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant={activeAssetClass !== 'all' ? 'outline' : 'default'}
                    className={activeAssetClass !== 'all' ? 'text-xs' : 'primary-button'}
                    onClick={() => props.onRegionChange('All regions')}
                  >
                    View all regions ({(props.totalCount ?? 0).toLocaleString()})
                  </Button>
                  {props.onOpenDeals ? (
                    <Button type="button" variant="outline" className="text-xs" onClick={props.onOpenDeals}>
                      Open ranked deals
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast confirmation when key is saved */}
      <AnimatePresence>
        {keySavedToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-md bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md"
          >
            <Check size={16} />
            <span>Google Maps API Key updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Maps API Key Modal */}
      <AnimatePresence>
        {keyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl"
            >
              <Button
                type="button"
                onClick={() => setKeyModalOpen(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </Button>

              <div className="flex items-center gap-2 mb-3">
                <Globe size={22} className="text-primary" />
                <h3 className="text-base font-semibold text-foreground">Google Maps Platform Integration</h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                The application connects to Google Maps Platform via the official{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-foreground">@vis.gl/react-google-maps</code>{' '}
                SDK with vector rendering, Advanced Markers, and satellite layers.
              </p>

              <div className="mt-4 rounded-md border border-border bg-muted/40 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-foreground mb-1">
                  <span>Free Demo Key Quickstart</span>
                  <span className="text-emerald-500 font-semibold">Zero-cost Prototyping</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Generate a free demo key with no billing required via Google Maps Platform:
                </p>
                <a
                  href={DEMO_KEY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/25 transition-colors"
                >
                  <span>Get Google Maps Demo Key</span>
                  <ArrowsOut size={13} />
                </a>
              </div>

              <div className="mt-4">
                <label htmlFor="gmp-key-input" className="block text-xs font-medium text-foreground mb-1.5">
                  Your Google Maps API Key
                </label>
                <Input
                  id="gmp-key-input"
                  type="password"
                  placeholder="AIzaSy..."
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  className="w-full rounded border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Stored securely for your session. Alternatively define{' '}
                  <code className="text-muted-foreground font-semibold">VITE_GOOGLE_MAPS_API_KEY</code> in environment variables.
                </p>
              </div>

              {isBillingError && (
                <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 mb-1">
                    <span>!</span>
                    <span>Billing Account Required (BillingNotEnabledMapError)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                    Google Cloud requires associating an active Cloud Billing account with the project that generated this key. The monthly free tier covers standard development usage at zero cost.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={BILLING_ENABLE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-500 hover:bg-amber-500/30 transition-colors"
                    >
                      <span>Enable Billing in Google Cloud Console</span>
                      <ArrowsOut size={12} />
                    </a>
                    <a
                      href={BILLING_DOCS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span>View Error Documentation</span>
                      <ArrowsOut size={12} />
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-2">
                <div>
                  {apiKey && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setGoogleMapsApiKey('')
                        setApiKey('')
                        setIsBillingError(false)
                        setGoogleMapsBillingError(false)
                        setBillingBannerDismissed(false)
                        setKeyModalOpen(false)
                        setKeySavedToast(true)
                        setTimeout(() => setKeySavedToast(false), 3000)
                      }}
                      className="rounded px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
                    >
                      Remove Key
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setKeyModalOpen(false)}
                    className="rounded px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="primary-button text-xs"
                  >
                    Save Key
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.97 }}
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`filter-button ${active ? 'active-filter' : ''}`}
    >
      {children}
    </motion.button>
  )
}

function MapButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      aria-label={label}
      title={label}
      onClick={onClick}
      type="button"
      className="grid h-8 w-8 place-items-center rounded-sm text-muted-foreground hover:bg-muted active:translate-y-px"
    >
      {children}
    </Button>
  )
}
