import React from 'react'
import { cn } from '@/lib/utils'

export interface BentoGridProps {
  className?: string
  children?: React.ReactNode
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

export interface BentoGridItemProps {
  className?: string
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
  badge?: string
  children?: React.ReactNode
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  badge,
  children,
}: BentoGridItemProps) {
  return (
    <div
      className={cn(
        'group/bento relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300',
        className
      )}
    >
      {/* Visual Header / Graphics / Interactive Slot */}
      {header && <div className="mb-4 overflow-hidden rounded-xl">{header}</div>}

      {/* Item Body */}
      <div className="flex flex-col gap-2 transition-transform duration-200 group-hover/bento:translate-x-0.5">
        <div className="flex items-center justify-between gap-2">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              {icon}
            </div>
          )}
          {badge && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              {badge}
            </span>
          )}
        </div>

        {title && (
          <div className="font-sans font-bold text-slate-900 text-lg tracking-tight mt-1">
            {title}
          </div>
        )}

        {description && (
          <div className="font-sans font-normal text-slate-600 text-sm leading-relaxed">
            {description}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
