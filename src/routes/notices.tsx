import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SectionBoundary } from "@/components/SectionBoundary";
import { parseLegalNotice } from "@/lib/notice-parser.functions";
import { supabase } from "@/integrations/supabase/client";
import { fmt$ } from "@/lib/format";

export const Route = createFileRoute("/notices")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { next: "/notices" } });
  },
  head: () => ({
    meta: [
      { title: "Read a sale notice — Perfect Property" },
      {
        name: "description",
        content:
          "Paste a sheriff, trustee or tax sale notice and get the address, sale date, judgment amount and buyer risks in plain English.",
      },
      { property: "og:title", content: "Read a sale notice — Perfect Property" },
      {
        property: "og:description",
        content: "Turn dense foreclosure legal notices into a clear, structured record in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SectionBoundary label="Notice reader unavailable" minHeight={400}>
      <NoticesPage />
    </SectionBoundary>
  ),
});

const FIELDS: Array<[string, string]> = [
  ["property_address", "Address"],
  ["city", "City"],
  ["state", "State"],
  ["zip", "ZIP"],
  ["parcel_or_lot", "Parcel / lot"],
  ["sale_date", "Sale date"],
  ["sale_time", "Sale time"],
  ["sale_type", "Sale type"],
  ["plaintiff_or_seller", "Plaintiff / seller"],
  ["defendant", "Defendant"],
  ["judgment_amount", "Judgment"],
  ["deposit_terms", "Deposit terms"],
  ["attorney", "Attorney"],
  ["case_number", "Case number"],
  ["subject_to", "Subject to"],
  ["redemption_note", "Redemption"],
];

function NoticesPage() {
  const parseFn = useServerFn(parseLegalNotice);
  const [text, setText] = useState("");
  const mutation = useMutation({
    mutationFn: (value: string) => parseFn({ data: { text: value } }),
  });
  const result = mutation.data;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <PageHeader
        title="Read a sale notice"
        sub="Paste a sheriff, trustee or tax sale notice. We pull out the address, sale date, amounts and the catches, and explain them in plain English."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <label htmlFor="notice-text" className="text-[12px] font-medium text-muted-foreground">
            Notice text
          </label>
          <textarea
            id="notice-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={18}
            placeholder="Paste the full published notice here…"
            className="mt-2 w-full resize-y rounded-md border border-border bg-background p-3 text-[13px] leading-relaxed outline-none focus:border-border-strong"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={mutation.isPending || text.trim().length < 80}
              onClick={() => mutation.mutate(text)}
              className="rounded-md border border-border-strong bg-surface-2 px-4 py-2 text-[13px] font-medium disabled:opacity-50"
            >
              {mutation.isPending ? "Reading…" : "Read this notice"}
            </button>
            <span className="text-[11px] text-muted-foreground">
              Nothing is saved — this is a read-only helper, not legal advice.
            </span>
          </div>
          {mutation.isError ? (
            <p className="mt-3 text-[12px] text-destructive">
              {mutation.error instanceof Error ? mutation.error.message : "Parsing failed."}
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          {!result ? (
            <p className="text-[13px] text-muted-foreground">
              The structured record shows up here: address, sale date, who is selling, how much
              money is owed, deposit rules, and the risks a buyer takes on.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold">What this notice says</h2>
                <span className="rounded-sm border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {Math.round(result.confidence * 100)}% of fields found
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed">{result.plain_english}</p>

              {result.risks.length ? (
                <ul className="mt-4 space-y-1.5">
                  {result.risks.map((risk) => (
                    <li key={risk} className="text-[12px] leading-relaxed text-muted-foreground">
                      • {risk}
                    </li>
                  ))}
                </ul>
              ) : null}

              <dl className="mt-5 divide-y divide-border border-t border-border">
                {FIELDS.map(([key, label]) => {
                  const value = (result as unknown as Record<string, unknown>)[key];
                  const display =
                    value == null || value === ""
                      ? "—"
                      : key === "judgment_amount"
                        ? fmt$(Number(value))
                        : String(value);
                  return (
                    <div key={key} className="flex gap-3 py-2">
                      <dt className="w-36 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="text-[13px]">{display}</dd>
                    </div>
                  );
                })}
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
