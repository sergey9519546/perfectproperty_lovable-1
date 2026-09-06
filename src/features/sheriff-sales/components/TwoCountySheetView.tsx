import { useState, useMemo } from 'react';
import {
  FileCsv,
  PresentationChart,
  MagnifyingGlass,
  Funnel,
  DownloadSimple,
  CheckCircle,
  Eye,
  Gavel,
  Buildings,
  ShieldCheck,
  TrendUp,
  WarningCircle,
} from '@phosphor-icons/react';
import type { SheriffGovSale } from '../types';

export function TwoCountySheetView({
  sales,
  onSelectSale,
}: {
  sales: SheriffGovSale[];
  onSelectSale: (sale: SheriffGovSale) => void;
}) {
  const [activeSheetScope, setActiveSheetScope] = useState<'FIRST_TWO' | 'STATEWIDE_PA' | 'ALL'>('FIRST_TWO');
  const [searchQuery, setSearchQuery] = useState('');
  const [minFlipScore, setMinFlipScore] = useState(80);
  const [showReiaModal, setShowReiaModal] = useState(false);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Scope filtering
      if (activeSheetScope === 'FIRST_TWO') {
        const isBergenOrMiddlesex =
          sale.county.includes('Bergen') || sale.county.includes('Middlesex');
        if (!isBergenOrMiddlesex) return false;
      } else if (activeSheetScope === 'STATEWIDE_PA') {
        const isNjOrPa = sale.jurisdictionState === 'NJ' || sale.jurisdictionState === 'PA';
        if (!isNjOrPa) return false;
      }

      // Flip score filter
      if (sale.flipScoreAndEndGame.flipScore < minFlipScore) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesAddress = sale.parcel.address.toLowerCase().includes(query);
        const matchesCity = sale.parcel.city.toLowerCase().includes(query);
        const matchesCounty = sale.county.toLowerCase().includes(query);
        const matchesCase = sale.caseNumber.toLowerCase().includes(query);
        const matchesOwner = sale.entityResolution.trueBeneficialOwner.toLowerCase().includes(query);
        if (!matchesAddress && !matchesCity && !matchesCounty && !matchesCase && !matchesOwner) {
          return false;
        }
      }

      return true;
    });
  }, [sales, activeSheetScope, searchQuery, minFlipScore]);

  // Export to CSV
  function handleExportCsv() {
    const headers = [
      'Case Number',
      'Sheriff Number',
      'County',
      'Address',
      'City',
      'State',
      'Zip',
      'Beneficial Owner (Hack 3)',
      'Loan Servicer',
      'Auction Date',
      'Modeled ARV',
      'Max Allowable Bid (MAB)',
      'Surviving Liens',
      'Net Spread Dollars',
      'Flip Score',
      'Required Deposit',
      'Status',
    ];

    const rows = filteredSales.map((s) => [
      `"${s.caseNumber}"`,
      `"${s.sheriffNumber || ''}"`,
      `"${s.county}"`,
      `"${s.parcel.address}"`,
      `"${s.parcel.city}"`,
      `"${s.parcel.state}"`,
      `"${s.parcel.zip}"`,
      `"${s.entityResolution.trueBeneficialOwner}"`,
      `"${s.entityResolution.loanServicer}"`,
      `"${s.auctionDate}"`,
      s.aiWorkforce.dealUnderwriter.modeledArv,
      s.aiWorkforce.dealUnderwriter.maximumAllowableBid,
      s.assistedLienCheck.totalSurvivingDebtRequired,
      s.compsAndMargin.netSpreadDollars,
      s.flipScoreAndEndGame.flipScore,
      s.bidCard.requiredDepositDollars,
      `"${s.dailyStatus.currentStatus}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sheriff_deal_sheet_${activeSheetScope.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-bold">
              BUILD SEQUENCE STEP 1 & 2
            </span>
            <span className="text-xs text-slate-500 font-mono">CivilView Direct Ingestion</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Sheriff Intelligence Underwriting Sheet
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Turnkey pipeline tracking pre-auction upset limits, surviving liens, and post-rehab margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReiaModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <PresentationChart size={16} />
            <span>Generate REIA Pitch Packet</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <DownloadSimple size={16} />
            <span>Export CSV Sheet</span>
          </button>
        </div>
      </div>

      {/* Scope Toggles & Filters */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveSheetScope('FIRST_TWO')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSheetScope === 'FIRST_TWO' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bergen + Middlesex (First Two-County Sheet)
          </button>
          <button
            onClick={() => setActiveSheetScope('STATEWIDE_PA')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSheetScope === 'STATEWIDE_PA' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Statewide NJ + Philadelphia
          </button>
          <button
            onClick={() => setActiveSheetScope('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSheetScope === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Markets
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, town, case #, owner…"
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
            <span>Min Flip Score:</span>
            <select
              value={minFlipScore}
              onChange={(e) => setMinFlipScore(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900"
            >
              <option value={70}>70+</option>
              <option value={80}>80+</option>
              <option value={90}>90+ (Ring 1 Priority)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-mono text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="p-3.5">Property & Docket</th>
                <th className="p-3.5">Beneficial Owner (Hack 3)</th>
                <th className="p-3.5">Auction Date</th>
                <th className="p-3.5">Equalized Mkt Val</th>
                <th className="p-3.5">Modeled ARV</th>
                <th className="p-3.5">Max Bid (MAB)</th>
                <th className="p-3.5">Surviving Liens</th>
                <th className="p-3.5">Net Margin</th>
                <th className="p-3.5">Flip Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Property & Docket */}
                  <td className="p-3.5">
                    <div className="font-bold font-sans text-slate-900 text-sm">{sale.parcel.address}</div>
                    <div className="text-slate-500 font-sans text-xs">
                      {sale.parcel.city}, {sale.parcel.state} {sale.parcel.zip}
                    </div>
                    <div className="text-[11px] text-blue-700 font-mono mt-0.5">
                      Case #{sale.caseNumber} {sale.sheriffNumber && `• Shf #${sale.sheriffNumber}`}
                    </div>
                  </td>

                  {/* Beneficial Owner */}
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800 text-xs font-sans">
                      {sale.entityResolution.trueBeneficialOwner}
                    </div>
                    <div className="text-[11px] text-slate-500 font-sans">
                      Servicer: {sale.entityResolution.loanServicer}
                    </div>
                  </td>

                  {/* Auction Date */}
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{sale.auctionDate}</div>
                    <div className="text-[11px] text-slate-500">{sale.auctionTime}</div>
                    <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                      Dep: ${sale.bidCard.requiredDepositDollars.toLocaleString()}
                    </div>
                  </td>

                  {/* Equalized Market Value */}
                  <td className="p-3.5">
                    {sale.njEqualization ? (
                      <div>
                        <div className="font-bold text-slate-900">
                          ${sale.njEqualization.equalizedTrueMarketValue.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Ratio: {(sale.njEqualization.directorsRatio * 100).toFixed(1)}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Modeled ARV */}
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">
                      ${sale.aiWorkforce.dealUnderwriter.modeledArv.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ${sale.compsAndMargin.submarketMedianPpsf}/sf
                    </div>
                  </td>

                  {/* Max Bid (MAB) */}
                  <td className="p-3.5">
                    <div className="font-bold text-blue-700">
                      ${sale.aiWorkforce.dealUnderwriter.maximumAllowableBid.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">70% rule ceiling</div>
                  </td>

                  {/* Surviving Liens (The Catch) */}
                  <td className="p-3.5">
                    <div className="font-bold text-rose-600">
                      ${sale.assistedLienCheck.totalSurvivingDebtRequired.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {sale.theCatch.seniorSurvivingLiens.length} lien(s) survive
                    </div>
                  </td>

                  {/* Net Margin */}
                  <td className="p-3.5">
                    <div className="font-bold text-emerald-700">
                      +${sale.compsAndMargin.netSpreadDollars.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      {sale.compsAndMargin.netMarginPercent}% margin
                    </div>
                  </td>

                  {/* Flip Score */}
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                      <TrendUp size={12} />
                      {sale.flipScoreAndEndGame.flipScore}
                    </span>
                  </td>

                  {/* Daily Status */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                      {sale.dailyStatus.currentStatus.replace(/_/g, ' ')}
                    </span>
                    {sale.dailyStatus.statutoryAdjournmentCount > 0 && (
                      <div className="text-[10px] text-amber-700 mt-0.5">
                        {sale.dailyStatus.statutoryAdjournmentCount} adj used
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onSelectSale(sale)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                    >
                      <Eye size={14} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REIA PITCH PACKET MODAL */}
      {showReiaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-600 uppercase font-bold">
                  REIA Meeting Presentation Packet
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Local Real Estate Investors Association Pitch
                </h3>
              </div>
              <button
                onClick={() => setShowReiaModal(false)}
                className="text-slate-400 hover:text-slate-900 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                <span className="text-xs font-bold font-mono text-indigo-900 uppercase block">
                  Executive Pitch Deck (First REIA Meeting)
                </span>
                <p>
                  "We systematically monitor 100% of New Jersey Chancery and Pennsylvania Court of Common Pleas
                  foreclosure dockets before they reach the courthouse steps. Using our autonomous AI workforce, we
                  read the raw legal notice, de-anonymize private equity securitization trusts, verify municipal surviving
                  liens, and calculate 70% rule hard-stop bids with verified NAIP aerial structural scores."
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Filtered Deals</span>
                  <span className="text-xl font-bold text-slate-900">{filteredSales.length} Ring 1 Deals</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Aggregate Net Spread</span>
                  <span className="text-xl font-bold text-emerald-600">
                    +$
                    {filteredSales
                      .reduce((acc, s) => acc + s.compsAndMargin.netSpreadDollars, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Avg Flip Score</span>
                  <span className="text-xl font-bold text-blue-600">
                    {Math.round(
                      filteredSales.reduce((acc, s) => acc + s.flipScoreAndEndGame.flipScore, 0) /
                        (filteredSales.length || 1)
                    )}
                    /100
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
                <span className="font-bold text-slate-900 block">Highlights for Private Lenders & Capital Partners:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Bergen County:</strong> 184 Clinton Place, Hackensack — $175,500 equity spread with 20% certified check deposit requirement.</li>
                  <li><strong>Middlesex County:</strong> 42 Plainfield Ave, Edison — $163,500 net margin, peremptory auction with all defendant adjournments exhausted.</li>
                  <li><strong>Assisted Lien Check:</strong> All municipal taxes and water/sewer liens quantified to the exact dollar before bidding.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Print Handout Packet
              </button>
              <button
                onClick={() => setShowReiaModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
