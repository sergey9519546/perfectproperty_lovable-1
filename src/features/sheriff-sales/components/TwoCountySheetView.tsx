import { TableSkeleton, MetricsHeaderSkeleton } from '@/components/ui/skeleton-loaders';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from 'react';
import {
  PresentationChart,
  MagnifyingGlass,
  DownloadSimple,
  Eye,
  TrendUp,
  Funnel,
  Printer,
  X,
  FileSpreadsheet,
  CheckCircle,
  CaretUp,
  CaretDown,
} from '@phosphor-icons/react';
import type { SheriffGovSale } from '../types';

type SortColumn = 'address' | 'auctionDate' | 'equalizedMktVal' | 'modeledArv' | 'mab' | 'survivingLiens' | 'netSpread' | 'flipScore';

export function TwoCountySheetView({
  sales,
  onSelectSale,
  loading = false,
}: {
  sales: SheriffGovSale[];
  onSelectSale: (sale: SheriffGovSale) => void;
  loading?: boolean;
}) {
  const [activeSheetScope, setActiveSheetScope] = useState<'FIRST_TWO' | 'STATEWIDE_PA' | 'ALL'>('FIRST_TWO');
  const [searchQuery, setSearchQuery] = useState('');
  const [minFlipScore, setMinFlipScore] = useState(70);
  const [showReiaModal, setShowReiaModal] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>('flipScore');
  const [sortAsc, setSortAsc] = useState(false);

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
    }).sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortColumn === 'address') {
        valA = a.parcel.address.toLowerCase();
        valB = b.parcel.address.toLowerCase();
      } else if (sortColumn === 'auctionDate') {
        valA = new Date(a.auctionDate).getTime();
        valB = new Date(b.auctionDate).getTime();
      } else if (sortColumn === 'equalizedMktVal') {
        valA = a.njEqualization?.equalizedTrueMarketValue || 0;
        valB = b.njEqualization?.equalizedTrueMarketValue || 0;
      } else if (sortColumn === 'modeledArv') {
        valA = a.aiWorkforce.dealUnderwriter.modeledArv;
        valB = b.aiWorkforce.dealUnderwriter.modeledArv;
      } else if (sortColumn === 'mab') {
        valA = a.aiWorkforce.dealUnderwriter.maximumAllowableBid;
        valB = b.aiWorkforce.dealUnderwriter.maximumAllowableBid;
      } else if (sortColumn === 'survivingLiens') {
        valA = a.assistedLienCheck.totalSurvivingDebtRequired;
        valB = b.assistedLienCheck.totalSurvivingDebtRequired;
      } else if (sortColumn === 'netSpread') {
        valA = a.compsAndMargin.netSpreadDollars;
        valB = b.compsAndMargin.netSpreadDollars;
      } else if (sortColumn === 'flipScore') {
        valA = a.flipScoreAndEndGame.flipScore;
        valB = b.flipScoreAndEndGame.flipScore;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [sales, activeSheetScope, searchQuery, minFlipScore, sortColumn, sortAsc]);

  if (loading) {
    return (
      <div className="space-y-6 p-2">
        <MetricsHeaderSkeleton />
        <TableSkeleton
          rows={7}
          columns={[
            { width: 'w-1/4' },
            { width: 'w-1/8' },
            { width: 'w-1/8', align: 'right' },
            { width: 'w-1/8', align: 'right' },
            { width: 'w-1/8', align: 'right' },
            { width: 'w-1/8', align: 'right' },
            { width: 'w-1/8', align: 'right' },
          ]}
        />
      </div>
    );
  }

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortAsc((prev) => !prev);
    } else {
      setSortColumn(column);
      setSortAsc(false);
    }
  }

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

  const aggregateSpread = filteredSales.reduce((acc, s) => acc + s.compsAndMargin.netSpreadDollars, 0);

  return (
    <div id="two-county-sheet-container" className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div id="two-county-sheet-banner" className="bg-card border border-pp-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold border border-blue-200">
              PRO TRADER DESK
            </span>
            <span className="text-xs text-muted-foreground font-mono">CivilView & Chancery Ingestion Grid</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Sheriff Intelligence Underwriting Spreadsheet
          </h2>
          <p className="text-xs text-muted-foreground">
            Interactive high-density data sheet showing modeled ARVs, senior surviving liens, and wholesale/flip spreads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            id="reia-packet-btn"
            type="button"
            onClick={() => setShowReiaModal(true)}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <PresentationChart size={16} />
            <span>Generate REIA Pitch Packet</span>
          </Button>
          <Button
            id="export-csv-btn"
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-muted border border-slate-200 hover:bg-accent text-foreground rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer"
          >
            <DownloadSimple size={16} />
            <span>Export CSV Grid</span>
          </Button>
        </div>
      </div>

      {/* Scope Toggles & Filters */}
      <div id="two-county-filters-bar" className="bg-card border border-pp-border rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Scope Pill Switcher */}
        <div className="flex items-center gap-1 bg-accent p-1 rounded-xl text-xs font-medium font-mono shrink-0 overflow-x-auto">
          <Button
            id="scope-first-two-btn"
            type="button"
            onClick={() => setActiveSheetScope('FIRST_TWO')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSheetScope === 'FIRST_TWO' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Bergen + Middlesex (First Two-County Sheet)
          </Button>
          <Button
            id="scope-statewide-btn"
            type="button"
            onClick={() => setActiveSheetScope('STATEWIDE_PA')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSheetScope === 'STATEWIDE_PA' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Statewide NJ + Philadelphia
          </Button>
          <Button
            id="scope-all-btn"
            type="button"
            onClick={() => setActiveSheetScope('ALL')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSheetScope === 'ALL' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Markets ({sales.length})
          </Button>
        </div>

        {/* Search & Min Score */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <MagnifyingGlass size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <Input
              id="sheet-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter address, town, case #, owner…"
              className="w-full pl-9 pr-3 py-1.5 bg-muted border border-slate-200 rounded-xl text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>Min Flip Score:</span>
            <select
              id="sheet-min-score-select"
              value={minFlipScore}
              onChange={(e) => setMinFlipScore(Number(e.target.value))}
              className="bg-muted border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value={0}>All Scores</option>
              <option value={70}>70+ (Viable)</option>
              <option value={80}>80+ (Strong)</option>
              <option value={90}>90+ (Ring 1 Priority)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div id="two-county-table-wrapper" className="bg-card border border-pp-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table id="two-county-sales-table" className="w-full text-xs text-left">
            <thead className="bg-muted font-mono text-muted-foreground uppercase border-b border-slate-200 text-[11px] tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('address')}
                  className="p-3.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Property & Docket</span>
                    {sortColumn === 'address' && (sortAsc ? <CaretUp size={12} /> : <CaretDown size={12} />)}
                  </div>
                </th>
                <th className="p-3.5">Beneficial Owner</th>
                <th
                  onClick={() => handleSort('auctionDate')}
                  className="p-3.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Auction Date</span>
                    {sortColumn === 'auctionDate' && (sortAsc ? <CaretUp size={12} /> : <CaretDown size={12} />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('equalizedMktVal')}
                  className="p-3.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Equalized Mkt Val</span>
                    {sortColumn === 'equalizedMktVal' && (sortAsc ? <CaretUp size={12} /> : <CaretDown size={12} />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('modeledArv')}
                  className="p-3.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Modeled ARV</span>
                    {sortColumn === 'modeledArv' && (sortAsc ? <CaretUp size={12} /> : <CaretDown size={12} />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('mab')}
                  className="p-3.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Max Bid (MAB)</span>
                    {sortColumn === 'mab' && (sortAsc ? <CaretUp size={12} /> : <CaretDown size={12} />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('survivingLiens')}
                  className="p-3.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Surviving Liens</span>
                    {sortColumn === 'survivingLiens' && (sortAsc ? <CaretUp size={12} /> : <CaretDown size={12} />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('netSpread')}
                  className="p-3.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Net Margin</span>
                    {sortColumn === 'netSpread' && (sortAsc ? <CaretUp size={12} /> : <CaretDown size={12} />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('flipScore')}
                  className="p-3.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Flip Score</span>
                    {sortColumn === 'flipScore' && (sortAsc ? <CaretUp size={12} /> : <CaretDown size={12} />)}
                  </div>
                </th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-muted transition-colors">
                  {/* Property & Docket */}
                  <td className="p-3.5">
                    <div className="font-bold font-sans text-foreground text-sm">{sale.parcel.address}</div>
                    <div className="text-muted-foreground font-sans text-xs">
                      {sale.parcel.city}, {sale.parcel.state} {sale.parcel.zip}
                    </div>
                    <div className="text-[11px] text-primary font-mono mt-0.5">
                      Case #{sale.caseNumber} {sale.sheriffNumber && `• Shf #${sale.sheriffNumber}`}
                    </div>
                  </td>

                  {/* Beneficial Owner */}
                  <td className="p-3.5">
                    <div className="font-semibold text-foreground text-xs font-sans max-w-44 truncate">
                      {sale.entityResolution.trueBeneficialOwner}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-sans max-w-44 truncate">
                      Servicer: {sale.entityResolution.loanServicer}
                    </div>
                  </td>

                  {/* Auction Date */}
                  <td className="p-3.5">
                    <div className="font-bold text-foreground">{sale.auctionDate}</div>
                    <div className="text-[11px] text-muted-foreground">{sale.auctionTime}</div>
                    <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                      Dep: ${sale.bidCard.requiredDepositDollars.toLocaleString()}
                    </div>
                  </td>

                  {/* Equalized Market Value */}
                  <td className="p-3.5">
                    {sale.njEqualization ? (
                      <div>
                        <div className="font-bold text-foreground">
                          ${sale.njEqualization.equalizedTrueMarketValue.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Ratio: {(sale.njEqualization.directorsRatio * 100).toFixed(1)}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Modeled ARV */}
                  <td className="p-3.5">
                    <div className="font-bold text-foreground">
                      ${sale.aiWorkforce.dealUnderwriter.modeledArv.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      ${sale.compsAndMargin.submarketMedianPpsf}/sf
                    </div>
                  </td>

                  {/* Max Bid (MAB) */}
                  <td className="p-3.5">
                    <div className="font-bold text-primary">
                      ${sale.aiWorkforce.dealUnderwriter.maximumAllowableBid.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">70% rule ceiling</div>
                  </td>

                  {/* Surviving Liens (The Catch) */}
                  <td className="p-3.5">
                    <div className="font-bold text-rose-600">
                      ${sale.assistedLienCheck.totalSurvivingDebtRequired.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {sale.theCatch.seniorSurvivingLiens.length} lien(s) survive
                    </div>
                  </td>

                  {/* Net Margin */}
                  <td className="p-3.5">
                    <div className="font-bold text-emerald-600">
                      +${sale.compsAndMargin.netSpreadDollars.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      {sale.compsAndMargin.netMarginPercent}% margin
                    </div>
                  </td>

                  {/* Flip Score */}
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                      <TrendUp size={12} />
                      {sale.flipScoreAndEndGame.flipScore}
                    </span>
                  </td>

                  {/* Daily Status */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-accent text-foreground border border-slate-200 text-[10px] font-bold">
                      {sale.dailyStatus.currentStatus.replace(/_/g, ' ')}
                    </span>
                    {sale.dailyStatus.statutoryAdjournmentCount > 0 && (
                      <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                        {sale.dailyStatus.statutoryAdjournmentCount} adj used
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="p-3.5 text-right">
                    <Button
                      id={`inspect-sale-btn-${sale.id}`}
                      type="button"
                      onClick={() => onSelectSale(sale)}
                      className="px-3 py-1.5 bg-accent hover:bg-accent text-foreground rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                    >
                      <Eye size={14} />
                      <span>Inspect</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REIA PITCH PACKET MODAL */}
      {showReiaModal && (
        <div id="reia-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div id="reia-modal-dialog" className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-6 my-8 text-foreground">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono text-primary uppercase font-bold">
                  REIA Meeting Presentation Packet
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  Local Real Estate Investors Association Pitch
                </h3>
              </div>
              <Button
                type="button"
                onClick={() => setShowReiaModal(false)}
                className="p-1.5 text-slate-400 hover:text-foreground rounded-lg font-bold text-sm cursor-pointer"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4 text-xs text-foreground leading-relaxed font-sans">
              <div className="p-4 bg-muted border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold font-mono text-primary uppercase block">
                  Executive Pitch Deck (First REIA Meeting)
                </span>
                <p className="text-muted-foreground">
                  "We systematically monitor 100% of New Jersey Chancery and Pennsylvania Court of Common Pleas
                  foreclosure dockets before they reach the courthouse steps. Using our autonomous AI workforce, we
                  read the raw legal notice, de-anonymize private equity securitization trusts, verify municipal surviving
                  liens, and calculate 70% rule hard-stop bids with verified NAIP aerial structural scores."
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3.5 bg-muted rounded-xl border border-slate-200">
                  <span className="text-[10px] text-muted-foreground uppercase block">Filtered Deals</span>
                  <span className="text-xl font-bold text-foreground">{filteredSales.length} Pipeline Deals</span>
                </div>
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase block">Aggregate Net Spread</span>
                  <span className="text-xl font-bold text-emerald-600">
                    +${aggregateSpread.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 bg-muted rounded-xl border border-slate-200">
                  <span className="text-[10px] text-muted-foreground uppercase block">Avg Flip Score</span>
                  <span className="text-xl font-bold text-primary">
                    {Math.round(
                      filteredSales.reduce((acc, s) => acc + s.flipScoreAndEndGame.flipScore, 0) /
                        (filteredSales.length || 1)
                    )}
                    /100
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-muted">
                <span className="font-bold text-foreground block">Highlights for Private Lenders & Capital Partners:</span>
                <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground">
                  <li><strong className="text-foreground">Bergen County:</strong> 184 Clinton Place, Hackensack — $175,500 equity spread with 20% certified check deposit requirement.</li>
                  <li><strong className="text-foreground">Middlesex County:</strong> 42 Plainfield Ave, Edison — $163,500 net margin, peremptory auction with all defendant adjournments exhausted.</li>
                  <li><strong className="text-foreground">Assisted Lien Check:</strong> All municipal taxes and water/sewer liens quantified to the exact dollar before bidding.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <Button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold transition-colors hover:bg-primary/90 cursor-pointer flex items-center gap-1.5"
              >
                <Printer size={15} />
                <span>Print Handout Packet</span>
              </Button>
              <Button
                type="button"
                onClick={() => setShowReiaModal(false)}
                className="px-4 py-2 bg-accent hover:bg-accent text-foreground rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
