import { useState, useMemo } from 'react';
import {
  PresentationChart,
  MagnifyingGlass,
  DownloadSimple,
  Eye,
  TrendUp,
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
      'Beneficial Owner',
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

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sheriff_deal_sheet_${activeSheetScope.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div id="two-county-sheet-container" className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div id="two-county-sheet-banner" className="bg-pp-surface border border-pp-border/70 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-pp-gold/15 text-pp-gold text-xs font-mono font-bold">
              PIPELINE DESK
            </span>
            <span className="text-xs text-pp-muted font-mono">CivilView Direct Ingestion</span>
          </div>
          <h2 className="text-lg font-bold text-pp-text mt-1">
            Sheriff Intelligence Underwriting Sheet
          </h2>
          <p className="text-xs text-pp-muted mt-0.5">
            Turnkey pipeline tracking pre-auction upset limits, surviving liens, and post-rehab margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="reia-packet-btn"
            type="button"
            onClick={() => setShowReiaModal(true)}
            className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PresentationChart size={16} />
            <span>Generate REIA Pitch Packet</span>
          </button>
          <button
            id="export-csv-btn"
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 bg-pp-surface-raised border border-pp-border hover:bg-pp-header text-pp-text rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <DownloadSimple size={16} />
            <span>Export CSV Sheet</span>
          </button>
        </div>
      </div>

      {/* Scope Toggles & Filters */}
      <div id="two-county-filters-bar" className="bg-pp-surface border border-pp-border/70 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-pp-page p-1 rounded-lg border border-pp-border/70 text-xs font-medium">
          <button
            id="scope-first-two-btn"
            type="button"
            onClick={() => setActiveSheetScope('FIRST_TWO')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSheetScope === 'FIRST_TWO' ? 'bg-pp-gold text-black font-bold' : 'text-pp-muted hover:text-pp-text'
            }`}
          >
            Bergen + Middlesex (First Two-County Sheet)
          </button>
          <button
            id="scope-statewide-btn"
            type="button"
            onClick={() => setActiveSheetScope('STATEWIDE_PA')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSheetScope === 'STATEWIDE_PA' ? 'bg-pp-gold text-black font-bold' : 'text-pp-muted hover:text-pp-text'
            }`}
          >
            Statewide NJ + Philadelphia
          </button>
          <button
            id="scope-all-btn"
            type="button"
            onClick={() => setActiveSheetScope('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSheetScope === 'ALL' ? 'bg-pp-gold text-black font-bold' : 'text-pp-muted hover:text-pp-text'
            }`}
          >
            All Markets
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-3 top-2.5 text-pp-muted" />
            <input
              id="sheet-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, town, case #, owner…"
              className="pl-8 pr-3 py-1.5 bg-pp-page border border-pp-border rounded-lg text-xs text-pp-text placeholder:text-pp-faint focus:outline-none focus:border-pp-gold w-56 font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-pp-muted font-mono">
            <span>Min Flip Score:</span>
            <select
              id="sheet-min-score-select"
              value={minFlipScore}
              onChange={(e) => setMinFlipScore(Number(e.target.value))}
              className="bg-pp-page border border-pp-border rounded-lg px-2 py-1 text-xs font-bold text-pp-text focus:outline-none focus:border-pp-gold cursor-pointer"
            >
              <option value={70}>70+</option>
              <option value={80}>80+</option>
              <option value={90}>90+ (Ring 1 Priority)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div id="two-county-table-wrapper" className="bg-pp-surface border border-pp-border/70 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table id="two-county-sales-table" className="w-full text-xs text-left">
            <thead className="bg-pp-page font-mono text-pp-muted uppercase border-b border-pp-border/70 text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Property & Docket</th>
                <th className="p-3.5">Beneficial Owner</th>
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
            <tbody className="divide-y divide-pp-border/50 font-mono">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-pp-surface-raised transition-colors">
                  {/* Property & Docket */}
                  <td className="p-3.5">
                    <div className="font-bold font-sans text-pp-text text-sm">{sale.parcel.address}</div>
                    <div className="text-pp-muted font-sans text-xs">
                      {sale.parcel.city}, {sale.parcel.state} {sale.parcel.zip}
                    </div>
                    <div className="text-[11px] text-pp-gold font-mono mt-0.5">
                      Case #{sale.caseNumber} {sale.sheriffNumber && `• Shf #${sale.sheriffNumber}`}
                    </div>
                  </td>

                  {/* Beneficial Owner */}
                  <td className="p-3.5">
                    <div className="font-semibold text-pp-text text-xs font-sans">
                      {sale.entityResolution.trueBeneficialOwner}
                    </div>
                    <div className="text-[11px] text-pp-muted font-sans">
                      Servicer: {sale.entityResolution.loanServicer}
                    </div>
                  </td>

                  {/* Auction Date */}
                  <td className="p-3.5">
                    <div className="font-bold text-pp-text">{sale.auctionDate}</div>
                    <div className="text-[11px] text-pp-muted">{sale.auctionTime}</div>
                    <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                      Dep: ${sale.bidCard.requiredDepositDollars.toLocaleString()}
                    </div>
                  </td>

                  {/* Equalized Market Value */}
                  <td className="p-3.5">
                    {sale.njEqualization ? (
                      <div>
                        <div className="font-bold text-pp-text">
                          ${sale.njEqualization.equalizedTrueMarketValue.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-pp-muted">
                          Ratio: {(sale.njEqualization.directorsRatio * 100).toFixed(1)}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-pp-faint">—</span>
                    )}
                  </td>

                  {/* Modeled ARV */}
                  <td className="p-3.5">
                    <div className="font-bold text-pp-text">
                      ${sale.aiWorkforce.dealUnderwriter.modeledArv.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-pp-muted">
                      ${sale.compsAndMargin.submarketMedianPpsf}/sf
                    </div>
                  </td>

                  {/* Max Bid (MAB) */}
                  <td className="p-3.5">
                    <div className="font-bold text-pp-gold">
                      ${sale.aiWorkforce.dealUnderwriter.maximumAllowableBid.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-pp-muted">70% rule ceiling</div>
                  </td>

                  {/* Surviving Liens (The Catch) */}
                  <td className="p-3.5">
                    <div className="font-bold text-rose-400">
                      ${sale.assistedLienCheck.totalSurvivingDebtRequired.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-pp-muted">
                      {sale.theCatch.seniorSurvivingLiens.length} lien(s) survive
                    </div>
                  </td>

                  {/* Net Margin */}
                  <td className="p-3.5">
                    <div className="font-bold text-profit-strong">
                      +${sale.compsAndMargin.netSpreadDollars.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      {sale.compsAndMargin.netMarginPercent}% margin
                    </div>
                  </td>

                  {/* Flip Score */}
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                      <TrendUp size={12} />
                      {sale.flipScoreAndEndGame.flipScore}
                    </span>
                  </td>

                  {/* Daily Status */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-pp-surface-raised text-pp-text border border-pp-border text-[10px] font-bold">
                      {sale.dailyStatus.currentStatus.replace(/_/g, ' ')}
                    </span>
                    {sale.dailyStatus.statutoryAdjournmentCount > 0 && (
                      <div className="text-[10px] text-amber-400 mt-0.5">
                        {sale.dailyStatus.statutoryAdjournmentCount} adj used
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="p-3.5 text-right">
                    <button
                      id={`inspect-sale-btn-${sale.id}`}
                      type="button"
                      onClick={() => onSelectSale(sale)}
                      className="px-3 py-1.5 bg-pp-surface-raised hover:bg-pp-header border border-pp-border text-pp-text rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
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
        <div id="reia-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div id="reia-modal-dialog" className="w-full max-w-3xl bg-pp-surface rounded-xl shadow-2xl border border-pp-border p-6 space-y-6 my-8 text-pp-text">
            <div className="flex items-center justify-between border-b border-pp-border pb-4">
              <div>
                <span className="text-xs font-mono text-pp-gold uppercase font-bold">
                  REIA Meeting Presentation Packet
                </span>
                <h3 className="text-xl font-bold text-pp-text mt-1">
                  Local Real Estate Investors Association Pitch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReiaModal(false)}
                className="text-pp-muted hover:text-pp-text font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-pp-text leading-relaxed font-sans">
              <div className="p-4 bg-pp-page border border-pp-border rounded-xl space-y-2">
                <span className="text-xs font-bold font-mono text-pp-gold uppercase block">
                  Executive Pitch Deck (First REIA Meeting)
                </span>
                <p className="text-pp-muted">
                  "We systematically monitor 100% of New Jersey Chancery and Pennsylvania Court of Common Pleas
                  foreclosure dockets before they reach the courthouse steps. Using our autonomous AI workforce, we
                  read the raw legal notice, de-anonymize private equity securitization trusts, verify municipal surviving
                  liens, and calculate 70% rule hard-stop bids with verified NAIP aerial structural scores."
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 bg-pp-page rounded-xl border border-pp-border">
                  <span className="text-[10px] text-pp-muted uppercase block">Filtered Deals</span>
                  <span className="text-xl font-bold text-pp-text">{filteredSales.length} Ring 1 Deals</span>
                </div>
                <div className="p-3 bg-pp-page rounded-xl border border-pp-border">
                  <span className="text-[10px] text-pp-muted uppercase block">Aggregate Net Spread</span>
                  <span className="text-xl font-bold text-profit-strong">
                    +$
                    {filteredSales
                      .reduce((acc, s) => acc + s.compsAndMargin.netSpreadDollars, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-pp-page rounded-xl border border-pp-border">
                  <span className="text-[10px] text-pp-muted uppercase block">Avg Flip Score</span>
                  <span className="text-xl font-bold text-pp-gold">
                    {Math.round(
                      filteredSales.reduce((acc, s) => acc + s.flipScoreAndEndGame.flipScore, 0) /
                        (filteredSales.length || 1)
                    )}
                    /100
                  </span>
                </div>
              </div>

              <div className="border border-pp-border rounded-xl p-4 space-y-2 bg-pp-page">
                <span className="font-bold text-pp-text block">Highlights for Private Lenders & Capital Partners:</span>
                <ul className="list-disc pl-4 space-y-1 text-pp-muted">
                  <li><strong className="text-pp-text">Bergen County:</strong> 184 Clinton Place, Hackensack — $175,500 equity spread with 20% certified check deposit requirement.</li>
                  <li><strong className="text-pp-text">Middlesex County:</strong> 42 Plainfield Ave, Edison — $163,500 net margin, peremptory auction with all defendant adjournments exhausted.</li>
                  <li><strong className="text-pp-text">Assisted Lien Check:</strong> All municipal taxes and water/sewer liens quantified to the exact dollar before bidding.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-pp-border pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-pp-gold text-black rounded-lg text-xs font-bold transition-colors hover:bg-pp-gold-bright cursor-pointer"
              >
                Print Handout Packet
              </button>
              <button
                type="button"
                onClick={() => setShowReiaModal(false)}
                className="px-4 py-2 bg-pp-surface-raised border border-pp-border text-pp-text rounded-lg text-xs font-bold transition-colors hover:bg-pp-header cursor-pointer"
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
