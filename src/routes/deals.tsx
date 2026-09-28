import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listRankedParcels, lookupParcelByAddress } from "@/lib/parcels.functions";
import { getCurrentUserSubscription } from "@/lib/subscriptions.functions";
import { DossierPanel } from "@/components/DossierPanel";
import { fmt$, ringLabel } from "@/lib/format";
import {
  stressedDeal,
  portfolioStressLossMean,
  type StressScenario,
  type DealBase,
} from "@/lib/engine/credit";
import { pickArv } from "@/lib/arv-picker";
import { BulkLookupPanel } from "@/components/BulkLookupPanel";
import { supabase } from "@/integrations/supabase/client";
import { SectionBoundary } from "@/components/SectionBoundary";
import { DataFreshness } from "@/components/DataFreshness";
import { ScorePill } from "@/components/ScorePill";
import { TableSkeleton } from "@/components/TableSkeleton";
import { CardGridSkeleton } from "@/components/ui/skeleton-loaders";
import { PageHeader } from "@/components/PageHeader";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import {
  useFirebaseAuth,
  getSavedDealsFromFirestore,
  saveDealToFirestore,
  removeSavedDealFromFirestore,
  getAuthenticatedFirebaseUser,
} from "@/integrations/firebase";
import {
  Bookmark,
  Sparkles,
  CreditCard,
  Lock,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  Table2,
  Search,
  Download,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Map,
  Gavel,
} from "lucide-react";
import { generateDealsCsv, downloadCsvFile, type DealExportRow } from "@/lib/deal-memo";
import { DealCard } from "@/components/DealCard";
import { toast } from "sonner";

export const Route = createFileRoute("/deals")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { search?: string; parcelId?: string } => ({
    search: typeof search.search === "string" ? search.search : undefined,
    parcelId: typeof search.parcelId === "string" ? search.parcelId : undefined,
  }),
  beforeLoad: async () => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (!firebaseUser) {
      if (typeof localStorage !== "undefined" && localStorage.getItem("pp_demo_session")) {
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw redirect({ to: "/auth", search: { next: "/deals" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Ranked Deals — Profit Property Engine" },
      {
        name: "description",
        content: "Every underwritten parcel, ranked by risk-adjusted Perfect Score.",
      },
    ],
  }),
  component: () => (
    <ProtectedLayout>
      <SectionBoundary label="Deals unavailable" minHeight={400}>
        <DealsPage />
      </SectionBoundary>
    </ProtectedLayout>
  ),
});

function DealsPage() {
  const searchParams = Route.useSearch();
  const listFn = useServerFn(listRankedParcels);
  const subFn = useServerFn(getCurrentUserSubscription);
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(searchParams.parcelId || null);
  const [viewMode, setViewMode] = useState<"all" | "saved">("all");
  const [layoutMode, setLayoutMode] = useState<"cards" | "table">("cards");
  const [selectedMetro, setSelectedMetro] = useState<string>("17031"); // Cook County, IL default
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "");
  const [minProfitFilter, setMinProfitFilter] = useState<number | "ALL">("ALL");
  const [minScoreFilter, setMinScoreFilter] = useState<number | "ALL">("ALL");
  const [strategyFilter, setStrategyFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"profit" | "score" | "offer_asc" | "arv" | "exit">("profit");

  const subQ = useQuery<any>({
    queryKey: ["current-user-subscription", user?.uid],
    queryFn: () => subFn(),
    enabled: !!user,
  });
  const isSubscribed = subQ.data?.isSubscribed ?? false;
  const userTier = subQ.data?.tier ?? "free";

  const q = useQuery({
    queryKey: ["ranked-deals", selectedMetro],
    queryFn: () =>
      listFn({
        data: {
          limit: 500,
          county_fips: selectedMetro === "all" ? undefined : selectedMetro,
        },
      }),
  });

  const savedQ = useQuery({
    queryKey: ["saved-deals", user?.uid],
    queryFn: () => (user ? getSavedDealsFromFirestore(user.uid) : Promise.resolve([])),
    enabled: !!user,
  });

  const savedIds = useMemo(
    () => new Set(savedQ.data?.map((d) => d.parcelId) || []),
    [savedQ.data],
  );

  const toggleSaveDeal = async (r: any) => {
    if (!user) {
      toast.error("Please sign in to save deals to your portfolio.");
      return;
    }
    const parcelId = r.parcel_id;
    const isSaved = savedIds.has(parcelId);

    try {
      if (isSaved) {
        await removeSavedDealFromFirestore(user.uid, parcelId);
        toast.success("Removed from portfolio");
      } else {
        await saveDealToFirestore(user.uid, {
          id: parcelId,
          parcelId,
          address: r.parcels?.address || "",
          county: r.parcels?.county_fips || undefined,
          state: r.parcels?.state || undefined,
          arv: r.full_reno_arv ? Number(r.full_reno_arv) : undefined,
          maxBid: (r.modeled_offer ?? r.max_allowable_offer) ? Number(r.modeled_offer ?? r.max_allowable_offer) : undefined,
          predictedSpread: r.gross_profit ? Number(r.gross_profit) : undefined,
          underwriteStatus: "underwritten",
          starred: true,
        });
        toast.success("Saved to portfolio");
      }
      await queryClient.invalidateQueries({ queryKey: ["saved-deals", user.uid] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update portfolio");
    }
  };

  const displayData = useMemo(() => {
    if (viewMode === "saved") {
      if (!user) return [];
      const savedList = savedQ.data || [];
      const scoredMap = new Map((q.data || []).map((item: any) => [item.parcel_id, item]));
      const mapped = savedList.map((saved) => {
        const scored = scoredMap.get(saved.parcelId);
        if (scored) return scored;
        return {
          parcel_id: saved.parcelId,
          perfect_score: 75,
          gross_profit: saved.predictedSpread ?? 0,
          modeled_offer: saved.maxBid ?? 0,
          full_reno_arv: saved.arv,
          ring: 1,
          recommended_scope: saved.underwriteStatus || "watch",
          parcels: {
            id: saved.parcelId,
            address: saved.address || "Saved Property",
            city: saved.county || "",
            state: saved.state || "",
            county_fips: saved.county,
          },
          computed_at: saved.updatedAt || saved.createdAt,
          skeptic_flags: [],
        };
      });
      if (selectedMetro === "all") return mapped;
      return mapped.filter((item: any) => {
        const fips = item.parcels?.county_fips;
        if (fips) return fips === selectedMetro;
        if (selectedMetro === "17031") return item.parcels?.state === "IL";
        if (selectedMetro === "06037") return item.parcels?.state === "CA";
        if (selectedMetro === "36061") return item.parcels?.state === "NY";
        return true;
      });
    }
    return q.data || [];
  }, [viewMode, user, q.data, savedQ.data, selectedMetro]);

  const filteredDeals = useMemo(() => {
    let list = [...displayData];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((item: any) => {
        const addr = (item.parcels?.address || item.address || "").toLowerCase();
        const city = (item.parcels?.city || item.city || "").toLowerCase();
        const state = (item.parcels?.state || item.state || "").toLowerCase();
        const zip = (item.parcels?.zip || item.zip || "").toLowerCase();
        const id = (item.parcel_id || item.id || "").toLowerCase();
        const scope = (item.recommended_scope || "").toLowerCase();
        return (
          addr.includes(query) ||
          city.includes(query) ||
          state.includes(query) ||
          zip.includes(query) ||
          id.includes(query) ||
          scope.includes(query)
        );
      });
    }

    // Min profit filter
    if (minProfitFilter !== "ALL") {
      list = list.filter((item: any) => Number(item.gross_profit ?? 0) >= minProfitFilter);
    }

    // Min score filter
    if (minScoreFilter !== "ALL") {
      list = list.filter((item: any) => Number(item.perfect_score ?? 0) >= minScoreFilter);
    }

    // Strategy filter
    if (strategyFilter !== "ALL") {
      list = list.filter((item: any) => {
        const scope = (item.recommended_scope || "").toLowerCase();
        return scope.includes(strategyFilter.toLowerCase());
      });
    }

    // Sort order
    list.sort((a: any, b: any) => {
      if (sortOrder === "profit") {
        return Number(b.gross_profit ?? 0) - Number(a.gross_profit ?? 0);
      }
      if (sortOrder === "score") {
        return Number(b.perfect_score ?? 0) - Number(a.perfect_score ?? 0);
      }
      if (sortOrder === "offer_asc") {
        return (
          Number(a.modeled_offer ?? a.max_allowable_offer ?? 0) -
          Number(b.modeled_offer ?? b.max_allowable_offer ?? 0)
        );
      }
      if (sortOrder === "arv") {
        return (
          Number(b.full_reno_arv ?? b.arv ?? 0) -
          Number(a.full_reno_arv ?? a.arv ?? 0)
        );
      }
      if (sortOrder === "exit") {
        return Number(a.exit_days ?? 60) - Number(b.exit_days ?? 60);
      }
      return 0;
    });

    return list;
  }, [displayData, searchQuery, minProfitFilter, minScoreFilter, strategyFilter, sortOrder]);

  const handleExportCsv = () => {
    if (filteredDeals.length === 0) {
      toast.error("No deals available to export with current filters.");
      return;
    }

    const exportRows: DealExportRow[] = filteredDeals.map((r: any) => {
      const p = r.parcels || {};
      const arv = Number(r.full_reno_arv || r.arv || r.cosmetic_arv || 0);
      const maxOffer = Number(r.modeled_offer ?? r.max_allowable_offer ?? 0);
      const expectedProfit = Number(r.gross_profit ?? r.risk_adjusted_profit ?? 0);
      const flags = (r.skeptic_flags as string[]) || [];

      return {
        parcelId: r.parcel_id || r.id,
        address: p.address || r.address || "Unknown Address",
        city: p.city || r.city || "",
        state: p.state || r.state || "",
        zip: p.zip || r.zip || "",
        countyFips: p.county_fips || r.county || selectedMetro,
        arv,
        maxOffer,
        expectedProfit,
        dealScore: Number(r.perfect_score || 0),
        confidenceGrade: r.confidence_grade || "B",
        strategy: r.recommended_scope || "Full Renovation",
        livingSqft: p.living_sqft ? Number(p.living_sqft) : null,
        yearBuilt: p.year_built ? Number(p.year_built) : null,
        bedrooms: p.bedrooms ? Number(p.bedrooms) : null,
        bathrooms: p.bathrooms ? Number(p.bathrooms) : null,
        pLossPercent: r.mc_p_loss != null ? Math.round(Number(r.mc_p_loss) * 100) : null,
        typicalProfitP50: r.mc_profit_p50 ? Number(r.mc_profit_p50) : null,
        worstCaseProfitP5: r.mc_profit_p5 ? Number(r.mc_profit_p5) : null,
        exitDays: r.exit_days ? Number(r.exit_days) : null,
        warningsCount: flags.length,
        warnings: flags.join("; "),
        isSaved: savedIds.has(r.parcel_id || r.id),
      };
    });

    const csv = generateDealsCsv(exportRows);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `perfect-property-${viewMode === "saved" ? "portfolio" : "deals"}-${selectedMetro}-${dateStr}.csv`;
    downloadCsvFile(csv, filename);
    toast.success(`Exported ${exportRows.length} deal${exportRows.length > 1 ? "s" : ""} to CSV for CRM import`);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    minProfitFilter !== "ALL" ||
    minScoreFilter !== "ALL" ||
    strategyFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setMinProfitFilter("ALL");
    setMinScoreFilter("ALL");
    setStrategyFilter("ALL");
  };

  const metroTitle =
    selectedMetro === "17031"
      ? `New deals in Cook County, IL today (${displayData.length} scored)`
      : selectedMetro === "06037"
        ? `New deals in Los Angeles, CA today (${displayData.length} scored)`
        : selectedMetro === "36061"
          ? `New deals in New York, NY today (${displayData.length} scored)`
          : `New deals across all metros today (${displayData.length} scored)`;

  const metroSub =
    selectedMetro === "17031"
      ? "Freshly underwritten properties in Cook County (Chicago). Ranked by expected profit, max offer, and deal score. Click any deal to view neighborhood comps and AI maps."
      : "Every property we've scored, sorted by expected profit and deal score. Click any card to see comps, risks, and neighborhood intelligence.";

  const metroLabel =
    selectedMetro === "17031"
      ? "Cook County, IL"
      : selectedMetro === "06037"
        ? "Los Angeles, CA"
        : selectedMetro === "36061"
          ? "New York, NY"
          : "all markets";

  return (
    <>
      <div id="deals-page-container" className="mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          id="deals-header"
          title={metroTitle}
          badge={selectedMetro === "17031" ? "Primary Focus Metro · Live Dealflow" : "Live Dealflow"}
          breadcrumbs={[{ label: "Ranked Deals" }]}
          sub={metroSub}
        />

        {!isSubscribed && (
          <div
            id="deals-paywall-banner"
            className="mt-6 rounded-2xl border border-primary/30 bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-bold text-foreground">
                  Free Preview: Showing 3 Sample Deals in Cook County, IL
                </h3>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl">
                Unlock all 500+ Cook County deals, estimated repair budgets, verified neighborhood comps, and safe max offer calculations. Backed by our 30-Day Money-Back Guarantee.
              </p>
            </div>
            <Link
              to="/pricing"
              id="deals-unlock-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all shrink-0 cursor-pointer"
            >
              <span>Unlock 500+ Deals</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <HelpStrip />

        {/* View mode toggle + Metro selector + Cards/Table layout toggle */}
        <div id="deals-view-bar" className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              id="deals-view-all-btn"
              type="button"
              onClick={() => setViewMode("all")}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "all"
                  ? "bg-card text-foreground border border-border-strong shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              All Ranked Deals ({q.data?.length ?? 0})
            </Button>
            <Button
              id="deals-view-saved-btn"
              type="button"
              onClick={() => setViewMode("saved")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "saved"
                  ? "bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>My List ({savedQ.data?.length ?? 0})</span>
            </Button>

            <span className="mx-1 hidden h-5 w-px bg-border sm:inline-block" />

            {/* Metro Selector */}
            <div id="deals-metro-selector" className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 text-xs">
              <span className="px-2 font-medium text-muted-foreground">Metro:</span>
              <button
                type="button"
                id="metro-cook-il-btn"
                onClick={() => setSelectedMetro("17031")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedMetro === "17031"
                    ? "bg-card text-primary font-semibold shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Cook County, IL</span>
                <span className="rounded bg-primary/10 px-1 py-0.5 text-[10px] font-bold text-primary">Focus</span>
              </button>
              <button
                type="button"
                id="metro-la-ca-btn"
                onClick={() => setSelectedMetro("06037")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedMetro === "06037"
                    ? "bg-card text-foreground font-semibold shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Los Angeles, CA
              </button>
              <button
                type="button"
                id="metro-ny-btn"
                onClick={() => setSelectedMetro("36061")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedMetro === "36061"
                    ? "bg-card text-foreground font-semibold shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                New York, NY
              </button>
              <button
                type="button"
                id="metro-all-btn"
                onClick={() => setSelectedMetro("all")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedMetro === "all"
                    ? "bg-card text-foreground font-semibold shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Metros
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div id="deals-count-indicator" className="text-[13px] text-muted-foreground hidden sm:block">
              Showing <span className="font-semibold text-foreground">{filteredDeals.length}</span>{" "}
              {filteredDeals.length !== displayData.length && (
                <span>of {displayData.length} </span>
              )}
              {viewMode === "saved" ? "saved properties" : `deals in ${metroLabel}`}
            </div>

            {/* Layout Toggle: Cards vs Table */}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
              <button
                type="button"
                id="deals-view-cards-btn"
                onClick={() => setLayoutMode("cards")}
                aria-label="Cards view"
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  layoutMode === "cards"
                    ? "bg-card text-foreground shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                id="deals-view-table-btn"
                onClick={() => setLayoutMode("table")}
                aria-label="Table view"
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  layoutMode === "table"
                    ? "bg-card text-foreground shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Table2 className="h-3.5 w-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Filter & Action Bar */}
        <div id="deals-filter-bar" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
          <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="deals-search-input"
                type="text"
                placeholder="Search address, city, zip, or plan…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 pl-8.5 pr-8 text-xs bg-muted/30 border-border"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Min Profit Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground font-medium hidden md:inline">Profit:</span>
              <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
                {[
                  { label: "All", val: "ALL" as const },
                  { label: "$40k+", val: 40000 },
                  { label: "$60k+", val: 60000 },
                  { label: "$80k+", val: 80000 },
                ].map((tier) => (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() => setMinProfitFilter(tier.val)}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                      minProfitFilter === tier.val
                        ? "bg-card text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Score Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground font-medium hidden lg:inline">Score:</span>
              <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
                {[
                  { label: "All", val: "ALL" as const },
                  { label: "70+", val: 70 },
                  { label: "80+", val: 80 },
                  { label: "85+", val: 85 },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setMinScoreFilter(s.val)}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                      minScoreFilter === s.val
                        ? "bg-card text-primary font-bold shadow-2xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy Filter */}
            <div className="flex items-center gap-1 text-xs">
              <select
                id="deals-strategy-filter"
                value={strategyFilter}
                onChange={(e) => setStrategyFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-muted/30 px-2 text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                aria-label="Filter by repair scope"
              >
                <option value="ALL">All Repair Types</option>
                <option value="Cosmetic">Light Cosmetic</option>
                <option value="Full Renovation">Full Remodel</option>
                <option value="Expanded">Major Renovation</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 text-xs">
              <select
                id="deals-sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="h-8 rounded-lg border border-border bg-muted/30 px-2 text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                aria-label="Sort deals"
              >
                <option value="profit">Sort: Highest Net Profit</option>
                <option value="score">Sort: Highest Deal Rating</option>
                <option value="offer_asc">Sort: Lowest Purchase Price</option>
                <option value="arv">Sort: Highest Resale Value</option>
                <option value="exit">Sort: Quickest Turnaround</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                id="deals-clear-filters-btn"
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Reset filters</span>
              </button>
            )}
          </div>

          {/* Right Action Tools: CSV Export & Cross-Links */}
          <div className="flex items-center gap-2">
            <Button
              id="deals-export-csv-btn"
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={filteredDeals.length === 0}
              className="h-8 text-xs font-semibold gap-1.5 border-border bg-card hover:bg-muted cursor-pointer"
              title="Export filtered deals to CSV for Excel, Podio, or CRM"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>Export CSV ({filteredDeals.length})</span>
            </Button>

            <Link
              to="/workspace"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Open full interactive cadastral map workspace"
            >
              <Map className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Map</span>
            </Link>

            <Link
              to="/sheriff-sales"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Inspect court foreclosure & sheriff auction pipeline"
            >
              <Gavel className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Auctions</span>
            </Link>
          </div>
        </div>

        {/* Content View: Cards vs Table */}
        {layoutMode === "cards" ? (
          <div>
            {(viewMode === "all" ? q.isLoading : savedQ.isLoading) ? (
              <div className="mt-6">
                <CardGridSkeleton count={6} />
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground space-y-3">
                <p>
                  {hasActiveFilters
                    ? "No properties match your current search and filter criteria."
                    : viewMode === "saved"
                      ? "No deals saved in your list yet. Click 'Add to my list' on any property card to save it."
                      : "No properties found matching current criteria. Try selecting Cook County or All Metros."}
                </p>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs font-semibold"
                  >
                    Reset all filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div id="deals-card-grid" className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredDeals.map((deal: any) => (
                    <DealCard
                      key={deal.parcel_id}
                      deal={deal}
                      isSaved={savedIds.has(deal.parcel_id)}
                      onToggleSave={toggleSaveDeal}
                      onSelect={setSelected}
                    />
                  ))}
                </div>

                {!isSubscribed && filteredDeals.length > 0 && (
                  <div id="deals-cards-locked-footer" className="mt-8 rounded-2xl border border-border bg-muted/20 p-6 sm:p-8 text-center space-y-3">
                    <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary mb-1">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">
                      497+ Scored Deals Locked in Cook County, IL
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                      Subscribe to Starter ($79/mo) or Pro ($199/mo) to unlock the full database, contact records, and Prophecy forecasts. Protected by our 30-Day Money-Back Guarantee.
                    </p>
                    <div className="pt-2">
                      <Link
                        to="/pricing"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>View Subscription Plans</span>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (

        <div id="deals-table-wrapper" className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table id="deals-data-table" className="w-full text-[14px]">
            <thead className="bg-muted border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Property</th>

                <th
                  className="px-4 py-3 text-right"
                  title="Overall buy score, 0–100. Higher is better."
                >
                  Score
                </th>
                <th
                  className="px-4 py-3 text-left"
                  title="How we found it: on-market, off-market, or predicted to list soon."
                >
                  Source
                </th>
                <th className="px-4 py-3 text-left" title="Recommended renovation plan.">
                  Plan
                </th>
                <th className="border-l border-border px-4 py-3 text-right" title="What we'd offer the seller today.">
                  Our offer
                </th>
                <th
                  className="px-4 py-3 text-right"
                  title="Expected profit after all costs, at our offer."
                >
                  Expected profit
                </th>
                <th
                  className="px-4 py-3 text-right"
                  title="Middle-case profit · worst-case profit (bottom 5% of outcomes)."
                >
                  Typical · Worst case
                </th>
                <th className="border-l border-border px-4 py-3 text-right" title="Chance the deal loses money.">
                  Loss risk
                </th>
                <th className="px-4 py-3 text-right" title="Chance the seller accepts our offer.">
                  Deal odds
                </th>
                <th
                  className="px-4 py-3 text-right"
                  title="Expected days to sell after renovation."
                >
                  Days to sell
                </th>
                <th
                  className="px-4 py-3 text-left"
                  title="Automatic warnings that need a human look."
                >
                  Warnings
                </th>
              </tr>
            </thead>
            <tbody>
              {(viewMode === "all" ? q.isLoading : savedQ.isLoading) && <TableSkeleton rows={10} columns={11} />}
              {viewMode === "all" && q.isError && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-rose-500">
                    Failed to load ranked deals: {q.error instanceof Error ? q.error.message : "Database error"}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => q.refetch()}
                      className="ml-3 text-xs font-semibold cursor-pointer"
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              )}
              {viewMode === "saved" && savedQ.isError && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-rose-500">
                    Failed to load Firestore portfolio: {savedQ.error instanceof Error ? savedQ.error.message : "Firestore error"}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => savedQ.refetch()}
                      className="ml-3 text-xs font-semibold cursor-pointer"
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              )}
              {!(viewMode === "all" ? q.isLoading : savedQ.isLoading) && filteredDeals.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {hasActiveFilters
                      ? "No properties match your current search and filter criteria."
                      : viewMode === "saved"
                        ? "No deals saved in your list yet. Click 'Add to my list' on any property card or table row to track it."
                        : "No properties found matching current criteria."}
                  </td>
                </tr>
              )}
              {!(viewMode === "all" ? q.isLoading : savedQ.isLoading) && filteredDeals.map((r: any, i: number) => {
                const flags = (r.skeptic_flags as string[]) ?? [];
                const pLoss = Number(r.mc_p_loss);
                return (
                  <tr
                    key={r.parcel_id}
                    onClick={() => setSelected(r.parcel_id)}
                    style={{ animationDelay: `${Math.min(i * 35, 600)}ms` }}
                    className="group cursor-pointer border-t border-border transition-colors hover:bg-muted animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-backwards"
                  >
                    
                    <td className="sticky left-0 z-10 bg-card px-4 py-3 group-hover:bg-muted">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground truncate">{r.parcels?.address || r.address || "Saved Property"}</div>
                          <div className="text-[12px] text-muted-foreground">
                            {r.parcels?.city || ""}{r.parcels?.state ? `, ${r.parcels.state}` : ""}
                          </div>
                          <DataFreshness
                            timestamp={r.computed_at}
                            prefix="Underwritten"
                            className="mt-1"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void toggleSaveDeal(r);
                          }}
                          aria-label={savedIds.has(r.parcel_id) ? "Remove from my list" : "Add to my list"}
                          title={savedIds.has(r.parcel_id) ? "In your list" : "Add to my list"}
                          className={`rounded-lg p-1.5 transition-colors shrink-0 ${
                            savedIds.has(r.parcel_id)
                              ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <Bookmark
                            className={`h-4 w-4 ${savedIds.has(r.parcel_id) ? "fill-amber-500" : ""}`}
                          />
                        </Button>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <ScorePill score={Number(r.perfect_score)} />
                    </td>
                    <td className="px-4 py-3 text-[13px]">{ringLabel(r.ring)}</td>
                    <td className="px-4 py-3 text-[13px]">{r.recommended_scope}</td>
                    <td className="num border-l border-border/50 px-4 py-3 text-right">
                      {fmt$(Number(r.modeled_offer ?? r.max_allowable_offer ?? 0))}
                    </td>
                    <td className="num px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                      {fmt$(Number(r.gross_profit ?? 0))}
                    </td>
                    <td className="num px-4 py-3 text-right text-[13px]">
                      {r.mc_profit_p50 != null ? fmt$(Number(r.mc_profit_p50)) : "—"}
                      <div className="text-[11px] text-muted-foreground">
                        {r.mc_profit_p5 != null ? `worst ${fmt$(Number(r.mc_profit_p5))}` : ""}
                      </div>
                    </td>
                    <td
                      className="num px-4 py-3 text-right"
                      style={{
                        color:
                          pLoss > 0.35
                            ? "#f43f5e"
                            : pLoss > 0.15
                              ? "var(--opportunity)"
                              : "#05d680",
                      }}
                    >
                      {r.mc_p_loss != null ? `${Math.round(pLoss * 100)}%` : "—"}
                    </td>
                    <td className="num px-4 py-3 text-right">
                      {Math.round(Number(r.acquisition_probability) * 100)}%
                    </td>
                    <td className="num px-4 py-3 text-right">{r.exit_days}d</td>
                    <td className="px-4 py-3 text-[12px] text-rose-500">
                      {flags.length ? `${flags.length} warning${flags.length > 1 ? "s" : ""}` : "—"}
                    </td>
                  </tr>
                );
              })}
              {!q.isLoading && (q.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No scored properties yet. Run the underwriter from the admin panel to generate deals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {!isSubscribed && (q.data ?? []).length > 0 && (
            <div id="deals-table-locked-footer" className="border-t border-border bg-muted/20 p-6 sm:p-8 text-center space-y-3">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary mb-1">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                497+ Scored Deals Locked in Cook County, IL
              </h4>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Subscribe to Starter ($79/mo) or Pro ($199/mo) to unlock the full database, contact records, and Prophecy forecasts. Protected by our 30-Day Money-Back Guarantee.
              </p>
              <div className="pt-2">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>View Subscription Plans</span>
                </Link>
              </div>
            </div>
          )}
        </div>
        )}

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-[15px] font-semibold text-foreground">Tools</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Add properties to the list, or test how the whole portfolio holds up in a downturn.
          </p>
          <RealieLookup onCreated={(id) => setSelected(id)} />
          <BulkLookupPanel />
          <StressPanel rows={q.data ?? []} />
        </section>
      </div>

      <DossierPanel parcelId={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function HelpStrip() {
  const items = [
    { k: "Deal Rating", v: "0 to 100 score. 80+ is an exceptional deal, 65–79 is strong, 50–64 is viable." },
    { k: "Max Safe Offer", v: "The highest price you can pay while still securing your target profit margin." },
    { k: "Downside Risk", v: "The probability of losing money if repair costs run high or sales take longer." },
    { k: "Offer Acceptance", v: "Estimated likelihood that a motivated seller accepts this cash offer." },
  ];
  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-2xs">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>How to evaluate these properties</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.k} className="text-xs leading-relaxed">
            <span className="font-semibold text-foreground">{it.k}: </span>
            <span className="text-muted-foreground">{it.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}



const SCENARIOS: Record<string, StressScenario> = {
  base: {
    ARV_shock: 0,
    rehab_multiplier: 1,
    hold_months_additive: 0,
    hold_multiplier: 1,
    rate_shock: 0,
    PD_multiplier: 1,
    LGD_multiplier: 1,
    financing_available: true,
    warehouse_haircut: 0,
    insurance_cost_shock: 0,
    liquidity_exit_shock: 0,
  },
  arv15: {
    ARV_shock: -0.15,
    rehab_multiplier: 1,
    hold_months_additive: 0,
    hold_multiplier: 1,
    rate_shock: 0,
    PD_multiplier: 1.4,
    LGD_multiplier: 1.2,
    financing_available: true,
    warehouse_haircut: 0,
    insurance_cost_shock: 0,
    liquidity_exit_shock: 0.05,
  },
  rate200: {
    ARV_shock: 0,
    rehab_multiplier: 1,
    hold_months_additive: 0,
    hold_multiplier: 1,
    rate_shock: 0.2,
    PD_multiplier: 1.2,
    LGD_multiplier: 1.0,
    financing_available: true,
    warehouse_haircut: 0,
    insurance_cost_shock: 0,
    liquidity_exit_shock: 0,
  },
  hold3: {
    ARV_shock: 0,
    rehab_multiplier: 1,
    hold_months_additive: 3,
    hold_multiplier: 1,
    rate_shock: 0,
    PD_multiplier: 1.15,
    LGD_multiplier: 1.0,
    financing_available: true,
    warehouse_haircut: 0,
    insurance_cost_shock: 0.05,
    liquidity_exit_shock: 0,
  },
};

function StressPanel({ rows }: { rows: any[] }) {
  const [key, setKey] = useState<keyof typeof SCENARIOS>("arv15");
  const scenario = SCENARIOS[key];

  const { deals, weights, perDeal } = useMemo(() => {
    const deals: DealBase[] = [];
    const weights: number[] = [];
    const perDeal: Array<{
      id: string;
      addr: string;
      base: number;
      stressed: number;
      delta: number;
    }> = [];
    for (const r of rows) {
      const arv = pickArv(r);
      const P = Number(r.modeled_offer ?? r.max_allowable_offer ?? 0);
      const R = Number(r.reno_cost ?? 0);
      const exit_days = Number(r.exit_days ?? 90);
      if (!Number.isFinite(arv) || !arv) continue;
      const d: DealBase = {
        ARV: arv,
        P,
        R,
        H_base: Math.max(1, exit_days / 30),
        base_rate: 0.11,
        base_insurance: 180,
        base_selling_cost: Number(r.selling_cost ?? arv * 0.06),
        base_loan_cost_per_month: (P * 0.11) / 12,
        base_carry_cost_per_month: Number(r.carry_cost ?? 3800) / Math.max(1, exit_days / 30),
        EAD: Number(r.ead ?? P + R),
        PD_credit: Number(r.pd_credit ?? 0.05),
        LGD: Number(r.lgd ?? 0.4),
        E_profit_base: Number(r.risk_adjusted_profit_credit ?? r.gross_profit ?? 0),
      };
      deals.push(d);
      weights.push(1);
      const s = stressedDeal(d, scenario);
      perDeal.push({
        id: r.parcel_id,
        addr: r.parcels?.address ?? "—",
        base: d.E_profit_base,
        stressed: s.EProfit,
        delta: s.EProfit - d.E_profit_base,
      });
    }
    return { deals, weights, perDeal };
  }, [rows, scenario]);

  const portfolioLoss = portfolioStressLossMean(deals, weights, scenario);
  const totalBase = perDeal.reduce((a, r) => a + r.base, 0);
  const totalStressed = perDeal.reduce((a, r) => a + r.stressed, 0);

  const buttons: Array<{ k: keyof typeof SCENARIOS; label: string }> = [
    { k: "base", label: "Base" },
    { k: "arv15", label: "-15% ARV" },
    { k: "rate200", label: "Rate +200bps" },
    { k: "hold3", label: "+3 mo hold" },
  ];

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Portfolio stress test
          </div>
          <div className="mt-0.5 text-[13px] font-medium text-foreground">
            Applied across {deals.length} deals.
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {buttons.map((b) => (
            <Button
              key={b.k}
              onClick={() => setKey(b.k)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all cursor-pointer ${
                key === b.k
                  ? "bg-primary/10 text-primary border border-blue-200 shadow-2xs"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {b.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniBox label="Base E[Profit]" v={fmt$(totalBase)} />
        <MiniBox
          label="Stressed E[Profit]"
          v={fmt$(totalStressed)}
          tone={totalStressed < totalBase ? "skeptic" : "profit"}
        />
        <MiniBox label="Portfolio loss" v={fmt$(portfolioLoss)} tone="skeptic" />
        <MiniBox
          label="Delta / deal (avg)"
          v={fmt$(perDeal.length ? (totalStressed - totalBase) / perDeal.length : 0)}
        />
      </div>
    </div>
  );
}

function MiniBox({ label, v, tone }: { label: string; v: string; tone?: "skeptic" | "profit" }) {
  const color =
    tone === "skeptic" ? "#E11D48" : tone === "profit" ? "#059669" : undefined;
  return (
    <div className="rounded-lg border border-border bg-muted px-3.5 py-2.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="num mt-0.5 text-[15px] font-bold text-foreground" style={{ color }}>
        {v}
      </div>
    </div>
  );
}

function RealieLookup({ onCreated }: { onCreated: (id: string) => void }) {
  const lookup = useServerFn(lookupParcelByAddress);
  const qc = useQueryClient();
  const [address, setAddress] = useState("");
  const [state, setState] = useState("TX");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim() || !state.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await lookup({
        data: {
          address: address.trim(),
          state: state.trim().toUpperCase(),
          city: city.trim() || undefined,
        },
      });
      await qc.invalidateQueries({ queryKey: ["ranked-all"] });
      onCreated(r.parcel_id);
      setAddress("");
    } catch (e: any) {
      setErr(e?.message ?? "Lookup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex-1 min-w-[220px]">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Analyze Any Property Address
        </div>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 123 Main St"
          className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">State</div>
        <Input
          value={state}
          onChange={(e) => setState(e.target.value)}
          maxLength={2}
          className="mt-1.5 w-16 rounded-lg border border-border bg-card px-2 py-2 text-[13px] text-foreground uppercase outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          City (optional)
        </div>
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Austin"
          className="mt-1.5 w-40 rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <Button
        type="submit"
        disabled={busy}
        className="rounded-lg border border-border bg-foreground px-4 py-2 text-[13px] font-semibold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-all"
      >
        {busy ? "Analyzing…" : "Calculate Deal Numbers"}
      </Button>
      {err && <div className="w-full text-[12px] font-medium text-rose-600">{err}</div>}
    </form>
  );
}
