import React, { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface InfiniteMovingCardsItem {
  quote?: string
  name?: string
  title?: string
  tag?: string
  metric?: string
  delta?: string
  badge?: string
}

export interface InfiniteMovingCardsProps {
  items: InfiniteMovingCardsItem[]
  direction?: 'left' | 'right'
  speed?: 'fast' | 'normal' | 'slow'
  pauseOnHover?: boolean
  className?: string
}

/**
 * InfiniteMovingCards — Aceternity UI component.
 * Continuously loops content horizontally with hardware-accelerated CSS animations.
 */
export function InfiniteMovingCards({
  items,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLUListElement>(null)
  const [start, setStart] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return

    // Avoid duplicate appending if re-rendered
    if (!scrollerRef.current.getAttribute('data-duplicated')) {
      const scrollerContent = Array.from(scrollerRef.current.children)
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true)
        scrollerRef.current?.appendChild(duplicatedItem)
      })
      scrollerRef.current.setAttribute('data-duplicated', 'true')
    }

    if (direction === 'left') {
      containerRef.current.style.setProperty('--animation-direction', 'forwards')
    } else {
      containerRef.current.style.setProperty('--animation-direction', 'reverse')
    }

    if (speed === 'fast') {
      containerRef.current.style.setProperty('--animation-duration', '24s')
    } else if (speed === 'normal') {
      containerRef.current.style.setProperty('--animation-duration', '42s')
    } else {
      containerRef.current.style.setProperty('--animation-duration', '80s')
    }

    setStart(true)
  }, [direction, speed])

  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]',
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          'flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap',
          start && 'animate-scroll',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="w-[320px] max-w-full relative rounded-xl border border-slate-200 bg-card px-5 py-4 shrink-0 transition-colors shadow-xs hover:border-slate-300"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              {item.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-blue-100 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {item.metric && (
                <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {item.metric} {item.delta && <span className="text-[10px] font-normal text-emerald-600">{item.delta}</span>}
                </span>
              )}
            </div>

            {item.quote && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                "{item.quote}"
              </p>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">{item.name}</span>
                <span className="text-[11px] text-muted-foreground">{item.title}</span>
              </div>
              {item.tag && (
                <span className="text-[10px] font-mono text-slate-400">
                  {item.tag}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
