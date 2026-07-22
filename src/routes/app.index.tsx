import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Panel } from "@/components/dashboard/Panel";
import { HydrationRingCard } from "@/components/dashboard/HydrationRingCard";
import { PhNudgeCard } from "@/components/dashboard/PhNudgeCard";
import { FirstRunCard } from "@/components/dashboard/FirstRunCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Flame, CalendarDays, Activity, Plus, Settings2, ArrowRight, History } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCycleSettings } from "@/hooks/use-cycle";
import { useStreak } from "@/hooks/use-daily-log";
import { usePhReadings } from "@/hooks/use-ph";
import {
  getPhaseSubLabel, getPhaseHeroText, getPhaseHeroSubtext, getTodaysFocus,
} from "@/lib/cycleEngine";
import { CycleSettingsDialog } from "@/components/genesyx/CycleSettingsDialog";
import { useHydrationGoal } from "@/hooks/use-hydration-goal";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Overview · Genesyx" },
      { name: "description", content: "Your cycle, hydration, streak, and vaginal pH at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { user } = useAuth();
  const { settings, cycleInfo, loading } = useCycleSettings();
  const { streak } = useStreak();
  const { readings } = usePhReadings();
  const [cycleOpen, setCycleOpen] = useState(false);
  const navigate = useNavigate();
  const goalMl = useHydrationGoal();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Guest";

  const phaseLine = cycleInfo
    ? `Day ${cycleInfo.dayOfCycle} · ${getPhaseSubLabel(cycleInfo.phase, cycleInfo.fertileWindow)}`
    : loading ? "Loading cycle…" : "Cycle not set up";

  const heroHeading = cycleInfo ? getPhaseHeroText(cycleInfo.phase, cycleInfo.fertileWindow) : "Set up your cycle";
  const heroSub = cycleInfo ? getPhaseHeroSubtext(cycleInfo.phase, cycleInfo.fertileWindow) : "Add your last period date to unlock personalised insights.";
  const focus = cycleInfo ? getTodaysFocus(cycleInfo.phase) : null;
  const lastPh = readings.length ? readings[readings.length - 1] : null;

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader
        title={`Welcome back, ${displayName}`}
        subtitle={phaseLine}
        actions={
          <Button size="sm" variant="outline" onClick={() => setCycleOpen(true)} className="hidden sm:inline-flex">
            <Settings2 className="h-4 w-4" /> Cycle setup
          </Button>
        }
      />

      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[1400px] space-y-5">
          {!settings && !loading && (
            <FirstRunCard onSetup={() => setCycleOpen(true)} />
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard label="Cycle day"
              value={cycleInfo?.dayOfCycle ?? "—"}
              unit={cycleInfo ? "day" : undefined}
              hint={cycleInfo ? getPhaseSubLabel(cycleInfo.phase, cycleInfo.fertileWindow) : "Set up your cycle"}
              icon={CalendarDays} accent />
            <KpiCard label="Hydration goal"
              value={(goalMl / 1000).toFixed(1)}
              unit="L / day"
              hint="Editable in Hydration tracker"
              icon={Droplets} />
            <KpiCard label="Log streak"
              value={streak ?? 0}
              unit="days"
              hint={streak && streak > 0 ? "Keep it up" : "Log today to start"}
              icon={Flame} />
            <KpiCard label="Last vaginal pH"
              value={lastPh ? lastPh.phValue.toFixed(1) : "—"}
              unit={lastPh ? "pH" : undefined}
              hint={lastPh
                ? new Date(lastPh.recordedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                : "No readings yet"}
              icon={Activity} />
          </div>

          {/* Home summary cards */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <HydrationRingCard />
            <PhNudgeCard />
          </div>

          {/* Middle row — phase + focus */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <Panel className="xl:col-span-2" title="Current phase" description={phaseLine}
              actions={
                <Button size="sm" variant="ghost" onClick={() => setCycleOpen(true)}>
                  <Settings2 className="h-4 w-4" /> Edit
                </Button>
              }>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 max-w-xl">
                  <h3 className="font-display text-xl font-semibold tracking-tight">{heroHeading}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{heroSub}</p>
                  {cycleInfo?.fertileWindow && (
                    <Badge className="mt-3" variant="secondary">Fertile window · estimated</Badge>
                  )}
                </div>
                <div className="flex flex-col gap-2 md:min-w-[180px]">
                  <Button onClick={() => navigate({ to: "/app/log" })}>
                    <Plus className="h-4 w-4" /> Log today
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/app/track">Open cycle <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </Panel>

            <Panel title="Today's focus" description="Guidance for this phase">
              {focus ? (
                <>
                  <p className="font-display text-[15px] font-semibold">{focus.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{focus.description}</p>
                  <Button asChild variant="ghost" size="sm" className="mt-3 -ml-2">
                    <Link to="/app/nutrition">See nutrition <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </>
              ) : (
                <p className="text-[13px] text-muted-foreground">Complete your cycle setup to see phase-specific focus foods.</p>
              )}
            </Panel>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <Panel className="xl:col-span-2" title="Quick actions">
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/app/log"><Plus className="h-4 w-4" /> Log today</Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/app/track">Trackers hub <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/app/insights"><Activity className="h-4 w-4" /> View insights</Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/app/history"><History className="h-4 w-4" /> Log history</Link>
                </Button>
              </div>
            </Panel>
            <Panel title="Learn" description="Bite-sized, evidence-informed">
              <p className="text-[13px] text-muted-foreground">Ten short articles on hydration, cycle-aware eating, insights, and habits.</p>
              <Button asChild variant="outline" className="mt-3">
                <Link to="/app/learn">Open Learn <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </Panel>
          </div>
        </div>
      </main>

      <CycleSettingsDialog open={cycleOpen} onOpenChange={setCycleOpen} onRequireAuth={() => navigate({ to: "/auth" })} />
    </div>
  );
}
