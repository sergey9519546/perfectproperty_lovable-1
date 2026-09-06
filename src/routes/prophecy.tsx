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
  return (
    <>
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Predicted to sell"
          sub="Properties showing the pattern that usually comes 60–90 days before an owner sells. Early warning, not a listing."
        />


        {q.data && q.data.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-pp-border bg-pp-page p-8 text-center text-sm text-pp-muted">
            No properties match this pattern right now. We keep watching and will list them here as soon as the signals appear.
          </div>
        )}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {q.isLoading && Array.from({length:4}).map((_,i)=>(<div key={i} className="rounded-lg border border-pp-border bg-pp-page p-5"><div className="skeleton h-4 w-1/3 rounded-sm" /><div className="skeleton mt-2 h-5 w-2/3 rounded-sm" /><div className="skeleton mt-3 h-16 w-full rounded-md" /></div>))}
          {(q.data ?? []).map((r: any, i: number) => {
            return (
              <button key={r.parcel_id} onClick={() => setSel(r.parcel_id)} style={{animationDelay:`${Math.min(i*60,500)}ms`, borderColor: "color-mix(in oklab, var(--prophecy) 30%, var(--pp-border))"}} className="rounded-lg border border-prophecy/40 bg-pp-page p-5 text-left transition-colors hover:bg-pp-header animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-prophecy">Likely to sell soon</div>
                    <div className="mt-1 text-[15px] font-medium">{r.parcels.address}</div>
                    <div className="text-[12px] text-pp-muted">{r.parcels.city}, {r.parcels.state}</div>
                  </div>
                  <ScorePill score={Number(r.perfect_score)} size="lg" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                  <div className="rounded-md border border-pp-border bg-pp-header px-2 py-1.5">
                    <div className="text-[9px] uppercase text-pp-muted">Our offer</div>
                    <div className="num text-[13px]">{fmt$(Number(r.modeled_offer))}</div>
                  </div>
                  <div className="rounded-md border border-pp-border bg-pp-header px-2 py-1.5">
                    <div className="text-[9px] uppercase text-pp-muted">Expected profit</div>
                    <div className="num text-[13px] text-pp-live">{fmt$(Number(r.gross_profit))}</div>
                  </div>
                  <div className="rounded-md border border-pp-border bg-pp-header px-2 py-1.5">
                    <div className="text-[9px] uppercase text-pp-muted">Odds it becomes available</div>
                    <div className="num text-[13px]">{Math.round(Number(r.acquisition_probability) * 100)}%</div>
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
