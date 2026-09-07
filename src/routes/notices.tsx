import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { SectionBoundary } from "@/components/SectionBoundary";
import { PageHeader } from "@/components/PageHeader";
import { parseNotice, listDistressSources } from "@/lib/notice-parser.functions";
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

const SAMPLE_NOTICE = `SHERIFF'S SALE OF REAL ESTATE
SUPERIOR COURT OF NEW JERSEY, CHANCERY DIVISION, BERGEN COUNTY
DOCKET NO. F-014922-24
PLAINTIFF: BANK OF NEW YORK MELLON, AS TRUSTEE
VS.
DEFENDANT: MARCUS A. REYNOLDS, ET AL.

By virtue of a writ of execution in above stated action to me directed, I shall expose for sale by public venue on FRIDAY, OCTOBER 16, 2026 at 2:00 PM in the afternoon prevailing time, at the Bergen County Administration Building, One Bergen County Plaza, 4th Floor, Hackensack, NJ.

MUNICIPALITY: BOROUGH OF PARAMUS, COUNTY OF BERGEN, STATE OF NEW JERSEY
STREET & NUMBER: 412 FOREST AVENUE, PARAMUS, NJ 07652
TAX LOT NO: 14, BLOCK: 3204
DIMENSIONS OF LOT: APPROXIMATELY 100 FT X 150 FT (0.34 ACRES)
NEAREST CROSS STREET: SPRING VALLEY ROAD

THE APPROXIMATE AMOUNT OF THE JUDGMENT TO BE SATISFIED BY SAID SALE IS THE SUM OF $482,750.00 TOGETHER WITH LAWFUL INTEREST AND COSTS TAXED.
OPENING MINIMUM BID: $100.00.
SURPLUS MONEY: IF AFTER THE SALE AND SATISFACTION OF THE MORTGAGE DEBT, INCLUDING COSTS AND EXPENSES, THERE REMAINS ANY SURPLUS MONEY, THE MONEY WILL BE DEPOSITED INTO THE SUPERIOR COURT TRUST FUND.

TERMS OF SALE: A DEPOSIT OF 20% OF PURCHASE PRICE IN CASH, CERTIFIED CHECK OR CASHIER'S CHECK IS REQUIRED AT THE TIME OF SALE. THE BALANCE IS DUE WITHIN 30 DAYS WITH LEGAL INTEREST OF 6% FROM THE DATE OF SALE.
SUBJECT TO: ANY UNPAID TAXES, WATER AND SEWER CHARGES, PRIOR LIENS, MUNICIPAL ASSESSMENTS, AND RIGHTS OF TENANTS OR PARTIES IN POSSESSION UNDER APPLICABLE STATE OR FEDERAL OCCUPANCY LAWS.
REDEMPTION PERIOD: 10 DAYS PURSUANT TO N.J. COURT RULE 4:65-5.

ATTORNEY FOR PLAINTIFF:
FEIN, SUCH, KAHN & SHEPARD, P.C.
7 CENTURY DRIVE, SUITE 201, PARSIPPANY, NJ 07054
SHERIFF OF BERGEN COUNTY`;

function NoticesPage() {
  const fn = useServerFn(parseNotice);
  const sourcesFn = useServerFn(listDistressSources);
  const [text, setText] = useState("");
  const m = useMutation({ mutationFn: (t: string) => fn({ data: { text: t } }) });
  const sourcesQuery = useQuery({
    queryKey: ["distress-sources"],
    queryFn: () => sourcesFn(),
  });
  const notice = m.data?.ok ? m.data.notice : undefined;
  const errorText = m.data && !m.data.ok ? m.data.error : m.error ? String(m.error) : null;

  return (
    <div id="notices-page-container" className="mx-auto max-w-[1400px] px-6 py-8 space-y-8">
      <div id="notices-header-bar" className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Read a sale notice"
          sub="Paste the text of a sheriff, trustee, or tax sale notice. You get the key facts pulled out and a plain-English read of what could go wrong."
        />
        <Link
          id="notices-sheriff-auctions-link"
          to="/sheriff-sales"
          className="rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] px-4 py-2 text-xs font-semibold text-[#0F172A] hover:text-[#2F5FFF] transition-all shadow-2xs"
        >
          View Scored Sheriff Auctions →
        </Link>
      </div>

      <div id="notices-workspace-grid" className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="notice" className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Notice Text Input
            </label>
            <div className="flex items-center gap-3 text-xs">
              <button
                id="notices-load-sample-btn"
                type="button"
                onClick={() => setText(SAMPLE_NOTICE)}
                className="text-[#2F5FFF] hover:text-blue-700 font-semibold underline underline-offset-2 cursor-pointer"
              >
                Load sample notice
              </button>
              {text && (
                <button
                  id="notices-clear-btn"
                  type="button"
                  onClick={() => setText("")}
                  className="text-[#64748B] hover:text-[#0F172A] cursor-pointer font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            id="notice"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={18}
            placeholder="Paste the full notice here, or click 'Load sample notice' above…"
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 font-mono text-xs leading-relaxed text-[#0F172A] outline-none focus:border-[#2F5FFF] focus:bg-white transition-colors"
          />
          <button
            id="notices-submit-btn"
            type="button"
            disabled={m.isPending || text.trim().length < 40}
            onClick={() => m.mutate(text)}
            className="w-full rounded-lg bg-[#0F172A] hover:bg-[#1E293B] py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            {m.isPending ? "Reading & Extracting Facts…" : "Read This Notice"}
          </button>
          {errorText && (
            <p id="notices-error-text" className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
              {errorText}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {!notice && !m.isPending && (
            <div id="notices-empty-placeholder" className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-xs text-[#64748B]">
              Paste a foreclosure, tax, or trustee notice on the left and click &quot;Read This Notice&quot; to parse parties, judgment debt, redemption periods, and legal risks.
            </div>
          )}
          {notice && (
            <div id="notices-parsed-results" className="space-y-4">
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700">
                    {notice.sale_type.replace("_", " ")} Sale
                  </span>
                  <span className="text-[12px] font-medium text-[#64748B]">
                    {Math.round(notice.confidence * 100)}% confidence
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-[#0F172A]">{notice.verdict}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#64748B]">{notice.plain_english}</p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Extracted Legal Details</h4>
                <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2 text-xs">
                  {FIELDS.map(([label, key]) => {
                    const v = (notice as unknown as Record<string, unknown>)[key];
                    const display =
                      v === null || v === undefined || v === ""
                        ? "—"
                        : (key === "opening_bid" || key === "judgment_amount") && typeof v === "number"
                          ? new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }).format(v)
                          : String(v);
                    return (
                      <div key={key} className="flex justify-between gap-3 border-b border-[#E2E8F0] py-1.5">
                        <dt className="text-[#64748B]">{label}</dt>
                        <dd className="text-right text-[#0F172A] font-semibold truncate max-w-[60%] font-mono">
                          {display}
                        </dd>
                      </div>
                    );
                  })}
                  <div className="flex justify-between gap-3 border-b border-[#E2E8F0] py-1.5">
                    <dt className="text-[#64748B]">Occupancy</dt>
                    <dd className="text-right text-[#0F172A] font-semibold">{notice.occupancy}</dd>
                  </div>
                </dl>
              </div>

              {notice.risks.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">Potential Pitfalls & Title Risks</h4>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs text-rose-700">
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

      {/* Distress Feeds Directory */}
      <div id="notices-distress-feeds-section" className="border-t border-[#E2E8F0] pt-8 space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">Verified Legal & Distress Sale Feeds</h3>
          <p className="mt-1 text-xs text-[#64748B]">
            Primary public notice feeds ingested and monitored for legal auction notices and docket filings.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(sourcesQuery.data && sourcesQuery.data.length > 0
            ? sourcesQuery.data
            : [
                {
                  key: "civilview-bergen",
                  label: "CivilView Bergen County Sheriff",
                  category: "Sheriff Sales",
                  tier: "Free / Public",
                  url: "https://www.civilview.com/bergen",
                  notes: "Weekly sales, published dockets & court writs",
                },
                {
                  key: "civilview-middlesex",
                  label: "CivilView Middlesex County Sheriff",
                  category: "Sheriff Sales",
                  tier: "Free / Public",
                  url: "https://www.civilview.com/middlesex",
                  notes: "Weekly chancery and execution auctions",
                },
                {
                  key: "la-tax-defaulted",
                  label: "LA County Treasurer & Tax Collector",
                  category: "Tax Defaulted",
                  tier: "Free / Public",
                  url: "https://ttc.lacounty.gov",
                  notes: "Annual chapter 7/8 public auction lists",
                },
                {
                  key: "hud-homestore",
                  label: "HUD HomeStore Dockets",
                  category: "Government Foreclosure",
                  tier: "Free / Public",
                  url: "https://hudhomestore.gov",
                  notes: "Federal FHA single family real estate dispositions",
                },
                {
                  key: "miami-dade-clerk",
                  label: "Miami-Dade Foreclosure RealAuction",
                  category: "Foreclosure Auction",
                  tier: "Free / Public",
                  url: "https://www.miamidade.realforeclose.com",
                  notes: "Daily online foreclosure sales & final judgment records",
                },
                {
                  key: "cook-county-sheriff",
                  label: "Cook County Mortgage Foreclosure Sales",
                  category: "Sheriff Sales",
                  tier: "Free / Public",
                  url: "https://cookcountysheriff.org",
                  notes: "Judicial sales dockets & publication notices",
                },
              ]
          ).map((src) => (
            <div
              key={src.key}
              id={`notice-source-card-${src.key}`}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                    {src.category}
                  </span>
                  <span className="text-[11px] font-medium text-[#64748B]">{src.tier}</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-[#0F172A]">{src.label}</h4>
                {src.notes && <p className="mt-1 text-xs text-[#64748B]">{src.notes}</p>}
              </div>
              <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                <a
                  id={`notice-source-link-${src.key}`}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#2F5FFF] hover:text-blue-700 flex items-center gap-1"
                >
                  Visit Notice Source ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
