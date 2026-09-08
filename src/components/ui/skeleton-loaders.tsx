import React from 'react';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

/**
 * TableSkeleton
 * Renders a full data table loading skeleton with headers and formatted row cells.
 */
export function TableSkeleton({
  rows = 6,
  columns = [
    { width: 'w-1/4' },
    { width: 'w-1/6' },
    { width: 'w-1/8' },
    { width: 'w-1/8', align: 'right' },
    { width: 'w-1/8', align: 'right' },
    { width: 'w-1/8', align: 'right' },
  ],
  className,
}: {
  rows?: number;
  columns?: Array<{ width: string; align?: 'left' | 'right' }>;
  className?: string;
}) {
  return (
    <div className={cn('w-full border border-border/60 rounded-2xl overflow-hidden bg-card/50', className)}>
      {/* Table Header Skeleton */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-muted/60 border-b border-border/50">
        {columns.map((col, idx) => (
          <div key={idx} className={cn('flex items-center', col.align === 'right' ? 'justify-end' : 'justify-start', col.width)}>
            <Skeleton className="h-3.5 w-20 rounded-md" />
          </div>
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-border/30">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between px-6 py-4 transition-colors">
            {columns.map((col, cIdx) => (
              <div key={cIdx} className={cn('flex items-center', col.align === 'right' ? 'justify-end' : 'justify-start', col.width)}>
                {cIdx === 0 ? (
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/2 rounded-md opacity-60" />
                  </div>
                ) : (
                  <Skeleton className={cn('h-4 rounded-md', cIdx % 2 === 0 ? 'w-16' : 'w-20')} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * CardGridSkeleton
 * Renders a grid of property/deal auction cards matching design system radii and colors.
 */
export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5', className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs space-y-4 relative overflow-hidden"
        >
          {/* Top Badge & Header Line */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>

          {/* Address Title */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-4/5 rounded-lg" />
            <Skeleton className="h-3.5 w-3/5 rounded-md opacity-70" />
          </div>

          {/* 3-Col Metric Summary */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted/50 border border-border/40">
            <div className="space-y-1">
              <Skeleton className="h-3 w-12 rounded-xs" />
              <Skeleton className="h-4 w-16 rounded-sm" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-12 rounded-xs" />
              <Skeleton className="h-4 w-16 rounded-sm" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-12 rounded-xs" />
              <Skeleton className="h-4 w-16 rounded-sm" />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * MetricsHeaderSkeleton
 * 4-card KPI summary banner skeleton.
 */
export function MetricsHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl border border-border/60 bg-card/80 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Skeleton className="h-3 w-40 rounded-md opacity-70" />
        </div>
      ))}
    </div>
  );
}

/**
 * EvidencePanelSkeleton
 * Right-hand underwriting evidence inspector drawer skeleton.
 */
export function EvidencePanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 rounded-2xl border border-border bg-card space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-xl" />
          <Skeleton className="h-3.5 w-32 rounded-md" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-3.5 rounded-xl border border-border/50 bg-muted/40 space-y-2">
            <Skeleton className="h-3 w-20 rounded-xs" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-2.5 w-28 rounded-xs opacity-60" />
          </div>
        ))}
      </div>

      {/* AI Guidance Box */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full bg-primary/30" />
          <Skeleton className="h-4 w-36 rounded-md bg-primary/20" />
        </div>
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-4/5 rounded-md" />
      </div>

      {/* Action Button */}
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

/**
 * DossierModalSkeleton
 * Modal/Drawer 4-panel dossier inspector loading state.
 */
export function DossierModalSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 rounded-3xl border border-border bg-card space-y-6 max-w-4xl w-full mx-auto', className)}>
      {/* Modal Title & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded-xl" />
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/40">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-9 w-28 shrink-0 rounded-xl" />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * CountyDirectorySkeleton
 * County listing cards skeleton.
 */
export function CountyDirectorySkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-4 rounded-2xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-24 rounded-md opacity-70" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-8 flex-1 rounded-xl" />
            <Skeleton className="h-8 w-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
