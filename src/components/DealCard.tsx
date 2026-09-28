import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { fmt$, ringLabel, tierLabel } from "@/lib/format";
import { ScorePill } from "@/components/ScorePill";
import { PropertyGallery } from "@/components/PropertyGallery";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Map,
  Gavel,
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
  const parcelId = deal.parcel_id || deal.id;

  return (
    <div
      id={`deal-card-${parcelId}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md"
    >
      {/* Top Header: Unboxed metadata + Score per Zero-Pill discipline */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1 text-foreground">
              <span
                className={`h-2 w-2 rounded-full ${
                  ring === 2 ? "bg-amber-500" : ring === 3 ? "bg-purple-500" : "bg-emerald-500"
                }`}
              />
              {statusLabel}
            </span>
            <span aria-hidden="true" className="text-muted-foreground/60">·</span>
            <span>{plan}</span>
            {flags.length > 0 && (
              <>
                <span aria-hidden="true" className="text-muted-foreground/60">·</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{flags.length} flag{flags.length > 1 ? "s" : ""}</span>
              </>
            )}
          </div>

          <div className="shrink-0">
            <ScorePill score={dealScore} size="sm" />
          </div>
        </div>

        {/* Property Image Gallery with Native Lazy Loading */}
        <div className="mt-3">
          <PropertyGallery
            parcelId={parcelId}
            address={address}
            mode="compact"
            className="w-full"
          />
        </div>

        {/* Address & Meta */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onSelect(parcelId)}
            className="text-left font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            title={address}
          >
            {address}
          </button>
          <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground mt-0.5">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{locationLine || "Cook County, IL"}</span>
            </div>
            {deal.parcels?.living_sqft && (
              <span className="shrink-0 num font-mono text-[11px]">
                {Number(deal.parcels.living_sqft).toLocaleString()} sqft
              </span>
            )}
          </div>
        </div>

        {/* Key Deal Metrics: Plain English & User-Friendly */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 border border-border/50 text-center">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Estimated Profit</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 num">
              {fmt$(expectedProfit)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Max Safe Offer</div>
            <div className="text-sm font-bold text-foreground mt-0.5 num">
              {fmt$(maxOffer)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Resale Value</div>
            <div className="text-sm font-bold text-foreground mt-0.5 num">
              {fmt$(arv)}
            </div>
          </div>
        </div>

        {/* Secondary Unboxed Indicators with Typographic Separators */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-0.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Accuracy: <strong className="text-foreground">Grade {confidence}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>~{exitDays} days to flip</span>
          </div>
        </div>

        {/* Collapsible "Why this is a deal" */}
        <div className="mt-3 border-t border-border/50 pt-2.5">
          <button
            type="button"
            onClick={() => setWhyExpanded(!whyExpanded)}
            className="flex w-full items-center justify-between py-1 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Why This is a Deal</span>
              {discountFromArv && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ({discountFromArv}% below market)
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
                <span>Total Value Margin:</span>
                <span className="font-semibold text-foreground num">
                  {fmt$(arv - maxOffer)} below estimated resale
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Risk of Loss:</span>
                <span className={`font-semibold ${pLoss <= 15 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {pLoss <= 15 ? `Low risk (${pLoss}% chance)` : `Moderate risk (${pLoss}% chance)`}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Recommended Work:</span>
                <span className="font-semibold text-foreground">{plan}</span>
              </div>
              {flags.length > 0 ? (
                <div className="flex items-start gap-1 text-amber-600 dark:text-amber-400 text-[11px] pt-1 border-t border-border/40">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                  <span>{flags.length} warning item{flags.length > 1 ? "s" : ""} to verify before submitting an offer</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] pt-1 border-t border-border/40">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Clean property checks & safe pricing margins</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Buttons & Quick Cadastral Links */}
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
        <button
          type="button"
          id={`add-to-list-btn-${parcelId}`}
          onClick={() => onToggleSave(deal)}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isSaved
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
              : "bg-foreground text-background hover:bg-foreground/90 shadow-2xs"
          }`}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="h-3.5 w-3.5" />
              <span>In My List</span>
            </>
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5" />
              <span>Add to my list</span>
            </>
          )}
        </button>

        <Link
          to="/workspace"
          search={{ parcelId }}
          title="View lot lines & comps on Property Map"
          aria-label="View on Property Map"
          className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Map className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={() => onSelect(parcelId)}
          title="Open full property report & numbers"
          aria-label="Open full property report"
          className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
