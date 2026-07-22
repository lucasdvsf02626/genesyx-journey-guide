import { Link } from "@tanstack/react-router";
import { Flame, ArrowRight } from "lucide-react";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useHydrationGoal } from "@/hooks/use-hydration-goal";
import { useTrackingSummary } from "@/hooks/use-tracking-summary";
import { cn } from "@/lib/utils";

function mondayOfToday(d = new Date()): Date {
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = day.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  day.setDate(day.getDate() + diff);
  return day;
}
function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function coachLine(pct: number, waterMl: number): string {
  const h = new Date().getHours();
  if (waterMl === 0) return "Nothing logged yet — a glass now is a great start.";
  if (pct >= 100) return "Goal met — steady sips from here.";
  if (h >= 14 && pct < 50) return "Behind pace mid-afternoon — a glass now helps.";
  if (h >= 18 && pct < 75) return "Evening check-in — a small top-up keeps you on track.";
  return "Keep sipping gently through the day.";
}

export function HydrationRingCard() {
  const { log } = useDailyLog();
  const goalMl = useHydrationGoal();
  const { summary, loading } = useTrackingSummary();
  const waterMl = log?.waterMl ?? 0;
  const pct = Math.min(100, Math.round((waterMl / goalMl) * 100));
  const monday = mondayOfToday();
  const todayIso = isoDate(new Date());
  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return { iso: isoDate(d), isToday: isoDate(d) === todayIso, past: d <= new Date() };
  });
  const size = 132, stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <Link to="/app/track/hydration" className="dash-panel group block p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Hydration today</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">Ring shows today vs your goal</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-foreground">
          <Flame className="h-3.5 w-3.5 text-primary" />
          {loading ? "—" : `${summary.weeklyStreak}w streak`}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-5">
        <svg width={size} height={size} className="shrink-0" role="img" aria-label={`${pct}% of hydration goal`}>
          <circle cx={size/2} cy={size/2} r={r} stroke="var(--muted)" strokeWidth={stroke} fill="none" />
          <circle cx={size/2} cy={size/2} r={r} stroke="var(--primary)" strokeWidth={stroke} fill="none"
            strokeLinecap="round" strokeDasharray={`${dash} ${c - dash}`}
            transform={`rotate(-90 ${size/2} ${size/2})`} />
          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground" style={{ fontSize: 22, fontWeight: 600 }}>
            {(waterMl / 1000).toFixed(1)}L
          </text>
          <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>
            of {(goalMl / 1000).toFixed(1)}L
          </text>
        </svg>

        <div className="min-w-0 flex-1">
          <span className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
            pct >= 100 ? "bg-primary/15 text-primary" : pct >= 50 ? "bg-muted text-foreground" : "bg-muted text-muted-foreground",
          )}>
            {pct >= 100 ? "On goal" : pct >= 50 ? "In progress" : "Behind pace"}
          </span>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{coachLine(pct, waterMl)}</p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {loading ? "—" : `${summary.daysOnGoal} of 7 days on goal`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-1.5">
          {weekDots.map((d) => (
            <span key={d.iso} aria-hidden className={cn(
              "h-2 flex-1 rounded-full",
              d.isToday ? (pct >= 100 ? "bg-primary" : "bg-primary/50") : d.past ? "bg-muted-foreground/30" : "bg-muted",
            )} />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary group-hover:underline">
          Open <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
