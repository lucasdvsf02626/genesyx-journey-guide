import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon } from "lucide-react";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useTrackingSummary } from "@/hooks/use-tracking-summary";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/track/sleep")({
  head: () => ({
    meta: [
      { title: "Sleep · Genesyx" },
      { name: "description", content: "Week summary and sleep editor. Writes to your daily log." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SleepDetail,
});

function SleepDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { log, save } = useDailyLog();
  const { logs } = useTrackingSummary(30);
  const [h, setH] = useState("7");
  const [m, setM] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (log?.sleepMinutes != null) {
      setH(String(Math.floor(log.sleepMinutes / 60)));
      setM(String(log.sleepMinutes % 60));
    }
  }, [log]);

  const onSave = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const hh = Math.max(0, Math.min(24, parseInt(h || "0", 10) || 0));
    const mm = Math.max(0, Math.min(59, parseInt(m || "0", 10) || 0));
    setSaving(true);
    try {
      await save({ sleepMinutes: hh * 60 + mm });
      toast.success("Sleep saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally { setSaving(false); }
  };

  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  }), []);
  const byDate = new Map(logs.map(l => [l.date, l]));
  const weekData = last7.map(d => ({ date: d, sleep: byDate.get(d)?.sleepMinutes ?? null }));
  const loggedCount = weekData.filter(w => w.sleep != null).length;
  const avg = loggedCount ? weekData.reduce((a, w) => a + (w.sleep ?? 0), 0) / loggedCount : 0;

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Sleep" subtitle="Sleep 0 counts — an all-nighter is still logging" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[900px] space-y-5">
          <Panel title="Today" description="Writes to your daily log">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-[12px] text-muted-foreground">Hours</label>
                <Input type="number" min={0} max={24} className="w-24" value={h} onChange={(e) => setH(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-[12px] text-muted-foreground">Minutes</label>
                <Input type="number" min={0} max={59} className="w-24" value={m} onChange={(e) => setM(e.target.value)} />
              </div>
              <Button onClick={onSave} disabled={saving}><Moon className="h-4 w-4" /> {saving ? "Saving…" : "Save sleep"}</Button>
            </div>
          </Panel>

          <Panel title="Last 7 days" description={loggedCount ? `Averaging ${Math.floor(avg/60)}h ${Math.round(avg%60)}m across ${loggedCount} nights` : "No sleep logged this week"}>
            <ul className="divide-y divide-border">
              {weekData.map((w) => (
                <li key={w.date} className="flex items-center justify-between py-2 text-[13.5px]">
                  <span className="tabular-nums">{w.date}</span>
                  <span className="tabular-nums">{w.sleep != null ? `${Math.floor(w.sleep/60)}h ${w.sleep%60}m` : "—"}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </main>
    </div>
  );
}
