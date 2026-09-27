/**
 * Deterministic property imagery generator and metadata catalog for real estate parcels.
 * Provides categorized photo gallery feeds (Exterior, Aerial Ortho, Backyard, Renovation Layout)
 * with responsive dimensions and CDN query parameters optimized for lazy loading.
 */

export interface PropertyImageItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  category: "exterior" | "aerial" | "interior" | "yard";
  description: string;
  badge?: string;
}

const EXTERIOR_PHOTOS = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&q=80&w=900",
];

const AERIAL_PHOTOS = [
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=900",
];

const INTERIOR_PHOTOS = [
  "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=900",
];

const YARD_PHOTOS = [
  "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1584738766473-61c083514bf4?auto=format&fit=crop&q=80&w=900",
];

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a deterministic gallery of photos for a parcel or deal.
 */
export function getPropertyGalleryImages(
  parcelId: string = "default",
  address: string = ""
): PropertyImageItem[] {
  const seed = stringHash(parcelId + address);

  const extIndex = seed % EXTERIOR_PHOTOS.length;
  const aerialIndex = (seed >> 2) % AERIAL_PHOTOS.length;
  const interiorIndex = (seed >> 4) % INTERIOR_PHOTOS.length;
  const yardIndex = (seed >> 6) % YARD_PHOTOS.length;

  const extUrl = EXTERIOR_PHOTOS[extIndex];
  const aerialUrl = AERIAL_PHOTOS[aerialIndex];
  const interiorUrl = INTERIOR_PHOTOS[interiorIndex];
  const yardUrl = YARD_PHOTOS[yardIndex];

  return [
    {
      id: `${parcelId}-ext`,
      url: extUrl,
      thumbnailUrl: extUrl.replace("w=900", "w=240"),
      title: "Front Elevation",
      category: "exterior",
      description: "Street-level front facade & curb appraisal",
      badge: "Street View",
    },
    {
      id: `${parcelId}-aerial`,
      url: aerialUrl,
      thumbnailUrl: aerialUrl.replace("w=900", "w=240"),
      title: "Aerial Ortho (NAIP 0.6m)",
      category: "aerial",
      description: "Cadastral lot boundary & roof envelope inspection",
      badge: "NAIP Ortho",
    },
    {
      id: `${parcelId}-interior`,
      url: interiorUrl,
      thumbnailUrl: interiorUrl.replace("w=900", "w=240"),
      title: "Scope & Layout",
      category: "interior",
      description: "Open floor plan & value-add expansion potential",
      badge: "Floor Layout",
    },
    {
      id: `${parcelId}-yard`,
      url: yardUrl,
      thumbnailUrl: yardUrl.replace("w=900", "w=240"),
      title: "Lot & Setback",
      category: "yard",
      description: "Rear boundary, ADU zoning clearance & topography",
      badge: "Lot Bounds",
    },
  ];
}
