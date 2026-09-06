import React, { useState } from "react";
import {
  MapPin,
  Globe,
  Sparkles,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Building,
  CheckCircle2,
  BookmarkPlus,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useFirebaseAuth } from "@/integrations/firebase";
import { saveDealToFirestore } from "@/integrations/firebase";

interface Props {
  parcelId: string;
  address: string;
  city?: string;
  county?: string;
  state?: string;
  lat?: number;
  lng?: number;
  apn?: string;
  arv?: number;
  maxBid?: number;
}

interface GroundingResult {
  ok: boolean;
  type: string;
  summary: string;
  groundingSources?: Array<{
    title?: string;
    url?: string;
    placeId?: string;
  }>;
  webSearchQueries?: string[];
  maps?: any;
  search?: any;
  error?: string;
}

export function GroundedIntelligenceSection({
  parcelId,
  address,
  city,
  county,
  state,
  lat,
  lng,
  apn,
  arv,
  maxBid,
}: Props) {
  const { user } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState<"maps" | "search" | "comprehensive">("maps");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroundingResult | null>(null);
  const [customInquiry, setCustomInquiry] = useState("");
  const [savingToPortfolio, setSavingToPortfolio] = useState(false);

  const handleRunAnalysis = async (mode: "maps" | "search" | "comprehensive") => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/gemini/grounded-intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: mode,
          address,
          city,
          county,
          state,
          coordinates: lat && lng ? { lat, lng } : undefined,
          apn,
          userQuery: customInquiry.trim() || undefined,
        }),
      });

      const data = (await response.json()) as GroundingResult;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to retrieve grounded intelligence.");
      }
      setResult(data);
      toast.success(
        mode === "maps"
          ? "Google Maps spatial intelligence loaded"
          : mode === "search"
            ? "Google Search live market intelligence loaded"
            : "Comprehensive grounded intelligence loaded",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing Gemini Grounding analysis";
      toast.error(msg);
      setResult({
        ok: false,
        type: mode,
        summary: msg,
        error: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPortfolio = async () => {
    if (!user) {
      toast.error("Please sign in to save this deal and its intelligence to your Firestore portfolio.");
      return;
    }

    setSavingToPortfolio(true);
    try {
      await saveDealToFirestore(user.uid, {
        id: parcelId,
        parcelId,
        address,
        county,
        state,
        arv,
        maxBid,
        underwriteStatus: "underwritten",
        notes: result?.summary ? `[AI Grounded Intelligence - ${new Date().toLocaleDateString()}]\n${result.summary.slice(0, 1500)}` : "",
        starred: true,
      });
      toast.success("Deal and intelligence saved to your Firestore portfolio!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save deal to Firestore");
    } finally {
      setSavingToPortfolio(false);
    }
  };

  return (
    <div className="rounded-lg border border-pp-border bg-pp-header p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/20 text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-pp-text uppercase">
              Grounded Market Intelligence
            </h3>
            <p className="text-[11px] text-pp-muted">
              Live Google Maps spatial telemetry & Google Search public record grounding (Gemini 3.5 Flash)
            </p>
          </div>
        </div>

        {user && (
          <button
            type="button"
            onClick={handleSaveToPortfolio}
            disabled={savingToPortfolio}
            className="flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-[11px] font-medium text-emerald-300 transition-colors hover:bg-emerald-900/40"
          >
            {savingToPortfolio ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <BookmarkPlus className="h-3 w-3" />
            )}
            <span>Save to Portfolio</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-3 flex gap-1.5 border-b border-pp-border pb-2 text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab("maps");
            handleRunAnalysis("maps");
          }}
          disabled={loading}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors ${
            activeTab === "maps"
              ? "bg-blue-900/40 text-blue-300 font-medium border border-blue-500/30"
              : "text-pp-muted hover:bg-pp-page hover:text-pp-text"
          }`}
        >
          <MapPin className="h-3.5 w-3.5 text-blue-400" />
          <span>Maps Grounding</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("search");
            handleRunAnalysis("search");
          }}
          disabled={loading}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors ${
            activeTab === "search"
              ? "bg-emerald-900/40 text-emerald-300 font-medium border border-emerald-500/30"
              : "text-pp-muted hover:bg-pp-page hover:text-pp-text"
          }`}
        >
          <Globe className="h-3.5 w-3.5 text-emerald-400" />
          <span>Search Grounding</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("comprehensive");
            handleRunAnalysis("comprehensive");
          }}
          disabled={loading}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors ${
            activeTab === "comprehensive"
              ? "bg-purple-900/40 text-purple-300 font-medium border border-purple-500/30"
              : "text-pp-muted hover:bg-pp-page hover:text-pp-text"
          }`}
        >
          <Building className="h-3.5 w-3.5 text-purple-400" />
          <span>Full Dual Audit</span>
        </button>
      </div>

      {/* Custom Inquiry input */}
      <div className="mt-2.5 flex gap-2">
        <input
          type="text"
          placeholder="Optional: Enter specific prompt (e.g. proximity to light rail, tax lien risk, zoning restrictions)..."
          value={customInquiry}
          onChange={(e) => setCustomInquiry(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRunAnalysis(activeTab);
          }}
          className="h-8 flex-1 rounded border border-pp-border bg-pp-page px-2.5 text-xs text-pp-text placeholder:text-pp-muted/70 focus:border-amber-500/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleRunAnalysis(activeTab)}
          disabled={loading}
          className="flex h-8 items-center gap-1 rounded bg-amber-600 px-3 text-xs font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Query Gemini</span>
            </>
          )}
        </button>
      </div>

      {/* Result Display */}
      {loading && (
        <div className="mt-4 flex flex-col items-center justify-center rounded border border-pp-border bg-pp-page/50 p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
          <p className="mt-2 text-xs font-medium text-pp-text">
            Executing {activeTab === "maps" ? "Google Maps Spatial Query" : activeTab === "search" ? "Google Search Public Record Audit" : "Dual Grounded Verification"}
          </p>
          <p className="mt-1 text-[11px] text-pp-muted">
            Grounding parcel signals via Gemini 3.5 Flash with live Google platform tools
          </p>
        </div>
      )}

      {!loading && result && (
        <div className="mt-3 space-y-3">
          {result.error ? (
            <div className="flex items-start gap-2 rounded border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-medium">Grounding Service Notice</p>
                <p className="mt-0.5 text-[11px] text-red-300/80">{result.error}</p>
              </div>
            </div>
          ) : (
            <div className="rounded border border-pp-border bg-pp-page p-3">
              <div className="flex items-center justify-between pb-2 border-b border-pp-border/50">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Grounding Verification Complete</span>
                </div>
                <span className="text-[10px] text-pp-muted">Model: gemini-3.5-flash</span>
              </div>

              {/* Summary narrative */}
              <div className="mt-2.5 whitespace-pre-wrap text-xs leading-relaxed text-pp-text">
                {result.type === "comprehensive" ? (
                  <div className="space-y-3">
                    {result.maps?.summary && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                          📍 Google Maps Spatial & Neighborhood Analysis
                        </p>
                        <p className="mt-1">{result.maps.summary}</p>
                      </div>
                    )}
                    {result.search?.summary && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                          🌐 Google Search Public Records & Market News
                        </p>
                        <p className="mt-1">{result.search.summary}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  result.summary
                )}
              </div>

              {/* Grounding Sources / Citations */}
              {((result.groundingSources && result.groundingSources.length > 0) ||
                (result.maps?.groundingSources && result.maps.groundingSources.length > 0) ||
                (result.search?.groundingSources && result.search.groundingSources.length > 0)) && (
                <div className="mt-3 border-t border-pp-border/50 pt-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-pp-muted">
                    Verified Grounding Citations
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {[
                      ...(result.groundingSources || []),
                      ...(result.maps?.groundingSources || []),
                      ...(result.search?.groundingSources || []),
                    ].slice(0, 6).map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url || "#"}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 rounded border border-pp-border bg-pp-header px-2 py-0.5 text-[11px] text-blue-300 transition-colors hover:border-blue-400/50 hover:text-blue-200"
                      >
                        <span className="max-w-[200px] truncate">{source.title || "External Source"}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !result && (
        <div className="mt-2.5 text-center py-3 text-[11px] text-pp-muted">
          Click any mode above to fetch real-time grounded intelligence from Google Maps and Google Search.
        </div>
      )}
    </div>
  );
}
