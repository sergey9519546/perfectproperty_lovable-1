import React from 'react'
import { cn } from '@/lib/utils'

interface GridPatternProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  squares?: Array<[x: number, y: number]>
  strokeDasharray?: string
  className?: string
  maskClassName?: string
}

/**
 * GridPattern — Cadastral coordinate grid from Aceternity UI.
 * Pure SVG grid without runtime JavaScript overhead.
 * Used to give cartographic and institutional depth to engineering surfaces.
 */
export function GridPattern({
  width = 32,
  height = 32,
  x = -1,
  y = -1,
  strokeDasharray = '0',
  squares,
  className,
  maskClassName = '[mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]',
  ...props
}: GridPatternProps) {
  const id = React.useId()

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        maskClassName,
        className
      )}
      {...props}
    >
      <svg
        className="absolute inset-0 h-full w-full stroke-slate-200/70 [stroke-width:1]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={id}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            x={x}
            y={y}
          >
            <path
              d={`M.5 ${height}V.5H${width}`}
              fill="none"
              strokeDasharray={strokeDasharray}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
        {squares && (
          <svg x={x} y={y} className="overflow-visible">
            {squares.map(([sqX, sqY], idx) => (
              <rect
                strokeWidth="0"
                key={`${sqX}-${sqY}-${idx}`}
                width={width - 1}
                height={height - 1}
                x={sqX * width + 1}
                y={sqY * height + 1}
                className="fill-blue-500/10 stroke-blue-400/20"
              />
            ))}
          </svg>
        )}
      </svg>
    </div>
  )
}

/**
 * DotBackground — Subtle coordinate matrix background.
 */
export function DotBackground({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center bg-white',
        'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      {children}
    </div>
  )
}
