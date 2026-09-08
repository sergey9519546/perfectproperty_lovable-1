import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export type Direction = 'TOP' | 'LEFT' | 'BOTTOM' | 'RIGHT'

export interface HoverBorderGradientProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType
  containerClassName?: string
  className?: string
  duration?: number
  clockwise?: boolean
  children?: React.ReactNode
}

/**
 * HoverBorderGradient — Aceternity UI component.
 * Produces an elegant, rotating border highlight on interactive elements.
 * Ideal for primary CTA triggers, underwriting execution buttons, and featured badges.
 */
export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = 'button',
  duration = 1,
  clockwise = true,
  ...props
}: HoverBorderGradientProps) {
  const [hovered, setHovered] = useState<boolean>(false)
  const [direction, setDirection] = useState<Direction>('TOP')

  const rotateDirection = useCallback((currentDirection: Direction): Direction => {
    const directions: Direction[] = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT']
    const currentIndex = directions.indexOf(currentDirection)
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length
    return directions[nextIndex]
  }, [clockwise])

  const movingMap: Record<Direction, string> = {
    TOP: 'radial-gradient(20.7% 50% at 50% 0%, #2F5FFF 0%, rgba(47, 95, 255, 0) 100%)',
    LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, #2F5FFF 0%, rgba(47, 95, 255, 0) 100%)',
    BOTTOM: 'radial-gradient(20.7% 50% at 50% 100%, #2F5FFF 0%, rgba(47, 95, 255, 0) 100%)',
    RIGHT: 'radial-gradient(16.2% 41.2% at 100% 50%, #2F5FFF 0%, rgba(47, 95, 255, 0) 100%)',
  }

  const highlight =
    'radial-gradient(75% 181.15% at 50% 50%, #2F5FFF 0%, rgba(47, 95, 255, 0) 100%)'

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState))
      }, duration * 1000)
      return () => clearInterval(interval)
    }
  }, [hovered, duration, rotateDirection])

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative flex rounded-full border border-slate-200/80 content-center bg-card transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit cursor-pointer',
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          'w-auto text-foreground z-10 bg-card px-5 py-2.5 rounded-full font-semibold text-sm',
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          'flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]'
        )}
        style={{
          filter: 'blur(2px)',
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: 'linear', duration: duration ?? 1 }}
      />
      <div className="bg-card absolute z-1 flex-none inset-[2px] rounded-full" />
    </Tag>
  )
}
