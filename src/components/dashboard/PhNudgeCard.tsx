import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePhReadings, phStatus, PH_STATUS_LABEL, PH_STATUS_COLOR, PH_RANGE_TEXT } from "@/hooks/use-ph";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function PhNudgeCard() {
  const { user } = useAuth();
  const { readings, loading } = usePhReadings(30);
  const latest = readings.length ? readings[readings.length - 1] : null;
  const status = latest ? phStatus(latest.phValue) : null;

  return (
    <Link to="/app/track/ph" className="dash-panel group block p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Vaginal pH</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">Trend awareness, not diagnosis</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary group-hover:underline">
          Open <ArrowRight className="h-3 w-3" />
        </span>
      </div>
      {loading ? (
        <div className="mt-4 h-14 animate-pulse rounded-xl bg-muted/50" />
      ) : latest && status ? (
        <div className="mt-3 flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl font-display text-lg font-semibold tabular-nums"
               style={{ background: `color-mix(in oklab, ${PH_STATUS_COLOR[status]} 18%, white)`, color: PH_STATUS_COLOR[status] }}>
            {latest.phValue.toFixed(1)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: PH_STATUS_COLOR[status] }}>
              {PH_STATUS_LABEL[status]}
            </p>
            <p className="text-[11.5px] text-muted-foreground">{relativeTime(latest.recordedAt)}</p>
            <p className="mt-1 text-[10.5px] text-muted-foreground">pH entries sync to your Genesyx account</p>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-border/60 p-3">
          <p className="text-[13px] font-medium text-foreground">
            {user ? "Log your first vaginal pH reading" : "Sign in to log vaginal pH"}
          </p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Values from {PH_RANGE_TEXT}. Entries sync to your Genesyx account.
          </p>

        </div>
      )}
    </Link>
  );
}
