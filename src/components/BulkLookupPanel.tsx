import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
/**
 * Bulk lookup panel: paste rows as "address, state[, city]" (one per line)
 * or "address | state | city", enqueue as a job, watch progress.
 */
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createBulkLookupJob, listBulkLookupJobs, resumeFailedInJob, getBulkLookupJob } from "@/lib/bulk-lookup.functions";


type ParsedRow = { address: string; state: string; city?: string };

function parseRows(text: string): { rows: ParsedRow[]; errors: string[] } {
  const rows: ParsedRow[] = [];
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const [i, line] of lines.entries()) {
    const parts = line.split(/\||,/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) { errors.push(`Line ${i + 1}: need at least "address, state"`); continue; }
    const address = parts[0];
    const state = parts[1];
    const city = parts[2];
    if (state.length !== 2) { errors.push(`Line ${i + 1}: state must be 2 letters (got "${state}")`); continue; }
    rows.push({ address, state: state.toUpperCase(), city: city || undefined });
  }
  return { rows, errors };
}

export function BulkLookupPanel() {
  const create = useServerFn(createBulkLookupJob);
  const list = useServerFn(listBulkLookupJobs);
  const qc = useQueryClient();

  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const jobs = useQuery({
    queryKey: ["bulk-lookup-jobs"],
    queryFn: () => list(),
    refetchInterval: 5000,
  });

  const parsed = parseRows(text);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!parsed.rows.length) { setMsg("No valid rows to enqueue."); return; }
    setBusy(true);
    try {
      const r = await create({ data: { name: name.trim() || undefined, rows: parsed.rows } });
      setMsg(`Enqueued ${r.enqueued} addresses. The overnight worker will underwrite them.`);
      setText(""); setName("");
      await qc.invalidateQueries({ queryKey: ["bulk-lookup-jobs"] });
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to enqueue.");
    } finally {
      setBusy(false);
    }
  }

  const resume = useServerFn(resumeFailedInJob);
  const latestJob = jobs.data?.[0] as any;
  const latestFailed = Number(latestJob?.failed ?? 0);
  const [resuming, setResuming] = useState(false);

  async function resumeLatest() {
    if (!latestJob) return;
    setResuming(true); setMsg(null);
    try {
      const r = await resume({ data: { job_id: latestJob.id } });
      setMsg(`Requeued ${r.reset} failed items · ran ${r.processed} now (${r.succeeded} ok, ${r.failed} fail).`);
      await qc.invalidateQueries({ queryKey: ["bulk-lookup-jobs"] });
    } catch (e: any) {
      setMsg(e?.message ?? "Resume failed.");
    } finally {
      setResuming(false);
    }
  }


  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Bulk Address Import</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Paste one address per line. Format: <code className="rounded bg-muted px-1.5 py-0.5 text-foreground font-mono text-[11px] border border-border">address, state[, city]</code>.
            The overnight worker underwrites them via Realie.
          </div>
        </div>
        <Button
          type="button"
          onClick={resumeLatest}
          disabled={resuming || !latestJob || latestFailed === 0}
          title={!latestJob ? "No jobs yet" : latestFailed === 0 ? "Latest job has no failed items" : `Requeue ${latestFailed} failed`}
          className="rounded-lg border border-border-strong bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
        >
          {resuming ? "Resuming…" : `Resume failed (${latestFailed})`}
        </Button>
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-[1fr_260px]">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder={"123 Main St, TX, Austin\n456 Oak Ave, TX, Dallas\n789 Elm Dr | CA | San Diego"}
            className="w-full rounded-lg border border-border bg-muted p-3 text-xs font-mono text-foreground outline-none focus:border-primary focus:bg-card transition-colors"
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="font-semibold text-emerald-700">{parsed.rows.length} valid</span>
            {parsed.errors.length > 0 && <span className="font-semibold text-rose-600">{parsed.errors.length} invalid</span>}
            {parsed.errors.slice(0, 2).map((e, i) => <span key={i} className="text-rose-500">· {e}</span>)}
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Job name (optional)"
            className="rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:bg-card transition-colors"
          />
          <Button
            type="submit"
            disabled={busy || !parsed.rows.length}
            className="rounded-lg bg-foreground text-white px-3 py-2 text-xs font-semibold hover:bg-black disabled:opacity-50 transition-colors cursor-pointer"
          >
            {busy ? "Enqueuing…" : `Enqueue ${parsed.rows.length} for overnight`}
          </Button>
          {msg && <div className="text-[11px] text-muted-foreground bg-muted p-2 rounded-md border border-border">{msg}</div>}
        </div>
      </form>

      {(jobs.data?.length ?? 0) > 0 && (
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-xs">
            <thead className="bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-3.5 py-2.5 text-left">Job</th>
                <th className="px-3.5 py-2.5 text-left">Status</th>
                <th className="px-3.5 py-2.5 text-right">Progress</th>
                <th className="px-3.5 py-2.5 text-right">OK / Fail</th>
                <th className="px-3.5 py-2.5 text-right">Created</th>
                <th className="px-3.5 py-2.5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(jobs.data ?? []).map((j: any) => (
                <JobRow key={j.id} job={j} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function JobRow({ job }: { job: any }) {
  const [open, setOpen] = useState(false);
  const get = useServerFn(getBulkLookupJob);
  const detail = useQuery({
    queryKey: ["bulk-lookup-job", job.id],
    queryFn: () => get({ data: { job_id: job.id } }),
    enabled: open,
    refetchInterval: open ? 5000 : false,
  });
  const failedItems = ((detail.data?.items ?? []) as any[]).filter((i) => i.status === "failed");
  return (
    <>
      <tr className="hover:bg-muted transition-colors">
        <td className="px-3.5 py-2.5 font-medium text-foreground">{job.name || job.id.slice(0, 8)}</td>
        <td className="px-3.5 py-2.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted border border-border text-foreground">
            {job.status}
          </span>
        </td>
        <td className="num px-3.5 py-2.5 text-right font-mono text-foreground">{job.processed} / {job.total}</td>
        <td className="num px-3.5 py-2.5 text-right font-mono">
          <span className="text-emerald-600 font-bold">{job.succeeded}</span>{" · "}
          <span className="text-rose-600 font-bold">{job.failed}</span>
        </td>
        <td className="px-3.5 py-2.5 text-right text-muted-foreground">
          {new Date(job.created_at).toLocaleString()}
        </td>
        <td className="px-3.5 py-2.5 text-right">
          <Button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
          >
            {open ? "Hide" : "Details"}
          </Button>
        </td>
      </tr>
      {open && (
        <tr className="bg-muted">
          <td colSpan={6} className="px-4 py-3">
            {detail.isLoading ? (
              <div className="text-[11px] text-muted-foreground">Loading details…</div>
            ) : failedItems.length === 0 ? (
              <div className="text-[11px] text-muted-foreground">
                No failed items ({(detail.data?.items ?? []).length} total).
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  {failedItems.length} Failed Records
                </div>
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-[11px]">
                    <thead className="bg-muted text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-3 py-1.5 text-left font-semibold">Address</th>
                        <th className="px-3 py-1.5 text-left font-semibold">State</th>
                        <th className="px-3 py-1.5 text-right font-semibold">Attempts</th>
                        <th className="px-3 py-1.5 text-left font-semibold">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {failedItems.slice(0, 100).map((it: any) => (
                        <tr key={it.id} className="hover:bg-muted">
                          <td className="px-3 py-1.5 text-foreground">{it.address}{it.city ? `, ${it.city}` : ""}</td>
                          <td className="px-3 py-1.5 font-mono text-muted-foreground">{it.state}</td>
                          <td className="num px-3 py-1.5 text-right font-mono">
                            {it.attempts ?? 0}/{it.max_attempts ?? 3}
                          </td>
                          <td className="px-3 py-1.5 text-rose-600">{it.error ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {failedItems.length > 100 && (
                  <div className="text-[10px] text-muted-foreground">
                    Showing 100 of {failedItems.length} failed items.
                  </div>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

