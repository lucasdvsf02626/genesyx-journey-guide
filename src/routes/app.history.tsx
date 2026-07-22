import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenSquare, Droplet, Moon, Pill, Activity, ArrowRight } from "lucide-react";
import { listDailyLogsFull, type DailyLogFullDTO } from "@/lib/daily-log.functions";
import { listPhReadings, type PhReadingDTO } from "@/lib/ph.functions";
import { useHydrationGoal } from "@/hooks/use-hydration-goal";
import { useAuth } from "@/hooks/use-auth";
import { phStatus, PH_STATUS_COLOR, PH_STATUS_LABEL } from "@/hooks/use-ph";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "Log history · Genesyx" },
      { name: "description", content: "Every daily log and vaginal pH reading, newest first." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

const PAGE_DAYS = 30;

type DayCard = {
  date: string;
  log: DailyLogFullDTO | null;
  readings: PhReadingDTO[];
};

function toIso(d: string): string { return d.slice(0, 10); }

function buildDayCards(logs: DailyLogFullDTO[], readings: PhReadingDTO[]): DayCard[] {
  const byDate = new Map<string, DayCard>();
  for (const l of logs) {
    byDate.set(l.date, { date: l.date, log: l, readings: [] });
  }
  for (const r of readings) {
    const d = toIso(r.recordedAt);
    const existing = byDate.get(d) ?? { date: d, log: null, readings: [] };
    existing.readings.push(r);
    byDate.set(d, existing);
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const goalMl = useHydrationGoal();
  const listLogs = useServerFn(listDailyLogsFull);
  const listPh = useServerFn(listPhReadings);
  const [logs, setLogs] = useState<DailyLogFullDTO[]>([]);
  const [readings, setReadings] = useState<PhReadingDTO[]>([]);
  const [windowDays, setWindowDays] = useState(PAGE_DAYS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      listLogs({ data: { sinceDays: windowDays } }).catch(() => [] as DailyLogFullDTO[]),
      listPh({ data: { sinceDays: windowDays } }).catch(() => [] as PhReadingDTO[]),
    ]).then(([l, r]) => {
      if (cancelled) return;
      setLogs(l); setReadings(r);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, listLogs, listPh, windowDays]);

  const cards = useMemo(() => buildDayCards(logs, readings), [logs, readings]);

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader title="Log history" subtitle="Every log and pH reading, newest first" />
      <main className="flex-1 px-4 py-5 lg:px-6">
        <div className="mx-auto w-full max-w-[900px] space-y-4">
          {!user ? (
            <Panel title="Sign in to view your history">
              <p className="text-[13.5px] text-muted-foreground">
                Your daily logs and pH readings sync to your Genesyx account.
              </p>
              <Button className="mt-3" onClick={() => navigate({ to: "/auth" })}>Sign in</Button>
            </Panel>
          ) : loading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted/50" />)}
            </div>
          ) : cards.length === 0 ? (
            <Panel title="No history yet">
              <p className="text-[13.5px] text-muted-foreground">
                Add your first daily log or vaginal pH reading to see it here.
              </p>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => navigate({ to: "/app/log" })}>
                  <PenSquare className="h-4 w-4" /> Log today
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: "/app/track/ph" })}>
                  Log vaginal pH <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Panel>
          ) : (
            <>
              {cards.map((c) => <DayCardView key={c.date} card={c} goalMl={goalMl} />)}
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={() => setWindowDays((w) => w + PAGE_DAYS)}>
                  Load older
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function DayCardView({ card, goalMl }: { card: DayCard; goalMl: number }) {
  const l = card.log;
  const waterMl = l?.waterMl ?? 0;
  const waterPct = Math.min(100, Math.round((waterMl / goalMl) * 100));
  const sleepLabel = l && l.sleepMinutes !== null
    ? `${Math.floor(l.sleepMinutes / 60)}h ${l.sleepMinutes % 60}m`
    : null;

  return (
    <section className="dash-panel p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
        <h3 className="font-display text-[15px] font-semibold">{fmtDate(card.date)}</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {l?.mood && <Badge variant="secondary" className="capitalize">{l.mood}</Badge>}
          {l?.energy && <Badge variant="outline" className="capitalize">Energy: {l.energy}</Badge>}
        </div>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricTile Icon={Droplet} label="Water"
          value={waterMl > 0 ? `${(waterMl/1000).toFixed(1)}L` : "—"}
          hint={waterMl > 0 ? `${waterPct}% of goal` : "Not logged"} />
        <MetricTile Icon={Moon} label="Sleep" value={sleepLabel ?? "—"} hint={sleepLabel ? "Recorded" : "Not logged"} />
        <MetricTile Icon={Pill} label="Supplements"
          value={l && l.supplements.length ? String(l.supplements.length) : "—"}
          hint={l && l.supplements.length ? l.supplements.slice(0, 2).join(", ") + (l.supplements.length > 2 ? "…" : "") : "Not logged"} />
        <MetricTile Icon={Activity} label="pH readings"
          value={card.readings.length ? String(card.readings.length) : "—"}
          hint={card.readings.length ? "Vaginal pH" : "Not logged"} />
      </div>

      {l?.symptoms && l.symptoms.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Symptoms</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {l.symptoms.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
          </div>
        </div>
      )}

      {card.readings.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Vaginal pH · trend awareness
          </p>
          <ul className="mt-2 space-y-1.5">
            {card.readings
              .slice()
              .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
              .map((r) => {
                const s = phStatus(r.phValue);
                return (
                  <li key={r.id} className="flex items-center gap-2 text-[13px]">
                    <span
                      className="inline-flex h-7 w-11 items-center justify-center rounded-md font-display tabular-nums text-[12.5px] font-semibold"
                      style={{ background: `color-mix(in oklab, ${PH_STATUS_COLOR[s]} 18%, white)`, color: PH_STATUS_COLOR[s] }}
                    >
                      {r.phValue.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground tabular-nums">{fmtTime(r.recordedAt)}</span>
                    <span className="text-foreground/80">· {PH_STATUS_LABEL[s]}</span>
                    {r.notes && <span className="text-muted-foreground truncate">— {r.notes}</span>}
                  </li>
                );
              })}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">pH entries sync to your Genesyx account</p>
        </div>
      )}

      {l?.notes && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Note</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-foreground/90">{l.notes}</p>
        </div>
      )}
    </section>
  );
}

function MetricTile({ Icon, label, value, hint }: { Icon: typeof Droplet; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 font-display text-[16px] font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11.5px] text-muted-foreground truncate">{hint}</p>
    </div>
  );
}
