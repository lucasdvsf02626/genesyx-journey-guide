import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings2 } from "lucide-react";
import { useCycleSettings } from "@/hooks/use-cycle";
import { getCyclePhase, cycleNumberFor, phaseLabel } from "@/lib/cycle";
import { CycleSettingsDialog } from "@/components/genesyx/CycleSettingsDialog";

export const Route = createFileRoute("/app/track/cycle")({
  head: () => ({
    meta: [
      { title: "Cycle · Genesyx" },
      { name: "description", content: "Current phase, cycle metrics, and estimated fertile window." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CycleDetail,
});

function CycleDetail() {
  const navigate = useNavigate();
  const { settings, loading } = useCycleSettings();
  const [open, setOpen] = useState(false);

  const info = settings ? getCyclePhase(settings.lastPeriodDate, settings.cycleLength, settings.periodLength) : null;
  const cycleNo = settings ? cycleNumberFor(settings.lastPeriodDate, settings.cycleLength) : null;

  const fertileStart = info ? info.ovulationDay - 5 : null;
  const fertileEnd = info ? info.ovulationDay + 1 : null;

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Cycle" subtitle="Your phase and metrics" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[900px] space-y-5">
          {!settings && !loading ? (
            <Panel title="Set up your cycle">
              <p className="text-[13.5px] text-muted-foreground">Add the first day of your last period so we can estimate your phase and fertile window.</p>
              <Button className="mt-3" onClick={() => setOpen(true)}>Set up now</Button>
            </Panel>
          ) : (
            <>
              <Panel
                title="Current phase"
                description={info ? `${phaseLabel[info.phase]} · Cycle ${cycleNo} · Day ${info.dayOfCycle}` : "Loading…"}
                actions={
                  <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                    <Settings2 className="h-4 w-4" /> Edit settings
                  </Button>
                }
              >
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Metric label="Cycle length" value={settings ? `${settings.cycleLength} days` : "—"} />
                  <Metric label="Period length" value={settings ? `${settings.periodLength} days` : "—"} />
                  <Metric label="Last period start" value={settings?.lastPeriodDate ?? "—"} />
                  <Metric label="Days until next period" value={info ? `${info.daysUntilNextPeriod}` : "—"} />
                </div>
              </Panel>

              <Panel title="Fertile window · estimated" description="An estimate based on a typical 14-day luteal phase, not a diagnosis.">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={info?.fertileWindow ? "default" : "secondary"}>
                    {info?.fertileWindow ? "You are in your fertile window (estimated)" : "Not in your fertile window today"}
                  </Badge>
                  {info && (
                    <span className="text-[13px] text-muted-foreground">
                      Estimated ovulation on day {info.ovulationDay} · window days {fertileStart}–{fertileEnd}
                    </span>
                  )}
                </div>
              </Panel>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => navigate({ to: "/app/track" })}>Back to trackers hub</Button>
              </div>
            </>
          )}
        </div>
      </main>
      <CycleSettingsDialog open={open} onOpenChange={setOpen} onRequireAuth={() => navigate({ to: "/auth" })} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-[16px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}
