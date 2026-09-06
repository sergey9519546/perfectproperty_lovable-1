import React, { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface TabItem {
  title: string
  value: string
  icon?: React.ReactNode
  badge?: string
  content?: React.ReactNode
}

export interface AnimatedTabsProps {
  tabs: TabItem[]
  containerClassName?: string
  activeTabClassName?: string
  tabClassName?: string
  contentClassName?: string
  defaultValue?: string
  onChange?: (value: string) => void
}

/**
 * AnimatedTabs — Aceternity UI component.
 * Physics-based spring pill navigation between views and modes.
 * Perfectly suited for switching between "Deals (Active MLS)", "Shadow (Pre-Foreclosure)",
 * "Prophecy (Predictive)", and analytical perspectives.
 */
export function AnimatedTabs({
  tabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
  defaultValue,
  onChange,
}: AnimatedTabsProps) {
  const [active, setActive] = useState<TabItem>(
    tabs.find((t) => t.value === defaultValue) || tabs[0]
  )

  const handleSelect = (tab: TabItem) => {
    setActive(tab)
    onChange?.(tab.value)
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className={cn(
          'flex flex-row items-center justify-center [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full p-1.5 bg-slate-100/90 border border-slate-200 rounded-full',
          containerClassName
        )}
      >
        {tabs.map((tab) => {
          const isActive = active.value === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleSelect(tab)}
              className={cn(
                'relative px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-2',
                isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800',
                tabClassName
              )}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {isActive && (
                <motion.div
                  layoutId="clickedbutton"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  className={cn(
                    'absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(15,23,42,0.08)]',
                    activeTabClassName
                  )}
                />
              )}

              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                <span>{tab.title}</span>
                {tab.badge && (
                  <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.2 text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {active.content && (
        <div className={cn('mt-8 w-full', contentClassName)}>
          <motion.div
            key={active.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {active.content}
          </motion.div>
        </div>
      )}
    </div>
  )
}
