import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Droplets,
  Activity,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronRight,
  Flame,
  HeartPulse,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  CartesianGrid,
  BarChart,
  Bar,
  type TooltipProps,
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { listDailyLogs, type DailyLogRowDTO } from "@/lib/daily-log.functions";
import {
  usePhReadings,
  phStatus,
  PH_STATUS_LABEL,
  PH_STATUS_COLOR,
  PH_BANDS,
  PH_MIN,
  PH_MAX,
  type PhStatus,
} from "@/hooks/use-ph";

import { useHydrationGoal } from "@/hooks/use-hydration-goal";
import { useTrackingSummary as _useTrackingSummary } from "@/hooks/use-tracking-summary";

const WATER_TARGET_ML = 2400;

export function InsightsScreen({ onOpenTracker }: { onOpenTracker?: () => void }) {
  const goalMl = useHydrationGoal();
  const { user } = useAuth();
  const listFn = useServerFn(listDailyLogs);
  const [logs, setLogs] = useState<DailyLogRowDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { readings, loading: phLoading } = usePhReadings(30);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setLogs([]); setLoading(false); return; }
    setLoading(true);
    listFn({ data: { sinceDays: 30 } })
      .then((rows) => { if (!cancelled) setLogs(rows); })
      .catch(() => { if (!cancelled) setLogs([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, listFn]);

  const days28 = useMemo(() => buildDayGrid(28, logs), [logs]);
  const days7 = useMemo(() => days28.slice(-7), [days28]);
  const phSeries = useMemo(() => buildPhSeries(30, readings), [readings]);
  const symptomCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of logs) for (const s of l.symptoms) counts.set(s, (counts.get(s) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [logs]);

  const loggedDays = logs.length;
  const avgWater = loggedDays > 0
    ? Math.round(logs.reduce((a, l) => a + l.waterMl, 0) / loggedDays)
    : 0;
  const consistencyPct = Math.round((loggedDays / 30) * 100);

  const latestPh = phSeries.filter((d) => d.value != null).slice(-1)[0]?.value ?? null;
  const prevPh = phSeries.filter((d) => d.value != null).slice(-2, -1)[0]?.value ?? null;
  const avgPh = (() => {
    const vals = phSeries.filter((d) => d.value != null).map((d) => d.value as number);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  })();
  const phTrend: "up" | "down" | "flat" | null =
    latestPh != null && prevPh != null
      ? latestPh - prevPh > 0.1 ? "up" : latestPh - prevPh < -0.1 ? "down" : "flat"
      : null;
  const currentStatus: PhStatus | null = latestPh != null ? phStatus(latestPh) : null;

  if (!user) {
    const demoPh = Array.from({ length: 30 }, (_, i) => ({
      day: i,
      label: `D${i + 1}`,
      value: +(4.2 + Math.sin(i / 3) * 0.35 + (i % 7 === 0 ? 0.25 : 0)).toFixed(2),
    }));

    const demoHydration = [1.6, 2.1, 1.9, 2.4, 2.2, 2.5, 2.0].map((l, i) => ({
      label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      litres: l,
      pct: Math.round((l * 1000 / WATER_TARGET_ML) * 100),
    }));
    return (
      <div className="space-y-6">
        {/* Preview banner */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-[22px] font-semibold leading-tight">Your insights are waiting</p>
                <p className="mt-1 text-[14px] text-muted-foreground max-w-xl">
                  Sign in to unlock personalized vaginal pH trends, hydration tracking, symptom heatmaps and consistency streaks — built from your daily logs.
                </p>
              </div>
            </div>
            <a
              href="/auth"
              className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-[14px] font-medium text-primary-foreground shadow-sm transition hover:opacity-90 md:self-auto"
            >
              Sign in to view <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Preview KPI cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: HeartPulse, label: "Latest vaginal pH", value: "6.8", meta: "Optimal range", tone: "text-emerald-500" },
            { icon: Droplets, label: "Avg hydration", value: "2.1 L", meta: "88% of daily target", tone: "text-sky-500" },
            { icon: CalendarCheck, label: "Consistency", value: "24 / 30", meta: "80% logged", tone: "text-primary" },
          ].map((k) => (
            <div key={k.label} className="rounded-3xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-wide text-muted-foreground">{k.label}</span>
                <k.icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <p className="mt-3 font-display text-[28px] font-semibold">{k.value}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{k.meta}</p>
            </div>
          ))}
        </div>

        {/* Preview charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border bg-card p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-display text-[16px] font-semibold">Vaginal pH trend · sample</p>
                <p className="text-[12px] text-muted-foreground">30-day preview with optimal zone (3.5–4.5)</p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">Demo data</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demoPh} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={4} axisLine={false} tickLine={false} />
                  <YAxis domain={[PH_MIN, PH_MAX]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ReferenceArea y1={PH_MIN} y2={4.5} fill="hsl(var(--primary))" fillOpacity={0.08} />
                  <ReferenceLine y={4.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />

                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-5">
            <div className="mb-3">
              <p className="font-display text-[16px] font-semibold">Hydration · sample</p>
              <p className="text-[12px] text-muted-foreground">Last 7 days vs 2.4 L target</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoHydration} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={2.4} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                  <Bar dataKey="litres" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* What you'll get */}
        <div className="rounded-3xl border bg-card p-6">
          <p className="font-display text-[16px] font-semibold">What you'll unlock</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Activity, title: "Vaginal pH patterns", body: "See when your body drifts outside the optimal window." },
              { icon: Droplets, title: "Hydration streaks", body: "Track daily water intake against your target." },
              { icon: Flame, title: "Symptom heatmap", body: "Spot recurring symptoms across the last 28 days." },
              { icon: TrendingUp, title: "Consistency score", body: "Build a habit — the more you log, the sharper the insights." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border bg-background/50 p-4">
                <f.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-[14px] font-semibold">{f.title}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading || phLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/60" />)}
        </div>
        <div className="h-72 animate-pulse rounded-3xl bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-3xl bg-muted/60" />
          <div className="h-64 animate-pulse rounded-3xl bg-muted/60" />
        </div>
      </div>
    );
  }

  const empty = loggedDays === 0 && readings.length === 0;

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="flex flex-col gap-2">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Your Insights
        </p>
        <h2 className="font-display text-[28px] font-semibold leading-tight tracking-tight md:text-[34px]">
          Patterns from the last 30 days
        </h2>
        <p className="max-w-[62ch] text-[14.5px] leading-relaxed text-muted-foreground">
          {empty
            ? "Log a few days and your patterns will start to appear here."
            : "Understanding your rhythm helps you make informed, gentle decisions for your wellbeing."}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          Icon={HeartPulse}
          label="Latest vaginal pH"
          value={latestPh != null ? latestPh.toFixed(1) : "—"}
          hint={currentStatus ? PH_STATUS_LABEL[currentStatus] : "No readings yet"}
          hintColor={currentStatus ? PH_STATUS_COLOR[currentStatus] : undefined}
          trend={phTrend}
        />
        <KpiCard
          Icon={Droplets}
          label="Avg hydration"
          value={avgWater > 0 ? `${(avgWater / 1000).toFixed(1)}L` : "—"}
          hint={avgWater > 0 ? `${Math.round((avgWater / goalMl) * 100)}% of daily target` : "Log to start"}
        />
        <KpiCard
          Icon={CalendarCheck}
          label="Logging consistency"
          value={`${loggedDays}/30`}
          hint={`${consistencyPct}% of the last 30 days`}
        />
      </div>

      {/* pH trend */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Vaginal pH trend
            </p>
            <h3 className="mt-1 font-display text-[20px] font-semibold">
              Vaginal pH — last 30 days
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Optimal zone shaded. Above 6.0 is usually a sampling artefact — retest rather than read into it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
            {PH_BANDS.map((b) => (
              <Legend key={b.status} swatch={PH_STATUS_COLOR[b.status]} label={`${b.label} ${b.range}`} />
            ))}

            {onOpenTracker && (
              <button
                type="button"
                onClick={onOpenTracker}
                className="ml-1 inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-muted"
              >
                Open tracker <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 h-[280px] w-full">
          {readings.length === 0 ? (
            <EmptyChart
              label="No vaginal pH readings yet"
              hint="Log your first reading on the Track page to start seeing your trend."
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={phSeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  domain={[4.5, 8.5]}
                  ticks={[5, 6, 7, 8]}
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <ReferenceArea y1={6} y2={7.5} fill="#3FA37A" fillOpacity={0.08} />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
                  content={<PhTooltip />}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--primary)" }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {avgPh != null && (
          <p className="mt-4 flex items-center gap-2 text-[13px] text-foreground/80">
            <Activity className="h-4 w-4 text-primary" />
            30-day average <strong className="mx-1">{avgPh.toFixed(1)}</strong> ·{" "}
            <span style={{ color: PH_STATUS_COLOR[phStatus(avgPh)] }}>
              {PH_STATUS_LABEL[phStatus(avgPh)]}
            </span>
          </p>
        )}
      </section>

      {/* Two-column: hydration + consistency ring */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Hydration bars */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Hydration
              </p>
              <h3 className="mt-1 font-display text-[20px] font-semibold">Last 7 days</h3>
            </div>
            <span className="text-[12px] font-medium text-primary">Target 2.4L / day</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
            <Legend swatch="var(--color-electric-blue, #57A1CE)" label="Water logged" />
            <Legend swatch="var(--muted-foreground)" label="2.4L daily target" dashed />
          </div>
          <div className="mt-4 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days7.map((d) => ({ label: d.weekday, fullDate: d.date, ml: d.waterMl, pct: d.pct }))}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={36}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}L`} />
                <ReferenceLine
                  y={goalMl}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  label={{ value: "Target", position: "right", fill: "var(--muted-foreground)", fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={<HydrationTooltip />}
                />
                <Bar dataKey="ml" fill="var(--color-electric-blue, #57A1CE)" radius={[8, 8, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 flex items-center gap-2 text-[13px] text-foreground/80">
            <Droplets className="h-4 w-4 text-[var(--color-electric-blue,#57A1CE)]" />
            {avgWater > 0
              ? `${(avgWater / 1000).toFixed(1)}L average across ${loggedDays} day${loggedDays === 1 ? "" : "s"} logged.`
              : "No hydration logged yet — tap Log today on Home to start."}
          </p>
        </section>

        {/* Consistency ring */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Consistency
          </p>
          <h3 className="mt-1 font-display text-[20px] font-semibold">Logging streak</h3>

          <div className="mt-6 flex items-center gap-6">
            <Ring pct={consistencyPct} />
            <div className="min-w-0">
              <p className="font-display text-[32px] font-semibold leading-none">
                {loggedDays}
                <span className="ml-1 text-[15px] font-medium text-muted-foreground">/ 30 days</span>
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-primary" />
                {consistencyPct >= 70
                  ? "Beautifully steady rhythm."
                  : consistencyPct >= 30
                    ? "You're building a rhythm — keep going."
                    : "A few more logs will unlock richer insights."}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Two-column: symptom heatmap + top symptoms */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Symptom activity
              </p>
              <h3 className="mt-1 font-display text-[20px] font-semibold">Last 4 weeks</h3>
            </div>
            <span className="text-[12px] text-muted-foreground">Each cell = 1 day</span>
          </div>

          <Heatmap days={days28} />

          <div className="mt-4 flex items-center justify-between gap-4 text-[11.5px] text-muted-foreground">
            <span>Hover a cell for details</span>
            <div className="flex items-center gap-2">
              <span>0</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="h-3 w-4 rounded-sm border border-border/50"
                    style={{ background: heatColor(i) }}
                    title={i === 0 ? "No symptoms logged" : `${i}${i === 4 ? "+" : ""} symptom${i === 1 ? "" : "s"}`}
                  />
                ))}
              </div>
              <span>4+ symptoms</span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Top symptoms
          </p>
          <h3 className="mt-1 font-display text-[20px] font-semibold">Most logged this month</h3>

          {symptomCounts.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
              <Sparkles className="h-8 w-8 text-primary/60" />
              <p className="mt-3 text-[14px] font-medium">No symptoms logged yet</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Start with Daily log and patterns appear here in a few days.
              </p>
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {symptomCounts.map(([name, count]) => {
                const max = symptomCounts[0][1];
                const pct = Math.round((count / max) * 100);
                return (
                  <li key={name}>
                    <div className="flex items-center justify-between text-[13.5px]">
                      <span className="font-medium capitalize text-foreground">{name}</span>
                      <span className="text-muted-foreground">
                        {count} day{count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Supplement adherence + Weekly summary — powered by real logs */}
      <SupplementAndWeeklySummary />

      {/* Footer strip */}
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/8 via-card to-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-[16px] font-semibold">Your logs, always available</p>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              Every daily log and pH reading is on the History page — one card per day.
            </p>
          </div>
          <a href="/app/history" className="inline-flex h-11 items-center gap-1 rounded-xl border border-border bg-card px-5 text-[14px] font-semibold text-foreground hover:bg-muted">
            My logs <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

type Day = {
  date: string;
  weekday: string;
  waterMl: number;
  pct: number;
  symptomCount: number;
  logged: boolean;
};

function buildDayGrid(n: number, logs: DailyLogRowDTO[]): Day[] {
  const byDate = new Map(logs.map((l) => [l.date, l]));
  const out: Day[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const row = byDate.get(iso);
    const ml = row?.waterMl ?? 0;
    out.push({
      date: iso,
      weekday: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
      waterMl: ml,
      pct: Math.min(100, Math.round((ml / WATER_TARGET_ML) * 100)),
      symptomCount: row?.symptoms?.length ?? 0,
      logged: !!row,
    });
  }
  return out;
}

function buildPhSeries(n: number, readings: { phValue: number; recordedAt: string }[]) {
  const byDate = new Map<string, number[]>();
  for (const r of readings) {
    const key = r.recordedAt.slice(0, 10);
    (byDate.get(key) ?? byDate.set(key, []).get(key)!).push(r.phValue);
  }
  const out: { date: string; label: string; value: number | null }[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const arr = byDate.get(iso);
    const value = arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    out.push({
      date: iso,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      value: value != null ? Math.round(value * 10) / 10 : null,
    });
  }
  return out;
}

function heatColor(level: 0 | 1 | 2 | 3 | 4 | number) {
  const alphas = [0.06, 0.2, 0.4, 0.65, 0.9];
  const a = alphas[Math.min(4, Math.max(0, Math.floor(level)))];
  return `color-mix(in oklab, var(--primary) ${a * 100}%, transparent)`;
}

function Heatmap({ days }: { days: Day[] }) {
  // 4 weeks x 7 days = 28 cells
  const weeks: Day[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return (
    <div className="mt-5">
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-2 space-y-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((day) => {
              const level = day.logged
                ? Math.min(4, day.symptomCount)
                : 0;
              return (
                <div
                  key={day.date}
                  title={`${day.date} · ${day.symptomCount} symptom${day.symptomCount === 1 ? "" : "s"}${day.logged ? "" : " · not logged"}`}
                  className="aspect-square rounded-md border border-border/50"
                  style={{
                    background: day.logged ? heatColor(level) : "transparent",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const size = 120;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--muted)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-[22px] font-semibold">{pct}%</span>
      </div>
    </div>
  );
}

function KpiCard({
  Icon,
  label,
  value,
  hint,
  hintColor,
  trend,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  hintColor?: string;
  trend?: "up" | "down" | "flat" | null;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-[28px] font-semibold leading-none">{value}</span>
        {TrendIcon && <TrendIcon className="h-4 w-4 text-primary" />}
      </div>
      {hint && (
        <p className="mt-2 text-[12.5px]" style={{ color: hintColor ?? "var(--muted-foreground)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function Legend({ swatch, label, dashed }: { swatch: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {dashed ? (
        <span
          className="inline-block h-0 w-4 border-t-2 border-dashed"
          style={{ borderColor: swatch }}
        />
      ) : (
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: swatch }} />
      )}
      {label}
    </span>
  );
}

function formatFullDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function PhTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload as { date: string; value: number | null };
  const status = p.value != null ? phStatus(p.value) : null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium text-foreground">{formatFullDate(p.date)}</p>
      {p.value != null ? (
        <>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-[18px] font-semibold text-foreground">
              {p.value.toFixed(1)}
            </span>
            <span className="text-muted-foreground">pH</span>
          </div>
          {status && (
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: PH_STATUS_COLOR[status] }}
              />
              <span style={{ color: PH_STATUS_COLOR[status] }} className="font-medium">
                {PH_STATUS_LABEL[status]}
              </span>
            </div>
          )}
        </>
      ) : (
        <p className="mt-1 text-muted-foreground">No reading logged</p>
      )}
    </div>
  );
}

function HydrationTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload as { fullDate: string; ml: number; pct: number };
  const delta = p.ml - WATER_TARGET_ML;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium text-foreground">{formatFullDate(p.fullDate)}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-[18px] font-semibold text-foreground">
          {(p.ml / 1000).toFixed(2)}L
        </span>
        <span className="text-muted-foreground">/ 2.4L</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="rounded-md bg-[var(--color-electric-blue,#57A1CE)]/15 px-1.5 py-0.5 font-medium text-[var(--color-electric-blue,#57A1CE)]">
          {p.pct}% of target
        </span>
        {p.ml > 0 && (
          <span className="text-muted-foreground">
            {delta >= 0 ? `+${(delta / 1000).toFixed(2)}L over` : `${(delta / 1000).toFixed(2)}L to go`}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-background/50">
      <div className="max-w-sm px-6 text-center">
        <Activity className="mx-auto h-8 w-8 text-primary/60" />
        <p className="mt-3 font-display text-[15px] font-semibold">{label}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function SupplementAndWeeklySummary() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SupplementAdherenceCard />
      <WeeklySummaryCard />
    </div>
  );
}

function SupplementAdherenceCard() {
  const { logs, loading } = useTrackingSummaryFromEngine();
  const rows = (() => {
    const counts = new Map<string, number>();
    for (const l of logs) for (const s of l.supplements) counts.set(s, (counts.get(s) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  })();
  const daysWith = logs.filter((l: { supplements: string[] }) => l.supplements.length > 0).length;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Supplement adherence
      </p>
      <h3 className="mt-1 font-display text-[20px] font-semibold">
        {daysWith} day{daysWith === 1 ? "" : "s"} in the last 30
      </h3>
      {loading ? (
        <p className="mt-3 text-[13px] text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-[13px] text-muted-foreground">
          Tick supplements in Daily log to see adherence here.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.slice(0, 6).map(([name, count]) => {
            const pct = Math.round((count / 30) * 100);
            return (
              <li key={name}>
                <div className="flex items-center justify-between text-[13.5px]">
                  <span className="font-medium">{name}</span>
                  <span className="tabular-nums text-muted-foreground">{count}/30 · {pct}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function WeeklySummaryCard() {
  const { summary, logs, loading } = useTrackingSummaryFromEngine();
  const weekComplete = summary.daysLoggedThisWeek >= 4;
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Weekly summary
      </p>
      <h3 className="mt-1 font-display text-[20px] font-semibold">
        This week · ISO Mon–Sun
      </h3>
      {loading ? (
        <p className="mt-3 text-[13px] text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniStat label="Days logged" value={`${summary.daysLoggedThisWeek}/7`} />
          <MiniStat label="Days on hydration goal" value={`${summary.daysOnGoal}/7`} />
          <MiniStat label="Weekly streak" value={`${summary.weeklyStreak}w`} />
          <MiniStat label="Daily activity streak" value={`${summary.dailyActivity}d`} />
        </div>
      )}
      <p className="mt-4 text-[12px] text-muted-foreground">
        A week is complete once you've logged at least 4 of 7 days.
        {weekComplete ? " This week clears the threshold." : " Log a few more days to complete this week."}
      </p>
      {logs.length === 0 && (
        <p className="mt-2 text-[12px] text-muted-foreground">Nothing logged yet — start with a mood or a glass of water.</p>
      )}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-[18px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}

// Local helper so this file stays self-contained.
function useTrackingSummaryFromEngine() {
  return _useTrackingSummary(30);
}
