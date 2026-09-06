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
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <PageHeader title="Prediction accuracy" sub="How our forecasts compared to what actually happened. Checked automatically every night and published as-is." />
      {q.isLoading && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({length:4}).map((_,i)=>(
              <div key={i} className="rounded-lg border border-pp-border bg-pp-page p-4">

                <div className="skeleton h-3 w-1/2 rounded-sm" />
                <div className="skeleton mt-2 h-7 w-2/3 rounded-sm" />
              </div>
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-lg border border-pp-border bg-pp-page">
            <table className="w-full text-[13px]">
              <thead className="bg-pp-header text-[10px] uppercase tracking-widest text-pp-muted">
                <tr>{["","","","","","",""].map((_,j)=><th key={j} className="px-4 py-2" />)}</tr>
              </thead>
              <tbody><TableSkeleton rows={6} columns={7} /></tbody>
            </table>
          </div>
        </>
      )}
      {c && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <BigStat label="Outcomes recorded" v={c.accuracy.total.toString()} />
            <BigStat label="Win rate" v={`${Math.round(c.accuracy.win_rate * 100)}%`} color="#05d680" />
            <BigStat label="Losses" v={c.accuracy.losses.toString()} color="#f43f5e" />
            <BigStat label="Average value error" v={`${c.accuracy.mean_abs_error_pct.toFixed(1)}%`} />
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-pp-border bg-pp-page">
            <div className="border-b border-pp-border px-4 py-3 text-[11px] uppercase tracking-widest text-pp-muted">Recent outcomes</div>
            <table className="w-full text-[13px]">
              <thead className="bg-pp-header text-[10px] uppercase tracking-widest text-pp-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Sold</th>
                  <th className="px-4 py-2 text-left">Outcome</th>
                  <th className="px-4 py-2 text-right">Predicted ARV</th>
                  <th className="px-4 py-2 text-right">Actual sale</th>
                  <th className="px-4 py-2 text-right">Predicted profit</th>
                  <th className="px-4 py-2 text-right">Actual profit</th>
                  <th className="px-4 py-2 text-right">Error</th>
                </tr>
              </thead>
              <tbody>
                {c.outcomes.slice(0, 50).map((o: any, i: number) => (
                  <tr key={i} className="border-t border-pp-border">
                    <td className="num px-4 py-2 text-pp-muted">{o.actual_sold_at ?? "—"}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full px-2 py-0.5 text-[11px]" style={{
                        color: o.outcome === "WIN" ? "#05d680" : o.outcome === "LOSS" ? "#f43f5e" : "var(--pp-muted)",
                        backgroundColor: "color-mix(in oklab, " + (o.outcome === "WIN" ? "#05d680" : o.outcome === "LOSS" ? "#f43f5e" : "var(--pp-muted)") + " 15%, transparent)",
                      }}>{o.outcome}</span>
                    </td>
                    <td className="num px-4 py-2 text-right">{fmt$(Number(o.predicted_arv))}</td>
                    <td className="num px-4 py-2 text-right">{fmt$(Number(o.actual_sale_price))}</td>
                    <td className="num px-4 py-2 text-right">{fmt$(Number(o.predicted_profit))}</td>
                    <td className="num px-4 py-2 text-right" style={{ color: Number(o.actual_profit) > 0 ? "#05d680" : "#f43f5e" }}>{fmt$(Number(o.actual_profit))}</td>
                    <td className="num px-4 py-2 text-right text-pp-muted">{Number(o.error_pct).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 max-w-3xl text-sm text-pp-muted">
            This dataset compounds. Year one it's a model. Year five it's the reference dataset for an industry — every predicted-vs-actual on every value-add residential transaction we cover, wins and losses alike.
          </p>
        </>
      )}
    </div>
  );
}

function BigStat({ label, v, color }: { label: string; v: string; color?: string }) {
  return (
    <div className="rounded-lg border border-pp-border bg-pp-page p-5">
      <div className="text-[10px] uppercase tracking-widest text-pp-muted">{label}</div>
      <div className="num mt-1 text-3xl font-semibold" style={{ color }}>{v}</div>
    </div>
  );
}
