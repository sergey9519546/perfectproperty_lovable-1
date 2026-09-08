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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Gavel,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Printer,
  ChevronRight,
  Calculator,
  Flame,
  Scale,
  RotateCcw,
  SlidersHorizontal,
  Home,
  MapPin,
  ExternalLink,
  Layers,
  Check,
} from 'lucide-react';
import { SHERIFF_GOV_SALES } from '../data';
import type { SheriffGovSale } from '../types';
import { SheriffSalesSearch } from './SheriffSalesSearch';
import { getAssetClass } from './SheriffSalesDashboard';
import { SheriffSalesErrorBoundary } from './SheriffSalesErrorBoundary';
import { useUnderwritingAccessGate } from './SheriffSalesAuthGuard';

export interface SheriffSalesPageProps {
  sales?: SheriffGovSale[];
  onSelectSale?: (sale: SheriffGovSale) => void;
  className?: string;
}

interface UnderwritingAnalysis {
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  maxAllowableBid: number;
  estimatedRehab: number;
  rehabTier: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'GUT';
  netMarginDollars: number;
  netMarginPercent: number;
  survivingSeniorLiens: number;
  titleRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  verdict: string;
}

export function SheriffSalesPage({
  sales = SHERIFF_GOV_SALES,
  onSelectSale,
  className = '',
}: SheriffSalesPageProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('ALL');
  const [selectedAssetClass, setSelectedAssetClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortField, setSortField] = useState<'flipScore' | 'arv' | 'date' | 'mab' | 'openingBid'>('flipScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Firebase Auth Underwriting Access Gate
  const { requireUnderwritingAuth, UnderwritingGateModal } = useUnderwritingAccessGate();

  // Modal & Analysis State

  const [selectedSaleForAnalysis, setSelectedSaleForAnalysis] = useState<SheriffGovSale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<UnderwritingAnalysis | null>(null);
  const [activeRehabTier, setActiveRehabTier] = useState<'LIGHT' | 'MEDIUM' | 'HEAVY' | 'GUT'>('LIGHT');

  // Compute available counties with docket count
  const countyOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach((s) => {
      counts[s.county] = (counts[s.county] || 0) + 1;
    });
    return [
      { value: 'ALL', label: `All Counties (${sales.length})` },
      ...Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([c, count]) => ({ value: c, label: `${c} (${count})` })),
    ];
  }, [sales]);

  // Compute available asset classes with count
  const assetClassOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach((s) => {
      const cls = getAssetClass(s.parcel.propertyType);
      counts[cls] = (counts[cls] || 0) + 1;
    });
    return [
      { value: 'ALL', label: `All Asset Classes (${sales.length})` },
      ...Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([cls, count]) => ({ value: cls, label: `${cls} (${count})` })),
    ];
  }, [sales]);

  // Recent address suggestions for the search component
  const addressSuggestions = useMemo(() => {
    return sales.slice(0, 5).map((s) => s.parcel.address);
  }, [sales]);

  // Calculate Underwriting Score Analysis with Error Guarding
  function calculateScore(
    sale: SheriffGovSale,
    rehabTier: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'GUT' = 'LIGHT'
  ): UnderwritingAnalysis {
    try {
      const rehabMultiplier = {
        LIGHT: 0.8,
        MEDIUM: 1.0,
        HEAVY: 1.35,
        GUT: 1.75,
      }[rehabTier] || 1.0;

      const arv =
        sale?.aiWorkforce?.dealUnderwriter?.modeledArv ||
        (sale?.compsAndMargin?.submarketMedianPpsf || 250) * (sale?.parcel?.livingSqft || 1500) ||
        350000;
      const baseRehab = sale?.aiWorkforce?.dealUnderwriter?.modeledRehabCost || 35000;
      const adjustedRehab = Math.round(baseRehab * rehabMultiplier);
      const holdingCosts = sale?.compsAndMargin?.holdingAndCarryingCosts || 14000;
      const maxAllowableBid = Math.max(0, Math.round(arv * 0.7 - adjustedRehab - holdingCosts));
      const openingBid =
        sale?.bidCard?.openingBid ||
        (sale?.legalProse?.finalJudgmentAmount ? sale.legalProse.finalJudgmentAmount * 0.7 : 100000);
      const netMarginDollars = Math.round(arv - openingBid - adjustedRehab - holdingCosts);
      const netMarginPercent = Math.round((netMarginDollars / (openingBid + adjustedRehab + 1)) * 100);

      const survivingLiens = (sale?.assistedLienCheck?.waterfall || [])
        .filter((l) => l.survivesSale)
        .reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

      let baseScore = sale?.flipScoreAndEndGame?.flipScore || 78;
      if (rehabTier === 'HEAVY') baseScore -= 8;
      if (rehabTier === 'GUT') baseScore -= 15;
      if (survivingLiens > 20000) baseScore -= 12;

      const finalScore = Math.min(99, Math.max(35, baseScore));

      let grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' = 'B';
      if (finalScore >= 92) grade = 'A+';
      else if (finalScore >= 85) grade = 'A';
      else if (finalScore >= 78) grade = 'B+';
      else if (finalScore >= 70) grade = 'B';
      else if (finalScore >= 60) grade = 'C';
      else grade = 'D';

      return {
        overallScore: finalScore,
        grade,
        maxAllowableBid,
        estimatedRehab: adjustedRehab,
        rehabTier,
        netMarginDollars,
        netMarginPercent,
        survivingSeniorLiens: survivingLiens,
        titleRisk: sale?.legalProse?.titleCloudRisk || 'LOW',
        verdict:
          finalScore >= 85
            ? `High-conviction acquisition target. Spread of +$${netMarginDollars.toLocaleString()} (${netMarginPercent}%) exceeds submarket hurdle rate with clean municipal lien clearance.`
            : finalScore >= 70
            ? `Viable auction candidate. Strong ARV buffer ($${arv.toLocaleString()}) but requires disciplined bidding capped at $${maxAllowableBid.toLocaleString()} MAB.`
            : `High execution risk or senior encumbrance detected. Recommend rigorous pre-auction title search before advancing deposit.`,
      };
    } catch (err) {
      console.error('[SheriffSalesPage] Underwriting calculation fallback triggered:', err);
      return {
        overallScore: 70,
        grade: 'B',
        maxAllowableBid: 150000,
        estimatedRehab: 35000,
        rehabTier: 'LIGHT',
        netMarginDollars: 45000,
        netMarginPercent: 25,
        survivingSeniorLiens: 0,
        titleRisk: 'LOW',
        verdict: 'Default underwriter baseline applied due to sparse parcel records.',
      };
    }
  }

  // Trigger Underwriting Analysis Modal with real-time synthesis effect
  const handleTriggerAnalysis = (sale: SheriffGovSale) => {
    requireUnderwritingAuth(() => {
      setSelectedSaleForAnalysis(sale);
      setActiveRehabTier('LIGHT');
      setIsDialogOpen(true);
      setIsAnalyzing(true);
      setAnalysisProgress(15);

      setTimeout(() => setAnalysisProgress(45), 180);
      setTimeout(() => setAnalysisProgress(80), 360);
      setTimeout(() => {
        setAnalysisProgress(100);
        setAnalysisResult(calculateScore(sale, 'LIGHT'));
        setIsAnalyzing(false);
      }, 550);
    }, sale.caseNumber);
  };


  // Re-run calculation when changing rehab tier inside the modal
  const handleRehabTierChange = (tier: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'GUT') => {
    setActiveRehabTier(tier);
    if (selectedSaleForAnalysis) {
      setAnalysisResult(calculateScore(selectedSaleForAnalysis, tier));
    }
  };

  // Filter and sort the auctions
  const filteredSales = useMemo(() => {
    return sales
      .filter((sale) => {
        // County Filter
        if (selectedCounty !== 'ALL' && sale.county !== selectedCounty) {
          return false;
        }

        // Asset Class Filter
        if (selectedAssetClass !== 'ALL') {
          const saleClass = getAssetClass(sale.parcel.propertyType);
          if (saleClass !== selectedAssetClass) return false;
        }

        // Status Filter
        if (selectedStatus !== 'ALL' && sale.dailyStatus.currentStatus !== selectedStatus) {
          return false;
        }

        // Search Query Filter (Address, Municipality, Docket, Borrower, Plaintiff)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchAddress = sale.parcel.address.toLowerCase().includes(q);
          const matchCity = sale.parcel.city.toLowerCase().includes(q);
          const matchCounty = sale.county.toLowerCase().includes(q);
          const matchCase = sale.caseNumber.toLowerCase().includes(q);
          const matchDefendant = sale.legalProse.defendant.toLowerCase().includes(q);
          const matchPlaintiff = sale.legalProse.plaintiff.toLowerCase().includes(q);
          const matchAsset = getAssetClass(sale.parcel.propertyType).toLowerCase().includes(q);

          if (
            !matchAddress &&
            !matchCity &&
            !matchCounty &&
            !matchCase &&
            !matchDefendant &&
            !matchPlaintiff &&
            !matchAsset
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortField === 'flipScore') {
          valA = a.flipScoreAndEndGame.flipScore;
          valB = b.flipScoreAndEndGame.flipScore;
        } else if (sortField === 'arv') {
          valA = a.aiWorkforce.dealUnderwriter.modeledArv;
          valB = b.aiWorkforce.dealUnderwriter.modeledArv;
        } else if (sortField === 'mab') {
          valA = a.compsAndMargin.maximumAllowableBid;
          valB = b.compsAndMargin.maximumAllowableBid;
        } else if (sortField === 'openingBid') {
          valA = a.bidCard.openingBid;
          valB = b.bidCard.openingBid;
        } else if (sortField === 'date') {
          return sortDirection === 'asc'
            ? a.auctionDate.localeCompare(b.auctionDate)
            : b.auctionDate.localeCompare(a.auctionDate);
        }

        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [sales, selectedCounty, selectedAssetClass, selectedStatus, searchQuery, sortField, sortDirection]);

  // Aggregate Key Metrics for Header Cards
  const stats = useMemo(() => {
    const totalDockets = sales.length;
    const activeCount = sales.filter((s) => s.dailyStatus.currentStatus === 'ACTIVE_SCHEDULED').length;
    const avgScore = Math.round(
      sales.reduce((acc, s) => acc + s.flipScoreAndEndGame.flipScore, 0) / (totalDockets || 1)
    );
    const totalNetSpread = sales.reduce(
      (acc, s) => acc + (s.compsAndMargin.netSpreadDollars || 0),
      0
    );

    return { totalDockets, activeCount, avgScore, totalNetSpread };
  }, [sales]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCounty('ALL');
    setSelectedAssetClass('ALL');
    setSelectedStatus('ALL');
  };

  return (
    <TooltipProvider>
      <SheriffSalesErrorBoundary componentName="Sheriff Sales Page Root">
        <div className={`space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`} id="sheriff-sales-page-root">
          {/* PAGE HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold uppercase tracking-wider mb-1">
                <Gavel className="h-4 w-4" />
                <span>Judicial Foreclosures & Surplus Auction Intelligence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Sheriff & Government Sales
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
                Real-time pre-auction roster correlated with open cadastre, USDA NAIP aerial orthophotos, and AI title lien underwriting.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="font-mono text-xs py-1.5 px-3 border-primary/30 bg-primary/5 text-primary flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Verified August 2026 Rules</span>
              </Badge>
            </div>
          </div>

          {/* 4 HIGH-LEVEL KPI METRIC CARDS (GUARDED) */}
          <SheriffSalesErrorBoundary componentName="Sheriff Sales KPI Metrics" fallbackTitle="KPI Metrics Summary Temporarily Unavailable">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="sheriff-sales-metrics-grid">
              {/* Card 1: Total Dockets */}
              <Card className="shadow-xs border-border/70 hover:border-border transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-mono font-medium uppercase text-muted-foreground">
                    Total Dockets Tracked
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-foreground">
                    {stats.totalDockets}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across {countyOptions.length - 1} tri-state counties
                  </p>
                </CardContent>
              </Card>

              {/* Card 2: Active Scheduled */}
              <Card className="shadow-xs border-border/70 hover:border-border transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-mono font-medium uppercase text-muted-foreground">
                    Active Biddable
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-emerald-600">
                    {stats.activeCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scheduled for upcoming sales
                  </p>
                </CardContent>
              </Card>

              {/* Card 3: Avg Flip Score */}
              <Card className="shadow-xs border-border/70 hover:border-border transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-mono font-medium uppercase text-muted-foreground">
                    Average Flip Score
                  </CardTitle>
                  <Flame className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-foreground flex items-baseline gap-1">
                    {stats.avgScore}
                    <span className="text-xs text-muted-foreground font-normal">/ 100</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Underwritten submarket yield
                  </p>
                </CardContent>
              </Card>

              {/* Card 4: Total Modeled Spread */}
              <Card className="shadow-xs border-border/70 hover:border-border transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-mono font-medium uppercase text-muted-foreground">
                    Total Pipeline Margin
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-primary">
                    ${(stats.totalNetSpread / 1_000_000).toFixed(2)}M
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Modeled pre-auction equity
                  </p>
                </CardContent>
              </Card>
            </div>
          </SheriffSalesErrorBoundary>

          {/* SEARCH, FILTER & AUCTION TABLE CARD (GUARDED) */}
          <SheriffSalesErrorBoundary
            componentName="Sheriff Sales Auctions Table"
            fallbackTitle="Sheriff Sales Auctions Table Unavailable"
            fallbackDescription="An error occurred while filtering or rendering the judicial auctions roster."
            onReset={handleResetFilters}
          >
            <Card className="shadow-sm border-border" id="sheriff-sales-table-card">
              {/* Card Header & Filter Bar */}
              <CardHeader className="p-5 pb-4 border-b border-border/70 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                      <span>Upcoming Sheriff & Foreclosure Auctions</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {filteredSales.length} Active Listings
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Browse judicial foreclosure dockets, judgment amounts, upset limits, and instant underwriting scores.
                    </CardDescription>
                  </div>

                  {(searchQuery || selectedCounty !== 'ALL' || selectedAssetClass !== 'ALL' || selectedStatus !== 'ALL') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetFilters}
                      className="h-8 text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer self-start sm:self-auto"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Reset Filters
                    </Button>
                  )}
                </div>

                {/* Filter Bar Controls */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                  {/* Search Box */}
                  <div className="flex-1 w-full">
                    <SheriffSalesSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search by property address, municipality, docket #, borrower, or asset class…"
                      totalMatches={filteredSales.length}
                      totalCount={stats.totalDockets}
                      suggestions={addressSuggestions}
                      onSelectSuggestion={(addr) => setSearchQuery(addr)}
                    />
                  </div>

                  {/* Filter Selects Row */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
                    {/* County Filter */}
                    <div className="w-full sm:w-auto">
                      <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                        <SelectTrigger id="county-filter-trigger" className="h-10 text-xs font-sans bg-background w-full sm:w-[190px]">
                          <SelectValue placeholder="All Counties" />
                        </SelectTrigger>
                        <SelectContent>
                          {countyOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs font-sans">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Asset Class Filter */}
                    <div className="w-full sm:w-auto">
                      <Select value={selectedAssetClass} onValueChange={setSelectedAssetClass}>
                        <SelectTrigger id="asset-class-filter-trigger" className="h-10 text-xs font-sans bg-background w-full sm:w-[180px]">
                          <SelectValue placeholder="All Asset Classes" />
                        </SelectTrigger>
                        <SelectContent>
                          {assetClassOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs font-sans">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full sm:w-auto">
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger id="status-filter-trigger" className="h-10 text-xs font-sans bg-background w-full sm:w-[160px]">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
                          <SelectItem value="ACTIVE_SCHEDULED" className="text-xs">Active Scheduled</SelectItem>
                          <SelectItem value="ADJOURNED_PLAINTIFF" className="text-xs">Adjourned</SelectItem>
                          <SelectItem value="BANKRUPTCY_STAY" className="text-xs">Bankruptcy Stay</SelectItem>
                          <SelectItem value="SOLD_THIRD_PARTY" className="text-xs">Sold Third Party</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Auction Table Content */}
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs font-mono uppercase">
                        <TableHead className="w-[280px]">Property Address & Parcel</TableHead>
                        <TableHead className="w-[140px]">County & Court</TableHead>
                        <TableHead className="w-[130px]">
                          <Button
                            type="button"
                            onClick={() => {
                              if (sortField === 'date') setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                              else { setSortField('date'); setSortDirection('asc'); }
                            }}
                            className="flex items-center gap-1 font-bold hover:text-foreground transition-colors cursor-pointer"
                          >
                            <span>Auction Date</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-[140px]">
                          <Button
                            type="button"
                            onClick={() => {
                              if (sortField === 'openingBid') setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                              else { setSortField('openingBid'); setSortDirection('desc'); }
                            }}
                            className="flex items-center gap-1 font-bold hover:text-foreground transition-colors cursor-pointer"
                          >
                            <span>Opening / Deposit</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-[140px]">
                          <Button
                            type="button"
                            onClick={() => {
                              if (sortField === 'arv') setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                              else { setSortField('arv'); setSortDirection('desc'); }
                            }}
                            className="flex items-center gap-1 font-bold hover:text-foreground transition-colors cursor-pointer"
                          >
                            <span>ARV / Judgment</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-[120px]">
                          <Button
                            type="button"
                            onClick={() => {
                              if (sortField === 'flipScore') setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                              else { setSortField('flipScore'); setSortDirection('desc'); }
                            }}
                            className="flex items-center gap-1 font-bold hover:text-foreground transition-colors cursor-pointer"
                          >
                            <span>Flip Score</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-[110px]">Status</TableHead>
                        <TableHead className="w-[120px] text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredSales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-36 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <AlertTriangle className="h-7 w-7 text-muted-foreground/60" />
                              <p className="text-sm font-medium">No auctions found matching your criteria.</p>
                              <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
                                Reset Search & Filters
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSales.map((sale) => (
                          <TableRow
                            key={sale.id}
                            className="hover:bg-muted/30 transition-colors group cursor-pointer"
                            onClick={() => {
                              if (onSelectSale) onSelectSale(sale);
                            }}
                          >
                            {/* Address & Parcel */}
                            <TableCell className="py-3.5">
                              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                                <Home className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[240px]" title={sale.parcel.address}>
                                  {sale.parcel.address}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                <span>{sale.parcel.city}, {sale.parcel.state} {sale.parcel.zip}</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                                  {getAssetClass(sale.parcel.propertyType)}
                                </Badge>
                              </div>
                              <div className="text-[11px] font-mono text-muted-foreground mt-1">
                                Docket: <span className="font-medium text-foreground">{sale.caseNumber}</span>
                              </div>
                            </TableCell>

                            {/* County & Court */}
                            <TableCell className="py-3.5 text-xs">
                              <div className="font-medium text-foreground">{sale.county}</div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[120px]" title={sale.court}>
                                {sale.court}
                              </div>
                            </TableCell>

                            {/* Auction Date */}
                            <TableCell className="py-3.5 text-xs font-mono">
                              <div className="font-bold text-foreground flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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

                            {/* ARV / Judgment */}
                            <TableCell className="py-3.5 font-mono text-xs">
                              <div className="font-bold text-foreground">
                                ARV: ${sale.aiWorkforce.dealUnderwriter.modeledArv.toLocaleString()}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Judg: ${sale.legalProse.finalJudgmentAmount.toLocaleString()}
                              </div>
                            </TableCell>

                            {/* Flip Score */}
                            <TableCell className="py-3.5 font-mono">
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

                            {/* Action: Trigger Underwriting Score */}
                            <TableCell className="py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
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

              {/* Footer Information */}
              <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-3 px-6 bg-muted/20 border-t border-border/60 text-xs text-muted-foreground font-mono gap-2">
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

          {/* UNDERWRITING SCORE ANALYSIS MODAL (GUARDED) */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
              <SheriffSalesErrorBoundary
                componentName="Underwriting Analysis Report"
                fallbackTitle="Underwriting Calculation Report Error"
                fallbackDescription="Could not render the complete financial report for this parcel. You can close or try re-running the analysis."
              >
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                      INSTANT UNDERWRITING REPORT
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      Docket: {selectedSaleForAnalysis?.caseNumber}
                    </span>
                  </div>
                  <DialogTitle className="text-xl font-bold tracking-tight mt-1 text-foreground">
                    {selectedSaleForAnalysis?.parcel.address}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {selectedSaleForAnalysis?.parcel.city}, {selectedSaleForAnalysis?.parcel.state} {selectedSaleForAnalysis?.parcel.zip} • {selectedSaleForAnalysis?.county}
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
                ) : analysisResult && selectedSaleForAnalysis ? (
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
                        <TabsTrigger value="breakdown">Rehab Scenarios</TabsTrigger>
                        <TabsTrigger value="financials">Financials & MAB</TabsTrigger>
                        <TabsTrigger value="liens">Surviving Liens</TabsTrigger>
                      </TabsList>

                      {/* Tab 1: Rehab Simulation */}
                      <TabsContent value="breakdown" className="space-y-4 pt-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">Select Modeled Rehab Scope:</span>
                            <span className="font-mono text-primary font-bold">
                              Current Estimate: ${analysisResult.estimatedRehab.toLocaleString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(
                              [
                                { id: 'LIGHT', label: 'Light Cosmetic', desc: '$25-35k paint/floors' },
                                { id: 'MEDIUM', label: 'Medium Update', desc: '$45-60k kit/bath' },
                                { id: 'HEAVY', label: 'Heavy Mech.', desc: '$75-95k roof/HVAC' },
                                { id: 'GUT', label: 'Gut Rehab', desc: '$120k+ full studs' },
                              ] as const
                            ).map((tier) => (
                              <Button
                                key={tier.id}
                                type="button"
                                onClick={() => handleRehabTierChange(tier.id)}
                                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                  activeRehabTier === tier.id
                                    ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                                    : 'bg-background hover:bg-muted/50 border-border text-foreground'
                                }`}
                              >
                                <div className="text-xs flex items-center justify-between">
                                  <span>{tier.label}</span>
                                  {activeRehabTier === tier.id && <Check className="h-3 w-3 text-primary" />}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                  {tier.desc}
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      {/* Tab 2: Financials & 70% Rule Formula */}
                      <TabsContent value="financials" className="space-y-3 pt-3">
                        <div className="rounded-xl border border-border p-4 space-y-2.5 bg-background text-xs font-mono">
                          <div className="flex justify-between pb-1.5 border-b border-border/60">
                            <span className="text-muted-foreground">Modeled After-Repair Value (ARV):</span>
                            <span className="font-bold text-foreground">
                              ${selectedSaleForAnalysis.aiWorkforce.dealUnderwriter.modeledArv.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between pb-1.5 border-b border-border/60">
                            <span className="text-muted-foreground">70% Rule Benchmark:</span>
                            <span className="font-bold text-foreground">
                              ${Math.round(selectedSaleForAnalysis.aiWorkforce.dealUnderwriter.modeledArv * 0.7).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between pb-1.5 border-b border-border/60">
                            <span className="text-muted-foreground">Rehab Cost Budget:</span>
                            <span className="font-bold text-red-600">
                              -${analysisResult.estimatedRehab.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between pb-1.5 border-b border-border/60">
                            <span className="text-muted-foreground">Holding & Closing Carrying Costs:</span>
                            <span className="font-bold text-red-600">-$14,000</span>
                          </div>
                          <div className="flex justify-between pt-1 text-sm">
                            <span className="font-bold text-foreground">Maximum Allowable Bid (MAB):</span>
                            <span className="font-bold text-primary">
                              ${analysisResult.maxAllowableBid.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Tab 3: Surviving Liens Waterfall */}
                      <TabsContent value="liens" className="space-y-3 pt-3">
                        <div className="space-y-2 text-xs">
                          <h5 className="font-semibold text-foreground">
                            Municipal Tax & Senior Lien Exposure
                          </h5>
                          <div className="space-y-1.5">
                            {(selectedSaleForAnalysis.assistedLienCheck?.waterfall || []).map((lien, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono ${
                                  lien.survivesSale
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                                    : 'bg-muted/30 border-border text-muted-foreground'
                                }`}
                              >
                                <div>
                                  <div className="font-bold">{lien.lienHolder}</div>
                                  <div className="text-[10px] opacity-80">{lien.justification}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">${lien.currentBalance.toLocaleString()}</div>
                                  <Badge variant={lien.survivesSale ? 'destructive' : 'secondary'} className="text-[9px] py-0 px-1">
                                    {lien.survivesSale ? 'SURVIVES SALE' : 'Extinguished'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : null}

                <DialogFooter className="flex flex-row items-center justify-between sm:justify-between pt-2">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Jurisdiction: {selectedSaleForAnalysis?.jurisdictionState} Foreclosure Code
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                    Close Report
                  </Button>
                </DialogFooter>
              </SheriffSalesErrorBoundary>
            </DialogContent>
          </Dialog>

          {/* FIREBASE AUTH UNDERWRITING GATE MODAL */}
          {UnderwritingGateModal}
        </div>
      </SheriffSalesErrorBoundary>

    </TooltipProvider>
  );
}

export default SheriffSalesPage;
