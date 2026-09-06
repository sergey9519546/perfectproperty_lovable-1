import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface HoverEffectItem {
  title: string
  description: string
  link?: string
  badge?: string
  icon?: React.ReactNode
  onClick?: () => void
}

export interface HoverEffectProps {
  items: HoverEffectItem[]
  className?: string
}

/**
 * HoverEffect — Aceternity UI component.
 * Shared dynamic backdrop that smoothly glides underneath grid items as
 * the user hovers across cards.
 */
export function HoverEffect({ items, className }: HoverEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-6 gap-4',
        className
      )}
    >
      {items.map((item, idx) => {
        const Content = (
          <div
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={item.onClick}
            className="relative group block p-2 h-full w-full cursor-pointer"
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full bg-blue-50/80 rounded-2xl block border border-blue-200/60"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.1 },
                  }}
                />
              )}
            </AnimatePresence>
            <div className="rounded-xl h-full w-full p-5 overflow-hidden bg-white border border-slate-200/80 group-hover:border-slate-300 relative z-20 flex flex-col justify-between transition-all duration-200 shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {item.icon && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                      {item.icon}
                    </div>
                  )}
                  {item.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-slate-900 font-bold tracking-tight text-base mb-1.5">
                  {item.title}
                </h4>
                <p className="text-slate-600 tracking-normal text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        )

        return (
          <React.Fragment key={item.title || idx}>
            {item.link ? (
              <a href={item.link} className="h-full w-full block">
                {Content}
              </a>
            ) : (
              Content
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
