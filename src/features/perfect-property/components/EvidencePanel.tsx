import { EvidencePanelSkeleton } from '@/components/ui/skeleton-loaders'
import { Button } from "@/components/ui/button";
import { ArrowRight, Buildings, ChartLineUp, CheckCircle, Database, House, ShieldCheck, Warning } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import type { WorkspaceParcel } from '../live'
import { formatMoney, parcelTier, underwriteGuidance } from '../live'
import { formatShortDate } from '../data'
import { pct } from '@/lib/format'
import { TextGenerateEffect } from '@/components/ui/aceternity'
import { PropertySearchGroundingNews } from '@/components/PropertySearchGroundingNews'

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
      <aside className="p-6 border-l border-border bg-card">
        <EvidencePanelSkeleton />
      </aside>
    )
  }

  if (!parcel) {
    return (
      <aside
        id="property-details-panel"
        tabIndex={-1}
        className="evidence-panel flex items-center justify-center border-l border-border bg-card p-8 text-center text-sm font-medium text-muted-foreground relative z-10 outline-none"
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
      tone: 'text-foreground',
    },
    {
      label: 'Expected Profit',
      value: formatMoney(parcel.profit),
      detail: 'Gross modeled returns',
      icon: ChartLineUp,
      tone: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Loss Risk',
      value: pct(parcel.lossRisk),
      detail: 'Monte Carlo P(loss)',
      icon: Warning,
      tone: parcel.lossRisk > 0.25 ? 'text-destructive' : 'text-foreground',
    },
    {
      label: 'Deal Odds',
      value: pct(parcel.dealOdds),
      detail: 'Accept probability',
      icon: ShieldCheck,
      tone: 'text-foreground',
    },
  ]

  return (
    <aside
      id="property-details-panel"
      tabIndex={-1}
      aria-label="Property Underwriting Details"
      className={`evidence-panel min-h-0 overflow-y-auto border-l border-border bg-background relative z-10 outline-none transition-all duration-300 ${
        isFocused ? 'ring-2 ring-primary shadow-lg' : ''
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
          <div className="flex-none p-6 pb-5 bg-card border-b border-border">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase text-primary">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Live Underwriting</span>
              {isFocused && (
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-primary tracking-normal">
                  ● In Focus
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground leading-snug">{parcel.address}</h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <span>{parcel.marketLabel}{parcel.zip ? ` ${parcel.zip}` : ''}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="font-semibold text-foreground">{parcel.ringLabel}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-muted-foreground">
              <span
                data-asset-class={parcel.assetClass}
                data-asset-class-kebab={parcel.assetClass === 'vacant_land' ? 'vacant-land' : parcel.assetClass}
                className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary text-[11px] font-semibold"
              >
                {parcel.assetClassLabel}
              </span>
              {[
                parcel.bedrooms != null || parcel.bathrooms != null
                  ? `${parcel.bedrooms ?? '—'} bed / ${parcel.bathrooms ?? '—'} bath`
                  : null,
                parcel.livingSqft != null ? `${parcel.livingSqft.toLocaleString()} sqft` : null,
                parcel.yearBuilt != null && parcel.yearBuilt > 0 ? `Built ${parcel.yearBuilt}` : null,
                parcel.absentee ? 'Absentee Owner' : null,
                parcel.isVacant ? 'Vacant' : null,
              ]
                .filter(Boolean)
                .map((tag, i) => (
                  <span key={i} className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-foreground text-[11px] font-medium">
                    {tag}
                  </span>
                ))}
            </div>
          </div>

          {/* Perfect Score section */}
          <section className="flex-none p-6 bg-card border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">Perfect Score</h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {tier.label}
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <div className="font-mono text-5xl font-bold leading-none tracking-tight text-foreground">
                {parcel.score.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">
                {parcel.computedAt && (
                  <p className="text-[11px] text-muted-foreground">
                    Updated <time dateTime={parcel.computedAt}>{formatShortDate(parcel.computedAt)}</time>
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg border border-border bg-background p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Scope</span>
                <span className="mt-0.5 block font-bold text-foreground">{parcel.scope}</span>
              </div>
              <div className="rounded-lg border border-border bg-background p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Exit</span>
                <span className="mt-0.5 block font-bold text-foreground">{parcel.exitDays ? `${Math.round(parcel.exitDays)}d` : '—'}</span>
              </div>
              <div className="rounded-lg border border-border bg-background p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Grade</span>
                <span className="mt-0.5 block font-bold text-foreground">{parcel.confidenceGrade ?? 'A'}</span>
              </div>
            </div>
          </section>

          {/* Metrics */}
          <section className="flex-none p-6 bg-background border-b border-border">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70 mb-4">Financial Model</h3>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
                <div key={label} className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <Icon size={14} weight="bold" />
                    <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
                  </div>
                  <span className={`font-mono text-xl font-bold tracking-tight block ${tone}`}>{value}</span>
                  <span className="text-[10px] text-muted-foreground/70 block mt-0.5">{detail}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Evidence Sources */}
          <section className="flex-none p-6 bg-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">Data Provenance</h3>
              <Database size={15} className="text-muted-foreground/70" />
            </div>
            <dl className="grid grid-cols-[100px_1fr] gap-y-2.5 text-xs">
              <dt className="text-muted-foreground font-medium">Pipeline</dt>
              <dd className="font-mono text-xs font-semibold text-foreground">Live Parcel Scores</dd>
              {parcel.apn && (
                <>
                  <dt className="text-muted-foreground font-medium">APN</dt>
                  <dd className="font-mono text-xs text-foreground">{parcel.apn}</dd>
                </>
              )}
              <dt className="text-muted-foreground font-medium">Property</dt>
              <dd className="text-xs text-foreground font-medium">County Records / Genome</dd>
              <dt className="text-muted-foreground font-medium">Signals</dt>
              <dd className="text-xs text-foreground font-medium">Distress & MLS (180d Gate)</dd>
              <dt className="text-muted-foreground font-medium">County FIPS</dt>
              <dd className="font-mono text-xs text-foreground">{parcel.countyFips ?? '—'}</dd>
            </dl>
            {onOpenFullDossier && (
              <Button
                type="button"
                variant="outline"
                className="mt-5 w-full text-xs font-semibold border-border hover:bg-muted transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                onClick={() => onOpenFullDossier(parcel.id)}
              >
                <span>View Complete Dossier</span>
                <ArrowRight size={14} weight="bold" />
              </Button>
            )}
          </section>

          {/* Search Grounded Property News & Market Updates */}
          <section className="flex-none p-4 bg-background border-b border-border">
            <PropertySearchGroundingNews
              address={parcel.address}
              city={parcel.marketLabel}
              county={parcel.countyFips || undefined}
              zip={parcel.zip || undefined}
              apn={parcel.apn || undefined}
              submarket={parcel.ringLabel}
              autoLoad={false}
            />
          </section>

          {/* Spacer */}
          <div className="flex-1 min-h-[16px] bg-card" />

          {/* Action */}
          <section className="flex-none p-6 bg-card mt-auto border-t border-border">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70 mb-2">Decision Guidance</h3>
            <div className="text-xs leading-relaxed text-foreground font-medium mb-4">
              <TextGenerateEffect
                words={underwriteGuidance(parcel.score, parcel.ring)}
                duration={0.3}
                filter={true}
              />
            </div>
            <Button
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-xs font-semibold text-background transition-all hover:opacity-90 shadow-xs active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
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