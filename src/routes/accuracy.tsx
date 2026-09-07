import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getCoverage } from "@/lib/parcels.functions";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { fmt$ } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { getAuthenticatedFirebaseUser } from "@/integrations/firebase";

export const Route = createFileRoute("/accuracy")({
  ssr: false,
  beforeLoad: async () => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (!firebaseUser) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw redirect({ to: "/auth", search: { next: "/accuracy" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Prediction Accuracy — Perfect Property" },
      { name: "description", content: "How our forecasts compared to real outcomes on completed deals." },
    ],
  }),
  component: () => (
    <ProtectedLayout>
      <AccuracyPage />
    </ProtectedLayout>
  ),
});

function AccuracyPage() {
  const fn = useServerFn(getCoverage);
  const q = useQuery({ queryKey: ["coverage"], queryFn: () => fn() });
  const c = q.data;
  return (
    <div id="accuracy-page-container" className="mx-auto max-w-[1400px] px-6 py-8 space-y-6">
      <PageHeader
        title="Prediction accuracy"
        badge="Backtested"
        sub="How our forecasts compared to what actually happened. Checked automatically every night and published as-is."
      />

      {q.isError && (
        <div id="accuracy-error-banner" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          Unable to load prediction accuracy metrics: {q.error instanceof Error ? q.error.message : "Query failed"}
          <button
            id="accuracy-retry-btn"
            type="button"
            onClick={() => q.refetch()}
            className="ml-3 font-semibold text-rose-800 underline hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {q.isLoading && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-2 shadow-sm">
                <div className="skeleton h-3 w-1/2 rounded bg-[#F1F5F9]" />
                <div className="skeleton h-7 w-2/3 rounded bg-[#F1F5F9]" />
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                <tr>
                  {["", "", "", "", "", "", ""].map((_, j) => (
                    <th key={j} className="px-4 py-3" />
                  ))}
                </tr>
              </thead>
              <tbody>
                <TableSkeleton rows={6} columns={7} />
              </tbody>
            </table>
          </div>
        </>
      )}

      {c && (
        <>
          <div id="accuracy-stats-bar" className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <BigStat id="accuracy-stat-total" label="Outcomes recorded" v={c.accuracy.total.toString()} />
            <BigStat
              id="accuracy-stat-winrate"
              label="Win rate"
              v={`${Math.round(c.accuracy.win_rate * 100)}%`}
              colorClass="text-emerald-600"
            />
            <BigStat
              id="accuracy-stat-losses"
              label="Losses"
              v={c.accuracy.losses.toString()}
              colorClass="text-rose-600"
            />
            <BigStat
              id="accuracy-stat-error"
              label="Average value error"
              v={`${c.accuracy.mean_abs_error_pct.toFixed(1)}%`}
              colorClass="text-[#2F5FFF]"
            />
          </div>

          <div id="accuracy-table-wrapper" className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center justify-between">
              <span>Historical Underwriting Outcomes</span>
              <span className="text-[12px] text-[#64748B] font-normal">Last {Math.min(50, c.outcomes.length)} settled records</span>
            </div>
            <div className="overflow-x-auto">
              <table id="accuracy-outcomes-table" className="w-full text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <tr>
                    <th className="px-4 py-3 text-left">Sold Date</th>
                    <th className="px-4 py-3 text-left">Outcome</th>
                    <th className="px-4 py-3 text-right">Predicted ARV</th>
                    <th className="px-4 py-3 text-right">Actual Sale</th>
                    <th className="px-4 py-3 text-right">Predicted Profit</th>
                    <th className="px-4 py-3 text-right">Actual Profit</th>
                    <th className="px-4 py-3 text-right">Error %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {c.outcomes.slice(0, 50).map((o: any, i: number) => {
                    const isWin = o.outcome === "WIN";
                    const isLoss = o.outcome === "LOSS";
                    return (
                      <tr key={i} id={`accuracy-row-${i}`} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 text-[#64748B] font-mono">{o.actual_sold_at ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                              isWin
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isLoss
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]"
                            }`}
                          >
                            {o.outcome}
                          </span>
                        </td>
                        <td className="num px-4 py-3 text-right text-[#0F172A]">{fmt$(Number(o.predicted_arv))}</td>
                        <td className="num px-4 py-3 text-right text-[#0F172A] font-bold">{fmt$(Number(o.actual_sale_price))}</td>
                        <td className="num px-4 py-3 text-right text-[#64748B]">{fmt$(Number(o.predicted_profit))}</td>
                        <td
                          className={`num px-4 py-3 text-right font-bold ${
                            Number(o.actual_profit) > 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {fmt$(Number(o.actual_profit))}
                        </td>
                        <td className="num px-4 py-3 text-right text-[#64748B]">{Number(o.error_pct).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div id="accuracy-methodology-note" className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2F5FFF]">Dataset Methodology</h4>
            <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
              This dataset compounds over time. Year one it represents an algorithmic prediction model. Year five it becomes the reference dataset for the entire market — every predicted-vs-actual on every residential investment transaction tracked, wins and losses published identically.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function BigStat({ id, label, v, colorClass }: { id?: string; label: string; v: string; colorClass?: string }) {
  return (
    <div id={id} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="text-[11px] uppercase font-bold tracking-wider text-[#64748B]">{label}</div>
      <div className={`mt-1.5 text-2xl font-bold ${colorClass || "text-[#0F172A]"}`}>{v}</div>
    </div>
  );
}
