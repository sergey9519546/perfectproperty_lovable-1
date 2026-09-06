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
          maxBid: r.max_allowable_offer ? Number(r.max_allowable_offer) : undefined,
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
    if (viewMode === "saved" && user) {
      return (q.data || []).filter((item: any) => savedIds.has(item.parcel_id));
    }
    return q.data || [];
  }, [viewMode, user, q.data, savedIds]);

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Ranked deals"
          sub="Every property we've scored, sorted by our overall buy score (0–100). Click any row to see the full breakdown — offer, profit, risks, comps, and AI Maps/Search Grounding."
        />

        <HelpStrip />

        {/* View mode toggle */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-pp-border pb-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "all"
                  ? "bg-pp-header text-pp-text border border-pp-border"
                  : "text-pp-muted hover:text-pp-text"
              }`}
            >
              All Ranked Deals ({q.data?.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("saved")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "saved"
                  ? "bg-amber-950/40 text-amber-300 border border-amber-500/30"
                  : "text-pp-muted hover:text-pp-text"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Saved Portfolio ({savedQ.data?.length ?? 0})</span>
            </button>
          </div>

          <div className="text-[13px] text-pp-muted">
            Showing <span className="font-semibold text-pp-text">{displayData.length}</span>{" "}
            {viewMode === "saved" ? "saved watchlist properties" : "live scored properties"}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-pp-border bg-pp-page">
          <table className="w-full text-[14px]">
            <thead className="bg-pp-header text-[11px] uppercase tracking-wider text-pp-muted">
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
                <th className="border-l border-pp-border/50 px-4 py-3 text-right" title="What we'd offer the seller today.">
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
                <th className="border-l border-pp-border/50 px-4 py-3 text-right" title="Chance the deal loses money.">
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
              {q.isLoading && <TableSkeleton rows={10} columns={11} />}
              {!q.isLoading && displayData.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-pp-muted">
                    {viewMode === "saved"
                      ? "No deals saved in your Firestore portfolio yet. Click any property in the workspace or ranked list, open its Dossier, and click 'Save to Portfolio'."
                      : "No properties found matching current criteria."}
                  </td>
                </tr>
              )}
              {!q.isLoading && displayData.map((r: any, i: number) => {
                const flags = (r.skeptic_flags as string[]) ?? [];
                const pLoss = Number(r.mc_p_loss);
                return (
                  <tr
                    key={r.parcel_id}
                    onClick={() => setSelected(r.parcel_id)}
                    style={{ animationDelay: `${Math.min(i * 35, 600)}ms` }}
                    className="group cursor-pointer border-t border-pp-border transition-colors hover:bg-pp-header animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-backwards"
                  >
                    
                    <td className="sticky left-0 z-10 bg-pp-page px-4 py-3 group-hover:bg-pp-header">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{r.parcels.address}</div>
                          <div className="text-[12px] text-pp-muted">
                            {r.parcels.city}, {r.parcels.state}
                          </div>
                          <DataFreshness
                            timestamp={r.computed_at}
                            prefix="Underwritten"
                            className="mt-1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void toggleSaveDeal(r);
                          }}
                          aria-label={savedIds.has(r.parcel_id) ? "Remove from portfolio" : "Save to portfolio"}
                          title={savedIds.has(r.parcel_id) ? "In your portfolio" : "Save to portfolio"}
                          className={`rounded p-1.5 transition-colors shrink-0 ${
                            savedIds.has(r.parcel_id)
                              ? "text-amber-400 hover:bg-amber-950/40"
                              : "text-pp-faint hover:text-pp-text hover:bg-pp-surface"
                          }`}
                        >
                          <Bookmark
                            className={`h-4 w-4 ${savedIds.has(r.parcel_id) ? "fill-amber-400" : ""}`}
                          />
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <ScorePill score={Number(r.perfect_score)} />
                    </td>
                    <td className="px-4 py-3 text-[13px]">{ringLabel(r.ring)}</td>
                    <td className="px-4 py-3 text-[13px]">{r.recommended_scope}</td>
                    <td className="num border-l border-pp-border/50 px-4 py-3 text-right">{fmt$(Number(r.modeled_offer))}</td>
                    <td className="num px-4 py-3 text-right text-pp-live font-medium">
                      {fmt$(Number(r.gross_profit))}
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
    <div className="mt-4 rounded-lg border border-pp-border bg-pp-page/60 p-3">
      <div className="mb-2 text-[11px] uppercase tracking-wider text-pp-muted">
        How to read this
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.k} className="text-[13px]">
            <span className="font-medium text-pp-text">{it.k}: </span>
            <span className="text-pp-muted">{it.v}</span>
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
      const P = Number(r.modeled_offer ?? 0);
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
    <div className="mt-6 rounded-lg border border-pp-border bg-pp-page p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-pp-muted">
            Portfolio stress test
          </div>
          <div className="mt-0.5 text-[13px] text-pp-text">
            Applied across {deals.length} deals.
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {buttons.map((b) => (
            <button
              key={b.k}
              onClick={() => setKey(b.k)}
              className="rounded-md border px-2.5 py-1 text-[12px]"
              style={{
                borderColor:
                  key === b.k
                    ? "color-mix(in oklab, var(--opportunity) 45%, transparent)"
                    : "var(--pp-border)",
                background:
                  key === b.k
                    ? "color-mix(in oklab, var(--opportunity) 12%, transparent)"
                    : "var(--pp-header)",
                color: key === b.k ? "var(--opportunity)" : "var(--foreground)",
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
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
    tone === "skeptic" ? "#f43f5e" : tone === "profit" ? "#05d680" : undefined;
  return (
    <div className="rounded-md border border-pp-border bg-pp-header px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-pp-muted">{label}</div>
      <div className="num mt-0.5 text-[14px] font-semibold" style={{ color }}>
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
      className="mt-6 flex flex-wrap items-end gap-2 rounded-lg border border-pp-border bg-pp-page p-4"
    >
      <div className="flex-1 min-w-[220px]">
        <div className="text-[10px] uppercase tracking-widest text-pp-muted">
          Add parcel by address (Realie)
        </div>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St"
          className="mt-1 w-full rounded-md border border-pp-border bg-pp-header px-3 py-1.5 text-[13px] outline-none focus:border-foreground"
        />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-pp-muted">State</div>
        <input
          value={state}
          onChange={(e) => setState(e.target.value)}
          maxLength={2}
          className="mt-1 w-16 rounded-md border border-pp-border bg-pp-header px-2 py-1.5 text-[13px] uppercase outline-none focus:border-foreground"
        />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-pp-muted">
          City (optional)
        </div>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Austin"
          className="mt-1 w-40 rounded-md border border-pp-border bg-pp-header px-2 py-1.5 text-[13px] outline-none focus:border-foreground"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="rounded-md border border-pp-border bg-pp-header px-3 py-1.5 text-[12px] hover:bg-pp-page disabled:opacity-50"
      >
        {busy ? "Underwriting…" : "Lookup + underwrite"}
      </button>
      {err && <div className="w-full text-[12px] text-rose-500">{err}</div>}
    </form>
  );
}
