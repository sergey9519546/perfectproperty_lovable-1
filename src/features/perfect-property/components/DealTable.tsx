import { MagnifyingGlass } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import type { WorkspaceParcel } from '../live'
import { formatMoney } from '../live'
import { formatShortDate } from '../data'
import { pct } from '@/lib/format'

export function DealTable({
  parcels,
  selectedId,
  onSelect,
  loading,
}: {
  parcels: WorkspaceParcel[]
  selectedId: string | null
  onSelect: (parcel: WorkspaceParcel) => void
  loading?: boolean
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () =>
      parcels.filter((p) =>
        `${p.address} ${p.city} ${p.state} ${p.scope} ${p.ringLabel}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [parcels, query],
  )

  useEffect(() => {
    if (!selectedId) return
    const rowEl = document.getElementById(`deal-row-${selectedId}`)
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedId])

  return (
    <section className="deal-table flex flex-col min-h-0 overflow-hidden border-t border-pp-border bg-pp-surface shadow-none">
      <div className="flex h-14 shrink-0 items-center gap-4 border-b border-pp-border bg-pp-surface px-6 max-sm:px-4">
        <strong className="flex items-center gap-2.5 whitespace-nowrap text-sm font-semibold tracking-tight text-pp-text">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-pp-live shadow-none" />
          <span>
            {loading ? 'Loading…' : `${filtered.length.toLocaleString()} Live Opportunities`}
          </span>
        </strong>
        <label className="relative ml-auto w-[280px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-pp-muted" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-full border border-pp-border bg-pp-surface-soft pl-9 pr-4 text-xs font-medium text-pp-text outline-none placeholder:text-pp-faint focus:border-pp-text focus:bg-pp-surface transition-colors"
            aria-label="Search parcels"
            placeholder="Search address or market…"
          />
        </label>
      </div>
      <div className="flex-1 overflow-auto bg-pp-surface">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-pp-surface-raised/95 backdrop-blur-sm shadow-[0_1px_0_0_var(--pp-border)]">
            <tr>
              {[
                { label: 'Address', align: 'left', width: '25%' },
                { label: 'Market', align: 'left', width: '15%' },
                { label: 'Source', align: 'left', width: '10%' },
                { label: 'Offer', align: 'right', width: '10%' },
                { label: 'Profit', align: 'right', width: '10%' },
                { label: 'Score', align: 'right', width: '10%' },
                { label: 'Loss risk', align: 'right', width: '10%' },
                { label: 'Updated', align: 'right', width: '10%' }
              ].map((col) => (
                <th 
                  scope="col" 
                  className={`px-6 py-3 text-[11px] font-bold tracking-widest uppercase text-pp-muted ${col.align === 'right' ? 'text-right' : 'text-left'}`} 
                  style={{ width: col.width }}
                  key={col.label}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((parcel) => {
              const active = parcel.id === selectedId
              return (
                <tr
                  key={parcel.id}
                  id={`deal-row-${parcel.id}`}
                  className={`group cursor-pointer border-b border-pp-border/50 text-sm transition-colors ${active ? 'bg-pp-surface-soft' : 'hover:bg-pp-surface-soft/50'}`}
                  onClick={() => onSelect(parcel)}
                >
                  <td className={`relative px-6 py-4 font-semibold text-pp-text`}>
                    {active && <span className="absolute left-0 top-0 bottom-0 w-1 bg-pp-text" />}
                    {parcel.address}
                  </td>
                  <td className="px-6 py-4 text-pp-muted font-medium">{parcel.marketLabel}</td>
                  <td className="px-6 py-4 text-pp-muted font-medium">{parcel.ringLabel}</td>
                  <td className="px-6 py-4 font-mono text-right text-pp-text">{formatMoney(parcel.offer)}</td>
                  <td className="px-6 py-4 font-mono text-right font-medium text-profit-strong">{formatMoney(parcel.profit)}</td>
                  <td className="px-6 py-4 font-mono text-right font-bold text-pp-text">{parcel.score.toFixed(1)}</td>
                  <td className="px-6 py-4 font-mono text-right text-pp-text">{pct(parcel.lossRisk)}</td>
                  <td className="px-6 py-4 text-right text-xs text-pp-faint font-medium">
                    {parcel.computedAt ? (
                      <time dateTime={parcel.computedAt}>{formatShortDate(parcel.computedAt)}</time>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-pp-faint">
            <MagnifyingGlass size={24} className="text-pp-border-strong" />
            No parcels match this search or region filter.
          </div>
        )}
        {loading && (
          <div className="space-y-4 p-6" aria-busy="true">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-3/4" />
          </div>
        )}
      </div>
    </section>
  )
}