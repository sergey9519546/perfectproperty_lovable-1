import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  MapPin,
  Image as ImageIcon,
  Compass,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  getPropertyGalleryImages,
  type PropertyImageItem,
} from "@/lib/property-images";

export interface PropertyGalleryProps {
  parcelId?: string;
  address?: string;
  images?: PropertyImageItem[];
  mode?: "full" | "compact" | "thumbnail";
  className?: string;
  onImageClick?: (index: number) => void;
  showBadges?: boolean;
}

/**
 * LazyImage component with native browser lazy loading, async decoding,
 * skeleton placeholder shimmer, and graceful fallback on network error.
 */
export const LazyPropertyImage = memo(function LazyPropertyImage({
  src,
  alt,
  className = "",
  aspectRatioClass = "aspect-[16/10]",
  loading = "lazy",
  priority = false,
  onLoad,
}: {
  src: string;
  alt: string;
  className?: string;
  aspectRatioClass?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  onLoad?: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset states if src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-muted/70 ${aspectRatioClass} ${className}`}
    >
      {/* Shimmer skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted/40 to-muted" />
      )}

      {/* Fallback Cadastral Vector if image fails to load */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card p-4 text-center">
          <div className="rounded-full bg-muted p-2.5 text-muted-foreground mb-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <span className="text-xs font-semibold text-foreground">
            Cadastral Vector Available
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            NAIP imagery pending flyover sync
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : loading}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
});

export function PropertyGallery({
  parcelId = "default-parcel",
  address = "Property Address",
  images: customImages,
  mode = "full",
  className = "",
  showBadges = true,
}: PropertyGalleryProps) {
  const images = customImages && customImages.length > 0
    ? customImages
    : getPropertyGalleryImages(parcelId, address);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredImages = activeCategory === "all"
    ? images
    : images.filter((img) => img.category === activeCategory);

  const activeImage = filteredImages[currentIndex] || images[0];

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    },
    [filteredImages.length]
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    },
    [filteredImages.length]
  );

  // Keyboard navigation for modal lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, filteredImages.length]);

  // COMPACT MODE: Ideal for cards and grid previews
  if (mode === "compact") {
    return (
      <div className={`relative group overflow-hidden rounded-xl border border-border bg-muted/40 ${className}`}>
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="cursor-pointer relative overflow-hidden"
        >
          <LazyPropertyImage
            src={activeImage.url}
            alt={`${address} - ${activeImage.title}`}
            aspectRatioClass="aspect-[16/10]"
            loading="lazy"
            priority={false}
          />

          {/* Top Badge: Category & Status */}
          {showBadges && activeImage.badge && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-100 backdrop-blur-xs border border-white/10 shadow-xs">
                {activeImage.category === "aerial" && <Compass className="h-3 w-3 text-cyan-400" />}
                {activeImage.category === "exterior" && <MapPin className="h-3 w-3 text-amber-400" />}
                {activeImage.category === "interior" && <Layers className="h-3 w-3 text-emerald-400" />}
                {activeImage.badge}
              </span>
            </div>
          )}

          {/* Photo Count Indicator */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-mono text-zinc-200 backdrop-blur-xs shadow-xs">
              <ImageIcon className="h-3 w-3" />
              <span>{currentIndex + 1}/{filteredImages.length}</span>
            </span>
          </div>

          {/* Subtle bottom gradient with photo title */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 pt-6 text-left">
            <div className="text-xs font-semibold text-white truncate">
              {activeImage.title}
            </div>
            <div className="text-[10px] text-zinc-300 truncate">
              {activeImage.description}
            </div>
          </div>
        </div>

        {/* Previous / Next Hover Navigation Controls */}
        {filteredImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous property photo"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-all cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next property photo"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-all cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Mini dot indicators */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 flex gap-1">
          {filteredImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Jump to photo ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? "w-3 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        {/* Modal Lightbox */}
        {isLightboxOpen && (
          <LightboxModal
            images={filteredImages}
            currentIndex={currentIndex}
            address={address}
            onClose={() => setIsLightboxOpen(false)}
            onNext={handleNext}
            onPrev={handlePrev}
            onSelectIndex={setCurrentIndex}
          />
        )}
      </div>
    );
  }

  // FULL MODE: Used in Property Dossier / Details Modal
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Category Filter Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setCurrentIndex(0);
            }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer text-xs ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({images.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("exterior");
              setCurrentIndex(0);
            }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer text-xs ${
              activeCategory === "exterior"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Exterior
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("aerial");
              setCurrentIndex(0);
            }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer text-xs ${
              activeCategory === "aerial"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Aerial Ortho
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("interior");
              setCurrentIndex(0);
            }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer text-xs ${
              activeCategory === "interior"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Layout
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>Expand</span>
        </button>
      </div>

      {/* Main Hero Viewer */}
      <div className="relative group overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="cursor-pointer relative overflow-hidden"
        >
          <LazyPropertyImage
            src={activeImage.url}
            alt={`${address} - ${activeImage.title}`}
            aspectRatioClass="aspect-[16/9]"
            loading="lazy"
            priority={false}
          />

          {/* Overlay Badge */}
          {activeImage.badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950/85 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-100 backdrop-blur-xs border border-white/10 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                {activeImage.badge}
              </span>
            </div>
          )}

          {/* Details Bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3 pt-8 flex items-end justify-between">
            <div className="text-left text-white">
              <div className="text-sm font-bold">{activeImage.title}</div>
              <div className="text-xs text-slate-300 line-clamp-1">
                {activeImage.description}
              </div>
            </div>
            <span className="rounded bg-black/60 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-200">
              {currentIndex + 1} / {filteredImages.length}
            </span>
          </div>
        </div>

        {/* Prev / Next Controls */}
        {filteredImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/90 transition-all cursor-pointer backdrop-blur-xs shadow-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/90 transition-all cursor-pointer backdrop-blur-xs shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip with Lazy Loading */}
      {filteredImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {filteredImages.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative overflow-hidden rounded-lg border text-left transition-all cursor-pointer ${
                idx === currentIndex
                  ? "ring-2 ring-primary border-primary"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              <LazyPropertyImage
                src={img.thumbnailUrl}
                alt={img.title}
                aspectRatioClass="aspect-[16/10]"
                loading="lazy"
                priority={false}
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[9px] font-medium text-white truncate text-center">
                {img.title}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <LightboxModal
          images={filteredImages}
          currentIndex={currentIndex}
          address={address}
          onClose={() => setIsLightboxOpen(false)}
          onNext={handleNext}
          onPrev={handlePrev}
          onSelectIndex={setCurrentIndex}
        />
      )}
    </div>
  );
}

/**
 * Lightbox Modal for high-resolution property inspection.
 */
function LightboxModal({
  images,
  currentIndex,
  address,
  onClose,
  onNext,
  onPrev,
  onSelectIndex,
}: {
  images: PropertyImageItem[];
  currentIndex: number;
  address: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (idx: number) => void;
}) {
  const current = images[currentIndex] || images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Property photo gallery lightbox"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in-50 duration-200"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm sm:text-base">{address}</span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            • {current.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-slate-300">
            {currentIndex + 1} of {images.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo gallery"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Center Image Canvas */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="relative max-h-full max-w-4xl overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
          <LazyPropertyImage
            src={current.url}
            alt={`${address} - ${current.title}`}
            aspectRatioClass="aspect-[16/10]"
            loading="lazy"
            priority={true}
          />
        </div>

        <button
          type="button"
          onClick={onNext}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="border-t border-slate-800 bg-slate-900/90 p-3">
        <div className="mx-auto flex max-w-xl items-center justify-center gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border transition-all cursor-pointer ${
                idx === currentIndex
                  ? "border-blue-500 ring-2 ring-blue-500"
                  : "border-slate-700 opacity-60 hover:opacity-100"
              }`}
            >
              <LazyPropertyImage
                src={img.thumbnailUrl}
                alt={img.title}
                aspectRatioClass="aspect-[16/10]"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
