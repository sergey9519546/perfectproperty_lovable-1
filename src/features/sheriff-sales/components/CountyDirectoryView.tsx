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

  const calcResult = calculateNJTrueMarketValue(calcMuni, calcAssessed);

  const filteredCounties = COUNTY_COVERAGE_REGISTRY.filter((c) => {
    if (selectedState !== 'ALL' && c.state !== selectedState) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-bold">
              COUNTY COVERAGE REGISTRY & SOURCES
            </span>
            <span className="text-xs text-slate-500 font-mono">Phase 2–4 Roadmap</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Statewide County Ingestion Portals & Court Rules
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            17 New Jersey Counties, Pennsylvania Metro Corridors, Ohio Realauction, and Texas Smart Search.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOhioAccessRequested(true)}
            disabled={ohioAccessRequested}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              ohioAccessRequested
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs'
            }`}
          >
            {ohioAccessRequested ? <CheckCircle size={15} /> : <PaperPlaneTilt size={15} />}
            <span>{ohioAccessRequested ? 'Ohio Realauction Requested' : 'Request Ohio Realauction Access'}</span>
          </button>

          <button
            onClick={() => setTexasTrialActive(true)}
            disabled={texasTrialActive}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              texasTrialActive
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs'
            }`}
          >
            {texasTrialActive ? <CheckCircle size={15} /> : <PaperPlaneTilt size={15} />}
            <span>{texasTrialActive ? 'Texas Smart Search Active' : 'Start Texas Smart Search Trial'}</span>
          </button>
        </div>
      </div>

      {/* State Filter Buttons */}
      <div className="flex items-center gap-2 text-xs font-medium">
        {(['ALL', 'NJ', 'PA', 'OH', 'TX', 'FL'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setSelectedState(st)}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedState === st
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Calculator size={18} className="text-blue-600" />
            <span>NJ Chapter 123 Director's Ratio Equalization Calculator</span>
          </div>
          <span className="text-[11px] font-mono text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
            Official NJ Division of Taxation Table
          </span>
        </div>
        <p className="text-xs text-blue-800">
          In NJ, tax assessments do not reflect 100% of fair market value. The State publishes the Director's Ratio annually.
          Divide the assessed value by the municipality's Director's Ratio to calculate statutory Equalized True Value.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-600 block mb-1">Municipality</label>
            <select
              value={calcMuni}
              onChange={(e) => setCalcMuni(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
            >
              {NJ_EQUALIZATION_RATIOS_2026.map((m) => (
                <option key={m.municipality} value={m.municipality}>
                  {m.municipality} ({m.county} County) - {(m.directorsRatio * 100).toFixed(1)}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-600 block mb-1">Assessed Value ($)</label>
            <input
              type="number"
              value={calcAssessed}
              onChange={(e) => setCalcAssessed(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold text-slate-900"
            />
          </div>

          <div className="bg-white border border-blue-300 rounded-xl p-3 flex flex-col justify-center font-mono">
            <span className="text-[10px] uppercase text-slate-500">Equalized True Market Value</span>
            <span className="text-xl font-bold text-blue-700">
              ${calcResult?.equalizedTrueMarketValue.toLocaleString() || '—'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Director's Ratio: {((calcResult?.directorsRatio || 1) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* County Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCounties.map((county) => (
          <div
            key={county.countyName}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                  {county.state} • {county.sourceType}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    county.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : county.status === 'BETA'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {county.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">{county.countyName}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{county.sheriffOfficeName}</p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{county.biddingLocation}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  <span>Deposit: {county.depositTerms}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scales size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">Statute: {county.statutoryCitation}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-slate-500">
                Redemption: {county.redemptionPeriodDays} days
              </span>
              {county.auctionUrl && (
                <a
                  href={county.auctionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
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
