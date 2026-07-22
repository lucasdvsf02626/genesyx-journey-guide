import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, PenSquare, ArrowRight } from "lucide-react";
import { useTrackingSummary } from "@/hooks/use-tracking-summary";

export const Route = createFileRoute("/app/track/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition · Genesyx" },
      { name: "description", content: "Supplements you actually logged — including Zinc — with an entry into the log flow." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NutritionDetail,
});

const VOCAB = ["Folic acid", "Folate", "Vitamin D", "Iron", "Omega-3", "Zinc", "Magnesium", "B6"];

function NutritionDetail() {
  const navigate = useNavigate();
  const { logs, loading } = useTrackingSummary(30);

  const summary = useMemo(() => {
    const counts = new Map<string, number>();
    let daysWithAny = 0;
    for (const l of logs) {
      if (l.supplements.length > 0) daysWithAny += 1;
      for (const s of l.supplements) counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return { rows, daysWithAny };
  }, [logs]);

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Nutrition · supplements" subtitle="What you actually logged over the last 30 days" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[900px] space-y-5">
          <Panel title="Supplement summary" description={`${summary.daysWithAny} day${summary.daysWithAny === 1 ? "" : "s"} with supplements`}>
            {loading ? (
              <p className="text-[13px] text-muted-foreground">Loading…</p>
            ) : summary.rows.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Nothing logged yet — supplements you tick in Daily log will show up here.</p>
            ) : (
              <ul className="space-y-2">
                {summary.rows.map(([name, count]) => (
                  <li key={name} className="flex items-center justify-between text-[13.5px]">
                    <span className="capitalize">{name}</span>
                    <span className="tabular-nums text-muted-foreground">{count} day{count === 1 ? "" : "s"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Vocabulary" description="Terms the log understands (including Zinc)">
            <div className="flex flex-wrap gap-1.5">
              {VOCAB.map(v => <Badge key={v} variant="outline">{v}</Badge>)}
            </div>
          </Panel>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate({ to: "/app/log" })}>
              <PenSquare className="h-4 w-4" /> Log supplements
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/app/nutrition" })}>
              <Apple className="h-4 w-4" /> Phase-aware nutrition <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
