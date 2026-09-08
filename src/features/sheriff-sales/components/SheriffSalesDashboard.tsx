import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Gavel,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Search,
  CheckCircle2,
  DollarSign,
  ArrowUpDown,
  Filter,
  Layers,
  FileSpreadsheet,
  Clock,
  Printer,
  ChevronRight,
  Calculator,
  Flame,
  Scale,
  X,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Home,
} from 'lucide-react';
import { SHERIFF_GOV_SALES } from '../data';
import type { SheriffGovSale } from '../types';
import { SheriffSalesSearch } from './SheriffSalesSearch';
import { SheriffSalesErrorBoundary } from './SheriffSalesErrorBoundary';
import { useUnderwritingAccessGate } from './SheriffSalesAuthGuard';

/**
 * Standardize property types into higher-level Asset Classes
 */
export function getAssetClass(propertyType: string): string {
  const pt = (propertyType || '').toLowerCase();
  if (
    pt.includes('single') ||
    pt.includes('colonial') ||
    pt.includes('split') ||
    pt.includes('ranch') ||
    pt.includes('cape') ||
    pt.includes('sfr')
  ) {
    return 'Single Family';
  }
  if (
    pt.includes('multi') ||
    pt.includes('duplex') ||
    pt.includes('triplex') ||
    pt.includes('fourplex') ||
    pt.includes('2-unit') ||
    pt.includes('3-unit') ||
    pt.includes('4-unit') ||
    pt.includes('unit')
  ) {
    return 'Multi-Family';
  }
  if (
    pt.includes('townhouse') ||
    pt.includes('rowhome') ||
    pt.includes('row house') ||
    pt.includes('attached')
  ) {
    return 'Townhouse';
  }
  if (pt.includes('condo') || pt.includes('apartment') || pt.includes('coop')) {
    return 'Condo';
  }
  if (
    pt.includes('commercial') ||
    pt.includes('mixed') ||
    pt.includes('retail') ||
    pt.includes('office')
  ) {
    return 'Commercial';
  }
  if (pt.includes('land') || pt.includes('lot') || pt.includes('acre')) {
    return 'Vacant Land';
  }
  return 'Residential';
}

interface UnderwritingAnalysis {
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  verdict: string;
  equitySpreadScore: number;
  titleLienRiskScore: number;
  marketVelocityScore: number;
  structuralAssetScore: number;
  modeledArv: number;
  maxAllowableBid: number;
  estimatedRehab: number;
  netMarginDollars: number;
  netMarginPercent: number;
  survivingSeniorLienTotal: number;
  survivingLiensCount: number;
  occupancyConstraint: string;
  recommendedCeiling: number;
  dailyStatusNote: string;
}

export function SheriffSalesDashboard({
  sales = SHERIFF_GOV_SALES,
  onSelectSale,
}: {
  sales?: SheriffGovSale[];
  onSelectSale?: (sale: SheriffGovSale) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<string>('ALL');
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'auctionDate' | 'openingBid' | 'score' | 'spread'>('auctionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Firebase Auth Underwriting Access Gate
  const { user, isAuthenticated, requireUnderwritingAuth, UnderwritingGateModal } = useUnderwritingAccessGate();

  // Underwriting Modal state

  const [analyzingSaleId, setAnalyzingSaleId] = useState<string | null>(null);
  const [analyzedSale, setAnalyzedSale] = useState<SheriffGovSale | null>(null);
  const [analysisResult, setAnalysisResult] = useState<UnderwritingAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dynamic Rehab Scope selection inside Underwriting Modal
  const [rehabScopeTier, setRehabScopeTier] = useState<'LIGHT' | 'MEDIUM' | 'HEAVY' | 'GUT'>('MEDIUM');

  // Unique counties with counts
  const countyOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach((s) => {
      counts[s.county] = (counts[s.county] || 0) + 1;
    });
    return [
      { value: 'ALL', label: 'All Counties', count: sales.length },
      ...Object.keys(counts)
        .sort()
        .map((county) => ({
          value: county,
          label: county,
          count: counts[county],
        })),
    ];
  }, [sales]);

  // Unique asset classes with counts
  const assetClassOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach((s) => {
      const ac = getAssetClass(s.parcel.propertyType);
      counts[ac] = (counts[ac] || 0) + 1;
    });
    return [
      { value: 'ALL', label: 'All Asset Classes', count: sales.length },
      ...Object.keys(counts)
        .sort()
        .map((ac) => ({
          value: ac,
          label: ac,
          count: counts[ac],
        })),
    ];
  }, [sales]);

  // Quick address search suggestions
  const recentAddressSuggestions = useMemo(() => {
    return sales.slice(0, 5).map((s) => s.parcel.address);
  }, [sales]);

  // Compute underwriting analysis score for a given sale
  function calculateUnderwritingScore(sale: SheriffGovSale, rehabTier: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'GUT'): UnderwritingAnalysis {
    const rehabMultiplier = {
      LIGHT: 0.8,
      MEDIUM: 1.0,
      HEAVY: 1.35,
      GUT: 1.75,
    }[rehabTier];

    const baseRehab = sale.compsAndMargin.modeledRehabEstimate || 45000;
    const computedRehab = Math.round(baseRehab * rehabMultiplier);
    const arv = sale.aiWorkforce.dealUnderwriter.modeledArv || 500000;
    const survivingDebt = sale.assistedLienCheck.totalSurvivingDebtRequired || 0;
    const carryingCosts = sale.compsAndMargin.holdingAndCarryingCosts || 18000;

    // 70% rule MAB minus surviving debt
    const mab = Math.max(0, Math.round(arv * 0.70 - computedRehab - carryingCosts - survivingDebt));
    const netSpread = Math.max(0, Math.round(arv - mab - computedRehab - carryingCosts - survivingDebt));
    const netMarginPct = Math.round((netSpread / (arv || 1)) * 100);

    // Component scores
    const equitySpreadScore = Math.min(100, Math.max(20, Math.round((netSpread / 150000) * 100)));
    const lienDeduction = Math.min(60, Math.round((survivingDebt / 40000) * 60));
    const titleLienRiskScore = Math.max(10, 100 - lienDeduction);
    const marketVelocityScore = Math.min(100, Math.max(30, sale.resaleDemandMeter.buyerLiquidityIndex || 85));
    const structuralAssetScore = Math.min(100, Math.max(40, 100 - (sale.openImagery.roofWearScore || 30)));

    // Weighted Overall Score
    const overallScore = Math.min(
      99,
      Math.max(
        35,
        Math.round(
          equitySpreadScore * 0.40 +
          titleLienRiskScore * 0.25 +
          marketVelocityScore * 0.20 +
          structuralAssetScore * 0.15
        )
      )
    );

    let grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' = 'B';
    let verdict = 'Viable wholesale spread with standard submarket margins.';

    if (overallScore >= 90) {
      grade = 'A+';
      verdict = 'Prime Institutional Acquisition: Exceptional spread with zero title cloud risk and high buyer liquidity.';
    } else if (overallScore >= 82) {
      grade = 'A';
      verdict = 'High-Conviction Flip: Strong equity margin, modest rehab requirements, and clear auction day bidding ceiling.';
    } else if (overallScore >= 74) {
      grade = 'B+';
      verdict = 'Solid Value-Add Play: Profitable submarket spread; verify municipal liens and tenant occupancy prior to gavel.';
    } else if (overallScore >= 65) {
      grade = 'B';
      verdict = 'Moderate Spread: Requires disciplined auction ceiling bidding. Do not exceed Maximum Allowable Bid.';
    } else if (overallScore >= 50) {
      grade = 'C';
      verdict = 'Narrow Margin / Elevated Risk: Surviving municipal debt or extensive deferred maintenance compresses upside.';
    } else {
      grade = 'D';
      verdict = 'High Risk / Speculative: Heavy senior debt exposure or severe title encumbrances.';
    }

    return {
      overallScore,
      grade,
      verdict,
      equitySpreadScore,
      titleLienRiskScore,
      marketVelocityScore,
      structuralAssetScore,
      modeledArv: arv,
      maxAllowableBid: mab,
      estimatedRehab: computedRehab,
      netMarginDollars: netSpread,
      netMarginPercent: netMarginPct,
      survivingSeniorLienTotal: survivingDebt,
      survivingLiensCount: sale.theCatch.seniorSurvivingLiens.length,
      occupancyConstraint: sale.theCatch.occupancyStatus.replace(/_/g, ' '),
      recommendedCeiling: Math.min(mab, sale.bidCard.ceilingBidHardStop || mab),
      dailyStatusNote: sale.dailyStatus.currentStatus.replace(/_/g, ' '),
    };
  }

  // Handle "Analyze" action
  function handleTriggerAnalysis(sale: SheriffGovSale) {
    requireUnderwritingAuth(() => {
      setAnalyzingSaleId(sale.id);
      setAnalyzedSale(sale);
      setIsAnalyzing(true);
      setAnalysisProgress(10);
      setIsDialogOpen(true);

      // Simulate multi-stage AI & open data analysis
      const timer1 = setTimeout(() => setAnalysisProgress(40), 200);
      const timer2 = setTimeout(() => setAnalysisProgress(75), 450);
      const timer3 = setTimeout(() => {
        setAnalysisProgress(100);
        setIsAnalyzing(false);
        setAnalysisResult(calculateUnderwritingScore(sale, rehabScopeTier));
      }, 700);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }, sale.caseNumber);
  }


  // Handle rehab change in modal
  function handleRehabScopeChange(tier: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'GUT') {
    setRehabScopeTier(tier);
    if (analyzedSale) {
      setAnalysisResult(calculateUnderwritingScore(analyzedSale, tier));
    }
  }

  // Filtered & Sorted sales
  const filteredSales = useMemo(() => {
    return sales
      .filter((sale) => {
        // County filter
        if (selectedCounty !== 'ALL' && sale.county !== selectedCounty) {
          return false;
        }

        // Asset Class filter
        if (selectedAssetClass !== 'ALL') {
          const saleAssetClass = getAssetClass(sale.parcel.propertyType);
          if (saleAssetClass !== selectedAssetClass) {
            return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesAddress = sale.parcel.address.toLowerCase().includes(q);
          const matchesCity = sale.parcel.city.toLowerCase().includes(q);
          const matchesCounty = sale.county.toLowerCase().includes(q);
          const matchesState = sale.parcel.state.toLowerCase().includes(q);
          const matchesZip = (sale.parcel.zip || '').toLowerCase().includes(q);
          const matchesCase = sale.caseNumber.toLowerCase().includes(q);
          const matchesSheriffNum = (sale.sheriffNumber || '').toLowerCase().includes(q);
          const matchesOwner = sale.entityResolution.trueBeneficialOwner.toLowerCase().includes(q);
          const matchesServicer = (sale.entityResolution.loanServicer || '').toLowerCase().includes(q);
          const matchesPlaintiff = (sale.legalProse.plaintiff || '').toLowerCase().includes(q);
          const matchesDefendant = (sale.legalProse.defendant || '').toLowerCase().includes(q);
          const matchesPropType = (sale.parcel.propertyType || '').toLowerCase().includes(q);
          const matchesAssetClass = getAssetClass(sale.parcel.propertyType).toLowerCase().includes(q);

          if (
            !matchesAddress &&
            !matchesCity &&
            !matchesCounty &&
            !matchesState &&
            !matchesZip &&
            !matchesCase &&
            !matchesSheriffNum &&
            !matchesOwner &&
            !matchesServicer &&
            !matchesPlaintiff &&
            !matchesDefendant &&
            !matchesPropType &&
            !matchesAssetClass
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        if (sortField === 'auctionDate') {
          valA = new Date(a.auctionDate).getTime();
          valB = new Date(b.auctionDate).getTime();
        } else if (sortField === 'openingBid') {
          valA = a.bidCard.openingBid;
          valB = b.bidCard.openingBid;
        } else if (sortField === 'score') {
          valA = a.flipScoreAndEndGame.flipScore;
          valB = b.flipScoreAndEndGame.flipScore;
        } else if (sortField === 'spread') {
          valA = a.compsAndMargin.netSpreadDollars;
          valB = b.compsAndMargin.netSpreadDollars;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [sales, selectedCounty, selectedAssetClass, searchQuery, sortField, sortDirection]);

  // Aggregate stats
  const totalDockets = sales.length;
  const totalSpread = sales.reduce((acc, s) => acc + s.compsAndMargin.netSpreadDollars, 0);
  const avgScore = Math.round(sales.reduce((acc, s) => acc + s.flipScoreAndEndGame.flipScore, 0) / (sales.length || 1));
  const activeCount = sales.filter((s) => s.dailyStatus.currentStatus === 'ACTIVE_SCHEDULED').length;

  const isFiltered = searchQuery.trim() !== '' || selectedCounty !== 'ALL' || selectedAssetClass !== 'ALL';
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCounty('ALL');
    setSelectedAssetClass('ALL');
  };

  return (
    <SheriffSalesErrorBoundary componentName="Sheriff Sales Dashboard" fallbackTitle="Dashboard Error">
      <div id="sheriff-sales-dashboard" className="space-y-6">
        {/* Header Metric Cards */}
        <SheriffSalesErrorBoundary componentName="Dashboard KPI Cards" fallbackTitle="Metrics Error">
          <div id="dashboard-metric-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Active Dockets */}
        <Card id="card-active-dockets" className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Upcoming Auctions
            </CardTitle>
            <Gavel className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {filteredSales.length}{' '}
              <span className="text-xs font-normal text-muted-foreground">/ {totalDockets} total</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {activeCount} confirmed active this cycle
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Average Score */}
        <Card id="card-avg-score" className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Avg Underwriting Score
            </CardTitle>
            <Flame className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {avgScore}
              <span className="text-xs font-normal text-muted-foreground"> / 100</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={avgScore} className="h-1.5 flex-1" />
              <span className="text-[11px] font-mono font-bold text-emerald-600">High Yield</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Pipeline Spread */}
        <Card id="card-total-spread" className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Pipeline Equity Spread
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">
              +${(totalSpread / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net profit potential after 70% rule rehab & carrying
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Senior Liens Protection */}
        <Card id="card-senior-protection" className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Assisted Lien Check
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              100%{' '}
              <span className="text-xs font-normal text-muted-foreground">Verified</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Municipal tax & water liens isolated to exact dollar
            </p>
          </CardContent>
        </Card>
      </div>
    </SheriffSalesErrorBoundary>

    {/* TOP SEARCH BAR & FILTER CONTROLS TOOLBAR AND MAIN TABLE */}
    <SheriffSalesErrorBoundary componentName="Sheriff Sales Table & Filters" fallbackTitle="Auctions Table Error">
      <Card id="sheriff-sales-filter-card" className="border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold tracking-tight">
                Search & Filter Auction Dataset
              </CardTitle>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              Showing <strong className="text-foreground font-semibold">{filteredSales.length}</strong> of{' '}
              {totalDockets} dockets
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 pt-0 space-y-3.5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
            {/* Dedicated Address & Keyword Search Component */}
            <div className="flex-1 w-full">
              <SheriffSalesSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by property address, municipality, docket #, borrower, or asset class…"
                totalMatches={filteredSales.length}
                totalCount={totalDockets}
                suggestions={recentAddressSuggestions}
                onSelectSuggestion={(addr) => setSearchQuery(addr)}
              />
            </div>

            {/* Filter Dropdowns Row */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
              {/* County Filter Dropdown */}
              <div className="w-full sm:w-auto">
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger
                    id="county-filter-trigger"
                    className="w-full sm:w-[200px] h-10 text-xs font-mono bg-background"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <SelectValue placeholder="All Counties" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs font-mono">
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="truncate">{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground ml-2 px-1.5 py-0.5 rounded bg-muted">
                            {opt.count}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Asset Class Filter Dropdown */}
              <div className="w-full sm:w-auto">
                <Select value={selectedAssetClass} onValueChange={setSelectedAssetClass}>
                  <SelectTrigger
                    id="asset-class-filter-trigger"
                    className="w-full sm:w-[200px] h-10 text-xs font-mono bg-background"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <SelectValue placeholder="All Asset Classes" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {assetClassOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs font-mono">
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="truncate">{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground ml-2 px-1.5 py-0.5 rounded bg-muted">
                            {opt.count}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters Button */}
              {isFiltered && (
                <Button
                  id="dashboard-reset-filters-btn"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-10 px-3 text-xs font-mono text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Active Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40 text-xs">
            <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold mr-1">
              Active Filters:
            </span>

            {selectedCounty !== 'ALL' && (
              <Badge
                variant="secondary"
                className="font-mono text-[11px] pl-2 pr-1 py-0.5 flex items-center gap-1 bg-primary/10 text-primary border-primary/20"
              >
                <span>County: {selectedCounty}</span>
                <Button
                  type="button"
                  onClick={() => setSelectedCounty('ALL')}
                  className="hover:text-destructive rounded-full p-0.5 cursor-pointer"
                  title="Remove county filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {selectedAssetClass !== 'ALL' && (
              <Badge
                variant="secondary"
                className="font-mono text-[11px] pl-2 pr-1 py-0.5 flex items-center gap-1 bg-primary/10 text-primary border-primary/20"
              >
                <span>Asset: {selectedAssetClass}</span>
                <Button
                  type="button"
                  onClick={() => setSelectedAssetClass('ALL')}
                  className="hover:text-destructive rounded-full p-0.5 cursor-pointer"
                  title="Remove asset class filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {searchQuery.trim() !== '' && (
              <Badge
                variant="secondary"
                className="font-mono text-[11px] pl-2 pr-1 py-0.5 flex items-center gap-1 bg-amber-50 text-amber-800 border-amber-200"
              >
                <span>Query: "{searchQuery.trim()}"</span>
                <Button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-destructive rounded-full p-0.5 cursor-pointer"
                  title="Clear search query"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {!isFiltered && (
              <span className="text-[11px] text-muted-foreground italic font-mono">
                No active filters applied (displaying full dataset)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card id="sheriff-sales-table-card" className="border-border/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[11px] font-bold bg-primary/10 text-primary border-primary/20">
              LIVE AUCTION BOARD
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">Verified August 2026 Legal Notices</span>
          </div>
          <CardTitle className="text-lg font-bold tracking-tight mt-1">
            Upcoming Sheriff & Foreclosure Auctions
          </CardTitle>
          <CardDescription className="text-xs">
            Review scheduled judicial sales, evaluate opening bids and judgment dockets, and click{' '}
            <strong className="text-foreground">Analyze</strong> to compute the instant AI underwriting score.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-md border-t border-border/60 overflow-x-auto">
            <Table id="auctions-table">
              <TableHeader className="bg-muted/40 font-mono text-xs">
                <TableRow>
                  <TableHead className="w-[280px]">Property Address & Docket</TableHead>
                  <TableHead className="w-[140px] cursor-pointer" onClick={() => {
                    if (sortField === 'auctionDate') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('auctionDate');
                      setSortDirection('asc');
                    }
                  }}>
                    <div className="flex items-center gap-1">
                      <span>Sale Date</span>
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[140px]">Opening Bid / Deposit</TableHead>
                  <TableHead className="w-[150px]">Judgment / ARV</TableHead>
                  <TableHead className="w-[130px] cursor-pointer" onClick={() => {
                    if (sortField === 'score') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('score');
                      setSortDirection('desc');
                    }
                  }}>
                    <div className="flex items-center gap-1">
                      <span>Flip Score</span>
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[130px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                      No sheriff sales match your active search or filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow
                      key={sale.id}
                      id={`auction-row-${sale.id}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Property Address & Docket */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm font-sans">
                            {sale.parcel.address}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-secondary text-secondary-foreground border border-border/50">
                            {getAssetClass(sale.parcel.propertyType)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-sans mt-0.5">
                          {sale.parcel.city}, {sale.parcel.state} {sale.parcel.zip} • {sale.county}
                        </div>
                        <div className="text-[11px] font-mono text-primary font-medium mt-0.5">
                          Docket: {sale.caseNumber} {sale.sheriffNumber && `• Shf #${sale.sheriffNumber}`}
                        </div>
                      </TableCell>

                      {/* Sale Date & Time */}
                      <TableCell className="py-3.5 font-mono text-xs">
                        <div className="font-bold text-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{sale.auctionDate}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {sale.auctionTime || '2:00 PM EST'}
                        </div>
                      </TableCell>

                      {/* Opening Bid & Deposit */}
                      <TableCell className="py-3.5 font-mono text-xs">
                        <div className="font-bold text-foreground">
                          ${sale.bidCard.openingBid.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-amber-600 font-medium">
                          Dep: ${sale.bidCard.requiredDepositDollars.toLocaleString()} ({sale.bidCard.requiredDepositPercent}%)
                        </div>
                      </TableCell>

                      {/* Judgment / Modeled ARV */}
                      <TableCell className="py-3.5 font-mono text-xs">
                        <div className="font-bold text-foreground">
                          ARV: ${sale.aiWorkforce.dealUnderwriter.modeledArv.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Judg: ${sale.legalProse.finalJudgmentAmount.toLocaleString()}
                        </div>
                      </TableCell>

                      {/* Flip Score Badge */}
                      <TableCell className="py-3.5 font-mono">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`font-mono text-xs font-bold ${
                              sale.flipScoreAndEndGame.flipScore >= 85
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : sale.flipScoreAndEndGame.flipScore >= 75
                                ? 'bg-primary/10 text-primary border-blue-300'
                                : 'bg-muted text-secondary-foreground border-slate-300'
                            }`}
                          >
                            <TrendingUp className="h-3 w-3 mr-1 inline" />
                            {sale.flipScoreAndEndGame.flipScore}/100
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] font-semibold tracking-tight uppercase"
                        >
                          {sale.dailyStatus.currentStatus === 'ACTIVE_SCHEDULED' ? 'Scheduled' : sale.dailyStatus.currentStatus.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>

                      {/* Analyze Button */}
                      <TableCell className="py-3.5 text-right">
                        <Button
                          id={`analyze-sale-btn-${sale.id}`}
                          size="sm"
                          variant="default"
                          onClick={() => handleTriggerAnalysis(sale)}
                          className="h-8 px-3 text-xs font-mono font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Analyze</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between py-3 px-6 bg-muted/20 border-t border-border/60 text-xs text-muted-foreground font-mono">
          <div>
            Showing <strong>{filteredSales.length}</strong> of <strong>{sales.length}</strong> judicial dockets
          </div>
          <div className="flex items-center gap-4">
            <span>Pre-Auction Self-Calibrating Model</span>
            <span className="text-primary font-bold">NJ Chancery Court & PA CP Rules</span>
          </div>
        </CardFooter>
      </Card>
    </SheriffSalesErrorBoundary>

    {/* UNDERWRITING SCORE ANALYSIS MODAL (SHADCN DIALOG) */}
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <SheriffSalesErrorBoundary componentName="Underwriting Modal Analysis" fallbackTitle="Underwriting Calculation Failed">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                INSTANT UNDERWRITING REPORT
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Docket: {analyzedSale?.caseNumber}
              </span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight mt-1 text-foreground">
              {analyzedSale?.parcel.address}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {analyzedSale?.parcel.city}, {analyzedSale?.parcel.state} {analyzedSale?.parcel.zip} • {analyzedSale?.county}
            </DialogDescription>
          </DialogHeader>

          {isAnalyzing ? (
            <div className="py-12 space-y-4 text-center">
              <Sparkles className="h-10 w-10 text-primary animate-bounce mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground font-mono">
                  Synthesizing Open Cadastre & Legal Notice…
                </h4>
                <p className="text-xs text-muted-foreground">
                  Evaluating surviving municipal liens, NAIP aerial wear, and 70% Maximum Allowable Bid ceiling.
                </p>
              </div>
              <div className="max-w-xs mx-auto pt-2">
                <Progress value={analysisProgress} className="h-2" />
              </div>
            </div>
          ) : analysisResult && analyzedSale ? (
            <div className="space-y-6">
              {/* Score Banner Hero */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-muted/30 to-primary/10 border border-primary/20">
                {/* Score Dial */}
                <div className="flex flex-col justify-center items-center md:items-start space-y-1">
                  <span className="text-xs font-mono font-bold uppercase text-muted-foreground">
                    Underwriting Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black font-mono text-foreground tracking-tight">
                      {analysisResult.overallScore}
                    </span>
                    <span className="text-sm font-bold font-mono text-muted-foreground">/ 100</span>
                    <Badge className="bg-emerald-600 text-white font-mono font-bold text-xs ml-1">
                      {analysisResult.grade}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-primary font-semibold">
                    {analysisResult.grade === 'A+' || analysisResult.grade === 'A'
                      ? 'Prime Target'
                      : 'Viable Acquisition'}
                  </span>
                </div>

                {/* Maximum Allowable Bid (MAB) */}
                <div className="p-3 bg-background/80 border border-border/80 rounded-xl space-y-1">
                  <span className="text-[11px] font-mono uppercase text-muted-foreground block font-semibold">
                    Max Allowable Bid (MAB)
                  </span>
                  <div className="text-xl font-bold font-mono text-primary">
                    ${analysisResult.maxAllowableBid.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    70% Rule Hard Ceiling (Includes ${analysisResult.estimatedRehab.toLocaleString()} Rehab)
                  </span>
                </div>

                {/* Net Equity Spread */}
                <div className="p-3 bg-background/80 border border-border/80 rounded-xl space-y-1">
                  <span className="text-[11px] font-mono uppercase text-muted-foreground block font-semibold">
                    Modeled Net Margin
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-600">
                    +${analysisResult.netMarginDollars.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    {analysisResult.netMarginPercent}% Projected Submarket Yield
                  </span>
                </div>
              </div>

              {/* AI Underwriting Verdict */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground font-mono">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>AI Underwriter Summary & Investment Thesis</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {analysisResult.verdict}
                </p>
              </div>

              {/* Tabs: Breakdown & Financials */}
              <Tabs defaultValue="breakdown" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9 text-xs font-mono">
                  <TabsTrigger value="breakdown">Score Pillars</TabsTrigger>
                  <TabsTrigger value="waterfall">Lien & Debt Waterfall</TabsTrigger>
                  <TabsTrigger value="rehab">Rehab Simulator</TabsTrigger>
                </TabsList>

                {/* TAB 1: SCORE PILLARS */}
                <TabsContent value="breakdown" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Equity Spread Potential</span>
                        <span className="font-mono font-bold text-emerald-600">{analysisResult.equitySpreadScore}/100</span>
                      </div>
                      <Progress value={analysisResult.equitySpreadScore} className="h-1.5" />
                      <p className="text-[11px] text-muted-foreground">Modeled ARV (${analysisResult.modeledArv.toLocaleString()}) vs MAB</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Title & Surviving Lien Risk</span>
                        <span className="font-mono font-bold text-primary">{analysisResult.titleLienRiskScore}/100</span>
                      </div>
                      <Progress value={analysisResult.titleLienRiskScore} className="h-1.5" />
                      <p className="text-[11px] text-muted-foreground">
                        {analysisResult.survivingLiensCount === 0
                          ? 'Zero surviving prior liens detected'
                          : `$${analysisResult.survivingSeniorLienTotal.toLocaleString()} surviving debt`}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Market Liquidity & Velocity</span>
                        <span className="font-mono font-bold text-indigo-600">{analysisResult.marketVelocityScore}/100</span>
                      </div>
                      <Progress value={analysisResult.marketVelocityScore} className="h-1.5" />
                      <p className="text-[11px] text-muted-foreground">Submarket buyer liquidity index</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Structural Asset Integrity</span>
                        <span className="font-mono font-bold text-amber-600">{analysisResult.structuralAssetScore}/100</span>
                      </div>
                      <Progress value={analysisResult.structuralAssetScore} className="h-1.5" />
                      <p className="text-[11px] text-muted-foreground">NAIP 0.6m multi-spectral aerial ortho wear score</p>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 2: LIEN WATERFALL */}
                <TabsContent value="waterfall" className="space-y-3 pt-4">
                  <div className="border border-border/80 rounded-xl overflow-hidden">
                    <Table className="text-xs">
                      <TableHeader className="bg-muted/40 font-mono text-[11px]">
                        <TableRow>
                          <TableHead>Pos</TableHead>
                          <TableHead>Lienholder</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Statutory Outcome</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-mono">
                        {analyzedSale.assistedLienCheck.waterfall.map((lien) => (
                          <TableRow key={lien.position} className={lien.survivesSale ? 'bg-destructive/5' : ''}>
                            <TableCell className="font-bold">#{lien.position}</TableCell>
                            <TableCell className="font-sans font-semibold text-foreground">{lien.lienHolder}</TableCell>
                            <TableCell className="text-muted-foreground">{lien.lienType.replace(/_/g, ' ')}</TableCell>
                            <TableCell className="font-bold">${lien.currentBalance.toLocaleString()}</TableCell>
                            <TableCell>
                              {lien.survivesSale ? (
                                <Badge variant="destructive" className="text-[10px] font-mono">
                                  SURVIVES SALE
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                                  EXTINGUISHED
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="p-3 bg-muted/30 border border-border/80 rounded-xl flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Total Surviving Debt Obligation:</span>
                    <span className="font-bold text-destructive">
                      ${analysisResult.survivingSeniorLienTotal.toLocaleString()}
                    </span>
                  </div>
                </TabsContent>

                {/* TAB 3: REHAB SIMULATOR */}
                <TabsContent value="rehab" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-muted-foreground font-semibold block">
                      Select Modeled Rehab Scope:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                      {(['LIGHT', 'MEDIUM', 'HEAVY', 'GUT'] as const).map((tier) => (
                        <Button
                          key={tier}
                          type="button"
                          onClick={() => handleRehabScopeChange(tier)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            rehabScopeTier === tier
                              ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                              : 'bg-card border-border hover:bg-muted/50 text-foreground'
                          }`}
                        >
                          <div className="font-bold">{tier}</div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            {tier === 'LIGHT' ? 'Cosmetic ($35k)' : tier === 'MEDIUM' ? 'Standard ($45k)' : tier === 'HEAVY' ? 'Major ($60k)' : 'Full Gut ($80k)'}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-muted/20 border border-border/80 rounded-xl font-mono text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Rehab Allocation</span>
                      <span className="font-bold text-foreground text-sm">
                        ${analysisResult.estimatedRehab.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Revised Max Bid (MAB)</span>
                      <span className="font-bold text-primary text-sm">
                        ${analysisResult.maxAllowableBid.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Revised Net Spread</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        +${analysisResult.netMarginDollars.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}

          <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border/60 pt-4">
            <div className="text-xs font-mono text-muted-foreground">
              {analyzedSale && (
                <span>Auction Date: <strong>{analyzedSale.auctionDate}</strong></span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onSelectSale && analyzedSale && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDialogOpen(false);
                    onSelectSale(analyzedSale);
                  }}
                  className="text-xs font-mono cursor-pointer"
                >
                  Open Full Dossier
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs font-mono cursor-pointer"
              >
                Close Report
              </Button>
            </div>
          </DialogFooter>
        </SheriffSalesErrorBoundary>
      </DialogContent>
    </Dialog>

    {/* FIREBASE AUTH UNDERWRITING GATE MODAL */}
    {UnderwritingGateModal}
  </div>
</SheriffSalesErrorBoundary>

  );
}
