import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ingestCountyCore, scoreAllCore } from "./ingest-core";
import { scrapyCloudSchedule, zyteEnabled } from "./zyte.server";

export interface MetroSpiderRunResult {
  county_fips: string;
  metro_name: string;
  spiders_triggered: string[];
  parcels_fetched: number;
  parcels_inserted: number;
  distress_events_logged: number;
  scored_deals_updated: number;
  status: "OK" | "PARTIAL" | "FAIL";
  notes: string;
  timestamp: string;
}

export async function runDailyMetroSpiders(countyFips = "17031"): Promise<MetroSpiderRunResult> {
  const startedAt = new Date().toISOString();
  const triggeredSpiders: string[] = [];
  const errors: string[] = [];

  // 1. Check for scrape_targets configured for this county
  const { data: targets } = await supabaseAdmin
    .from("scrape_targets")
    .select("*")
    .eq("county_fips", countyFips)
    .eq("paused", false);

  // 2. Schedule Scrapy Cloud spiders if Zyte integration is active
  if (zyteEnabled()) {
    const activeTargets = targets ?? [];
    const spidersToFire = activeTargets.length > 0 
      ? Array.from(new Set(activeTargets.map((t) => t.spider)))
      : ["zillow_deals", "redfin_deals"];

    for (const spider of spidersToFire) {
      try {
        const { jobid } = await scrapyCloudSchedule({
          spider,
          recipe: "foreclosure",
          jobArgs: { county_fips: countyFips },
        });
        triggeredSpiders.push(`${spider}:${jobid}`);
      } catch (err: any) {
        errors.push(`Zyte error scheduling ${spider}: ${err.message}`);
      }
    }
  }

  // 3. Ingest live public records & distress events for the focus metro (Chicago / Cook County)
  let ingestResult = { fetched: 0, inserted: 0, note: "Skipped" };
  try {
    ingestResult = await ingestCountyCore({
      county_fips: countyFips,
      max_parcels: 250,
      enrich_flood: true,
    });
  } catch (err: any) {
    errors.push(`Ingest error for FIPS ${countyFips}: ${err.message}`);
  }

  // 4. Run the underwriting & scoring engine across the updated parcels
  let scoredCount = 0;
  try {
    const scoreRes = await scoreAllCore();
    scoredCount = scoreRes.scored;
  } catch (err: any) {
    errors.push(`Scoring error: ${err.message}`);
  }

  // 5. Query distress event count for today in Cook County
  const today = new Date().toISOString().split("T")[0];
  const { count: distressCount } = await supabaseAdmin
    .from("distress_events")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today);

  // 6. Record run in scrape_runs for observability
  await supabaseAdmin.from("scrape_runs").insert({
    county_fips: countyFips,
    source_kind: "SOCRATA",
    status: errors.length === 0 ? "success" : errors.length < 3 ? "partial" : "blocked",
    requests_made: ingestResult.fetched,
    triggers_produced: distressCount ?? 0,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    used_zyte: triggeredSpiders.length > 0,
    spider: triggeredSpiders.join(",") || "socrata",
    error: `Daily metro run for Cook County, IL (FIPS ${countyFips}). Spiders: ${triggeredSpiders.join(", ") || "Direct Socrata/ArcGIS"}. ${errors.join("; ")}`,
  });

  return {
    county_fips: countyFips,
    metro_name: "Cook County, IL (Chicago)",
    spiders_triggered: triggeredSpiders,
    parcels_fetched: ingestResult.fetched,
    parcels_inserted: ingestResult.inserted,
    distress_events_logged: distressCount ?? 0,
    scored_deals_updated: scoredCount,
    status: errors.length === 0 ? "OK" : errors.length < 2 ? "PARTIAL" : "FAIL",
    notes: `Completed daily sweep: ${ingestResult.inserted} parcels inserted, ${distressCount ?? 0} distress triggers recorded, ${scoredCount} scored deals updated.`,
    timestamp: new Date().toISOString(),
  };
}
