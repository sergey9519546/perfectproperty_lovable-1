import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  APIProvider,
  Map,
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
} from '@phosphor-icons/react'
import type { LiveLayerMode, LiveRegionFilter, WorkspaceParcel } from '../live'
import { layerMetric } from '../live'
import { formatShortDate } from '../data'
import { useIsMac } from '@/hooks/use-is-mac'
import { fmt$ } from '@/lib/format'
import {
  GMP_ATTRIBUTION_ID,
  DEFAULT_MAP_ID,
  DARK_MAP_STYLE,
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
}

const layerModes: LiveLayerMode[] = ['Opportunity score', 'Expected profit', 'Loss risk', 'Deal odds']
const DEFAULT_CENTER = { lat: 33.2, lng: -99.2 }
const DEFAULT_ZOOM = 3.5

function tierColor(score: number): string {
  if (score >= 80) return '#f5b544' // amber / gold — exceptional
  if (score >= 65) return '#4ad19a' // emerald — strong
  if (score >= 50) return '#7fb3ff' // steel blue — viable
  return '#71717a' // zinc — baseline
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

  useEffect(() => {
    onRegisterControls({ zoomIn, zoomOut, resetView, fitParcels })
  }, [onRegisterControls, zoomIn, zoomOut, resetView, fitParcels])

  // Fit bounds whenever the parcel set materially changes
  useEffect(() => {
    if (!map || parcels.length === 0) return
    fitParcels()
  }, [map, parcels.length, fitParcels])

  // Fly to selected parcel
  useEffect(() => {
    if (!map || !selected) return
    const id = selected.id
    const shouldFly = prevSelectedId.current != null && prevSelectedId.current !== id
    prevSelectedId.current = id

    if (shouldFly) {
      map.panTo({ lat: selected.coordinates[1], lng: selected.coordinates[0] })
      if ((map.getZoom() || 0) < 11) {
        map.setZoom(11)
      }
    }
  }, [map, selected])

  return null
}

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

  // Camera control ref callbacks
  const cameraControlsRef = useRef<{
    zoomIn: () => void
    zoomOut: () => void
    resetView: () => void
    fitParcels: () => void
  }>({
    zoomIn: () => {},
    zoomOut: () => {},
    resetView: () => {},
    fitParcels: () => {},
  })

  const handleRegisterControls = useCallback(
    (controls: {
      zoomIn: () => void
      zoomOut: () => void
      resetView: () => void
      fitParcels: () => void
    }) => {
      cameraControlsRef.current = controls
    },
    [],
  )

  const handleSaveApiKey = () => {
    const trimmed = tempKeyInput.trim()
    setGoogleMapsApiKey(trimmed)
    setApiKey(trimmed)
    setKeyModalOpen(false)
    setKeySavedToast(true)
    setTimeout(() => setKeySavedToast(false), 3000)
  }

  const mapBusy = props.loading && props.parcels.length === 0

  return (
    <section ref={containerRef} className="relative min-h-0 w-full h-full overflow-hidden bg-pp-header">
      {/* Google Maps APIProvider & Map */}
      <APIProvider apiKey={apiKey} libraries={['marker', 'places', 'geometry']}>
        <div className="absolute inset-0 w-full h-full">
          <Map
            mapId={DEFAULT_MAP_ID}
            internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={window.innerWidth < 640 ? 2.5 : DEFAULT_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={true}
            mapTypeId={mapType}
            styles={mapType === 'roadmap' ? DARK_MAP_STYLE : undefined}
            style={{ width: '100%', height: '100%' }}
          >
            <MapCameraController
              selected={props.selected}
              parcels={props.parcels}
              onRegisterControls={handleRegisterControls}
            />

            {/* Render Advanced Markers for all parcels */}
            {props.parcels.map((parcel) => {
              const isSelected = props.selected?.id === parcel.id
              const isHovered = hoveredParcel?.id === parcel.id
              const metricVal = layerMetric(parcel, props.layer)
              const color = tierColor(parcel.score)

              return (
                <AdvancedMarker
                  key={parcel.id}
                  position={{ lat: parcel.coordinates[1], lng: parcel.coordinates[0] }}
                  onClick={() => {
                    props.onSelect(parcel)
                    setActiveInfoWindowParcel(parcel)
                  }}
                  title={`${parcel.address} — ${parcel.score.toFixed(1)} score`}
                >
                  <div
                    onMouseEnter={() => setHoveredParcel(parcel)}
                    onMouseLeave={() => setHoveredParcel(null)}
                    className="relative flex items-center justify-center cursor-pointer transition-transform duration-200"
                    style={{
                      transform: isSelected ? 'scale(1.28)' : isHovered ? 'scale(1.15)' : 'scale(1)',
                      zIndex: isSelected ? 50 : isHovered ? 40 : 10,
                    }}
                  >
                    {/* Glowing outer pulse for selected or high-priority parcel */}
                    {isSelected && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping opacity-40"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    )}

                    <div
                      className="relative flex items-center justify-center rounded-full font-mono text-[10px] font-bold text-white shadow-xl transition-colors"
                      style={{
                        width: isSelected ? 32 : 24,
                        height: isSelected ? 32 : 24,
                        backgroundColor: color,
                        border: isSelected ? '2.5px solid #ffffff' : '1.5px solid rgba(255,255,255,0.85)',
                        boxShadow: `0 0 14px ${color}aa`,
                      }}
                    >
                      {Math.round(metricVal)}
                    </div>
                  </div>
                </AdvancedMarker>
              )
            })}

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
                <div className="p-1 text-xs text-zinc-700 font-sans space-y-1.5 min-w-[210px]">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-200 pb-1">
                    <span>{activeInfoWindowParcel.marketLabel}</span>
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
                  <button
                    type="button"
                    onClick={() => {
                      props.onSelect(activeInfoWindowParcel)
                      setActiveInfoWindowParcel(null)
                    }}
                    className="w-full mt-2 rounded bg-zinc-900 px-2 py-1 text-center font-medium text-white hover:bg-zinc-800 transition-colors text-[11px]"
                  >
                    Open Underwriting
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </APIProvider>

      {/* Top filter bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center gap-2 border-b border-pp-border/18 bg-pp-header/94 p-2.5 shadow-inset-border backdrop-blur-md">
        {(['All regions', 'California', 'Florida'] as LiveRegionFilter[]).map((item) => (
          <FilterButton
            key={item}
            active={props.region === item}
            onClick={() => props.onRegionChange(item)}
          >
            {item}
          </FilterButton>
        ))}
        <span className="mx-1 h-6 w-px bg-white/10" />

        {/* Map Type Quick Switcher (Roadmap, Satellite, Terrain) */}
        <div className="flex items-center gap-1 rounded-md border border-pp-border/20 bg-pp-surface/70 p-0.5">
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
              className={`px-2 py-1 text-xs rounded transition-colors ${
                mapType === type
                  ? 'bg-pp-gold text-zinc-950 font-semibold'
                  : 'text-pp-muted hover:text-pp-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Refreshing & Snapshot indicator */}
        <div className="ml-auto flex items-center gap-2">
          {/* Google Maps API status indicator */}
          <button
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
          </button>

          {props.isRefreshing ? (
            <span className="filter-button inline-flex items-center gap-2 max-lg:hidden text-pp-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pp-gold" />
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
            <span className="filter-button inline-flex items-center max-lg:hidden text-pp-faint">
              No snapshot
            </span>
          )}
        </div>
      </div>

      {/* Left map camera controls */}
      <div className="absolute left-3 top-20 z-20 grid gap-1 rounded-md border border-pp-border/18 bg-pp-surface/95 p-1 shadow-map-controls">
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
        <button
          type="button"
          className="control-button w-full justify-between"
          aria-expanded={layersOpen}
          aria-controls="map-layer-options"
          onClick={() => setLayersOpen((open) => !open)}
        >
          <span className="flex items-center gap-2">
            <Stack size={17} className="text-pp-gold" />
            {props.layer}
          </span>
        </button>
        <AnimatePresence>
          {layersOpen && (
            <motion.div
              id="map-layer-options"
              aria-label="Map data layers"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 210, damping: 24 }}
              className="mt-1 overflow-hidden rounded-md border border-pp-border/18 bg-pp-surface/96 p-1 shadow-map-panel backdrop-blur-md"
            >
              {layerModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    props.onLayerChange(mode)
                    setLayersOpen(false)
                  }}
                  type="button"
                  aria-pressed={mode === props.layer}
                  className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm ${
                    mode === props.layer
                      ? 'bg-pp-gold/10 text-pp-gold'
                      : 'text-pp-muted hover:bg-pp-border/[.07]'
                  }`}
                >
                  {mode === props.layer ? <Eye size={15} /> : <EyeSlash size={15} />} {mode}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Score Tier Legend */}
      <div className="absolute bottom-7 left-3 z-20 w-[170px] border border-pp-border/18 bg-pp-surface/94 p-3 text-xs shadow-xs backdrop-blur-md rounded-md">
        <div className="mb-2 font-medium text-pp-text flex items-center justify-between">
          <span>{props.layer}</span>
          <span className="text-[10px] text-pp-muted">{props.parcels.length} parcels</span>
        </div>
        {[
          [80, 'Exceptional', '#f5b544'],
          [65, 'Strong', '#4ad19a'],
          [50, 'Viable', '#7fb3ff'],
          [20, 'Baseline', '#71717a'],
        ].map(([val, label, col]) => (
          <div key={label as string} className="flex items-center gap-2 py-0.5 text-pp-muted">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: col as string }}
            />
            <span>{val}+</span>
            <span className="ml-auto">{label}</span>
          </div>
        ))}
      </div>

      {/* Bottom Search shortcut pill */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-pp-border/20 bg-pp-surface/85 px-4 py-2 text-xs font-medium text-pp-text backdrop-blur-md max-sm:hidden transition-colors hover:bg-pp-surface">
        <MagnifyingGlass size={15} className="text-pp-gold" />
        <span>
          Press{' '}
          <kbd className="mx-1 rounded-sm border border-pp-border/30 bg-pp-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-pp-muted">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>{' '}
          to search parcels
        </span>
      </div>

      {/* Loading Skeleton Overlay */}
      {mapBusy && (
        <div
          className="absolute inset-0 z-30 grid place-items-center bg-pp-page/80 backdrop-blur-xs"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="w-[320px] space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-pp-muted mb-2">
              <Globe size={18} className="animate-spin text-pp-gold" />
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
        <div className="absolute inset-0 z-30 grid place-items-center bg-pp-page p-8 text-center">
          <div>
            <p className="font-medium">Live parcel data could not be loaded.</p>
            <p className="mt-2 text-sm text-pp-muted">
              {props.error ?? 'Check the network connection, then try again.'}
            </p>
            {props.onRetry ? (
              <button type="button" className="primary-button mt-4 mx-auto" onClick={props.onRetry}>
                Retry
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Empty Parcels Overlay */}
      {!props.loading && props.parcels.length === 0 && !props.error && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-pp-page/90 p-8 text-center">
          <div className="max-w-md">
            {(props.totalCount ?? 0) === 0 ? (
              <>
                <p className="font-medium text-pp-text">No LIVE scored parcels yet</p>
                <p className="mt-2 text-sm text-pp-muted">
                  The workspace reads <span className="font-mono text-pp-faint">parcel_scores</span> with{' '}
                  <span className="font-mono text-pp-faint">data_source=LIVE</span>. Ingest counties and run
                  underwriting to populate this Google Map.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {props.onOpenDeals ? (
                    <button type="button" className="primary-button" onClick={props.onOpenDeals}>
                      Open ranked deals
                    </button>
                  ) : null}
                  {props.onOpenAdmin ? (
                    <button type="button" className="control-button" onClick={props.onOpenAdmin}>
                      Open admin pipeline
                    </button>
                  ) : null}
                  {props.onRetry ? (
                    <button type="button" className="control-button" onClick={props.onRetry}>
                      Refresh
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <p className="font-medium text-pp-text">No parcels in this region</p>
                <p className="mt-2 text-sm text-pp-muted">
                  {(props.totalCount ?? 0).toLocaleString()} live parcels loaded — try All regions or switch state
                  filter.
                </p>
                {props.onOpenDeals ? (
                  <button type="button" className="primary-button mt-4 mx-auto" onClick={props.onOpenDeals}>
                    Open ranked deals
                  </button>
                ) : null}
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
              className="relative w-full max-w-md rounded-lg border border-pp-border/30 bg-pp-surface p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setKeyModalOpen(false)}
                className="absolute right-4 top-4 text-pp-muted hover:text-pp-text"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Globe size={22} className="text-pp-gold" />
                <h3 className="text-base font-semibold text-pp-text">Google Maps Platform Integration</h3>
              </div>

              <p className="text-xs text-pp-muted leading-relaxed">
                The application connects to Google Maps Platform via the official{' '}
                <code className="rounded bg-pp-surface-raised px-1 py-0.5 text-pp-text">@vis.gl/react-google-maps</code>{' '}
                SDK with vector rendering, Advanced Markers, and satellite layers.
              </p>

              <div className="mt-4 rounded-md border border-pp-border/20 bg-pp-surface-soft p-3">
                <div className="flex items-center justify-between text-xs font-medium text-pp-text mb-1">
                  <span>Free Demo Key Quickstart</span>
                  <span className="text-emerald-400">Zero-cost Prototyping</span>
                </div>
                <p className="text-[11px] text-pp-muted mb-2">
                  Generate a free demo key with no billing required via Google Maps Platform:
                </p>
                <a
                  href={DEMO_KEY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded bg-pp-gold/15 px-2.5 py-1 text-xs font-medium text-pp-gold hover:bg-pp-gold/25 transition-colors"
                >
                  <span>Get Google Maps Demo Key</span>
                  <ArrowsOut size={13} />
                </a>
              </div>

              <div className="mt-4">
                <label htmlFor="gmp-key-input" className="block text-xs font-medium text-pp-text mb-1.5">
                  Your Google Maps API Key
                </label>
                <input
                  id="gmp-key-input"
                  type="password"
                  placeholder="AIzaSy..."
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  className="w-full rounded border border-pp-border/30 bg-pp-page px-3 py-2 font-mono text-xs text-pp-text placeholder:text-pp-faint focus:border-pp-gold focus:outline-hidden"
                />
                <p className="mt-1 text-[11px] text-pp-muted">
                  Stored securely for your session. Alternatively define{' '}
                  <code className="text-pp-faint">VITE_GOOGLE_MAPS_API_KEY</code> in environment variables.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setKeyModalOpen(false)}
                  className="rounded px-3 py-1.5 text-xs text-pp-muted hover:text-pp-text"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="primary-button text-xs"
                >
                  Save Key
                </button>
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
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      type="button"
      className="grid h-8 w-8 place-items-center rounded-sm text-pp-muted hover:bg-pp-surface-soft active:translate-y-px"
    >
      {children}
    </button>
  )
}
