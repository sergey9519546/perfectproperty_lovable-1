import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listProphecyParcels } from "@/lib/parcels.functions";
import { DossierPanel } from "@/components/DossierPanel";
import { PageHeader } from "@/components/PageHeader";
import { fmt$ } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { SectionBoundary } from "@/components/SectionBoundary";
import { ScorePill } from "@/components/ScorePill";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { getAuthenticatedFirebaseUser } from "@/integrations/firebase";

export const Route = createFileRoute("/prophecy")({
  ssr: false,
  beforeLoad: async () => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (!firebaseUser) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw redirect({ to: "/auth", search: { next: "/prophecy" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Prophecy — Perfect Property Engine" },
      { name: "description", content: "Parcels whose signatures predict acquisition 60–90 days out. Alerted before the opportunity exists anywhere else." },
    ],
  }),
  component: () => (
    <ProtectedLayout>
      <SectionBoundary label="Prophecy unavailable" minHeight={400}>
        <ProphecyPage />
      </SectionBoundary>
    </ProtectedLayout>
  ),
});

function ProphecyPage() {
  const fn = useServerFn(listProphecyParcels);
  const [sel, setSel] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["prophecy"], queryFn: () => fn({ data: { min_score: 15, limit: 200 } }) });

  const totalCount = q.data?.length ?? 0;
  const avgOdds = totalCount > 0
    ? Math.round((q.data?.reduce((acc: number, r: any) => acc + Number(r.acquisition_probability || 0), 0) ?? 0) / totalCount * 100)
    : 0;
  const totalPipeline = totalCount > 0
    ? (q.data?.reduce((acc: number, r: any) => acc + Number(r.gross_profit || 0), 0) ?? 0)
    : 0;

  return (
    <>
      <div id="prophecy-page-container" className="mx-auto max-w-[1400px] px-6 py-8 space-y-6">
        <PageHeader
          title="Predicted to sell"
          badge="Prophecy Feed"
          sub="Properties showing the pattern that usually comes 60–90 days before an owner sells. Early warning, not a listing."
        />

        {/* Metrics Bar */}
        <div id="prophecy-metrics-bar" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Prophecy Pipeline</span>
            <span className="text-2xl font-bold text-[#0F172A] mt-1 block">
              {q.isLoading ? "—" : totalCount} <span className="text-xs text-[#64748B] font-normal">candidates</span>
            </span>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Avg Acquisition Odds</span>
            <span className="text-2xl font-bold text-[#2F5FFF] mt-1 block">
              {q.isLoading ? "—" : `${avgOdds}%`}
            </span>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Modeled Net Spread</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
              {q.isLoading ? "—" : fmt$(totalPipeline)}
            </span>
          </div>
        </div>

        {q.isError && (
          <div id="prophecy-error-banner" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
            Unable to load prophecy predictions: {q.error instanceof Error ? q.error.message : "Query failed"}
            <button
              id="prophecy-retry-btn"
              type="button"
              onClick={() => q.refetch()}
              className="ml-3 font-semibold text-rose-800 underline hover:text-rose-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {q.data && q.data.length === 0 && !q.isError && (
          <div id="prophecy-empty-state" className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
            No properties match this pattern right now. We keep watching and will list them here as soon as the signals appear.
          </div>
        )}

        <div id="prophecy-cards-grid" className="grid gap-4 md:grid-cols-2">
          {q.isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3 shadow-sm">
                <div className="skeleton h-4 w-1/3 rounded bg-[#F1F5F9]" />
                <div className="skeleton h-5 w-2/3 rounded bg-[#F1F5F9]" />
                <div className="skeleton h-16 w-full rounded bg-[#F1F5F9]" />
              </div>
            ))}

          {(q.data ?? []).map((r: any, i: number) => {
            return (
              <button
                key={r.parcel_id}
                id={`prophecy-card-${r.parcel_id}`}
                type="button"
                onClick={() => setSel(r.parcel_id)}
                style={{ animationDelay: `${Math.min(i * 60, 500)}ms` }}
                className="cursor-pointer rounded-xl border border-[#E2E8F0] bg-white hover:border-[#2F5FFF]/50 p-5 text-left transition-all hover:shadow-md shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-blue-50 border border-blue-200 text-blue-700">
                      Likely to sell soon
                    </span>
                    <h3 className="mt-2 text-base font-bold text-[#0F172A]">{r.parcels?.address || "Unaddressed Parcel"}</h3>
                    <p className="text-xs text-[#64748B]">
                      {r.parcels?.city || ""}{r.parcels?.state ? `, ${r.parcels.state}` : ""}
                    </p>
                  </div>
                  <ScorePill score={Number(r.perfect_score)} size="lg" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Modeled offer</span>
                    <span className="font-bold text-[#0F172A] mt-0.5 block num">{fmt$(Number(r.modeled_offer))}</span>
                  </div>
                  <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Expected profit</span>
                    <span className="font-bold text-emerald-600 mt-0.5 block num">{fmt$(Number(r.gross_profit))}</span>
                  </div>
                  <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Deal odds</span>
                    <span className="font-bold text-[#2F5FFF] mt-0.5 block num">{Math.round(Number(r.acquisition_probability) * 100)}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <DossierPanel parcelId={sel} onClose={() => setSel(null)} />
    </>
  );
}
