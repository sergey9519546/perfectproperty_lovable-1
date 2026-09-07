import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listRankedParcels } from "@/lib/parcels.functions";
import { DossierPanel } from "@/components/DossierPanel";
import { PageHeader } from "@/components/PageHeader";
import { fmt$ } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { SectionBoundary } from "@/components/SectionBoundary";
import { ScorePill } from "@/components/ScorePill";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { getAuthenticatedFirebaseUser } from "@/integrations/firebase";

export const Route = createFileRoute("/shadow")({
  ssr: false,
  beforeLoad: async () => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (!firebaseUser) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw redirect({ to: "/auth", search: { next: "/shadow" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Shadow Market — Perfect Property Engine" },
      { name: "description", content: "Off-market parcels ranked by acquisition gravity. No competition, because no listing." },
    ],
  }),
  component: () => (
    <ProtectedLayout>
      <SectionBoundary label="Shadow market unavailable" minHeight={400}>
        <ShadowPage />
      </SectionBoundary>
    </ProtectedLayout>
  ),
});

function ShadowPage() {
  const fn = useServerFn(listRankedParcels);
  const [sel, setSel] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["shadow"], queryFn: () => fn({ data: { ring: 2, limit: 500 } }) });

  const totalCount = q.data?.length ?? 0;
  const avgScore = totalCount > 0
    ? Math.round((q.data?.reduce((acc: number, r: any) => acc + Number(r.perfect_score || 0), 0) ?? 0) / totalCount)
    : 0;
  const totalProfit = totalCount > 0
    ? (q.data?.reduce((acc: number, r: any) => acc + Number(r.gross_profit || 0), 0) ?? 0)
    : 0;

  return (
    <>
      <div id="shadow-page-container" className="mx-auto max-w-[1400px] px-6 py-8 space-y-6">
        <PageHeader
          title="Off-market properties"
          badge="Shadow Pipeline"
          sub="Properties that aren't listed anywhere yet — ranked by how strong the distress signals are, so you can reach the owner before anyone competes."
        />

        {/* Metrics Bar */}
        <div id="shadow-metrics-bar" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Off-Market Inventory</span>
            <span className="text-2xl font-bold text-[#0F172A] mt-1 block">
              {q.isLoading ? "—" : totalCount} <span className="text-xs text-[#64748B] font-normal">assets tracked</span>
            </span>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Average Deal Score</span>
            <span className="text-2xl font-bold text-[#2F5FFF] mt-1 block">
              {q.isLoading ? "—" : `${avgScore}/100`}
            </span>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Aggregate Modeled Profit</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
              {q.isLoading ? "—" : fmt$(totalProfit)}
            </span>
          </div>
        </div>

        {q.isError && (
          <div id="shadow-error-banner" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
            Unable to load off-market properties: {q.error instanceof Error ? q.error.message : "Query failed"}
            <button
              id="shadow-retry-btn"
              type="button"
              onClick={() => q.refetch()}
              className="ml-3 font-semibold text-rose-800 underline hover:text-rose-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {q.data && q.data.length === 0 && !q.isError && (
          <div id="shadow-empty-state" className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
            No off-market properties found matching current criteria.
          </div>
        )}

        <div id="shadow-cards-grid" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {q.isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3 shadow-sm">
                <div className="skeleton h-5 w-3/4 rounded bg-[#F1F5F9]" />
                <div className="skeleton mt-3 h-4 w-1/2 rounded bg-[#F1F5F9]" />
                <div className="skeleton mt-2 h-4 w-2/3 rounded bg-[#F1F5F9]" />
              </div>
            ))}

          {(q.data ?? []).map((r: any, i: number) => {
            const flags = (r.skeptic_flags as string[]) ?? [];
            return (
              <button
                key={r.parcel_id}
                id={`shadow-card-${r.parcel_id}`}
                type="button"
                onClick={() => setSel(r.parcel_id)}
                style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
                className="cursor-pointer text-left rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all hover:border-[#2F5FFF]/50 hover:shadow-md shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[#0F172A]">{r.parcels?.address || "Unaddressed Parcel"}</h3>
                    <p className="truncate text-xs text-[#64748B]">
                      {r.parcels?.city || ""}{r.parcels?.state ? `, ${r.parcels.state}` : ""}
                    </p>
                  </div>
                  <ScorePill score={Number(r.perfect_score)} size="lg" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Metric label="Our offer" v={fmt$(Number(r.modeled_offer))} />
                  <Metric label="Expected profit" v={fmt$(Number(r.gross_profit))} accent />
                  <Metric label="Deal odds" v={`${Math.round(Number(r.acquisition_probability) * 100)}%`} />
                  <Metric label="Days to sell" v={`${r.exit_days}d`} />
                </div>
                {flags.length > 0 && (
                  <div className="mt-3 text-[11px] font-medium text-rose-600">
                    {flags.length} risk flag{flags.length > 1 ? "s" : ""}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <DossierPanel parcelId={sel} onClose={() => setSel(null)} />
    </>
  );
}

function Metric({ label, v, accent }: { label: string; v: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">{label}</div>
      <div className={"font-bold text-xs mt-0.5 num " + (accent ? "text-emerald-600" : "text-[#0F172A]")}>{v}</div>
    </div>
  );
}
