import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDossier } from "@/lib/parcels.functions";
import { fmt$, pct, tierLabel } from "@/lib/format";
import { X, TrendUp, Warning, Buildings, Scroll, Lightning, Pulse, ShieldCheck, Lock, Check, Bookmark } from "@phosphor-icons/react";
import { DataFreshness } from "@/components/DataFreshness";
import { WhyThisScorePanel } from "@/components/WhyThisScorePanel";
import { ParcelMiniMap } from "@/components/ParcelMiniMap";
import { GroundedIntelligenceSection } from "@/components/GroundedIntelligenceSection";
import {
  useFirebaseAuth,
  saveDealToFirestore,
  removeSavedDealFromFirestore,
  getSavedDealsFromFirestore,
} from "@/integrations/firebase";
import { toast } from "sonner";


interface Props {
  parcelId: string | null;
  onClose: () => void;
}

export function DossierPanel({ parcelId, onClose }: Props) {
  const fetchDossier = useServerFn(getDossier);
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const q = useQuery({
    queryKey: ["dossier", parcelId],
    queryFn: () => fetchDossier({ data: { parcel_id: parcelId! } }),
    enabled: !!parcelId,
  });

  const savedQ = useQuery({
    queryKey: ["saved-deals", user?.uid],
    queryFn: () => (user ? getSavedDealsFromFirestore(user.uid) : Promise.resolve([])),
    enabled: !!user,
  });

  const isSaved = !!(parcelId && savedQ.data?.some((d) => d.parcelId === parcelId));

  const handleToggleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save this property to your portfolio.");
      return;
    }
    if (!parcelId || !q.data?.parcel) return;

    setIsSaving(true);
    try {
      if (isSaved) {
        await removeSavedDealFromFirestore(user.uid, parcelId);
        toast.success("Removed from portfolio");
      } else {
        const p = q.data.parcel;
        const s = q.data.score;
        await saveDealToFirestore(user.uid, {
          id: parcelId,
          parcelId,
          address: p.address,
          county: p.county_fips || undefined,
          state: p.state || undefined,
          arv: s?.full_reno_arv ? Number(s.full_reno_arv) : undefined,
          maxBid: s?.max_allowable_offer ? Number(s.max_allowable_offer) : undefined,
          predictedSpread: s?.gross_profit ? Number(s.gross_profit) : undefined,
          underwriteStatus: "underwritten",
          starred: true,
        });
        toast.success("Saved to portfolio");
      }
      await queryClient.invalidateQueries({ queryKey: ["saved-deals", user.uid] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update portfolio");
    } finally {
      setIsSaving(false);
    }
  };

  // Focus management + ESC handler — the panel is a modal dialog while open.
  useLayoutEffect(() => {
    if (!parcelId) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Move focus into the panel on open.
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(t);
      // Restore focus to the trigger on close.
      previouslyFocused?.focus?.();
    };
  }, [parcelId]);

  useEffect(() => {
    if (!parcelId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Simple focus trap within the panel.
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [parcelId, onClose]);

  if (!parcelId) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close dossier backdrop"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] max-md:bg-black/60"
        onClick={onClose}
      />
      <aside
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-heading"
      tabIndex={-1}
      className="pointer-events-auto fixed top-0 bottom-0 right-0 z-50 flex w-full max-w-[520px] flex-col overflow-hidden border-l border-pp-border-strong bg-pp-page shadow-[0_24px_80px_-20px_rgba(0,0,0,0.6)] animate-in slide-in-from-right duration-300 max-md:max-w-none"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-pp-border bg-pp-page px-5 py-3">
        <div className="flex items-center gap-3">
          <h2 id="dossier-heading" className="text-[11px] font-medium uppercase tracking-widest text-pp-muted">Dossier</h2>
          {q.data?.parcel && (
            <button
              type="button"
              onClick={handleToggleSave}
              disabled={isSaving}
              aria-label={isSaved ? "Remove from saved portfolio" : "Save property to portfolio"}
              className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                isSaved
                  ? "border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-950/60"
                  : "border-pp-border bg-pp-surface text-pp-muted hover:border-pp-border-strong hover:text-pp-text"
              }`}
            >
              <Bookmark size={13} weight={isSaved ? "fill" : "bold"} />
              <span>{isSaving ? "Saving..." : isSaved ? "In Portfolio" : "Save to Portfolio"}</span>
            </button>
          )}
        </div>
        <button ref={closeRef} onClick={onClose} aria-label="Close dossier" className="rounded-md p-1.5 text-pp-muted transition-colors hover:bg-pp-header hover:text-pp-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <X className="h-4 w-4" />
        </button>
      </div>

      {q.isLoading && (
        <div className="space-y-3 p-6" aria-live="polite" aria-busy="true">
          <div className="skeleton h-4 w-1/2 rounded-sm" />
          <div className="skeleton h-3 w-2/3 rounded-sm" />
          <div className="skeleton h-3 w-1/2 rounded-sm" />
          <div className="skeleton h-20 w-full rounded-md" />
          <div className="skeleton h-3 w-full rounded-sm" />
          <div className="skeleton h-3 w-4/5 rounded-sm" />
        </div>
      )}

      {q.data && (
        <div className="space-y-6 overflow-y-auto p-5">
          <Header
            d={q.data}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            isSaving={isSaving}
          />
          <ScoreStrip d={q.data} />
          {parcelId && <WhyThisScorePanel parcelId={parcelId} />}
          {parcelId && q.data.parcel && (
            <GroundedIntelligenceSection
              parcelId={parcelId}
              address={q.data.parcel.address || ""}
              city={q.data.parcel.city || undefined}
              county={q.data.parcel.county_fips || undefined}
              state={q.data.parcel.state || undefined}
              lat={q.data.parcel.lat ?? undefined}
              lng={q.data.parcel.lng ?? undefined}
              apn={q.data.parcel.apn || undefined}
              arv={q.data.score ? Number(q.data.score.full_reno_arv) : undefined}
              maxBid={q.data.score ? Number(q.data.score.max_allowable_offer) : undefined}
            />
          )}
          <ValueLadder d={q.data} />
          <MonteCarloBlock d={q.data} />
          <V12RiskBlock d={q.data} />
          <CreditBlock d={q.data} />
          <GatesBlock d={q.data} />
          <OfferCurve d={q.data} />
          <ExitForecast d={q.data} />
          <SkepticBlock d={q.data} />
          <TransactionHistory d={q.data} />
          <DistressLog d={q.data} />
          <Verdict d={q.data} />
        </div>
      )}
    </aside>
    </>
  );
}

type D = Awaited<ReturnType<typeof getDossier>>;

function Header({
  d,
  isSaved,
  onToggleSave,
  isSaving,
}: {
  d: D;
  isSaved?: boolean;
  onToggleSave?: () => void;
  isSaving?: boolean;
}) {
  const p = d.parcel;
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold leading-tight">{p.address}</div>
          <div className="text-sm text-pp-muted">{p.city}, {p.state} {p.zip}</div>
          <DataFreshness timestamp={d.score?.computed_at} prefix="Underwritten" className="mt-1" />
        </div>
        {onToggleSave && (
          <button
            type="button"
            onClick={onToggleSave}
            disabled={isSaving}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              isSaved
                ? "border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-950/60"
                : "border-pp-border bg-pp-surface text-pp-text hover:bg-pp-surface-raised hover:border-pp-border-strong"
            }`}
          >
            <Bookmark size={14} weight={isSaved ? "fill" : "bold"} />
            <span>{isSaving ? "Saving..." : isSaved ? "In Portfolio" : "Save to Portfolio"}</span>
          </button>
        )}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-[11px] text-pp-muted">

        <Cell label="Beds/Ba" value={`${p.bedrooms ?? "—"}/${p.bathrooms ?? "—"}`} />
        <Cell label="Sqft" value={<span className="num">{p.living_sqft?.toLocaleString() ?? "—"}</span>} />
        <Cell label="Built" value={<span className="num">{p.year_built ?? "—"}</span>} />
        <Cell label="Cond" value={p.condition_grade ?? "—"} />
      </div>
      {p.lat != null && p.lng != null && (
        <div className="mt-3">
          <ParcelMiniMap lat={p.lat} lng={p.lng} address={p.address} />
        </div>
      )}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-pp-border bg-pp-header px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider">{label}</div>
      <div className="text-[13px] text-pp-text">{value}</div>
    </div>
  );
}

function ScoreStrip({ d }: { d: D }) {
  const s = d.score;
  if (!s) return <div className="text-sm text-pp-muted">No score computed yet.</div>;
  const tier = tierLabel(Number(s.perfect_score));
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-2 rounded-lg border border-pp-border bg-pp-header p-4">
        <div className="text-[10px] uppercase tracking-widest text-pp-muted">Perfect Score</div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="num text-4xl font-semibold" style={{ color: tier.color }}>{s.perfect_score}</div>
          <div className="text-xs" style={{ color: tier.color }}>{tier.label}</div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-pp-muted">
          <span>Confidence <span className="num text-pp-text">{s.confidence_grade}</span></span>
          <span>·</span>
          <span>Ring <span className="num text-pp-text">{s.ring}</span></span>
          <span>·</span>
          <span>Scope <span className="text-pp-text">{s.recommended_scope}</span></span>
        </div>
      </div>
      <div className="rounded-lg border border-pp-border bg-pp-header p-4">
        <div className="text-[10px] uppercase tracking-widest text-pp-muted">Risk-Adj. Profit</div>
        <div className="num mt-1 text-2xl font-semibold text-pp-live">{fmt$(Number(s.risk_adjusted_profit))}</div>
        <div className="mt-1 text-[11px] text-pp-muted">Gross <span className="num text-pp-text">{fmt$(Number(s.gross_profit))}</span></div>
      </div>
    </div>
  );
}

function ValueLadder({ d }: { d: D }) {
  const s = d.score; if (!s) return null;
  const rungs = [
    { label: "As-Is", value: Number(s.as_is_value) },
    { label: "Cosmetic ARV", value: Number(s.cosmetic_arv) },
    { label: "Full Reno ARV", value: Number(s.full_reno_arv) },
    { label: "Expanded ARV", value: Number(s.expanded_arv) },
  ];
  const max = Math.max(...rungs.map((r) => r.value));
  const arvSource = (s as any).arv_source ?? "HEURISTIC";
  const compCount = Number((s as any).comp_count ?? 0);
  const comps = ((s as any).comps_used as any[]) ?? [];
  return (
    <section>
      <SectionHead icon={<Buildings className="h-3.5 w-3.5" />} title="Value Ladder" />
      <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-widest">
        <span className="rounded-full px-2 py-0.5" style={{
          color: arvSource === "COMPS" ? "#05d680" : "var(--pp-muted)",
          backgroundColor: arvSource === "COMPS" ? "color-mix(in oklab, #05d680 15%, transparent)" : "var(--pp-header)",
        }}>
          {arvSource === "COMPS" ? `ARV from ${compCount} real comps` : "ARV from heuristic (no comps yet)"}
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        {rungs.map((r) => {
          const isRec = (s.recommended_scope === "COSMETIC" && r.label === "Cosmetic ARV") ||
            (s.recommended_scope === "FULL" && r.label === "Full Reno ARV") ||
            (s.recommended_scope === "EXPANDED" && r.label === "Expanded ARV");
          return (
            <div key={r.label} className="flex items-center gap-3">
              <div className="w-28 text-[11px] text-pp-muted">{r.label}</div>
              <div className="relative h-6 flex-1 overflow-hidden rounded-sm bg-pp-header">
                <div className="h-full" style={{
                  width: `${(r.value / max) * 100}%`,
                  background: isRec ? "var(--opportunity)" : "var(--pp-surface)",
                }} />
              </div>
              <div className="num w-24 text-right text-[12px]">{fmt$(r.value)}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <MiniStat label="Reno" v={fmt$(Number(s.reno_cost))} />
        <MiniStat label="Carry" v={fmt$(Number(s.carry_cost))} />
        <MiniStat label="Selling" v={fmt$(Number(s.selling_cost))} />
      </div>
      {comps.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-widest text-pp-muted">Comps used</div>
          <div className="mt-1 overflow-hidden rounded-md border border-pp-border">
            <table className="w-full text-[11px]">
              <thead className="bg-pp-header text-pp-muted">
                <tr>
                  <th className="px-2 py-1 text-left">Address</th>
                  <th className="px-2 py-1 text-right">Sold</th>
                  <th className="px-2 py-1 text-right">Price</th>
                  <th className="px-2 py-1 text-right">$/sf</th>
                  <th className="px-2 py-1 text-right">Dist</th>
                </tr>
              </thead>
              <tbody>
                {comps.slice(0, 8).map((c: any, i: number) => (
                  <tr key={c.sale_id ?? i} className="border-t border-pp-border">
                    <td className="truncate px-2 py-1">{c.address ?? "—"}</td>
                    <td className="num px-2 py-1 text-right text-pp-muted">{String(c.sold_at ?? "").slice(0, 7)}</td>
                    <td className="num px-2 py-1 text-right">{fmt$(Number(c.sale_price))}</td>
                    <td className="num px-2 py-1 text-right">${Math.round(Number(c.ppsf))}</td>
                    <td className="num px-2 py-1 text-right text-pp-muted">{Number(c.distance_km).toFixed(2)}km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function OfferCurve({ d }: { d: D }) {
  const s = d.score; if (!s) return null;
  // Rebuild the offer curve from the modeled offer (simple derived view)
  const offer = Number(s.modeled_offer);
  const arv = Number(s.recommended_scope === "COSMETIC" ? s.cosmetic_arv : s.recommended_scope === "FULL" ? s.full_reno_arv : s.expanded_arv);
  const reno = Number(s.reno_cost); const carry = Number(s.carry_cost); const sell = Number(s.selling_cost);
  const base = Number(s.acquisition_probability);
  const rows = [-0.08, -0.04, 0, 0.05, 0.1].map((delta) => {
    const o = Math.round(offer * (1 + delta));
    const p = Math.round(arv - o - reno - carry - sell);
    const pr = Math.min(0.98, Math.max(0.02, base * (1 + delta * 3)));
    return { offer: o, profit: p, prob: pr, delta };
  });
  return (
    <section>
      <SectionHead icon={<TrendUp className="h-3.5 w-3.5" />} title="Offer Curve — where three curves cross" />
      <div className="mt-2 overflow-hidden rounded-md border border-pp-border">
        <table className="w-full text-[12px]">
          <thead className="bg-pp-header text-[10px] uppercase tracking-wider text-pp-muted">
            <tr>
              <th className="px-3 py-2 text-left">Offer</th>
              <th className="px-3 py-2 text-right">Profit</th>
              <th className="px-3 py-2 text-right">P(accept)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.delta === 0 ? "bg-pp-header/60" : ""}>
                <td className="num border-t border-pp-border px-3 py-2">{fmt$(r.offer)}</td>
                <td className="num border-t border-pp-border px-3 py-2 text-right" style={{ color: r.profit > 0 ? "#05d680" : "#f43f5e" }}>{fmt$(r.profit)}</td>
                <td className="num border-t border-pp-border px-3 py-2 text-right">{pct(r.prob)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MonteCarloBlock({ d }: { d: D }) {
  const s: any = d.score; if (!s) return null;
  const p5 = Number(s.mc_profit_p5 ?? NaN);
  const p50 = Number(s.mc_profit_p50 ?? NaN);
  const p95 = Number(s.mc_profit_p95 ?? NaN);
  const pLoss = Number(s.mc_p_loss ?? NaN);
  const cvar = Number(s.mc_cvar_loss ?? NaN);
  const er = Number(s.exceedance_rank ?? NaN);
  const sigma = Number(s.sigma_arv_log ?? NaN);
  const drift = Number(s.drift_used_monthly ?? NaN);
  const dqr = s.mc_dqr;
  if (!Number.isFinite(p50)) return null;

  const min = Math.min(p5, 0), max = Math.max(p95, 0);
  const span = Math.max(max - min, 1);
  const zero = ((0 - min) / span) * 100;
  const barL = ((p5 - min) / span) * 100;
  const barR = ((p95 - min) / span) * 100;
  const medX = ((p50 - min) / span) * 100;
  const lossColor = pLoss > 0.35 ? "#f43f5e" : pLoss > 0.15 ? "var(--opportunity)" : "#05d680";

  return (
    <section>
      <SectionHead icon={<Pulse className="h-3.5 w-3.5" />} title="Monte Carlo — 800 draws" />
      <div className="mt-2 rounded-lg border border-pp-border bg-pp-header p-3">
        <div className="relative h-8 rounded bg-pp-surface" style={{ backgroundColor: "var(--pp-surface)" }}>
          <div className="absolute h-full opacity-60" style={{
            left: `${barL}%`, width: `${Math.max(barR - barL, 1)}%`,
            background: "linear-gradient(90deg, #f43f5e, var(--opportunity), #05d680)",
            borderRadius: 3,
          }} />
          <div className="absolute top-0 h-full w-px bg-foreground/70" style={{ left: `${zero}%` }} title="break-even" />
          <div className="absolute -top-1 h-10 w-0.5 bg-foreground" style={{ left: `${medX}%` }} title={`P50 ${fmt$(p50)}`} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <MiniStat label="P5" v={<span className="num" style={{ color: p5 < 0 ? "#f43f5e" : "var(--foreground)" }}>{fmt$(p5)}</span>} />
          <MiniStat label="P50" v={<span className="num">{fmt$(p50)}</span>} />
          <MiniStat label="P95" v={<span className="num text-pp-live">{fmt$(p95)}</span>} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <MiniStat label="P(loss)" v={<span className="num" style={{ color: lossColor }}>{Number.isFinite(pLoss) ? pct(pLoss) : "—"}</span>} />
          <MiniStat label="CVaR(5%)" v={<span className="num" style={{ color: cvar > 0 ? "#f43f5e" : "var(--foreground)" }}>{Number.isFinite(cvar) ? fmt$(cvar) : "—"}</span>} />
          <MiniStat label="Exceed. rank" v={<span className="num">{Number.isFinite(er) ? pct(er) : "—"}</span>} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <MiniStat label="σ ARV (log)" v={<span className="num">{Number.isFinite(sigma) ? sigma.toFixed(2) : "—"}</span>} />
          <MiniStat label="Drift/mo" v={<span className="num">{Number.isFinite(drift) ? `${(drift * 100).toFixed(2)}%` : "—"}</span>} />
          <MiniStat label="DQR" v={<span className="num">{dqr != null ? Number(dqr).toFixed(2) : "—"}</span>} />
        </div>
      </div>
    </section>
  );
}

function ExitForecast({ d }: { d: D }) {
  const s = d.score; if (!s) return null;
  return (
    <section>
      <SectionHead icon={<Lightning className="h-3.5 w-3.5" />} title="Exit Velocity" />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <MiniStat label="Days on market (renovated)" v={<span className="num">{s.exit_days}</span>} />
        <MiniStat label="Exit confidence" v={pct(Number(s.exit_confidence))} />
      </div>
    </section>
  );
}

function SkepticBlock({ d }: { d: D }) {
  const s = d.score; if (!s) return null;
  const flags = (s.skeptic_flags as string[]) ?? [];
  if (flags.length === 0) return (
    <section>
      <SectionHead icon={<Warning className="h-3.5 w-3.5" />} title="Skeptic report" />
      <div className="mt-2 rounded-md border border-pp-border bg-pp-header px-3 py-2 text-[12px] text-pp-muted">No red flags surfaced. Standard due diligence still required.</div>
    </section>
  );
  return (
    <section>
      <SectionHead icon={<Warning className="h-3.5 w-3.5" />} title="Skeptic report" />
      <ul className="mt-2 space-y-1.5">
        {flags.map((f, i) => (
          <li key={i} className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/8 px-3 py-2 text-[12px] text-pp-text" style={{ backgroundColor: "color-mix(in oklab, #f43f5e 10%, transparent)", borderColor: "color-mix(in oklab, #f43f5e 40%, transparent)" }}>
            <Warning className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-rose-500" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TransactionHistory({ d }: { d: D }) {
  return (
    <section>
      <SectionHead icon={<Scroll className="h-3.5 w-3.5" />} title={`Transaction bloodline (${d.deeds.length})`} />
      <div className="mt-2 space-y-1">
        {d.deeds.length === 0 && <div className="text-[12px] text-pp-muted">No recorded deeds in the genome.</div>}
        {d.deeds.map((x: any) => (
          <div key={x.id} className="flex items-center justify-between rounded-md border border-pp-border bg-pp-header px-3 py-2 text-[12px]">
            <span className="num text-pp-muted">{x.recorded_at}</span>
            <span className="text-[11px] uppercase text-pp-muted">{x.deed_type}</span>
            <span className="num text-pp-text">{x.sale_price ? fmt$(Number(x.sale_price)) : "—"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DistressLog({ d }: { d: D }) {
  if (d.distress.length === 0) return null;
  return (
    <section>
      <SectionHead icon={<Warning className="h-3.5 w-3.5" />} title={`Legal weather (${d.distress.length})`} />
      <div className="mt-2 space-y-1">
        {d.distress.map((x: any) => (
          <div key={x.id} className="rounded-md border px-3 py-2 text-[12px]" style={{ backgroundColor: "color-mix(in oklab, var(--shadow-ring) 8%, transparent)", borderColor: "color-mix(in oklab, var(--shadow-ring) 30%, transparent)" }}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-pp-text">{x.event_type.replace(/_/g, " ")}</span>
              <span className="num text-pp-muted">{x.event_date}</span>
            </div>
            {x.amount && <div className="num mt-1 text-[11px] text-pp-muted">Amount {fmt$(Number(x.amount))}</div>}
            {x.auction_date && <div className="num mt-1 text-[11px] text-pp-gold">Auction {x.auction_date}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function Verdict({ d }: { d: D }) {
  const s = d.score; if (!s) return null;
  const gp = Number(s.gross_profit);
  const line = gp > 40000
    ? `Buy at ${fmt$(Number(s.modeled_offer))} or below. ${s.recommended_scope.toLowerCase()} scope. Skeptic clears.`
    : gp > 12000
      ? `Marginal deal at ${fmt$(Number(s.modeled_offer))}. Only if operator has efficient ${s.recommended_scope.toLowerCase()} crew.`
      : `Pass. Numbers do not survive pessimism.`;
  return (
    <div className="rounded-lg border border-pp-border-strong bg-pp-header p-4">
      <div className="text-[10px] uppercase tracking-widest text-pp-muted">One-line verdict</div>
      <div className="mt-1 text-[14px] font-medium leading-snug">{line}</div>
    </div>
  );
}

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-pp-muted">
      {icon}
      <span>{title}</span>
    </div>
  );
}

function MiniStat({ label, v }: { label: string; v: React.ReactNode }) {
  return (
    <div className="rounded-md border border-pp-border bg-pp-header px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-pp-muted">{label}</div>
      <div className="mt-0.5 text-[13px] text-pp-text">{v}</div>
    </div>
  );
}

function V12RiskBlock({ d }: { d: D }) {
  const s: any = d.score; if (!s) return null;
  const primary = Number(s.primary_rank ?? NaN);
  const retail = Number(s.retail_score ?? NaN);
  const surv = Number(s.survival_factor ?? NaN);
  const arvT = Number(s.arv_today ?? NaN);
  const p5 = Number(s.arv_exit_p5 ?? NaN);
  const p50 = Number(s.arv_exit_p50 ?? NaN);
  const p95 = Number(s.arv_exit_p95 ?? NaN);
  const div = Number(s.lightgbm_divergence ?? NaN);
  if (!Number.isFinite(primary) && !Number.isFinite(arvT)) return null;
  return (
    <section>
      <SectionHead icon={<Pulse className="h-3.5 w-3.5" />} title="Risk — v12 exit distribution" />
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <MiniStat label="ARV today" v={<span className="num">{Number.isFinite(arvT) ? fmt$(arvT) : "—"}</span>} />
        <MiniStat label="ARV exit P50" v={<span className="num">{Number.isFinite(p50) ? fmt$(p50) : "—"}</span>} />
        <MiniStat label="Divergence" v={<span className="num">{Number.isFinite(div) ? div.toFixed(2) : "—"}</span>} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <MiniStat label="ARV exit P5" v={<span className="num">{Number.isFinite(p5) ? fmt$(p5) : "—"}</span>} />
        <MiniStat label="ARV exit P95" v={<span className="num text-pp-live">{Number.isFinite(p95) ? fmt$(p95) : "—"}</span>} />
        <MiniStat label="Survival" v={<span className="num">{Number.isFinite(surv) ? surv.toFixed(2) : "—"}</span>} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <MiniStat label="Primary rank" v={<span className="num">{Number.isFinite(primary) ? pct(primary) : "—"}</span>} />
        <MiniStat label="Retail score" v={<span className="num">{Number.isFinite(retail) ? retail.toFixed(0) : "—"}</span>} />
      </div>
    </section>
  );
}

function CreditBlock({ d }: { d: D }) {
  const s: any = d.score; if (!s) return null;
  const pdC = Number(s.pd_credit ?? NaN);
  if (!Number.isFinite(pdC)) return null;
  const pdP = Number(s.pd_project ?? NaN);
  const pdE = Number(s.pd_exit ?? NaN);
  const ead = Number(s.ead ?? NaN);
  const lgd = Number(s.lgd ?? NaN);
  const el = Number(s.expected_loss ?? NaN);
  const rap = Number(s.risk_adjusted_profit_credit ?? NaN);
  const raroc = Number(s.raroc ?? NaN);
  return (
    <section>
      <SectionHead icon={<ShieldCheck className="h-3.5 w-3.5" />} title="Credit — PD · EAD · LGD · EL" />
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <MiniStat label="PD credit" v={<span className="num">{pct(pdC)}</span>} />
        <MiniStat label="PD project" v={<span className="num">{Number.isFinite(pdP) ? pct(pdP) : "—"}</span>} />
        <MiniStat label="PD exit" v={<span className="num">{Number.isFinite(pdE) ? pct(pdE) : "—"}</span>} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <MiniStat label="EAD" v={<span className="num">{Number.isFinite(ead) ? fmt$(ead) : "—"}</span>} />
        <MiniStat label="LGD" v={<span className="num">{Number.isFinite(lgd) ? pct(lgd) : "—"}</span>} />
        <MiniStat label="Expected loss" v={<span className="num" style={{ color: "#f43f5e" }}>{Number.isFinite(el) ? fmt$(el) : "—"}</span>} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <MiniStat label="Risk-adj profit (credit)" v={<span className="num" style={{ color: rap > 0 ? "#05d680" : "#f43f5e" }}>{Number.isFinite(rap) ? fmt$(rap) : "—"}</span>} />
        <MiniStat label="RAROC" v={<span className="num">{Number.isFinite(raroc) ? `${(raroc * 100).toFixed(1)}%` : "—"}</span>} />
      </div>
    </section>
  );
}

function GatesBlock({ d }: { d: D }) {
  const s: any = d.score; if (!s) return null;
  const gs = s.gate_status;
  if (!gs) return null;
  const passed: number[] = gs.passed ?? [];
  const flags: Array<[string, boolean]> = [
    ["Map glow", !!gs.map_glow],
    ["Prophecy ranking", !!gs.prophecy_ranking],
    ["Institutional credit", !!gs.institutional_credit],
    ["Capital allocation", !!gs.capital_allocation],
    ["Public performance claim", !!gs.public_performance_claim],
  ];
  return (
    <section>
      <SectionHead icon={<Lock className="h-3.5 w-3.5" />} title="Gates 0–8" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
          const ok = passed.includes(n);
          return (
            <span
              key={n}
              className="rounded-md px-2 py-1 text-[11px]"
              style={{
                border: `1px solid ${ok ? "color-mix(in oklab, #05d680 40%, transparent)" : "var(--pp-border)"}`,
                backgroundColor: ok ? "color-mix(in oklab, #05d680 12%, transparent)" : "var(--pp-header)",
                color: ok ? "#05d680" : "var(--pp-muted)",
              }}
            >
              G{n}{ok ? <Check size={11} className="inline-block text-pp-live" aria-label="passed" /> : ""}
            </span>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        {flags.map(([label, on]) => (
          <div
            key={label}
            className="rounded-md border px-3 py-2"
            style={{
              borderColor: on ? "color-mix(in oklab, #05d680 30%, transparent)" : "var(--pp-border)",
              backgroundColor: on ? "color-mix(in oklab, #05d680 8%, transparent)" : "var(--pp-header)",
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-pp-muted">{label}</div>
            <div className="mt-0.5 text-[12px]" style={{ color: on ? "#05d680" : "var(--pp-muted)" }}>
              {on ? "unlocked" : "locked"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
