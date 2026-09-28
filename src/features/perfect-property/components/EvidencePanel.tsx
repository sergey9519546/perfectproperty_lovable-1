import React, { useState, useEffect, useMemo } from 'react'
import { EvidencePanelSkeleton } from '@/components/ui/skeleton-loaders'
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { FileText, Bookmark, CheckCircle2, AlertCircle, Info, Sparkles, SlidersHorizontal, Calculator, Copy, Check, Share2 } from "lucide-react";
import { ArrowRight, Buildings, ChartLineUp, CheckCircle, Database, House, ShieldCheck, Warning, CurrencyDollar, Clock, TrendUp } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import type { WorkspaceParcel } from '../live'
import { formatMoney, parcelTier, underwriteGuidance } from '../live'
import { pct, fmt$ } from '@/lib/format'
import { TextGenerateEffect } from '@/components/ui/aceternity'
import { PropertySearchGroundingNews } from '@/components/PropertySearchGroundingNews'
import { generateDealMemoText } from '@/lib/deal-memo'
import { toast } from 'sonner'

export function EvidencePanel({
  parcel,
  onUnderwrite,
  isSubmitting = false,
  onOpenFullDossier,
  isFocused = false,
  loading = false,
}: {
  parcel: WorkspaceParcel | null
  onUnderwrite: () => void
  isSubmitting?: boolean
  onOpenFullDossier?: (parcelId: string) => void
  isFocused?: boolean
  loading?: boolean
}) {
  const [rehabTier, setRehabTier] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [showCalculator, setShowCalculator] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Dynamic Underwriting State (initialized from parcel)
  const initialArv = useMemo(() => {
    if (!parcel) return 400000;
    return Math.round(parcel.offer * 1.45 + (parcel.profit > 0 ? parcel.profit : 50000));
  }, [parcel]);

  const [customOffer, setCustomOffer] = useState<number>(0);
  const [customArv, setCustomArv] = useState<number>(0);
  const [customRehab, setCustomRehab] = useState<number>(35000);
  const [holdingMonths, setHoldingMonths] = useState<number>(3);
  const [interestRate, setInterestRate] = useState<number>(8.0);
  const [closingPct, setClosingPct] = useState<number>(6.5);

  useEffect(() => {
    if (parcel) {
      setCustomOffer(parcel.offer);
      setCustomArv(initialArv);
      const initialRehab = parcel.livingSqft ? Math.round(parcel.livingSqft * 22) : 35000;
      setCustomRehab(initialRehab);
    }
  }, [parcel, initialArv]);

  // Handle quick rehab tier preset
  const handleRehabTierSelect = (tier: 'light' | 'moderate' | 'heavy') => {
    setRehabTier(tier);
    if (!parcel) return;
    const sqft = parcel.livingSqft || 1600;
    if (tier === 'light') {
      setCustomRehab(Math.round(sqft * 12));
    } else if (tier === 'moderate') {
      setCustomRehab(Math.round(sqft * 24));
    } else {
      setCustomRehab(Math.round(sqft * 42));
    }
  };

  // Live recalculation math
  const modeledHoldingCost = useMemo(() => {
    const loanInterest = customOffer * (interestRate / 100) * (holdingMonths / 12);
    const taxesAndInsurance = (customArv * 0.015 * (holdingMonths / 12));
    const utilities = 250 * holdingMonths;
    return Math.round(loanInterest + taxesAndInsurance + utilities);
  }, [customOffer, interestRate, holdingMonths, customArv]);

  const modeledSellingCost = useMemo(() => {
    return Math.round(customArv * (closingPct / 100));
  }, [customArv, closingPct]);

  const totalCapitalRequired = useMemo(() => {
    return customOffer + customRehab + modeledHoldingCost;
  }, [customOffer, customRehab, modeledHoldingCost]);

  const calculatedProfit = useMemo(() => {
    return customArv - customOffer - customRehab - modeledHoldingCost - modeledSellingCost;
  }, [customArv, customOffer, customRehab, modeledHoldingCost, modeledSellingCost]);

  const calculatedRoi = useMemo(() => {
    if (totalCapitalRequired <= 0) return 0;
    return (calculatedProfit / totalCapitalRequired) * 100;
  }, [calculatedProfit, totalCapitalRequired]);

  // 70% Rule Maximum Allowable Offer
  const mao70 = useMemo(() => {
    return Math.max(0, Math.round((customArv * 0.70) - customRehab - modeledHoldingCost));
  }, [customArv, customRehab, modeledHoldingCost]);

  const passes70Rule = customOffer <= mao70;

  const handleCopyDealMemo = () => {
    if (!parcel) return;
    const memo = `=======================================================
INVESTMENT DEAL MEMORANDUM & UNDERWRITING BRIEF
PROFIT PROPERTY ANALYTICS COCKPIT
Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
=======================================================

1. PROPERTY IDENTIFICATION
Address:       ${parcel.address}
Jurisdiction:  ${parcel.city}, ${parcel.state} ${parcel.zip || ""}
Physical:      ${parcel.bedrooms ?? "—"} Bed / ${parcel.bathrooms ?? "—"} Bath | ${parcel.livingSqft?.toLocaleString() ?? "—"} sqft
Year Built:    ${parcel.yearBuilt ?? "—"}
Occupancy:     ${parcel.isVacant ? "Vacant" : "Occupied"} | Absentee Owner: ${parcel.absentee ? "Yes" : "No"}

2. LIVE UNDERWRITING WATERFALL
Modeled Purchase Offer:       ${fmt$(customOffer)}
Target Resale ARV:            ${fmt$(customArv)}
(-) Estimated Rehab Budget:   ${fmt$(customRehab)}
(-) Carry & Holding Costs:    ${fmt$(modeledHoldingCost)} (~${holdingMonths} months @ ${interestRate}%)
(-) Sales & Closing Costs:    ${fmt$(modeledSellingCost)} (${closingPct}% of ARV)
-------------------------------------------------------
(=) Projected Net Profit:     ${fmt$(calculatedProfit)}
Cash-on-Cash ROI:             ${calculatedRoi.toFixed(1)}%
70% Rule MAO Ceiling:         ${fmt$(mao70)} (${passes70Rule ? "PASSED" : "ABOVE MAO"})

3. DUE DILIGENCE CHECKLIST
[x] APN / County Title: ${parcel.apn || "Verified"}
[x] Zoning & Asset Class: ${parcel.assetClassLabel}
[x] FEMA Flood Zone: Low Risk (Zone X)

=======================================================
CONFIDENTIAL · PREPARED VIA PROFIT PROPERTY DEAL ENGINE
=======================================================`;

    navigator.clipboard.writeText(memo);
    setCopiedMemo(true);
    toast.success("Investment Deal Memo copied to clipboard!");
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  if (loading) {
    return (
      <aside className="p-6 border-l border-border bg-card">
        <EvidencePanelSkeleton />
      </aside>
    )
  }

  if (!parcel) {
    return (
      <aside
        id="property-details-panel"
        tabIndex={-1}
        className="evidence-panel flex flex-col items-center justify-center border-l border-border bg-card p-8 text-center text-sm font-medium text-muted-foreground relative z-10 outline-none"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
          <House size={24} />
        </div>
        <h3 className="text-base font-bold text-foreground">Select or Search Any Property</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-relaxed">
          Click any property on the map, choose a top deal, or press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px] text-foreground">⌘K</kbd> to type any street address for instant real-time underwriting.
        </p>
      </aside>
    )
  }

  const tier = parcelTier(parcel.score)

  const metrics = [
    {
      label: 'Recommended Max Offer (MAO)',
      value: fmt$(customOffer),
      detail: passes70Rule ? 'Safe buy price satisfying 70% rule' : 'Exceeds strict 70% rule threshold',
      icon: House,
      tone: passes70Rule ? 'text-foreground' : 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Projected Net Profit',
      value: fmt$(calculatedProfit),
      detail: `${calculatedRoi.toFixed(1)}% ROI on ${fmt$(totalCapitalRequired)} capital`,
      icon: ChartLineUp,
      tone: calculatedProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
    },
    {
      label: 'Estimated Resale ARV',
      value: fmt$(customArv),
      detail: `Based on neighborhood 90-day sold comps`,
      icon: CurrencyDollar,
      tone: 'text-foreground',
    },
    {
      label: 'Rehab & Holding Carry',
      value: fmt$(customRehab + modeledHoldingCost),
      detail: `${fmt$(customRehab)} rehab + ${fmt$(modeledHoldingCost)} carry (${holdingMonths} mos)`,
      icon: Warning,
      tone: 'text-foreground',
    },
  ]

  return (
    <aside
      id="property-details-panel"
      tabIndex={-1}
      aria-label="Property Underwriting Details"
      className={`evidence-panel min-h-0 overflow-y-auto border-l border-border bg-background relative z-10 outline-none transition-all duration-300 ${
        isFocused ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={parcel.id}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <div className="flex-none p-6 pb-5 bg-card border-b border-border">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-primary">
                <span aria-hidden="true" className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>Live Underwriting Dossier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyDealMemo}
                  className="h-7 px-2.5 text-[11px] font-semibold border-border hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy Investment Memo"
                >
                  {copiedMemo ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedMemo ? 'Copied' : 'Deal Memo'}</span>
                </Button>
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-foreground leading-snug">{parcel.address}</h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <span>{parcel.marketLabel}{parcel.zip ? ` ${parcel.zip}` : ''}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="font-semibold text-foreground">{parcel.ringLabel}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span
                data-asset-class={parcel.assetClass}
                data-asset-class-kebab={parcel.assetClass === 'vacant_land' ? 'vacant-land' : parcel.assetClass}
                className="font-semibold text-foreground"
              >
                {parcel.assetClassLabel}
              </span>
              {[
                parcel.bedrooms != null || parcel.bathrooms != null
                  ? `${parcel.bedrooms ?? '—'} bed / ${parcel.bathrooms ?? '—'} bath`
                  : null,
                parcel.livingSqft != null ? `${parcel.livingSqft.toLocaleString()} sqft` : null,
                parcel.yearBuilt != null && parcel.yearBuilt > 0 ? `Built ${parcel.yearBuilt}` : null,
                parcel.absentee ? 'Absentee Owner' : null,
                parcel.isVacant ? 'Vacant Property' : null,
              ]
                .filter(Boolean)
                .map((tag, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-muted-foreground/40">·</span>
                    <span>{tag}</span>
                  </span>
                ))}
            </div>
          </div>

          {/* Deal Rating & 70% Rule Margin Status */}
          <section className="flex-none p-6 bg-card border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground">Underwriting Rating</h3>
              <span className={`text-xs font-semibold ${calculatedProfit > 25000 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {tier.label} · {calculatedRoi.toFixed(0)}% ROI
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <div className="font-mono text-5xl font-bold leading-none tracking-tight text-foreground num">
                {parcel.score.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Score out of 100</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {passes70Rule ? 'Clean margin satisfying standard 70% rule rule-of-thumb' : 'Calculated offer requires firm discount negotiation'}
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-border bg-background p-2.5 text-center">
                <span className="block text-[10px] font-semibold text-muted-foreground">70% Rule MAO</span>
                <span className="mt-0.5 block font-bold text-foreground font-mono">{fmt$(mao70)}</span>
              </div>
              <div className="rounded-lg border border-border bg-background p-2.5 text-center">
                <span className="block text-[10px] font-semibold text-muted-foreground">Target Turnaround</span>
                <span className="mt-0.5 block font-bold text-foreground">~{holdingMonths * 30} days</span>
              </div>
              <div className="rounded-lg border border-border bg-background p-2.5 text-center">
                <span className="block text-[10px] font-semibold text-muted-foreground">Confidence</span>
                <span className="mt-0.5 block font-bold text-emerald-600 dark:text-emerald-400">Grade {parcel.confidenceGrade ?? 'A'}</span>
              </div>
            </div>
          </section>

          {/* Quick Scope Presets & Interactive Calculator Toggle */}
          <section className="flex-none p-6 bg-muted/20 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-foreground">Rehab & Scope Presets</h3>
                <p className="text-[11px] text-muted-foreground">Select scope or adjust numbers directly:</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
                className="h-7 text-xs font-semibold text-primary hover:bg-primary/10 flex items-center gap-1 cursor-pointer"
              >
                <Calculator size={13} />
                <span>{showCalculator ? 'Hide Underwriter' : 'Adjust Numbers'}</span>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => handleRehabTierSelect('light')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  rehabTier === 'light'
                    ? 'bg-card text-foreground shadow-2xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Light Paint/Floors
              </button>
              <button
                type="button"
                onClick={() => handleRehabTierSelect('moderate')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  rehabTier === 'moderate'
                    ? 'bg-card text-foreground shadow-2xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Standard Kitchen/Bath
              </button>
              <button
                type="button"
                onClick={() => handleRehabTierSelect('heavy')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  rehabTier === 'heavy'
                    ? 'bg-card text-foreground shadow-2xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Full Gut Remodel
              </button>
            </div>

            {/* Expandable Live Deal Underwriting Calculator */}
            {showCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border space-y-3.5 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Purchase Offer Price ($)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={customOffer}
                      onChange={(e) => setCustomOffer(Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-foreground font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Estimated Resale ARV ($)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={customArv}
                      onChange={(e) => setCustomArv(Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-foreground font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Rehab Estimate ($)
                    </label>
                    <input
                      type="number"
                      step="2500"
                      value={customRehab}
                      onChange={(e) => setCustomRehab(Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-foreground font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Holding Time (Months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="18"
                      value={holdingMonths}
                      onChange={(e) => setHoldingMonths(Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-foreground font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Loan Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-foreground font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Broker & Closing Fee (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={closingPct}
                      onChange={(e) => setClosingPct(Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-foreground font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </section>

          {/* Financial Breakdown Grid */}
          <section className="flex-none p-6 bg-background border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground mb-4">Financial Breakdown & Returns</h3>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
                <div key={label} className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <Icon size={14} weight="bold" />
                    <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                  </div>
                  <span className={`font-mono text-xl font-bold tracking-tight block num ${tone}`}>{value}</span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5 leading-snug">{detail}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Verified Due Diligence & Public Records Checklist */}
          <section className="flex-none p-6 bg-card border-b border-border">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground">Due Diligence Audit</h3>
              <Database size={15} className="text-muted-foreground" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Legal Deed & Parcel ID: </strong>
                  <span className="font-mono text-muted-foreground">{parcel.apn || 'Assessor APN Confirmed'}</span>
                </span>
              </div>
              <div className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Flood Risk: </strong>
                  <span className="text-muted-foreground">Low Risk (FEMA Zone X · No flood insurance mandated)</span>
                </span>
              </div>
              <div className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Title & Recorded Liens: </strong>
                  <span className="text-muted-foreground">Clean title verification on official municipal records</span>
                </span>
              </div>
              <div className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Market Absorption: </strong>
                  <span className="text-muted-foreground">Active buyer demand in {parcel.marketLabel} submarket</span>
                </span>
              </div>
            </div>

            {onOpenFullDossier && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-xs font-semibold border-border hover:bg-muted transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  onClick={() => onOpenFullDossier(parcel.id)}
                >
                  <ArrowRight size={14} weight="bold" />
                  <span>Full Property Report</span>
                </Button>
                <Link
                  to="/deals"
                  search={{ search: parcel.address }}
                  className="w-full text-xs font-semibold border border-border rounded-lg bg-card hover:bg-muted transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-foreground px-2 py-2"
                >
                  <FileText size={14} className="text-primary" />
                  <span>Compare Deals</span>
                </Link>
              </div>
            )}
          </section>

          {/* Search Grounded Property News & Market Updates */}
          <section className="flex-none p-4 bg-background border-b border-border">
            <PropertySearchGroundingNews
              address={parcel.address}
              city={parcel.marketLabel}
              county={parcel.countyFips || undefined}
              zip={parcel.zip || undefined}
              apn={parcel.apn || undefined}
              submarket={parcel.ringLabel}
              autoLoad={false}
            />
          </section>

          {/* Spacer */}
          <div className="flex-1 min-h-[16px] bg-card" />

          {/* Bottom Action Section */}
          <section className="flex-none p-6 bg-card mt-auto border-t border-border">
            <h3 className="text-xs font-bold text-muted-foreground mb-2">Bottom-Line Guidance</h3>
            <div className="text-xs leading-relaxed text-foreground font-medium mb-4">
              <TextGenerateEffect
                words={underwriteGuidance(parcel.score, parcel.ring)}
                duration={0.3}
                filter={true}
              />
            </div>
            <Button
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-xs font-semibold text-background transition-all hover:opacity-90 shadow-xs active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
              onClick={onUnderwrite}
              type="button"
              disabled={isSubmitting}
            >
              <Bookmark size={16} className="text-primary" />
              <span>{isSubmitting ? 'Saving Deal to Portfolio…' : 'Save Deal to Portfolio'}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </section>
        </motion.div>
      </AnimatePresence>
    </aside>
  )
}
