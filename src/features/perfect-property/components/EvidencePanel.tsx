import { EvidencePanelSkeleton } from '@/components/ui/skeleton-loaders'
import { Button } from "@/components/ui/button";
import { ArrowRight, Buildings, ChartLineUp, CheckCircle, Database, House, ShieldCheck, Warning } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import type { WorkspaceParcel } from '../live'
import { formatMoney, parcelTier, underwriteGuidance } from '../live'
import { formatShortDate } from '../data'
import { pct } from '@/lib/format'
import { TextGenerateEffect } from '@/components/ui/aceternity'

export function EvidencePanel({
  parcel,
  onUnderwrite,
  isSubmitting = false,
  onOpenFullDossier,
  isFocused = false,
  loading = false,
}: {
  parcel: WorkspaceParcel | null
  onUnderwrite: () => void
  isSubmitting?: boolean
  onOpenFullDossier?: (parcelId: string) => void
  isFocused?: boolean
  loading?: boolean
}) {
  if (loading) {
    return (
      <aside className="p-6 border-l border-pp-border bg-pp-surface">
        <EvidencePanelSkeleton />
      </aside>
    )
  }

  if (!parcel) {
    return (
      <aside
        id="property-details-panel"
        tabIndex={-1}
        className="evidence-panel flex items-center justify-center border-l border-pp-border bg-pp-surface p-8 text-center text-sm font-medium text-pp-muted relative z-10 outline-none"
      >
        Select a parcel to inspect underwriting evidence.
      </aside>
    )
  }

  const tier = parcelTier(parcel.score)
  const metrics = [
    {
      label: 'Modeled Offer',
      value: formatMoney(parcel.offer),
      detail: 'Estimated acquisition price',
      icon: House,
      tone: 'text-pp-text',
    },
    {
      label: 'Expected Profit',
      value: formatMoney(parcel.profit),
      detail: 'Gross modeled returns',
      icon: ChartLineUp,
      tone: 'text-profit-strong',
    },
    {
      label: 'Loss Risk',
      value: pct(parcel.lossRisk),
      detail: 'Monte Carlo P(loss)',
      icon: Warning,
      tone: parcel.lossRisk > 0.25 ? 'text-skeptic' : 'text-pp-text',
    },
    {
      label: 'Deal Odds',
      value: pct(parcel.dealOdds),
      detail: 'Accept probability',
      icon: ShieldCheck,
      tone: 'text-pp-text',
    },
  ]

  return (
    <aside
      id="property-details-panel"
      tabIndex={-1}
      aria-label="Property Underwriting Details"
      className={`evidence-panel min-h-0 overflow-y-auto border-l border-pp-border bg-pp-page relative z-10 outline-none transition-all duration-300 ${
        isFocused ? 'ring-2 ring-pp-gold shadow-lg' : ''
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={parcel.id}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <div className="flex-none p-6 pb-5 bg-pp-surface border-b border-pp-border">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase text-primary">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Live Underwriting</span>
              {isFocused && (
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-pp-gold tracking-normal">
                  ● In Focus
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-pp-text leading-snug">{parcel.address}</h2>
            <p className="mt-1 text-xs font-medium text-pp-muted flex items-center gap-1.5">
              <span>{parcel.marketLabel}{parcel.zip ? ` ${parcel.zip}` : ''}</span>
              <span className="text-pp-border-strong">•</span>
              <span className="font-semibold text-pp-text">{parcel.ringLabel}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-pp-muted">
              {[
                parcel.bedrooms != null || parcel.bathrooms != null
                  ? `${parcel.bedrooms ?? '—'} bed / ${parcel.bathrooms ?? '—'} bath`
                  : null,
                parcel.livingSqft != null ? `${parcel.livingSqft.toLocaleString()} sqft` : null,
                parcel.yearBuilt != null ? `Built ${parcel.yearBuilt}` : null,
                parcel.absentee ? 'Absentee Owner' : null,
              ]
                .filter(Boolean)
                .map((tag, i) => (
                  <span key={i} className="rounded-md border border-pp-border bg-pp-surface-soft px-2.5 py-1 text-pp-text text-[11px] font-medium">
                    {tag}
                  </span>
                ))}
            </div>
          </div>

          {/* Perfect Score section */}
          <section className="flex-none p-6 bg-pp-surface border-b border-pp-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-pp-faint">Perfect Score</h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-blue-200">
                {tier.label}
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <div className="font-mono text-5xl font-bold leading-none tracking-tight text-pp-text">
                {parcel.score.toFixed(1)}
              </div>
              <div className="text-xs text-pp-muted">
                {parcel.computedAt && (
                  <p className="text-[11px] text-pp-muted">
                    Updated <time dateTime={parcel.computedAt}>{formatShortDate(parcel.computedAt)}</time>
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg border border-pp-border bg-pp-page p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-pp-faint">Scope</span>
                <span className="mt-0.5 block font-bold text-pp-text">{parcel.scope}</span>
              </div>
              <div className="rounded-lg border border-pp-border bg-pp-page p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-pp-faint">Exit</span>
                <span className="mt-0.5 block font-bold text-pp-text">{parcel.exitDays ? `${Math.round(parcel.exitDays)}d` : '—'}</span>
              </div>
              <div className="rounded-lg border border-pp-border bg-pp-page p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-pp-faint">Grade</span>
                <span className="mt-0.5 block font-bold text-pp-text">{parcel.confidenceGrade ?? 'A'}</span>
              </div>
            </div>
          </section>

          {/* Metrics */}
          <section className="flex-none p-6 bg-pp-page border-b border-pp-border">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-pp-faint mb-4">Financial Model</h3>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
                <div key={label} className="rounded-xl border border-pp-border bg-pp-surface p-3.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-pp-muted mb-1.5">
                    <Icon size={14} weight="bold" />
                    <span className="text-[11px] font-semibold text-pp-muted">{label}</span>
                  </div>
                  <span className={`font-mono text-xl font-bold tracking-tight block ${tone}`}>{value}</span>
                  <span className="text-[10px] text-pp-faint block mt-0.5">{detail}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Evidence Sources */}
          <section className="flex-none p-6 bg-pp-surface">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-pp-faint">Data Provenance</h3>
              <Database size={15} className="text-pp-faint" />
            </div>
            <dl className="grid grid-cols-[100px_1fr] gap-y-2.5 text-xs">
              <dt className="text-pp-muted font-medium">Pipeline</dt>
              <dd className="font-mono text-xs font-semibold text-pp-text">Live Parcel Scores</dd>
              {parcel.apn && (
                <>
                  <dt className="text-pp-muted font-medium">APN</dt>
                  <dd className="font-mono text-xs text-pp-text">{parcel.apn}</dd>
                </>
              )}
              <dt className="text-pp-muted font-medium">Property</dt>
              <dd className="text-xs text-pp-text font-medium">County Records / Genome</dd>
              <dt className="text-pp-muted font-medium">Signals</dt>
              <dd className="text-xs text-pp-text font-medium">Distress & MLS (180d Gate)</dd>
              <dt className="text-pp-muted font-medium">County FIPS</dt>
              <dd className="font-mono text-xs text-pp-text">{parcel.countyFips ?? '—'}</dd>
            </dl>
            {onOpenFullDossier && (
              <Button
                type="button"
                className="mt-5 text-xs font-semibold text-primary hover:text-primary/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                onClick={() => onOpenFullDossier(parcel.id)}
              >
                <span>View Complete Dossier</span>
                <ArrowRight size={14} weight="bold" />
              </Button>
            )}
          </section>

          {/* Spacer */}
          <div className="flex-1 min-h-[16px] bg-pp-surface" />

          {/* Action */}
          <section className="flex-none p-6 bg-pp-surface mt-auto border-t border-pp-border">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-pp-faint mb-2">Decision Guidance</h3>
            <div className="text-xs leading-relaxed text-pp-text font-medium mb-4">
              <TextGenerateEffect
                words={underwriteGuidance(parcel.score, parcel.ring)}
                duration={0.3}
                filter={true}
              />
            </div>
            <Button
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-xs font-semibold text-white transition-all hover:bg-slate-800 shadow-sm active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
              onClick={onUnderwrite}
              type="button"
              disabled={isSubmitting}
            >
              <Buildings size={16} />
              <span>{isSubmitting ? 'Recording Underwrite…' : 'Record Underwrite'}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </section>
        </motion.div>
      </AnimatePresence>
    </aside>
  )
}