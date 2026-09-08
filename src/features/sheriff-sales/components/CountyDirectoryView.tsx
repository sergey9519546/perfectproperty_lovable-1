import { CountyDirectorySkeleton } from '@/components/ui/skeleton-loaders';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import {
  COUNTY_COVERAGE_REGISTRY,
} from '../counties-config';
import { NJ_EQUALIZATION_RATIOS_2026, calculateNJTrueMarketValue } from '../nj-equalization';
import {
  Buildings,
  MapPin,
  CheckCircle,
  Clock,
  ArrowSquareOut,
  Scales,
  Calculator,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import type { JurisdictionState } from '../types';

export function CountyDirectoryView({ loading = false }: { loading?: boolean } = {}) {
  const [selectedState, setSelectedState] = useState<'ALL' | JurisdictionState>('ALL');
  const [ohioAccessRequested, setOhioAccessRequested] = useState(false);
  const [texasTrialActive, setTexasTrialActive] = useState(false);

  // NJ Equalization quick calculator state
  const [calcMuni, setCalcMuni] = useState('Hackensack');
  const [calcAssessed, setCalcAssessed] = useState(409400);

  if (loading) {
    return (
      <div className="space-y-6">
        <CountyDirectorySkeleton count={8} />
      </div>
    );
  }

  const calcResult = calculateNJTrueMarketValue(calcAssessed, calcMuni, 'Bergen');

  const filteredCounties = COUNTY_COVERAGE_REGISTRY.filter((c) => {
    if (selectedState !== 'ALL' && c.state !== selectedState) return false;
    return true;
  });

  return (
    <div id="county-directory-view" className="space-y-6">
      {/* Header */}
      <div id="county-directory-header" className="bg-card border border-pp-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-blue-200 text-xs font-mono font-bold">
              COUNTY COVERAGE REGISTRY & SOURCES
            </span>
            <span className="text-xs text-muted-foreground font-mono">17 Active & Integrated Jurisdictions</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Statewide County Ingestion Portals & Court Rules
          </h2>
          <p className="text-xs text-muted-foreground">
            17 New Jersey Counties, Pennsylvania Metro Corridors, Ohio Realauction, and Texas Smart Search.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            id="request-ohio-access-btn"
            type="button"
            onClick={() => setOhioAccessRequested(true)}
            disabled={ohioAccessRequested}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer font-mono ${
              ohioAccessRequested
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
            }`}
          >
            {ohioAccessRequested ? <CheckCircle size={15} /> : <PaperPlaneTilt size={15} />}
            <span>{ohioAccessRequested ? 'Ohio Realauction Requested' : 'Request Ohio Realauction Access'}</span>
          </Button>

          <Button
            id="start-texas-trial-btn"
            type="button"
            onClick={() => setTexasTrialActive(true)}
            disabled={texasTrialActive}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer font-mono ${
              texasTrialActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-muted hover:bg-accent text-foreground border border-slate-200 shadow-xs'
            }`}
          >
            {texasTrialActive ? <CheckCircle size={15} /> : <PaperPlaneTilt size={15} />}
            <span>{texasTrialActive ? 'Texas Smart Search Active' : 'Start Texas Smart Search Trial'}</span>
          </Button>
        </div>
      </div>

      {/* State Filter Buttons */}
      <div id="county-state-filter-bar" className="flex items-center gap-2 text-xs font-medium flex-wrap">
        {(['ALL', 'NJ', 'PA', 'OH', 'TX', 'FL'] as const).map((st) => (
          <Button
            key={st}
            id={`county-filter-state-${st.toLowerCase()}-btn`}
            type="button"
            onClick={() => setSelectedState(st)}
            className={`px-4 py-2 rounded-xl font-mono transition-all cursor-pointer ${
              selectedState === st
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-card border border-slate-200 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {st === 'ALL'
              ? 'All Jurisdictions'
              : st === 'NJ'
              ? 'New Jersey (All 17)'
              : st === 'PA'
              ? 'Pennsylvania (Philly/Lehigh/Allegheny)'
              : st === 'OH'
              ? 'Ohio (Realauction)'
              : st === 'TX'
              ? 'Texas (Smart Search)'
              : 'Florida (RealForeclose)'}
          </Button>
        ))}
      </div>

      {/* NJ Director's Ratio Chapter 123 Quick Tool */}
      <div id="nj-directors-ratio-tool" className="bg-card border border-pp-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <Calculator size={18} className="text-primary" />
            <span>NJ Chapter 123 Director's Ratio Equalization Calculator</span>
          </div>
          <span className="text-[11px] font-mono text-primary bg-primary/10 border border-blue-200 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
            Official NJ Division of Taxation Ratios
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
          In New Jersey, property tax assessments do not reflect 100% of fair market value. The State Division of Taxation publishes the Director's Ratio annually.
          Divide the assessed value by the municipality's Director's Ratio to compute the legally recognized <strong>Equalized True Market Value</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">Select Municipality</label>
            <select
              id="nj-calc-muni-select"
              value={calcMuni}
              onChange={(e) => setCalcMuni(e.target.value)}
              className="w-full bg-muted border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-blue-500 cursor-pointer"
            >
              {NJ_EQUALIZATION_RATIOS_2026.map((m) => (
                <option key={m.municipality} value={m.municipality} className="bg-card text-foreground">
                  {m.municipality} ({m.county} County) - {(m.directorsRatio * 100).toFixed(1)}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">County Assessed Value ($)</label>
            <Input
              id="nj-calc-assessed-input"
              type="number"
              value={calcAssessed}
              onChange={(e) => setCalcAssessed(Number(e.target.value))}
              className="w-full bg-muted border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-blue-500"
            />
          </div>

          <div className="bg-primary/10/60 border border-blue-200 rounded-xl p-3.5 flex flex-col justify-center font-mono">
            <span className="text-[10px] uppercase text-muted-foreground font-bold">Equalized True Market Value</span>
            <span className="text-2xl font-bold text-primary">
              ${calcResult?.equalizedTrueMarketValue.toLocaleString() || '—'}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
              Director's Ratio: {((calcResult?.directorsRatio || 1) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* County Registry Grid */}
      <div id="county-registry-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCounties.map((county) => (
          <div
            key={county.countyName}
            id={`county-card-${county.countyName.toLowerCase().replace(/\s+/g, '-')}`}
            className="bg-card border border-pp-border rounded-2xl p-5 space-y-3.5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-accent text-secondary-foreground border border-slate-200 font-mono text-[10px] font-bold">
                  {county.state} • {county.sourceType}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    county.activeCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-muted-foreground border border-slate-200'
                  }`}
                >
                  {county.activeCount} active deals
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground mt-2.5">{county.countyName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{county.sheriffOfficeAddress}</p>

              <div className="mt-3.5 space-y-1.5 text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{county.sheriffOfficeAddress}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">Deposit: {county.depositRule}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scales size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">Statute: {county.verifiedAugust2026Statute}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-muted-foreground">
                Next sale: {county.nextAuctionDate}
              </span>
              {county.sheriffWebsiteUrl && (
                <a
                  id={`county-portal-link-${county.countyName.toLowerCase().replace(/\s+/g, '-')}`}
                  href={county.sheriffWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary font-bold flex items-center gap-1 font-mono text-xs"
                >
                  <span>Portal</span>
                  <ArrowSquareOut size={13} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
