import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export interface CompareProps {
  firstImage?: string
  secondImage?: string
  firstLabel?: string
  secondLabel?: string
  firstContent?: React.ReactNode
  secondContent?: React.ReactNode
  className?: string
  initialSliderPercentage?: number
  slideMode?: 'hover' | 'drag'
  showHandlebar?: boolean
}

/**
 * Compare — Aceternity UI component.
 * Interactive split-pane comparison slider between two visual or textual states.
 */
export function Compare({
  firstImage,
  secondImage,
  firstLabel = 'Before',
  secondLabel = 'After',
  firstContent,
  secondContent,
  className,
  initialSliderPercentage = 50,
  slideMode = 'drag',
  showHandlebar = true,
}: CompareProps) {
  const [sliderPosition, setSliderPosition] = useState(initialSliderPercentage)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePositionChange = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = () => {
    if (slideMode === 'drag') setIsDragging(true)
  }

  const handleMouseUp = () => {
    if (slideMode === 'drag') setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (slideMode === 'hover' || (slideMode === 'drag' && isDragging)) {
      handlePositionChange(e.clientX)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      handlePositionChange(e.touches[0].clientX)
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
      className={cn(
        'relative overflow-hidden select-none rounded-xl border border-slate-200 bg-slate-100 h-80 w-full',
        className
      )}
    >
      {/* Right / Second Layer (Underneath) */}
      <div className="absolute inset-0 w-full h-full">
        {secondImage ? (
          <img
            src={secondImage}
            alt={secondLabel}
            className="w-full h-full object-cover"
          />
        ) : (
          secondContent
        )}
        <div className="absolute bottom-3 right-3 z-10 rounded bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
          {secondLabel}
        </div>
      </div>

      {/* Left / First Layer (Clipped by slider position) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {firstImage ? (
          <img
            src={firstImage}
            alt={firstLabel}
            className="w-full h-full object-cover"
          />
        ) : (
          firstContent
        )}
        <div className="absolute bottom-3 left-3 z-10 rounded bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
          {firstLabel}
        </div>
      </div>

      {/* Dividing Handle */}
      {showHandlebar && (
        <div
          className="absolute top-0 bottom-0 z-30 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.4)] cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-md">
            <span className="text-[10px] font-bold tracking-tighter">⇄</span>
          </div>
        </div>
      )}
    </div>
  )
}
