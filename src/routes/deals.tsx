import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listRankedParcels, lookupParcelByAddress } from "@/lib/parcels.functions";
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
import { PageHeader } from "@/components/PageHeader";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import {
  useFirebaseAuth,
  getSavedDealsFromFirestore,
  saveDealToFirestore,
  removeSavedDealFromFirestore,
  getAuthenticatedFirebaseUser,
} from "@/integrations/firebase";
import { Bookmark, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/deals")({
  ssr: false,
  beforeLoad: async () => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (!firebaseUser) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw redirect({ to: "/auth", search: { next: "/deals" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Ranked Deals — Perfect Property Engine" },
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
  const listFn = useServerFn(listRankedParcels);
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "saved">("all");

  const q = useQuery({
    queryKey: ["ranked-all"],
    queryFn: () => listFn({ data: { limit: 500 } }),
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
      return savedList.map((saved) => {
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
          },
          computed_at: saved.updatedAt || saved.createdAt,
          skeptic_flags: [],
        };
      });
    }
    return q.data || [];
  }, [viewMode, user, q.data, savedQ.data]);

  return (
    <>
      <div id="deals-page-container" className="mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          id="deals-header"
          title="Ranked deals"
          badge="Monte Carlo Calibrated"
          sub="Every property we've scored, sorted by our overall buy score (0–100). Click any row to see the full breakdown — offer, profit, risks, comps, and AI Maps/Search Grounding."
        />

        <HelpStrip />

        {/* View mode toggle */}
        <div id="deals-view-bar" className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3.5">
          <div className="flex items-center gap-2">
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
              <span>Saved Portfolio ({savedQ.data?.length ?? 0})</span>
            </Button>
          </div>

          <div id="deals-count-indicator" className="text-[13px] text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{displayData.length}</span>{" "}
            {viewMode === "saved" ? "saved watchlist properties" : "live scored properties"}
          </div>
        </div>

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
                      onClick={() => q.refetch()}
                      className="ml-3 font-medium underline hover:text-rose-600"
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
                      onClick={() => savedQ.refetch()}
                      className="ml-3 font-medium underline hover:text-rose-600"
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              )}
              {!(viewMode === "all" ? q.isLoading : savedQ.isLoading) && displayData.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {viewMode === "saved"
                      ? "No deals saved in your Firestore portfolio yet. Click any property in the workspace or ranked list, open its Dossier, and click 'Save to Portfolio'."
                      : "No properties found matching current criteria."}
                  </td>
                </tr>
              )}
              {!(viewMode === "all" ? q.isLoading : savedQ.isLoading) && displayData.map((r: any, i: number) => {
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
                          aria-label={savedIds.has(r.parcel_id) ? "Remove from portfolio" : "Save to portfolio"}
                          title={savedIds.has(r.parcel_id) ? "In your portfolio" : "Save to portfolio"}
                          className={`rounded-md p-1.5 transition-colors shrink-0 ${
                            savedIds.has(r.parcel_id)
                              ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
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
                    <td className="num border-l border-pp-border/50 px-4 py-3 text-right">
                      {fmt$(Number(r.modeled_offer ?? r.max_allowable_offer ?? 0))}
                    </td>
                    <td className="num px-4 py-3 text-right text-pp-live font-medium">
                      {fmt$(Number(r.gross_profit ?? 0))}
                    </td>
                    <td className="num px-4 py-3 text-right text-[13px]">
                      {r.mc_profit_p50 != null ? fmt$(Number(r.mc_profit_p50)) : "—"}
                      <div className="text-[11px] text-pp-muted">
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
                  <td colSpan={11} className="px-4 py-12 text-center text-sm text-pp-muted">
                    No scored properties yet. Run the underwriter from the admin panel to generate deals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <section className="mt-10 border-t border-pp-border pt-8">
          <h2 className="text-[15px] font-semibold text-pp-text">Tools</h2>
          <p className="mt-1 text-[13px] text-pp-muted">
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
    { k: "Score", v: "0–100 buy rating. 80+ = great, 65–79 = strong, 50–64 = worth a look." },
    { k: "Our offer", v: "The price we'd pay today to hit our profit target." },
    { k: "Loss risk", v: "How often this deal loses money across thousands of simulations." },
    { k: "Deal odds", v: "How likely the seller says yes at our offer." },
  ];
  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-2xs">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        How to read this
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.k} className="text-[13px]">
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
          Add parcel by address (Realie)
        </div>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St"
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
        {busy ? "Underwriting…" : "Lookup + underwrite"}
      </Button>
      {err && <div className="w-full text-[12px] font-medium text-rose-600">{err}</div>}
    </form>
  );
}
