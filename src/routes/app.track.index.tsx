import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { TrackScreen } from "@/components/genesyx/screens/Track";
import {
  Droplet, Droplets, CalendarDays, Moon, Activity, Apple, ArrowRight,
} from "lucide-react";
import { useTrackingSummary } from "@/hooks/use-tracking-summary";
import { usePhReadings, phStatus, PH_STATUS_LABEL, PH_STATUS_COLOR } from "@/hooks/use-ph";
import { useCycleSettings } from "@/hooks/use-cycle";
import { useHydrationGoal } from "@/hooks/use-hydration-goal";
import { getPhaseSubLabel } from "@/lib/cycleEngine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/track/")({
  head: () => ({
    meta: [
      { title: "Cycle & trackers · Genesyx" },
      { name: "description", content: "Calendar, phases, vaginal pH, and your six trackers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackHubPage,
});

function TrackHubPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Cycle" subtitle="Calendar, phases, and your trackers" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[1100px] space-y-5">
          <TrackersHubPanel />
          <TrackScreen
            onLog={() => navigate({ to: "/app/log" })}
            onRequireAuth={() => navigate({ to: "/auth" })}
          />
        </div>
      </main>
    </div>
  );
}

function TrackersHubPanel() {
  const { summary, logs, loading } = useTrackingSummary(14);
  const { readings } = usePhReadings(14);
  const { settings, cycleInfo } = useCycleSettings();
  const goalMl = useHydrationGoal();

  // Build last-7 daily buckets
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const logByDate = new Map(logs.map(l => [l.date, l]));

  const waterDots = last7.map(d => (logByDate.get(d)?.waterMl ?? 0) >= goalMl);
  const sleepDots = last7.map(d => logByDate.get(d)?.sleepMinutes != null);
  const symptomDots = last7.map(d => (logByDate.get(d)?.symptoms.length ?? 0) > 0);
  const nutriDots = last7.map(d => (logByDate.get(d)?.supplements.length ?? 0) > 0);
  const phByDay = new Map<string, boolean>();
  for (const r of readings) phByDay.set(r.recordedAt.slice(0, 10), true);
  const phDots = last7.map(d => !!phByDay.get(d));

  const latestPh = readings[readings.length - 1] ?? null;
  const latestStatus = latestPh ? phStatus(latestPh.phValue) : null;

  const cards = [
    {
      key: "cycle", to: "/app/track/cycle", Icon: CalendarDays, title: "Cycle",
      summary: cycleInfo ? `Day ${cycleInfo.dayOfCycle} · ${getPhaseSubLabel(cycleInfo.phase, cycleInfo.fertileWindow)}` : "Not set up",
      dots: last7.map(() => !!settings),
    },
    {
      key: "hydration", to: "/app/track/hydration", Icon: Droplets, title: "Hydration",
      summary: `${summary.daysOnGoal}/7 days on goal`,
      dots: waterDots,
    },
    {
      key: "ph", to: "/app/track/ph", Icon: Droplet, title: "Vaginal pH",
      summary: latestPh && latestStatus ? `Latest ${latestPh.phValue.toFixed(1)} · ${PH_STATUS_LABEL[latestStatus]}` : "No readings yet",
      dots: phDots,
    },
    {
      key: "sleep", to: "/app/track/sleep", Icon: Moon, title: "Sleep",
      summary: `${sleepDots.filter(Boolean).length}/7 days logged`,
      dots: sleepDots,
    },
    {
      key: "symptoms", to: "/app/track/symptoms", Icon: Activity, title: "Symptoms",
      summary: `${symptomDots.filter(Boolean).length}/7 days logged`,
      dots: symptomDots,
    },
    {
      key: "nutrition", to: "/app/track/nutrition", Icon: Apple, title: "Nutrition",
      summary: `${nutriDots.filter(Boolean).length}/7 days with supplements`,
      dots: nutriDots,
    },
  ] as const;

  return (
    <Panel title="Your Trackers" description="Six signals · last 7 days">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.key} to={c.to}
            className="dash-panel group block p-4 transition-colors hover:border-primary/40">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-muted text-muted-foreground">
                <c.Icon className="h-4 w-4" />
              </span>
              <p className="font-display text-[14.5px] font-semibold">{c.title}</p>
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-primary group-hover:underline">
                Open <ArrowRight className="h-3 w-3" />
              </span>
            </div>
            <p className="mt-2 text-[12.5px] text-muted-foreground">{loading ? "—" : c.summary}</p>
            <div className="mt-2 flex items-center gap-1.5" aria-label="Last 7 days">
              {c.dots.map((on, i) => (
                <span key={i} className={cn("h-1.5 flex-1 rounded-full", on ? "bg-primary" : "bg-muted")} />
              ))}
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
