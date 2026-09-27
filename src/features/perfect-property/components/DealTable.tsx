import { TableSkeleton } from '@/components/ui/skeleton-loaders'
import { Input } from "@/components/ui/input"
import {
  MagnifyingGlass,
  CaretUp,
  CaretDown,
  CaretLeft,
  CaretRight,
  ArrowsDownUp,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import type { WorkspaceParcel } from '../live'
import { formatMoney } from '../live'
import { formatShortDate } from '../data'
import { pct } from '@/lib/format'

type SortField = 'address' | 'marketLabel' | 'offer' | 'profit' | 'score' | 'lossRisk' | 'computedAt'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 50

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
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = parcels
    if (q) {
      list = parcels.filter((p) =>
        `${p.address} ${p.city} ${p.state} ${p.scope} ${p.ringLabel} ${p.apn ?? ''}`
          .toLowerCase()
          .includes(q),
      )
    }

    return [...list].sort((a, b) => {
      let valA: number | string = 0
      let valB: number | string = 0

      switch (sortField) {
        case 'address':
          valA = a.address.toLowerCase()
          valB = b.address.toLowerCase()
          break
        case 'marketLabel':
          valA = a.marketLabel.toLowerCase()
          valB = b.marketLabel.toLowerCase()
          break
        case 'offer':
          valA = a.offer
          valB = b.offer
          break
        case 'profit':
          valA = a.profit
          valB = b.profit
          break
        case 'score':
          valA = a.score
          valB = b.score
          break
        case 'lossRisk':
          valA = a.lossRisk
          valB = b.lossRisk
          break
        case 'computedAt':
          valA = a.computedAt ? new Date(a.computedAt).getTime() : 0
          valB = b.computedAt ? new Date(b.computedAt).getTime() : 0
          break
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [parcels, query, sortField, sortDir])

  // Reset page when search or total changes
  useEffect(() => {
    setCurrentPage(1)
  }, [query, parcels.length])

  // If a parcel is selected from outside (e.g. on map), ensure current page displays it
  useEffect(() => {
    if (!selectedId) return
    const idx = filteredAndSorted.findIndex((p) => p.id === selectedId)
    if (idx !== -1) {
      const targetPage = Math.floor(idx / PAGE_SIZE) + 1
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage)
      }
    }
  }, [selectedId, filteredAndSorted, currentPage])

  // Scroll into view on selection change
  useEffect(() => {
    if (!selectedId) return
    const rowEl = document.getElementById(`deal-row-${selectedId}`)
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedId, currentPage])

  // Keyboard navigation for rapid deal triage (Arrow Up / Down, PageUp/Down, Home, End, J/K)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (filteredAndSorted.length === 0) return

      const currentIndex = selectedId
        ? filteredAndSorted.findIndex((p) => p.id === selectedId)
        : -1

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        const nextIndex =
          currentIndex < filteredAndSorted.length - 1 ? currentIndex + 1 : 0
        onSelect(filteredAndSorted[nextIndex])
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : filteredAndSorted.length - 1
        onSelect(filteredAndSorted[prevIndex])
      } else if (e.key === 'Home') {
        e.preventDefault()
        onSelect(filteredAndSorted[0])
      } else if (e.key === 'End') {
        e.preventDefault()
        onSelect(filteredAndSorted[filteredAndSorted.length - 1])
      } else if (e.key === 'PageDown') {
        e.preventDefault()
        const nextIndex = Math.min(
          filteredAndSorted.length - 1,
          (currentIndex >= 0 ? currentIndex : 0) + 10,
        )
        onSelect(filteredAndSorted[nextIndex])
      } else if (e.key === 'PageUp') {
        e.preventDefault()
        const prevIndex = Math.max(
          0,
          (currentIndex >= 0 ? currentIndex : 0) - 10,
        )
        onSelect(filteredAndSorted[prevIndex])
      }
    },
    [filteredAndSorted, selectedId, onSelect],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE))
  const paginatedParcels = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredAndSorted.slice(start, start + PAGE_SIZE)
  }, [filteredAndSorted, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const columns: Array<{
    label: string
    field?: SortField
    align: 'left' | 'right'
    width: string
  }> = [
    { label: 'Address', field: 'address', align: 'left', width: '25%' },
    { label: 'Market', field: 'marketLabel', align: 'left', width: '15%' },
    { label: 'Source', align: 'left', width: '10%' },
    { label: 'Offer', field: 'offer', align: 'right', width: '10%' },
    { label: 'Profit', field: 'profit', align: 'right', width: '10%' },
    { label: 'Score', field: 'score', align: 'right', width: '10%' },
    { label: 'Loss risk', field: 'lossRisk', align: 'right', width: '10%' },
    { label: 'Updated', field: 'computedAt', align: 'right', width: '10%' },
  ]

  return (
    <section
      className="deal-table flex flex-col min-h-0 overflow-hidden border-t border-border bg-card shadow-none"
      aria-label="Deal Opportunities Table"
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-6 max-sm:px-4">
        <div className="flex items-center gap-3">
          <strong className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold tracking-tight text-foreground">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500 shadow-none" />
            <span>
              {loading ? 'Loading…' : `${filteredAndSorted.length.toLocaleString()} Live Opportunities`}
            </span>
          </strong>

          {/* Quick Keyboard shortcuts hint */}
          <div className="hidden lg:flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-md bg-muted/70 text-[11px] font-mono text-muted-foreground">
            <kbd className="px-1 py-0.2 rounded bg-background border border-border shadow-2xs font-semibold">↑</kbd>
            <kbd className="px-1 py-0.2 rounded bg-background border border-border shadow-2xs font-semibold">↓</kbd>
            <span>or</span>
            <kbd className="px-1 py-0.2 rounded bg-background border border-border shadow-2xs font-semibold">J</kbd>
            <kbd className="px-1 py-0.2 rounded bg-background border border-border shadow-2xs font-semibold">K</kbd>
            <span>Navigate</span>
          </div>

          {totalPages > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 ml-2 text-xs text-muted-foreground font-mono">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-muted text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <CaretLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded hover:bg-muted text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <CaretRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="relative w-[200px] sm:w-[280px]">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:bg-card transition-colors"
              aria-label="Search parcels"
              placeholder="Search address or market…"
            />
          </label>
        </div>
      </div>

      <div ref={tableContainerRef} className="flex-1 overflow-auto bg-card focus:outline-none" tabIndex={0}>
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-xs border-b border-border">
            <tr>
              {columns.map((col) => {
                const isSorted = col.field && sortField === col.field
                return (
                  <th
                    scope="col"
                    key={col.label}
                    onClick={() => col.field && handleSort(col.field)}
                    className={`px-6 py-3 text-[11px] font-bold tracking-widest uppercase text-muted-foreground select-none transition-colors ${
                      col.field ? 'cursor-pointer hover:text-foreground' : ''
                    } ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    style={{ width: col.width }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {isSorted && (
                        sortDir === 'asc' ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedParcels.map((parcel) => {
              const active = parcel.id === selectedId
              const assetClassKebab = parcel.assetClass === 'vacant_land' ? 'vacant-land' : parcel.assetClass
              return (
                <tr
                  key={parcel.id}
                  id={`deal-row-${parcel.id}`}
                  data-asset-class={parcel.assetClass}
                  data-asset-class-kebab={assetClassKebab}
                  className={`group cursor-pointer border-b border-border/60 text-sm transition-colors ${
                    active ? 'bg-primary/10 border-l-4 border-l-primary font-medium' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => onSelect(parcel)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect(parcel)
                    }
                  }}
                  aria-selected={active}
                  role="row"
                >
                  <td className="relative px-6 py-3.5 font-semibold text-foreground">
                    {active && <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                    <div className="flex items-center gap-2">
                      <span>{parcel.address}</span>
                      <span
                        data-asset-class={parcel.assetClass}
                        className="px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-muted/80 text-muted-foreground"
                      >
                        {parcel.assetClassLabel}
                      </span>
                      {active && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-primary text-primary-foreground hidden sm:inline-block">
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground font-medium">{parcel.marketLabel}</td>
                  <td className="px-6 py-3.5 text-muted-foreground font-medium">{parcel.ringLabel}</td>
                  <td className="px-6 py-3.5 font-mono text-right text-foreground">{formatMoney(parcel.offer)}</td>
                  <td className="px-6 py-3.5 font-mono text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {formatMoney(parcel.profit)}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-right font-bold text-foreground">
                    {parcel.score.toFixed(1)}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-right text-foreground">{pct(parcel.lossRisk)}</td>
                  <td className="px-6 py-3.5 text-right text-xs text-muted-foreground/70 font-medium">
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

        {!loading && filteredAndSorted.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground/70">
            <MagnifyingGlass size={24} className="text-muted-foreground/40" />
            No parcels match this search or region filter.
          </div>
        )}

        {loading && (
          <div className="p-4" aria-busy="true">
            <TableSkeleton
              rows={8}
              columns={[
                { width: 'w-1/4' },
                { width: 'w-1/6' },
                { width: 'w-1/8' },
                { width: 'w-1/8', align: 'right' },
                { width: 'w-1/8', align: 'right' },
                { width: 'w-1/8', align: 'right' },
                { width: 'w-1/8', align: 'right' },
                { width: 'w-1/8', align: 'right' },
              ]}
            />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex sm:hidden items-center justify-between px-4 py-2 border-t border-border bg-card text-xs text-muted-foreground font-mono">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-muted text-foreground disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-muted text-foreground disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
