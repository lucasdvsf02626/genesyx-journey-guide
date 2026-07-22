import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenSquare } from "lucide-react";
import { useTrackingSummary } from "@/hooks/use-tracking-summary";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/track/symptoms")({
  head: () => ({
    meta: [
      { title: "Symptoms · Genesyx" },
      { name: "description", content: "4-week symptom heatmap and dated history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SymptomsDetail,
});

function heatColor(level: number): string {
  const alphas = [0, 0.2, 0.4, 0.65, 0.9];
  const a = alphas[Math.min(4, Math.max(0, Math.floor(level)))];
  if (a === 0) return "transparent";
  return `color-mix(in oklab, var(--primary) ${a * 100}%, transparent)`;
}

function SymptomsDetail() {
  const navigate = useNavigate();
  const { logs, loading } = useTrackingSummary(30);

  const days28 = useMemo(() => {
    const out: { date: string; count: number }[] = [];
    const today = new Date();
    const byDate = new Map(logs.map(l => [l.date, l]));
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      out.push({ date: iso, count: byDate.get(iso)?.symptoms.length ?? 0 });
    }
    return out;
  }, [logs]);

  const weeks: (typeof days28) = [];
  for (let i = 0; i < days28.length; i += 7) weeks.push(days28.slice(i, i + 7) as never);
  const history = logs.filter(l => l.symptoms.length > 0).sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Symptoms" subtitle="Last 4 weeks · dated history" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[900px] space-y-5">
          <Panel title="4-week heatmap" description="Each cell is a day; darker = more symptoms">
            <div className="space-y-1.5">
              {(weeks as unknown as { date: string; count: number }[][]).map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1.5">
                  {week.map((day) => (
                    <div key={day.date}
                      title={`${day.date} · ${day.count} symptom${day.count === 1 ? "" : "s"}`}
                      className={cn("aspect-square rounded-md border border-border/50")}
                      style={{ background: heatColor(day.count) }} />
                  ))}
                </div>
              ))}
            </div>
            {loading && <p className="mt-2 text-[12px] text-muted-foreground">Loading…</p>}
          </Panel>

          <Panel title="History" description="Days with at least one logged symptom">
            {history.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No symptoms logged in the last 30 days.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((l) => (
                  <li key={l.date} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2.5 text-[13px]">
                    <span className="tabular-nums font-medium">{l.date}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {l.symptoms.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Button className="mt-3" variant="outline" onClick={() => navigate({ to: "/app/log" })}>
              <PenSquare className="h-4 w-4" /> Open daily log
            </Button>
          </Panel>
        </div>
      </main>
    </div>
  );
}
