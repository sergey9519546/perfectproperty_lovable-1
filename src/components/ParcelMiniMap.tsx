import { useState, useEffect } from 'react'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { ArrowSquareOut, Camera, Globe, MapPin } from '@phosphor-icons/react'
import {
  GMP_ATTRIBUTION_ID,
  DEFAULT_MAP_ID,
  DARK_MAP_STYLE,
  BILLING_ENABLE_URL,
  getGoogleMapsApiKey,
  isGoogleMapsBillingError,
  onGoogleMapsStatusChange,
} from '@/lib/google-maps'

type MapType = 'roadmap' | 'satellite' | 'hybrid'

interface Props {
  lat: number
  lng: number
  address?: string
  zoom?: number
  className?: string
}

export function ParcelMiniMap({ lat, lng, address, zoom = 16, className }: Props) {
  const [mapType, setMapType] = useState<MapType>('roadmap')
  const [isBillingError, setIsBillingError] = useState(() => isGoogleMapsBillingError())
  const apiKey = getGoogleMapsApiKey()

  useEffect(() => {
    return onGoogleMapsStatusChange((isErr) => {
      setIsBillingError(isErr)
    })
  }, [])

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`

  if (isBillingError || !apiKey) {
    return (
      <div className={`relative overflow-hidden rounded-md border border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 flex flex-col justify-between ${className ?? 'h-44 w-full'}`}>
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
              <MapPin size={16} weight="fill" />
            </span>
            <div>
              <p className="text-xs font-semibold text-zinc-100 truncate max-w-[200px]">
                {address || 'Target Property'}
              </p>
              <p className="font-mono text-[10px] text-zinc-400">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>
          </div>
          <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-mono font-medium text-amber-300">
            Cadastre Pin
          </span>
        </div>

        <div className="relative z-10 my-auto text-center py-1">
          <p className="text-[11px] text-zinc-400">
            {isBillingError
              ? 'Google Cloud Billing required for in-app map tiles.'
              : 'Google Maps API key configuring.'}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
          {isBillingError ? (
            <a
              href={BILLING_ENABLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-medium text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
            >
              Enable Cloud Billing
            </a>
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono">GPS Anchored</span>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            <a
              href={streetViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Google Street View"
              className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2 py-1 text-[10px] font-medium text-zinc-200 hover:text-white transition-colors border border-zinc-700 shadow-xs"
            >
              <Camera size={12} className="text-amber-400" />
              <span>Street View</span>
              <ArrowSquareOut size={10} className="opacity-70" />
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in Google Maps"
              className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2 py-1 text-[10px] font-medium text-zinc-200 hover:text-white transition-colors border border-zinc-700 shadow-xs"
            >
              <Globe size={12} className="text-primary" />
              <span>Google Maps</span>
              <ArrowSquareOut size={10} className="opacity-70" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-md border border-border bg-muted ${className ?? 'h-44 w-full'}`}>
      <APIProvider
        apiKey={apiKey}
        libraries={['marker', 'places']}
        onError={(err) => {
          console.warn('[ParcelMiniMap Google Maps API error]:', err);
        }}
      >
        <div className="h-full w-full">
          <Map
            mapId={DEFAULT_MAP_ID}
            internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
            defaultCenter={{ lat, lng }}
            defaultZoom={zoom}
            gestureHandling="greedy"
            disableDefaultUI={true}
            mapTypeId={mapType}
            styles={mapType === 'roadmap' ? DARK_MAP_STYLE : undefined}
            style={{ width: '100%', height: '100%' }}
          >
            <AdvancedMarker position={{ lat, lng }} title={address ?? 'Property location'}>
              <div className="relative flex items-center justify-center">
                <span className="absolute h-6 w-6 rounded-full bg-amber-400 opacity-40 animate-ping" />
                <div className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow-md">
                  <div className="h-1.5 w-1.5 rounded-full bg-card" />
                </div>
              </div>
            </AdvancedMarker>
          </Map>
        </div>
      </APIProvider>

      {/* Top Map Type Switcher */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded bg-black/70 p-0.5 backdrop-blur-xs">
        <button
          type="button"
          onClick={() => setMapType('roadmap')}
          className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors cursor-pointer ${
            mapType === 'roadmap' ? 'bg-primary text-primary-foreground font-bold' : 'text-zinc-300 hover:text-white'
          }`}
        >
          Vector
        </button>
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors cursor-pointer ${
            mapType === 'satellite' ? 'bg-primary text-primary-foreground font-bold' : 'text-zinc-300 hover:text-white'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Bottom External Actions */}
      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5">
        <a
          href={streetViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Google Street View"
          className="flex items-center gap-1 rounded bg-black/75 px-2 py-1 text-[10px] font-medium text-zinc-200 hover:bg-black hover:text-white transition-colors backdrop-blur-xs shadow-xs"
        >
          <Camera size={12} className="text-amber-400" />
          <span>Street View</span>
          <ArrowSquareOut size={10} className="opacity-70" />
        </a>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Google Maps"
          className="flex items-center gap-1 rounded bg-black/75 px-2 py-1 text-[10px] font-medium text-zinc-200 hover:bg-black hover:text-white transition-colors backdrop-blur-xs shadow-xs"
        >
          <Globe size={12} className="text-primary" />
          <span>Google Maps</span>
          <ArrowSquareOut size={10} className="opacity-70" />
        </a>
      </div>
    </div>
  )
}
