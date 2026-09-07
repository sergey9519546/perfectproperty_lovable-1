import { useState } from 'react';
import {
  COUNTY_COVERAGE_REGISTRY,
  getCountyCoverage,
  isCountySupported,
} from '../counties-config';
import { NJ_EQUALIZATION_RATIOS_2026, calculateNJTrueMarketValue } from '../nj-equalization';
import {
  Buildings,
  MapPin,
  CheckCircle,
  Clock,
  ArrowSquareOut,
  Scales,
  FileText,
  Calculator,
  ShieldCheck,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import type { JurisdictionState } from '../types';

export function CountyDirectoryView() {
  const [selectedState, setSelectedState] = useState<'ALL' | JurisdictionState>('ALL');
  const [ohioAccessRequested, setOhioAccessRequested] = useState(false);
  const [texasTrialActive, setTexasTrialActive] = useState(false);

  // NJ Equalization quick calculator state
  const [calcMuni, setCalcMuni] = useState('Hackensack');
  const [calcAssessed, setCalcAssessed] = useState(409400);

  const calcResult = calculateNJTrueMarketValue(calcAssessed, calcMuni, 'Bergen');

  const filteredCounties = COUNTY_COVERAGE_REGISTRY.filter((c) => {
    if (selectedState !== 'ALL' && c.state !== selectedState) return false;
    return true;
  });

  return (
    <div id="county-directory-view" className="space-y-8">
      {/* Header */}
      <div id="county-directory-header" className="bg-pp-surface border border-pp-border/70 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-pp-gold/15 text-pp-gold border border-pp-gold/30 text-xs font-mono font-bold">
              COUNTY COVERAGE REGISTRY & SOURCES
            </span>
            <span className="text-xs text-pp-muted font-mono">Phase 2–4 Roadmap</span>
          </div>
          <h2 className="text-lg font-bold text-pp-text mt-1">
            Statewide County Ingestion Portals & Court Rules
          </h2>
          <p className="text-xs text-pp-muted mt-0.5">
            17 New Jersey Counties, Pennsylvania Metro Corridors, Ohio Realauction, and Texas Smart Search.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="request-ohio-access-btn"
            type="button"
            onClick={() => setOhioAccessRequested(true)}
            disabled={ohioAccessRequested}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              ohioAccessRequested
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                : 'bg-pp-gold hover:bg-pp-gold-bright text-black shadow-xs font-mono'
            }`}
          >
            {ohioAccessRequested ? <CheckCircle size={15} /> : <PaperPlaneTilt size={15} />}
            <span>{ohioAccessRequested ? 'Ohio Realauction Requested' : 'Request Ohio Realauction Access'}</span>
          </button>

          <button
            id="start-texas-trial-btn"
            type="button"
            onClick={() => setTexasTrialActive(true)}
            disabled={texasTrialActive}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              texasTrialActive
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                : 'bg-pp-surface-raised hover:bg-pp-border text-pp-text border border-pp-border/70 shadow-xs font-mono'
            }`}
          >
            {texasTrialActive ? <CheckCircle size={15} /> : <PaperPlaneTilt size={15} />}
            <span>{texasTrialActive ? 'Texas Smart Search Active' : 'Start Texas Smart Search Trial'}</span>
          </button>
        </div>
      </div>

      {/* State Filter Buttons */}
      <div id="county-state-filter-bar" className="flex items-center gap-2 text-xs font-medium flex-wrap">
        {(['ALL', 'NJ', 'PA', 'OH', 'TX', 'FL'] as const).map((st) => (
          <button
            key={st}
            id={`county-filter-state-${st.toLowerCase()}-btn`}
            type="button"
            onClick={() => setSelectedState(st)}
            className={`px-4 py-2 rounded-lg font-mono transition-all cursor-pointer ${
              selectedState === st
                ? 'bg-pp-gold text-black font-bold shadow-xs'
                : 'bg-pp-surface border border-pp-border/70 text-pp-muted hover:text-pp-text'
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
          </button>
        ))}
      </div>

      {/* NJ Director's Ratio Chapter 123 Quick Tool */}
      <div id="nj-directors-ratio-tool" className="bg-pp-surface border border-pp-border/70 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-pp-text font-bold text-sm">
            <Calculator size={18} className="text-pp-gold" />
            <span>NJ Chapter 123 Director's Ratio Equalization Calculator</span>
          </div>
          <span className="text-[11px] font-mono text-pp-gold bg-pp-gold/15 border border-pp-gold/30 px-2.5 py-0.5 rounded">
            Official NJ Division of Taxation Table
          </span>
        </div>
        <p className="text-xs text-pp-muted leading-relaxed">
          In NJ, tax assessments do not reflect 100% of fair market value. The State publishes the Director's Ratio annually.
          Divide the assessed value by the municipality's Director's Ratio to calculate statutory Equalized True Value.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-[11px] font-mono uppercase text-pp-muted block mb-1">Municipality</label>
            <select
              id="nj-calc-muni-select"
              value={calcMuni}
              onChange={(e) => setCalcMuni(e.target.value)}
              className="w-full bg-pp-page border border-pp-border rounded-lg p-2.5 text-xs font-semibold text-pp-text focus:outline-none focus:ring-1 focus:ring-pp-gold"
            >
              {NJ_EQUALIZATION_RATIOS_2026.map((m) => (
                <option key={m.municipality} value={m.municipality} className="bg-pp-surface text-pp-text">
                  {m.municipality} ({m.county} County) - {(m.directorsRatio * 100).toFixed(1)}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-pp-muted block mb-1">Assessed Value ($)</label>
            <input
              id="nj-calc-assessed-input"
              type="number"
              value={calcAssessed}
              onChange={(e) => setCalcAssessed(Number(e.target.value))}
              className="w-full bg-pp-page border border-pp-border rounded-lg p-2 text-xs font-mono font-bold text-pp-text focus:outline-none focus:ring-1 focus:ring-pp-gold"
            />
          </div>

          <div className="bg-pp-page border border-pp-gold/30 rounded-lg p-3 flex flex-col justify-center font-mono">
            <span className="text-[10px] uppercase text-pp-muted">Equalized True Market Value</span>
            <span className="text-xl font-bold text-pp-gold">
              ${calcResult?.equalizedTrueMarketValue.toLocaleString() || '—'}
            </span>
            <span className="text-[10px] text-pp-muted mt-0.5">
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
            className="bg-pp-surface border border-pp-border/70 rounded-xl p-5 space-y-3 shadow-xs hover:border-pp-gold/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-pp-page text-pp-muted border border-pp-border/70 font-mono text-[10px] font-bold">
                  {county.state} • {county.sourceType}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    county.activeCount > 0 ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-pp-page text-pp-muted border border-pp-border/70'
                  }`}
                >
                  {county.activeCount} active
                </span>
              </div>

              <h3 className="text-base font-bold text-pp-text mt-2">{county.countyName}</h3>
              <p className="text-xs text-pp-muted mt-0.5">{county.sheriffOfficeAddress}</p>

              <div className="mt-3 space-y-1.5 text-xs text-pp-muted font-mono">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-pp-faint shrink-0" />
                  <span className="truncate">{county.sheriffOfficeAddress}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-pp-faint shrink-0" />
                  <span>Deposit: {county.depositRule}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scales size={14} className="text-pp-faint shrink-0" />
                  <span className="truncate">Statute: {county.verifiedAugust2026Statute}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-pp-border/70 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-pp-muted">
                Next auction: {county.nextAuctionDate}
              </span>
              {county.sheriffWebsiteUrl && (
                <a
                  id={`county-portal-link-${county.countyName.toLowerCase().replace(/\s+/g, '-')}`}
                  href={county.sheriffWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pp-gold hover:text-pp-gold-bright font-bold flex items-center gap-1"
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
