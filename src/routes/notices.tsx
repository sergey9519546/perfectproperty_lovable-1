import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { SectionBoundary } from "@/components/SectionBoundary";
import { PageHeader } from "@/components/PageHeader";
import { parseNotice } from "@/lib/notice-parser.functions";
import { supabase } from "@/integrations/supabase/client";
import { getAuthenticatedFirebaseUser } from "@/integrations/firebase";

export const Route = createFileRoute("/notices")({
  ssr: false,
  beforeLoad: async () => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (!firebaseUser) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw redirect({ to: "/auth", search: { next: "/notices" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Read a sale notice — Perfect Property" },
      {
        name: "description",
        content:
          "Paste a sheriff, trustee, or tax sale notice and get the address, date, opening bid, deposit terms and the risks explained in plain English.",
      },
      { property: "og:title", content: "Read a sale notice — Perfect Property" },
      {
        property: "og:description",
        content: "Turn dense foreclosure notices into a clear summary of what is being sold and what could go wrong.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ProtectedLayout>
      <SectionBoundary label="Notice reader unavailable" minHeight={400}>
        <NoticesPage />
      </SectionBoundary>
    </ProtectedLayout>
  ),
});

const FIELDS: Array<[string, string]> = [
  ["Address", "property_address"],
  ["City", "city"],
  ["County", "county"],
  ["State", "state"],
  ["Parcel ID", "parcel_id"],
  ["Case number", "case_number"],
  ["Sale date", "sale_date"],
  ["Sale time", "sale_time"],
  ["Where", "sale_location"],
  ["Opening bid", "opening_bid"],
  ["Judgment amount", "judgment_amount"],
  ["Deposit terms", "deposit_terms"],
  ["Redemption", "redemption_period"],
  ["Lender / plaintiff", "plaintiff"],
  ["Owner / defendant", "defendant"],
  ["Attorney", "attorney"],
];

function NoticesPage() {
  const fn = useServerFn(parseNotice);
  const [text, setText] = useState("");
  const m = useMutation({ mutationFn: (t: string) => fn({ data: { text: t } }) });
  const notice = m.data?.ok ? m.data.notice : undefined;
  const errorText = m.data && !m.data.ok ? m.data.error : m.error ? String(m.error) : null;

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <PageHeader
        title="Read a sale notice"
        sub="Paste the text of a sheriff, trustee, or tax sale notice. You get the key facts pulled out and a plain-English read of what could go wrong."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="notice" className="text-[13px] font-medium text-pp-text">
            Notice text
          </label>
          <textarea
            id="notice"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={18}
            placeholder="Paste the full notice here…"
            className="mt-2 w-full rounded-lg border border-pp-border bg-pp-page p-3 text-[13px] leading-relaxed text-pp-text outline-none focus:border-pp-border-strong"
          />
          <button
            type="button"
            disabled={m.isPending || text.trim().length < 40}
            onClick={() => m.mutate(text)}
            className="mt-3 rounded-lg border border-pp-border bg-pp-surface-raised px-4 py-2 text-[13px] font-medium text-pp-text transition-colors hover:bg-pp-header disabled:opacity-50"
          >
            {m.isPending ? "Reading…" : "Read this notice"}
          </button>
          {errorText && (
            <p className="mt-3 text-[13px] text-red-500">{errorText}</p>
          )}
        </div>

        <div>
          {!notice && !m.isPending && (
            <p className="text-[13px] text-pp-muted">
              Nothing read yet. The summary appears here.
            </p>
          )}
          {notice && (
            <div className="space-y-5">
              <div className="rounded-lg border border-pp-border bg-pp-page p-4">
                <div className="text-[12px] uppercase tracking-wide text-pp-muted">
                  {notice.sale_type.replace("_", " ")} sale · {Math.round(notice.confidence * 100)}% complete
                </div>
                <p className="mt-2 text-[14px] font-medium text-pp-text">{notice.verdict}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-pp-muted">{notice.plain_english}</p>
              </div>

              <div className="rounded-lg border border-pp-border bg-pp-page p-4">
                <div className="text-[12px] uppercase tracking-wide text-pp-muted">Details</div>
                <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {FIELDS.map(([label, key]) => {
                    const v = (notice as unknown as Record<string, unknown>)[key];
                    return (
                      <div key={key} className="flex justify-between gap-3 text-[13px]">
                        <dt className="text-pp-muted">{label}</dt>
                        <dd className="text-right text-pp-text">
                          {v === null || v === undefined || v === "" ? "—" : String(v)}
                        </dd>
                      </div>
                    );
                  })}
                  <div className="flex justify-between gap-3 text-[13px]">
                    <dt className="text-pp-muted">Occupancy</dt>
                    <dd className="text-right text-pp-text">{notice.occupancy}</dd>
                  </div>
                </dl>
              </div>

              {notice.risks.length > 0 && (
                <div className="rounded-lg border border-pp-border bg-pp-page p-4">
                  <div className="text-[12px] uppercase tracking-wide text-pp-muted">What could go wrong</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-pp-text">
                    {notice.risks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
