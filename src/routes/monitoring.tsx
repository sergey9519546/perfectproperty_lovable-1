import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fmt$ } from "@/lib/format";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase as browserSupabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { getAuthenticatedFirebaseUser } from "@/integrations/firebase";

const getLatestMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase;
    const { data, error } = await supabase
      .from("portfolio_metrics")
      .select("*")
      .order("computed_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const Route = createFileRoute("/monitoring")({
  ssr: false,
  beforeLoad: async () => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (!firebaseUser) {
      const { data } = await browserSupabase.auth.getUser();
      if (!data.user) throw redirect({ to: "/auth", search: { next: "/monitoring" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Portfolio Monitoring — Perfect Property Engine" },
      {
        name: "description",
        content:
          "Portfolio-level expected loss, VaR, CVaR, concentration, calibration and risk-appetite breach status.",
      },
    ],
  }),
  component: () => (
    <ProtectedLayout>
      <MonitoringPage />
    </ProtectedLayout>
  ),
});

function MonitoringPage() {
  const fetchMetrics = useServerFn(getLatestMetrics);
  const q = useQuery({ queryKey: ["portfolio-metrics"], queryFn: () => fetchMetrics() });

  const latest = q.data?.[0];
  const history = q.data ?? [];

  return (
    <div id="monitoring-page-container" className="mx-auto max-w-[1400px] px-6 py-8 space-y-6">
      <PageHeader
        title="Portfolio Monitoring"
        badge="Real-Time Risk"
        sub="Nightly snapshot of portfolio-level expected loss, tail risk, concentration, calibration and risk-appetite budget."
      />

      {q.isLoading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-2 shadow-sm">
              <div className="skeleton h-3 w-1/2 rounded bg-[#F1F5F9]" />
              <div className="skeleton mt-2 h-6 w-3/4 rounded bg-[#F1F5F9]" />
            </div>
          ))}
        </div>
      )}

      {!q.isLoading && !latest && (
        <div id="monitoring-empty-state" className="rounded-xl border border-dashed border-[#CBD5E1] bg-white px-6 py-8 text-center text-xs text-[#64748B]">
          No monitoring snapshot recorded yet. The nightly risk engine cron will populate this after its first run.
        </div>
      )}

      {latest && (
        <>
          <div id="monitoring-snapshot-badge" className="flex items-center justify-between text-xs text-[#64748B] bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-sm">
            <span>
              Latest snapshot: <strong className="text-[#0F172A]">{new Date(latest.computed_at).toLocaleString()}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] font-semibold text-[11px]">
              {latest.n_deals} active deals in pool
            </span>
          </div>

          {latest.risk_appetite_breached && (
            <div id="monitoring-breach-banner" className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Risk Appetite Limits Exceeded
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {(latest.breach_reasons as string[]).map((r) => (
                  <span
                    key={r}
                    className="rounded-lg border border-rose-300 bg-rose-100 px-3 py-1 font-semibold text-rose-800"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div id="monitoring-primary-metrics" className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Metric
              id="monitoring-metric-el"
              label="Expected loss"
              v={fmt$(Number(latest.el ?? 0))}
              tone="skeptic"
            />
            <Metric
              id="monitoring-metric-bad-month"
              label="Bad-month loss (CVaR 95)"
              v={fmt$(Number(latest.cvar_95 ?? 0))}
              tone="blue"
            />
            <Metric id="monitoring-metric-ec" label="Cash to hold back" v={fmt$(Number(latest.ec ?? 0))} />
            <Metric id="monitoring-metric-deals" label="Deals in portfolio" v={<span>{latest.n_deals}</span>} />
          </div>

          <p className="text-xs text-[#64748B]">
            Expected loss is the typical hit across all open deals. Bad-month loss is what the worst 5% of outcomes cost. Cash to hold back is the liquidity buffer that covers it.
          </p>

          <details id="monitoring-risk-details" className="group rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[#2F5FFF] hover:text-blue-700 flex items-center justify-between">
              <span>Detailed Risk Model Indicators</span>
              <span className="text-[#64748B] group-open:rotate-180 transition-transform text-sm">▾</span>
            </summary>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 pt-4 border-t border-[#E2E8F0]">
              <Metric label="VaR (95%)" v={fmt$(Number(latest.var_95 ?? 0))} />
              <Metric label="Return on risk capital" v={fmtPct(Number(latest.raroc ?? 0))} />
              <Metric label="County concentration" v={Number(latest.hhi_county ?? 0).toFixed(3)} />
              <Metric label="Scope concentration" v={Number(latest.hhi_scope ?? 0).toFixed(3)} />
              <Metric label="Liquidity coverage" v={Number(latest.lcr ?? 0).toFixed(2)} />
              <Metric
                label="Data drift (PSI)"
                v={
                  <span>
                    {Number(latest.psi ?? 0).toFixed(3)}{" "}
                    <span
                      className="ml-1 text-[10px] uppercase font-bold"
                      style={{ color: bandColor(latest.psi_band) }}
                    >
                      {latest.psi_band}
                    </span>
                  </span>
                }
              />
              <Metric
                label="Calibration slope"
                v={Number(latest.calibration_slope ?? 1).toFixed(2)}
                tone={latest.calibration_flag ? "skeptic" : undefined}
              />
              <Metric
                label="Calibration intercept"
                v={Number(latest.calibration_intercept ?? 0).toFixed(2)}
              />
            </div>
          </details>

          <div id="monitoring-history-section" className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Recent Nightly Integrity Checks
            </h3>
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table id="monitoring-history-table" className="w-full text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <tr>
                      <th className="px-4 py-3 text-left">Timestamp</th>
                      <th className="px-4 py-3 text-right">Deals</th>
                      <th className="px-4 py-3 text-right">Expected Loss</th>
                      <th className="px-4 py-3 text-right">Bad-Month Loss</th>
                      <th className="px-4 py-3 text-right">Cash Held Back</th>
                      <th className="px-4 py-3 text-right">County HHI</th>
                      <th className="px-4 py-3 text-right">Data Drift</th>
                      <th className="px-4 py-3 text-left">Alerts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {history.map((h) => (
                      <tr key={h.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 text-[#64748B] font-mono">
                          {new Date(h.computed_at).toLocaleString()}
                        </td>
                        <td className="num px-4 py-3 text-right font-bold text-[#0F172A]">{h.n_deals}</td>
                        <td className="num px-4 py-3 text-right text-rose-600 font-bold">{fmt$(Number(h.el ?? 0))}</td>
                        <td className="num px-4 py-3 text-right text-[#2F5FFF] font-bold">{fmt$(Number(h.cvar_95 ?? 0))}</td>
                        <td className="num px-4 py-3 text-right text-[#0F172A]">{fmt$(Number(h.ec ?? 0))}</td>
                        <td className="num px-4 py-3 text-right text-[#64748B]">
                          {Number(h.hhi_county ?? 0).toFixed(3)}
                        </td>
                        <td
                          className="num px-4 py-3 text-right font-bold"
                          style={{ color: bandColor(h.psi_band) }}
                        >
                          {Number(h.psi ?? 0).toFixed(3)}
                        </td>
                        <td
                          className="px-4 py-3 text-[11px] font-medium"
                          style={{
                            color: h.risk_appetite_breached
                              ? "#E11D48"
                              : "#64748B",
                          }}
                        >
                          {h.risk_appetite_breached ? (h.breach_reasons as string[]).join(", ") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Metric({
  id,
  label,
  v,
  tone,
}: {
  id?: string;
  label: string;
  v: React.ReactNode;
  tone?: "skeptic" | "blue";
}) {
  const colorClass =
    tone === "skeptic"
      ? "text-rose-600"
      : tone === "blue"
        ? "text-[#2F5FFF]"
        : "text-[#0F172A]";
  return (
    <div id={id} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">{label}</div>
      <div className={`mt-1 text-xl font-bold ${colorClass}`}>
        {v}
      </div>
    </div>
  );
}

function fmtPct(x: number) {
  if (!Number.isFinite(x)) return "—";
  return `${(x * 100).toFixed(1)}%`;
}

function bandColor(band: string | null): string {
  switch (band) {
    case "green":
      return "#059669";
    case "yellow":
      return "#D97706";
    case "orange":
      return "#EA580C";
    case "red":
      return "#E11D48";
    default:
      return "#64748B";
  }
}
