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
}: {
  parcel: WorkspaceParcel | null
  onUnderwrite: () => void
  isSubmitting?: boolean
  onOpenFullDossier?: (parcelId: string) => void
}) {
  if (!parcel) {
    return (
      <aside className="evidence-panel flex items-center justify-center border-l border-pp-border bg-pp-surface p-8 text-center text-sm font-medium text-pp-faint relative z-10">
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
    <aside className="evidence-panel min-h-0 overflow-y-auto border-l border-pp-border bg-pp-page relative z-10">
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
          <div className="flex-none p-6 pb-6">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase text-pp-text">
              <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex h-1.5 w-1.5 bg-pp-text"></span>
              </span>
              LIVE UNDERWRITING
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-pp-text leading-tight uppercase">{parcel.address}</h2>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-pp-muted">
              {parcel.marketLabel}
              {parcel.zip ? ` ${parcel.zip}` : ''} <span className="mx-2 text-pp-border-strong">•</span> {parcel.ringLabel}
            </p>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-widest text-pp-text border border-pp-border px-3 py-2">
              {[
                parcel.bedrooms != null || parcel.bathrooms != null
                  ? `${parcel.bedrooms ?? '—'} BED / ${parcel.bathrooms ?? '—'} BATH`
                  : null,
                parcel.livingSqft != null ? `${parcel.livingSqft.toLocaleString()} SQFT` : null,
                parcel.yearBuilt != null ? `BUILT ${parcel.yearBuilt}` : null,
                parcel.absentee ? 'ABSENTEE' : null,
              ]
                .filter(Boolean)
                .join(' — ') || 'PHYSICAL INPUTS UNKNOWN'}
            </p>
          </div>

          <div className="h-px w-full bg-pp-border" />

          {/* Perfect Score section */}
          <section className="flex-none p-6 bg-pp-surface">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-pp-faint mb-4">PERFECT SCORE</h3>
            <div className="flex items-end gap-4">
              <div className="font-mono text-[72px] font-bold leading-none tracking-tighter text-pp-text">
                {parcel.score.toFixed(1)}
              </div>
              <div className="pb-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-pp-text" title={tier.hint}>
                  {tier.label}
                </p>
                {parcel.computedAt && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-pp-faint mt-1">
                    UPDATED <time dateTime={parcel.computedAt}>{formatShortDate(parcel.computedAt)}</time>
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold tracking-widest uppercase">
              <span className="border border-pp-border bg-pp-surface-soft px-3 py-1.5 text-pp-text">
                SCOPE: {parcel.scope}
              </span>
              <span className="border border-pp-border bg-pp-surface-soft px-3 py-1.5 text-pp-text">
                EXIT: {parcel.exitDays ? `${Math.round(parcel.exitDays)}D` : '—'}
              </span>
              {parcel.confidenceGrade && (
                <span className="border border-pp-border bg-pp-surface-soft px-3 py-1.5 text-pp-text">
                  GRADE: {parcel.confidenceGrade}
                </span>
              )}
            </div>
          </section>

          <div className="h-px w-full bg-pp-border" />

          {/* Metrics */}
          <section className="flex-none p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-pp-faint mb-6">FINANCIAL MODEL</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-8">
              {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-pp-muted mb-1">
                    <Icon size={14} weight="bold" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{label}</span>
                  </div>
                  <span className={`font-mono text-[22px] font-bold tracking-tight ${tone}`}>{value}</span>
                  <span className="text-[10px] uppercase tracking-wider text-pp-faint font-semibold">{detail}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px w-full bg-pp-border" />

          {/* Evidence Sources */}
          <section className="flex-none p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-pp-faint">DATA PROVENANCE</h3>
              <Database size={14} className="text-pp-faint" />
            </div>
            <dl className="grid grid-cols-[110px_1fr] gap-y-4 text-[11px] uppercase tracking-widest font-bold">
              <dt className="text-pp-faint">PIPELINE</dt>
              <dd className="font-mono text-pp-text bg-pp-surface-soft border border-pp-border px-2 py-1 w-fit">LIVE PARCEL_SCORES</dd>
              {parcel.apn && (
                <>
                  <dt className="text-pp-faint">APN</dt>
                  <dd className="font-mono text-pp-text">{parcel.apn}</dd>
                </>
              )}
              <dt className="text-pp-faint">PROPERTY</dt>
              <dd className="text-pp-text">COUNTY / REALIE GENOME</dd>
              <dt className="text-pp-faint">TRIGGERS</dt>
              <dd className="text-pp-text">DISTRESS <span className="text-pp-border-strong mx-1.5">•</span> LISTINGS (180D GATE)</dd>
              <dt className="text-pp-faint">COUNTY FIPS</dt>
              <dd className="font-mono text-pp-text">{parcel.countyFips ?? '—'}</dd>
            </dl>
            {onOpenFullDossier && (
              <button
                type="button"
                className="mt-8 text-[10px] font-bold uppercase tracking-widest text-pp-text border border-pp-border bg-pp-surface px-4 py-2 hover:bg-pp-surface-raised transition-colors w-fit flex items-center gap-2"
                onClick={() => onOpenFullDossier(parcel.id)}
              >
                VIEW COMPLETE DOSSIER <ArrowRight size={14} weight="bold" />
              </button>
            )}
          </section>

          {/* Spacer to push action to bottom if container is tall */}
          <div className="flex-1" />

          {/* Action */}
          <section className="flex-none p-6 bg-pp-surface mt-auto border-t border-pp-border">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-pp-faint mb-3">DECISION</h3>
            <div className="text-[12px] uppercase tracking-widest leading-relaxed text-pp-text font-bold mb-6">
              <TextGenerateEffect
                words={underwriteGuidance(parcel.score, parcel.ring)}
                duration={0.3}
                filter={true}
              />
            </div>
            <motion.button
              whileTap={isSubmitting ? undefined : { scale: 0.98 }}
              className="group flex h-14 w-full items-center justify-center gap-2 bg-pp-text text-[11px] uppercase tracking-[0.2em] font-bold text-[#01070c] transition-all hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-60 disabled:bg-pp-text focus:outline-none focus-visible:ring-2 focus-visible:ring-pp-text focus-visible:ring-offset-2"
              onClick={onUnderwrite}
              type="button"
              disabled={isSubmitting}
            >
              <Buildings size={18} className="opacity-80" />
              {isSubmitting ? 'RECORDING UNDERWRITE…' : 'RECORD UNDERWRITE'}
              <ArrowRight size={18} className="opacity-60 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
            </motion.button>
          </section>
        </motion.div>
      </AnimatePresence>
    </aside>
  )
}