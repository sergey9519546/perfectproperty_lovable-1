import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
} from '@phosphor-icons/react'
import type { LiveLayerMode, LiveRegionFilter, WorkspaceParcel, AssetClassFilter } from '../live'
import { layerMetric, filterParcels, assetClassDisplayName } from '../live'
import { formatShortDate } from '../data'
import { useIsMac } from '@/hooks/use-is-mac'
import { fmt$ } from '@/lib/format'
import {
  GMP_ATTRIBUTION_ID,
  DEFAULT_MAP_ID,
  LIGHT_MAP_STYLE,
  DEMO_KEY_URL,
  getGoogleMapsApiKey,
  setGoogleMapsApiKey,
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
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ParcelMarkerProps) {
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
        onMouseEnter={() => onMouseEnter(parcel)}
        onMouseLeave={onMouseLeave}
        className={`relative flex items-center justify-center cursor-pointer transition-transform duration-150 ease-out will-change-transform ${
          isSelected ? 'scale-125 z-50' : isHovered ? 'scale-110 z-40' : 'scale-100 z-10'
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
          className="relative flex items-center justify-center rounded-full font-mono text-[10px] font-bold text-white shadow-md transition-all select-none"
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
  const [internalAssetClass, setInternalAssetClass] = useState<AssetClassFilter>('all')
  const { assetClass: propAssetClass, onAssetClassChange } = props
  const activeAssetClass = propAssetClass ?? internalAssetClass

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
      commercial: baseParcelsForCounts.filter((p) => p.assetClass === 'commercial').length,
      vacant_land: baseParcelsForCounts.filter((p) => p.assetClass === 'vacant_land').length,
    }
  }, [baseParcelsForCounts])

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
    setKeyModalOpen(false)
    setKeySavedToast(true)
    setTimeout(() => setKeySavedToast(false), 3000)
  }

  // Optimize marker payload to maintain 60 FPS: cap at 150 top parcels if dataset is huge
  const activeParcels = useMemo(() => {
    if (!props.onAssetClassChange && activeAssetClass !== 'all') {
      return filterParcels(props.parcels, props.region, activeAssetClass)
    }
    return props.parcels
  }, [props.parcels, props.region, props.onAssetClassChange, activeAssetClass])

  const displayParcels = useMemo(() => {
    if (activeParcels.length <= 150) return activeParcels
    return [...activeParcels].sort((a, b) => b.score - a.score).slice(0, 150)
  }, [activeParcels])

  const mapBusy = props.loading && props.parcels.length === 0

  return (
    <section ref={containerRef} className="relative min-h-0 w-full h-full overflow-hidden bg-background">
      {/* Google Maps APIProvider & Map */}
      <APIProvider apiKey={apiKey} libraries={['marker', 'places', 'geometry']}>
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
                  <div className="font-sans font-semibold text-zinc-900 text-xs truncate max-w-[200px]">
                    {activeInfoWindowParcel.address}
                  </div>
                }
              >
                <div
                  data-asset-class={activeInfoWindowParcel.assetClass}
                  className="p-1 text-xs text-zinc-700 font-sans space-y-1.5 min-w-[210px]"
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-200 pb-1">
                    <span className="flex items-center gap-1.5">
                      <span>{activeInfoWindowParcel.marketLabel}</span>
                      <span
                        data-asset-class={activeInfoWindowParcel.assetClass}
                        className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-700"
                      >
                        {activeInfoWindowParcel.assetClassLabel}
                      </span>
                    </span>
                    <span className="font-mono font-semibold text-zinc-800">
                      Score: {activeInfoWindowParcel.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 py-0.5 text-[11px]">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Exp. Profit</span>
                      <span className="font-semibold text-emerald-600">{fmt$(activeInfoWindowParcel.profit)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Modeled Offer</span>
                      <span className="font-semibold text-zinc-800">{fmt$(activeInfoWindowParcel.offer)}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      props.onSelect(activeInfoWindowParcel)
                      setActiveInfoWindowParcel(null)
                      const panelEl = document.getElementById('property-details-panel')
                      if (panelEl) {
                        panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                        panelEl.focus({ preventScroll: true })
                      }
                    }}
                    className="w-full mt-2 rounded bg-zinc-900 px-2 py-1.5 text-center font-medium text-white hover:bg-zinc-800 transition-colors text-[11px]"
                  >
                    Open Live Underwriting
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
            title={apiKey ? 'Google Maps Connected (Click to configure)' : 'Configure Google Maps API Key'}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-mono transition-colors ${
              apiKey
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Globe size={13} />
            <span className="max-sm:hidden">{apiKey ? 'Google Maps Live' : 'Maps Demo Mode'}</span>
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

      {/* Bottom Search shortcut pill */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-md max-sm:hidden transition-colors hover:bg-card">
        <MagnifyingGlass size={15} className="text-primary" />
        <span>
          Press{' '}
          <kbd className="mx-1 rounded-sm border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>{' '}
          to search parcels
        </span>
      </div>

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

              <div className="mt-6 flex items-center justify-end gap-2">
                <Button
                  type="button"
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
