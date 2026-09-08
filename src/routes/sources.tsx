import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { SectionBoundary } from "@/components/SectionBoundary";
import { PageHeader } from "@/components/PageHeader";
import { listDistressSources } from "@/lib/notice-parser.functions";
import { supabase } from "@/integrations/supabase/client";
import { getAuthenticatedFirebaseUser } from "@/integrations/firebase";

export const Route = createFileRoute("/sources")({
  ssr: false,
  beforeLoad: async () => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (!firebaseUser) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw redirect({ to: "/auth", search: { next: "/sources" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Where our deal data comes from — Perfect Property" },
      {
        name: "description",
        content:
          "The public records, court calendars, and government sale lists we watch for distressed property, and how often each one is checked.",
      },
      { property: "og:title", content: "Where our deal data comes from — Perfect Property" },
      {
        property: "og:description",
        content: "A plain list of every county, court, and agency feed behind the deals you see.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ProtectedLayout>
      <SectionBoundary label="Data sources unavailable" minHeight={400}>
        <SourcesPage />
      </SectionBoundary>
    </ProtectedLayout>
  ),
});

const TIER_LABEL: Record<number, string> = {
  1: "Checked daily",
  2: "Checked weekly",
  3: "Checked occasionally",
};

function SourcesPage() {
  const fn = useServerFn(listDistressSources);
  const [category, setCategory] = useState<string>("all");

  const q = useQuery({ queryKey: ["distress-sources"], queryFn: () => fn() });
  const rows = useMemo(() => q.data ?? [], [q.data]);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(rows.map((r) => r.category ?? "other")))],
    [rows],
  );
  const visible = category === "all" ? rows : rows.filter((r) => (r.category ?? "other") === category);

  return (
    <div id="sources-page-container" className="mx-auto max-w-[1400px] px-6 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Where the data comes from"
          sub="Every deal on this site traces back to a public record. These are the lists, court calendars, and agency feeds we watch."
        />
        <Link
          to="/notices"
          className="rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] px-4 py-2 text-xs font-semibold text-[#0F172A] hover:text-[#2F5FFF] transition-all shadow-2xs"
        >
          Read a sale notice →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer ${
              category === c
                ? "border-[#0F172A] bg-[#0F172A] text-white"
                : "border-[#E2E8F0] bg-white text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            {c === "all" ? "All sources" : c.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {q.isLoading && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-xs text-[#64748B]">
          Loading sources…
        </div>
      )}

      {!q.isLoading && visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-xs text-[#64748B]">
          No sources listed yet.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((s) => (
          <div key={s.key} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-bold text-[#0F172A]">{s.label}</h2>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  s.enabled
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {s.enabled ? "Live" : "Paused"}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#64748B]">
              {s.notes || "Public record feed used to spot properties heading to sale."}
            </p>
            <dl className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <dt className="text-[#94A3B8]">Type</dt>
                <dd className="font-semibold capitalize text-[#0F172A]">
                  {(s.category ?? "other").replace(/_/g, " ")}
                </dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">How often</dt>
                <dd className="font-semibold text-[#0F172A]">
                  {TIER_LABEL[s.tier as number] ?? "As published"}
                </dd>
              </div>
            </dl>
            {s.url && (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-semibold text-[#2F5FFF] hover:underline"
              >
                Open the original record →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
