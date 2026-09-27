import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchPropertyMarketNewsFn } from "@/lib/gemini.functions";
import type { PropertyMarketNewsResult, PropertyNewsItem } from "@/lib/gemini.server";
import {
  Globe,
  Sparkles,
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Building2,
  TrendingUp,
  FileText,
  Clock,
  RefreshCw,
  Tag,
  AlertCircle,
  Landmark,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  address: string;
  city?: string;
  county?: string;
  state?: string;
  zip?: string;
  apn?: string;
  submarket?: string;
  className?: string;
  autoLoad?: boolean;
}

export function PropertySearchGroundingNews({
  address,
  city,
  county,
  state,
  zip,
  apn,
  submarket,
  className = "",
  autoLoad = true,
}: Props) {
  const fetchNews = useServerFn(fetchPropertyMarketNewsFn);
  const [userQuery, setUserQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchExecuted, setSearchExecuted] = useState(autoLoad);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<PropertyMarketNewsResult>({
    queryKey: ["property-search-grounding-news", address, city, county, state, apn, activeQuery],
    queryFn: async () => {
      const res = await fetchNews({
        data: {
          address,
          city,
          county,
          state,
          zip,
          apn,
          submarket,
          userQuery: activeQuery.trim() || undefined,
        },
      });
      return res as PropertyMarketNewsResult;
    },
    enabled: Boolean(address && searchExecuted),
    staleTime: 1000 * 60 * 15, // 15 minutes cache
  });

  const handleManualSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (activeQuery === userQuery && searchExecuted) {
      refetch();
    } else {
      setActiveQuery(userQuery);
      setSearchExecuted(true);
    }
    toast.info("Executing Google Search Grounding for property updates...");
  };

  const newsItems = data?.newsItems || [];
  const filteredItems = filterCategory === "all"
    ? newsItems
    : newsItems.filter((item) => item.category === filterCategory);

  const getCategoryBadge = (category: PropertyNewsItem["category"]) => {
    switch (category) {
      case "market_sales":
        return {
          label: "Market & Comps",
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          icon: TrendingUp,
        };
      case "zoning_development":
        return {
          label: "Zoning & Permits",
          bg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          icon: Building2,
        };
      case "tax_distress":
        return {
          label: "Tax & Legal",
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: Landmark,
        };
      case "infrastructure":
        return {
          label: "Infrastructure",
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: Tag,
        };
      case "local_economy":
      default:
        return {
          label: "Economy & Growth",
          bg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
          icon: Globe,
        };
    }
  };

  const getImpactBadge = (impact: PropertyNewsItem["impact"]) => {
    switch (impact) {
      case "positive":
        return {
          label: "Bullish Signal",
          bg: "bg-emerald-950/40 text-emerald-400 border-emerald-500/30",
          icon: ShieldCheck,
        };
      case "risk":
        return {
          label: "Risk Factor",
          bg: "bg-rose-950/40 text-rose-400 border-rose-500/30",
          icon: ShieldAlert,
        };
      case "neutral":
      default:
        return {
          label: "Contextual",
          bg: "bg-muted text-muted-foreground border-border",
          icon: FileText,
        };
    }
  };

  return (
    <div className={`rounded-xl border border-border bg-card p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Live Market Updates & News
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 border border-emerald-500/20">
                <Sparkles className="h-2.5 w-2.5" />
                Google Search Grounded
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time deed filings, municipal permits, and neighborhood comp velocity via Gemini 3.8 Flash
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => handleManualSearch()}
          disabled={isLoading || isFetching}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted hover:border-border transition-colors cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin text-emerald-400" : "text-muted-foreground"}`} />
          <span>{isLoading || isFetching ? "Crawling Web…" : "Re-Ground"}</span>
        </Button>
      </div>

      {/* Inquiry Search Bar */}
      <form onSubmit={handleManualSearch} className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search specific topic (e.g. recent sales comps, zoning changes, tax lien filings, new transit)..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="h-8 pl-8 pr-3 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-emerald-500"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || isFetching}
          className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
        >
          Search
        </Button>
      </form>

      {/* Loading Skeleton */}
      {(isLoading || isFetching) && (
        <div className="mt-4 space-y-3 p-3 rounded-lg border border-border/50 bg-background/50">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Connecting Google Search Grounding to {city || address}...</span>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
            <div className="h-3 w-3/5 rounded bg-muted animate-pulse" />
            <div className="h-16 w-full rounded-md bg-muted/60 animate-pulse mt-2" />
          </div>
        </div>
      )}

      {/* Error state */}
      {!isLoading && !isFetching && error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Search Grounding Service Notice</p>
            <p className="mt-0.5 text-[11px] text-rose-300/80">
              {error instanceof Error ? error.message : "Unable to complete search grounding at this time."}
            </p>
            <Button
              type="button"
              onClick={() => handleManualSearch()}
              className="mt-2 text-[11px] font-semibold text-rose-400 underline hover:text-rose-300"
            >
              Retry Live Grounding
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && !isFetching && data && (
        <div className="mt-4 space-y-4">
          {/* Market Pulse Executive Summary */}
          {data.marketPulse && (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Executive Market Pulse</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                {data.marketPulse}
              </p>

              {/* Price & Regulatory Highlights */}
              {(data.priceTrendsOverview || data.regulatoryOutlook) && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-border/50 text-[11px]">
                  {data.priceTrendsOverview && (
                    <div className="rounded-md border border-border bg-background p-2">
                      <span className="font-bold text-blue-400 block mb-0.5">📈 Comp & Price Trajectory</span>
                      <span className="text-muted-foreground">{data.priceTrendsOverview}</span>
                    </div>
                  )}
                  {data.regulatoryOutlook && (
                    <div className="rounded-md border border-border bg-background p-2">
                      <span className="font-bold text-purple-400 block mb-0.5">🏛️ Municipal & Tax Baseline</span>
                      <span className="text-muted-foreground">{data.regulatoryOutlook}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Filter Categories */}
          {newsItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">Filter:</span>
              {[
                { id: "all", label: `All (${newsItems.length})` },
                { id: "market_sales", label: "Market & Comps" },
                { id: "zoning_development", label: "Zoning & Permits" },
                { id: "tax_distress", label: "Tax & Legal" },
                { id: "infrastructure", label: "Infrastructure" },
                { id: "local_economy", label: "Economy" },
              ].map((cat) => {
                const count = cat.id === "all" ? newsItems.length : newsItems.filter(i => i.category === cat.id).length;
                if (cat.id !== "all" && count === 0) return null;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCategory(cat.id)}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer border ${
                      filterCategory === cat.id
                        ? "bg-foreground text-background border-foreground font-semibold"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* News & Updates Cards Feed */}
          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              const catBadge = getCategoryBadge(item.category);
              const impactBadge = getImpactBadge(item.impact);
              const CatIcon = catBadge.icon;
              const ImpactIcon = impactBadge.icon;

              return (
                <div
                  key={item.id}
                  className="group rounded-lg border border-border bg-background p-3 transition-all hover:border-emerald-500/40 hover:shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${catBadge.bg}`}>
                        <CatIcon className="h-2.5 w-2.5" />
                        {catBadge.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${impactBadge.bg}`}>
                        <ImpactIcon className="h-2.5 w-2.5" />
                        {impactBadge.label}
                      </span>
                    </div>

                    {item.publishedTime && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {item.publishedTime}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {item.snippet}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                    <span className="font-medium text-muted-foreground">
                      Source: <strong className="text-foreground">{item.publisher || "Google Search Grounding"}</strong>
                    </span>

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        <span>View Source</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search Queries & Verified Sources */}
          {((data.webSearchQueries && data.webSearchQueries.length > 0) ||
            (data.groundingSources && data.groundingSources.length > 0)) && (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
              {data.webSearchQueries && data.webSearchQueries.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Google Grounding Queries Executed
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {data.webSearchQueries.map((q, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                      >
                        "{q}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.groundingSources && data.groundingSources.length > 0 && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Verified Citations & Records
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.groundingSources.slice(0, 6).map((src, i) => (
                      <a
                        key={i}
                        href={src.url || "#"}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-blue-400 hover:text-blue-300 hover:border-blue-500/40 transition-colors"
                      >
                        <span className="max-w-[220px] truncate">{src.title || "Record Citation"}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Initial Call To Action if not autoloaded */}
      {!searchExecuted && (
        <div className="mt-3 text-center py-4 bg-muted/20 rounded-lg border border-border border-dashed">
          <Globe className="h-6 w-6 text-emerald-400 mx-auto mb-1.5 opacity-80" />
          <p className="text-xs font-semibold text-foreground">
            Search Grounded Market Intelligence Ready
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 mb-2.5 max-w-sm mx-auto">
            Retrieve real-time property news, neighborhood comps, zoning updates, and municipal filings.
          </p>
          <Button
            type="button"
            onClick={() => handleManualSearch()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Fetch Grounded News & Updates</span>
          </Button>
        </div>
      )}
    </div>
  );
}
