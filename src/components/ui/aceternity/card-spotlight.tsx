import React, { useRef, useState, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: number
  color?: string
  children: React.ReactNode
  className?: string
}

/**
 * CardSpotlight — Aceternity UI component.
 * Tracks pointer coordinates on hover and projects a subtle, institutional
 * radial gradient spotlight across the surface.
 *
 * Eliminates unnecessary canvas overhead by utilizing CSS variables and
 * hardware-accelerated radial gradients.
 */
export function CardSpotlight({
  children,
  radius = 350,
  color = 'rgba(47, 95, 255, 0.08)',
  className,
  ...props
}: CardSpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return

    const div = divRef.current
    const rect = div.getBoundingClientRect()

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => {
    setIsFocused(true)
    setOpacity(1)
  }

  const handleBlur = () => {
    setIsFocused(false)
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-card transition-all duration-300',
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${color}, transparent 80%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
