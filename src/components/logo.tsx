import { BRAND_CONFIG } from "@/lib/brand";
import { Brand } from "@/features/perfect-property/components/Brand";

export function LogoIcon({ className = "h-5 w-5 shrink-0" }: { className?: string }) {
  const { mark } = BRAND_CONFIG;
  return (
    <svg viewBox={mark.viewBox} className={className} aria-hidden="true">
      <path fill="currentColor" d={mark.gabledSilhouettePath} />
      <g fill={mark.windowColor}>
        {mark.windows.map((win) => (
          <rect key={`${win.x}-${win.y}`} x={win.x} y={win.y} width={win.width} height={win.height} />
        ))}
      </g>
    </svg>
  );
}

export function Logo({ className = "", textClassName = "" }: { className?: string; textClassName?: string }) {
  return (
    <Brand
      id="brand-logo"
      compact={false}
      className={className}
      textClassName={textClassName || "text-base font-bold tracking-tight text-foreground"}
      iconClassName="h-6 w-6 shrink-0 text-primary"
    />
  );
}
