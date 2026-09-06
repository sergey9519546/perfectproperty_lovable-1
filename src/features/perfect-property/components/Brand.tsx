import { BRAND_CONFIG } from "@/lib/brand";

export { BRAND_CONFIG };

export interface BrandProps {
  id?: string;
  compact?: boolean;
  variant?: "uppercase" | "titlecase";
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}

export function Brand({
  id = "brand-logo",
  compact = false,
  variant = "uppercase",
  className = "",
  textClassName = "",
  iconClassName = "",
}: BrandProps) {
  const filterId = `${id}-filter`;
  const { mark } = BRAND_CONFIG;

  return (
    <div id={id} className={`flex items-center gap-3 max-sm:gap-2.5 ${className}`} aria-label={BRAND_CONFIG.name}>
      <svg
        viewBox={mark.viewBox}
        className={iconClassName || (compact ? "h-8 w-8 shrink-0" : "h-9 w-9 shrink-0")}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.15" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path fill="currentColor" d={mark.gabledSilhouettePath} />
        <g fill={mark.windowColor} filter={`url(#${filterId})`}>
          {mark.windows.map((win) => (
            <rect key={`${win.x}-${win.y}`} x={win.x} y={win.y} width={win.width} height={win.height} />
          ))}
        </g>
      </svg>
      {!compact && (
        <span
          className={`whitespace-nowrap text-lg font-bold tracking-wider leading-none max-sm:text-sm max-sm:tracking-wide ${textClassName}`}
        >
          {variant === "titlecase" ? BRAND_CONFIG.name : BRAND_CONFIG.displayName}
        </span>
      )}
    </div>
  );
}


