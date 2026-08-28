import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { SectionBoundary } from "@/components/SectionBoundary";
import { listDistressSources } from "@/lib/notice-parser.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sources")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { next: "/sources" } });
  },
  head: () => ({
    meta: [
      { title: "Where deals come from — Perfect Property" },
      {
        name: "description",
        content:
          "The government and court sources we crawl for distressed property: sheriff and trustee sales, HUD, Fannie Mae, Freddie Mac, USDA, VA and more.",
      },
      { property: "og:title", content: "Where deals come from — Perfect Property" },
      {
        property: "og:description",
        content: "Every distressed-property source feeding the deal pipeline, in one list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SectionBoundary label="Source directory unavailable" minHeight={320}>
      <SourcesPage />
    </SectionBoundary>
  ),
});

const GROUPS: Array<[string, string, string]> = [
  ["court", "Court & county auctions", "Foreclosure auctions published locally, county by county."],
  ["government", "Federal agency sales", "Homes and land agencies sell after a loan or seizure."],
];

function SourcesPage() {
  const fn = useServerFn(listDistressSources);
  const q = useQuery({ queryKey: ["distress-sources"], queryFn: () => fn() });
  const rows = q.data ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <PageHeader
        title="Where deals come from"
        sub="Every distressed-property source the crawler watches. Each one is a public record — no paid listing feeds, no scraped MLS."
      />

      {q.isLoading ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-4">
              <div className="skeleton h-5 w-1/2 rounded-sm" />
              <div className="skeleton mt-3 h-4 w-3/4 rounded-sm" />
            </div>
          ))}
        </div>
      ) : (
        GROUPS.map(([category, title, blurb]) => {
          const group = rows.filter((r) => r.category === category);
          if (!group.length) return null;
          return (
            <section key={category} className="mt-8">
              <h2 className="text-[16px] font-semibold">{title}</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">{blurb}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {group.map((source) => (
                  <a
                    key={source.key}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[14px] font-medium">{source.label}</span>
                      <span className="shrink-0 rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {source.tier === "county" ? "Per county" : "Nationwide"}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                      {source.notes}
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {source.enabled ? "Crawling" : "Paused"}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
