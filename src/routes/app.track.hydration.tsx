import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplets, Plus, Minus, Flame } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, ReferenceLine, CartesianGrid, Tooltip } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useHydrationGoal, useSetHydrationGoal } from "@/hooks/use-hydration-goal";
import { MIN_HYDRATION_GOAL_ML, MAX_HYDRATION_GOAL_ML } from "@/lib/hydration.functions";
import { useTrackingSummary } from "@/hooks/use-tracking-summary";
import { toast } from "sonner";

export const Route = createFileRoute("/app/track/hydration")({
  head: () => ({
    meta: [
      { title: "Hydration · Genesyx" },
      { name: "description", content: "Log water, see your goal, week history, and streak." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HydrationDetail,
});

const STEP = 200;

function HydrationDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { log, save } = useDailyLog();
  const goalMl = useHydrationGoal();
  const { summary, logs, loading } = useTrackingSummary(30);
  const [waterMl, setWaterMl] = useState(0);
  const [manual, setManual] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (log) setWaterMl(log.waterMl); }, [log]);

  const queueSave = (next: number) => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      save({ waterMl: next }).catch((e) => toast.error(e instanceof Error ? e.message : "Could not save"));
    }, 400);
  };
  const bump = (delta: number) => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const next = Math.max(0, Math.min(10000, waterMl + delta));
    setWaterMl(next);
    queueSave(next);
  };
  const setManualValue = () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const v = Math.max(0, Math.min(10000, parseInt(manual || "0", 10) || 0));
    setWaterMl(v);
    queueSave(v);
    setManual("");
  };

  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  }), []);
  const logByDate = new Map(logs.map(l => [l.date, l]));
  const chartData = last7.map((d) => {
    const dt = new Date(d + "T00:00:00");
    return {
      label: ["S","M","T","W","T","F","S"][dt.getDay()],
      fullDate: d,
      ml: (d === new Date().toISOString().slice(0, 10) ? waterMl : (logByDate.get(d)?.waterMl ?? 0)),
    };
  });

  const pct = Math.min(100, Math.round((waterMl / goalMl) * 100));

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Hydration" subtitle="The canonical editor — all writes sync everywhere" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[1000px] space-y-5">
          <Panel title="Today" description={`${(waterMl/1000).toFixed(2)}L of ${(goalMl/1000).toFixed(1)}L (${pct}%)`}>
            <div className="flex flex-wrap items-center gap-2">
              {[125, 250, 500].map(step => (
                <Button key={step} variant="outline" onClick={() => bump(step)}>
                  <Plus className="h-4 w-4" /> {step}ml
                </Button>
              ))}
              <Button variant="outline" onClick={() => bump(-STEP)}>
                <Minus className="h-4 w-4" /> {STEP}ml
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Input inputMode="numeric" placeholder="Set ml"
                  value={manual} onChange={(e) => setManual(e.target.value)}
                  className="h-9 w-28" />
                <Button onClick={setManualValue}>Set</Button>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-[12.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-primary" />Weekly streak: {loading ? "—" : summary.weeklyStreak}</span>
              <span>Daily streak: {loading ? "—" : summary.dailyHydration}</span>
              <span>{loading ? "—" : `${summary.daysOnGoal} of 7 days on goal`}</span>
            </div>
          </Panel>

          <Panel title="Last 7 days" description={`Target ${(goalMl/1000).toFixed(1)}L / day`}>
            <div className="h-[240px] w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(1)}L`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <ReferenceLine y={goalMl} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                  <Tooltip formatter={(v: number) => [`${(v/1000).toFixed(2)}L`, "Water"]} labelFormatter={(_, p) => (p?.[0]?.payload as { fullDate: string })?.fullDate ?? ""} />
                  <Bar dataKey="ml" fill="var(--primary)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Daily history">
            <ul className="divide-y divide-border">
              {logs
                .filter(l => l.waterMl > 0)
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .map((l) => (
                  <li key={l.date} className="flex items-center justify-between py-2 text-[13.5px]">
                    <span className="tabular-nums">{l.date}</span>
                    <span className="tabular-nums">{(l.waterMl/1000).toFixed(2)}L</span>
                    <span className="text-muted-foreground">{l.waterMl >= goalMl ? "On goal" : "Below goal"}</span>
                  </li>
                ))}
              {logs.filter(l => l.waterMl > 0).length === 0 && (
                <li className="py-6 text-center text-[13px] text-muted-foreground">No hydration logged yet.</li>
              )}
            </ul>
          </Panel>
        </div>
      </main>
    </div>
  );
}
