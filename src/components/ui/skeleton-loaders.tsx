import React from 'react';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';
import { Search, Compass, Plus, Minus, ShieldCheck } from 'lucide-react';

/**
 * TableSkeleton
 * Renders a full data table loading skeleton with headers and formatted row cells.
 */
export function TableSkeleton({
  rows = 8,
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
 * 3- or 4-card KPI summary banner skeleton.
 */
export function MetricsHeaderSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', count === 3 && 'lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl border border-border/60 bg-card/80 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-lg opacity-80" />
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

/**
 * MapCanvasSkeleton
 * High-fidelity GIS / Property Map loading skeleton with top controls,
 * simulated geographic radar grid, floating zoom controls, and telemetry pills.
 */
export function MapCanvasSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-full h-full min-h-[400px] overflow-hidden bg-slate-900/90 text-slate-100 flex flex-col', className)}>
      {/* Top Controls Bar Skeleton */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Region & Asset Class Pills */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-2xl shadow-xl">
          <Skeleton className="h-8 w-36 rounded-xl bg-slate-800" />
          <div className="hidden sm:flex items-center gap-1.5 pl-1 border-l border-slate-700/60">
            <Skeleton className="h-8 w-14 rounded-xl bg-slate-800" />
            <Skeleton className="h-8 w-16 rounded-xl bg-slate-800" />
            <Skeleton className="h-8 w-16 rounded-xl bg-slate-800" />
          </div>
        </div>

        {/* Center/Right: Search Bar & Layer Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-2xl shadow-xl">
            <Search className="h-4 w-4 text-slate-400 shrink-0 animate-pulse" />
            <Skeleton className="h-6 w-48 sm:w-64 rounded-lg bg-slate-800" />
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-2xl shadow-xl">
            <Skeleton className="h-6 w-28 rounded-lg bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Simulated Map Canvas with Radar Grid & Mock Pin Nodes */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Subtle coordinate grid lines */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Pulsing Radar Scanning Sweep */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-blue-500/20 bg-blue-500/5 animate-ping pointer-events-none duration-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-blue-400/30 bg-radial from-blue-500/10 to-transparent pointer-events-none" />

        {/* Mock Marker Beacons */}
        <div className="absolute top-1/3 left-1/4 flex flex-col items-center gap-1 animate-pulse">
          <div className="h-7 w-12 rounded-full bg-blue-600/80 border border-blue-400 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            94
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-md" />
        </div>

        <div className="absolute top-1/2 left-3/5 flex flex-col items-center gap-1 animate-pulse delay-150">
          <div className="h-7 w-12 rounded-full bg-emerald-600/80 border border-emerald-400 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            88
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-md" />
        </div>

        <div className="absolute top-2/3 left-2/5 flex flex-col items-center gap-1 animate-pulse delay-300">
          <div className="h-7 w-12 rounded-full bg-blue-600/80 border border-blue-400 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            91
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-md" />
        </div>

        <div className="absolute top-2/5 left-3/4 flex flex-col items-center gap-1 animate-pulse delay-200">
          <div className="h-7 w-12 rounded-full bg-slate-600/80 border border-slate-400 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            74
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shadow-md" />
        </div>

        {/* Center Loading Status Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-6 py-4 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-semibold tracking-wide text-slate-200">
              Underwriting Cadastral Map Layer…
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Querying parcel geometries</span>
            <span>•</span>
            <span>Calibrating ARV comps</span>
          </div>
        </div>

        {/* Floating Right Map Controls Skeleton */}
        <div className="absolute right-4 top-24 z-20 flex flex-col gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-2xl shadow-xl pointer-events-none">
          <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
            <Plus className="h-4 w-4" />
          </div>
          <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
            <Minus className="h-4 w-4" />
          </div>
          <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
            <Compass className="h-4 w-4" />
          </div>
        </div>

        {/* Bottom Floating Legend & Telemetry Bar Skeleton */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-4 py-2 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-[11px] font-medium text-slate-300">Top Tier (80+)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-slate-300">Strong (65-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
              <span className="text-[11px] font-medium text-slate-300">Viable (&lt;65)</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-2 rounded-2xl shadow-xl">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <Skeleton className="h-4 w-32 rounded-md bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * NoticeParserSkeleton
 * Specialized skeleton for the Legal Notice Reader layout.
 */
export function NoticeParserSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Verdict & Plain English Banner Skeleton */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </div>

      {/* 16-Field Table Skeleton */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
        <Skeleton className="h-4 w-36 rounded-md mb-3" />
        <div className="divide-y divide-border/40">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 text-xs">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-3.5 w-44 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * SignalDashboardSkeleton
 * Comprehensive skeleton loader for high-signal dashboards (Shadow, Prophecy, Accuracy, Sheriff Sales).
 */
export function SignalDashboardSkeleton({
  mode = 'cards',
  cardCount = 6,
  kpiCount = 3,
  className,
}: {
  mode?: 'cards' | 'table';
  cardCount?: number;
  kpiCount?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* 3 or 4 KPI Metric Summary Cards */}
      <MetricsHeaderSkeleton count={kpiCount} />

      {/* Filter / Search Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-card/60">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Main Content Layout */}
      {mode === 'cards' ? (
        <CardGridSkeleton count={cardCount} />
      ) : (
        <TableSkeleton rows={8} />
      )}
    </div>
  );
}
