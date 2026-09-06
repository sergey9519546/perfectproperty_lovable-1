import { useState } from 'react'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { ArrowSquareOut, Camera, Globe } from '@phosphor-icons/react'
import {
  GMP_ATTRIBUTION_ID,
  DEFAULT_MAP_ID,
  DARK_MAP_STYLE,
  getGoogleMapsApiKey,
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
  const apiKey = getGoogleMapsApiKey()

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`

  return (
    <div className={`relative overflow-hidden rounded-md border border-pp-border bg-pp-header ${className ?? 'h-44 w-full'}`}>
      <APIProvider apiKey={apiKey} libraries={['marker', 'places']}>
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
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
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
          className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
            mapType === 'roadmap' ? 'bg-pp-gold text-zinc-950 font-bold' : 'text-zinc-300 hover:text-white'
          }`}
        >
          Vector
        </button>
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
            mapType === 'satellite' ? 'bg-pp-gold text-zinc-950 font-bold' : 'text-zinc-300 hover:text-white'
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
          <Globe size={12} className="text-pp-gold" />
          <span>Google Maps</span>
          <ArrowSquareOut size={10} className="opacity-70" />
        </a>
      </div>
    </div>
  )
}
