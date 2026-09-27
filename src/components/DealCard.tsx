import { useState } from "react";
import { fmt$, ringLabel, tierLabel } from "@/lib/format";
import { ScorePill } from "@/components/ScorePill";
import { DataFreshness } from "@/components/DataFreshness";
import { PropertyGallery } from "@/components/PropertyGallery";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Building2,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  MapPin,
} from "lucide-react";

export interface DealCardProps {
  deal: any;
  isSaved: boolean;
  onToggleSave: (deal: any) => void;
  onSelect: (parcelId: string) => void;
}

export function DealCard({ deal, isSaved, onToggleSave, onSelect }: DealCardProps) {
  const [whyExpanded, setWhyExpanded] = useState(false);

  const address = deal.parcels?.address || deal.address || "Property Address";
  const city = deal.parcels?.city || deal.city || "";
  const state = deal.parcels?.state || deal.state || "";
  const zip = deal.parcels?.zip || deal.zip || "";
  const locationLine = [city, state, zip].filter(Boolean).join(", ");

  const arv = Number(deal.full_reno_arv || deal.arv || deal.cosmetic_arv || 0);
  const maxOffer = Number(deal.modeled_offer ?? deal.max_allowable_offer ?? 0);
  const expectedProfit = Number(deal.gross_profit ?? deal.risk_adjusted_profit ?? 0);
  const dealScore = Number(deal.perfect_score ?? 0);
  const confidence = deal.confidence_grade || "B";
  const ring = Number(deal.ring ?? 1);
  const statusLabel = ringLabel(ring);
  const flags = (deal.skeptic_flags as string[]) ?? [];
  const exitDays = deal.exit_days ? Number(deal.exit_days) : 60;
  const pLoss = deal.mc_p_loss != null ? Math.round(Number(deal.mc_p_loss) * 100) : 10;
  const plan = deal.recommended_scope || "Full Renovation";

  const discountFromArv = arv > 0 && maxOffer > 0 ? Math.round(((arv - maxOffer) / arv) * 100) : null;
  const tier = tierLabel(dealScore);

  return (
    <div
      id={`deal-card-${deal.parcel_id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md"
    >
      {/* Top Header: Status & Score */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${ring === 2 ? "bg-amber-500" : ring === 3 ? "bg-purple-500" : "bg-emerald-500"}`} />
              {statusLabel}
            </span>
            <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {plan}
            </span>
          </div>

          <div className="shrink-0">
            <ScorePill score={dealScore} size="sm" />
          </div>
        </div>

        {/* Property Image Gallery with Native Lazy Loading */}
        <div className="mt-3">
          <PropertyGallery
            parcelId={deal.parcel_id}
            address={address}
            mode="compact"
            className="w-full"
          />
        </div>

        {/* Address & Meta */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onSelect(deal.parcel_id)}
            className="text-left font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 cursor-pointer"
            title={address}
          >
            {address}
          </button>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{locationLine || "Cook County, IL"}</span>
          </div>
        </div>

        {/* Key Deal Metrics: Lay Buyer Focus */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 border border-border/50 text-center">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Expected Profit</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {fmt$(expectedProfit)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Max Offer</div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {fmt$(maxOffer)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Est. ARV</div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {fmt$(arv)}
            </div>
          </div>
        </div>

        {/* Secondary Lay Indicators */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Confidence: <strong className="text-foreground">Grade {confidence}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>~{exitDays}d turnaround</span>
          </div>
        </div>

        {/* Collapsible "Why this is a deal" */}
        <div className="mt-3 border-t border-border/50 pt-2.5">
          <button
            type="button"
            onClick={() => setWhyExpanded(!whyExpanded)}
            className="flex w-full items-center justify-between py-1 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Why this deal</span>
              {discountFromArv && (
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {discountFromArv}% below ARV
                </span>
              )}
            </span>
            {whyExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>

          {whyExpanded && (
            <div className="mt-2 space-y-1.5 rounded-lg bg-card border border-border/80 p-2.5 text-xs animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Value Spread:</span>
                <span className="font-semibold text-foreground">
                  {fmt$(arv - maxOffer)} spread from estimated resale
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Downside Risk:</span>
                <span className={`font-semibold ${pLoss <= 15 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {pLoss}% loss probability
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Strategy:</span>
                <span className="font-semibold text-foreground">{plan}</span>
              </div>
              {flags.length > 0 ? (
                <div className="flex items-start gap-1 text-amber-600 dark:text-amber-400 text-[11px] pt-1">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                  <span>{flags.length} warning flag{flags.length > 1 ? "s" : ""} to verify before contract</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] pt-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Clean parcel telemetry & risk bounds</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button: "Add to my list" */}
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
        <button
          type="button"
          id={`add-to-list-btn-${deal.parcel_id}`}
          onClick={() => onToggleSave(deal)}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
            isSaved
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          }`}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="h-4 w-4" />
              <span>In My List</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              <span>Add to my list</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelect(deal.parcel_id)}
          title="Open property dossier, comp radius & satellite view"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted transition-colors cursor-pointer shrink-0"
        >
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
