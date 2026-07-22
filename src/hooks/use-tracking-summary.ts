import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listDailyLogsFull, type DailyLogFullDTO } from "@/lib/daily-log.functions";
import { listPhReadings, type PhReadingDTO } from "@/lib/ph.functions";
import { useAuth } from "@/hooks/use-auth";
import { computeTrackingSummary, type TrackingSummary } from "@/lib/tracking/engine";
import { toEngineLogs, todayLocalIso, type DailyLogFull } from "@/lib/tracking/adapt";
import { useHydrationGoal } from "@/hooks/use-hydration-goal";

const MIN_WEEK_DAYS = 4;

/**
 * Loads the last N days of daily logs + pH readings and computes the tracking
 * summary via the engine. Refreshes when the auth user changes.
 */
export function useTrackingSummary(days = 90) {
  const { user } = useAuth();
  const goalMl = useHydrationGoal();
  const listLogs = useServerFn(listDailyLogsFull);
  const listPh = useServerFn(listPhReadings);
  const [logs, setLogs] = useState<DailyLogFullDTO[]>([]);
  const [readings, setReadings] = useState<PhReadingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLogs([]); setReadings([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      listLogs({ data: { sinceDays: days } }).catch(() => [] as DailyLogFullDTO[]),
      listPh({ data: { sinceDays: days } }).catch(() => [] as PhReadingDTO[]),
    ]).then(([l, r]) => {
      if (cancelled) return;
      setLogs(l);
      setReadings(r);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, listLogs, listPh, days]);

  const phDates = Array.from(new Set(readings.map((r) => r.recordedAt.slice(0, 10))));
  const summary: TrackingSummary = computeTrackingSummary({
    today: todayLocalIso(),
    logs: toEngineLogs(logs as DailyLogFull[]),
    phDates,
    goalMl,
    minWeekDays: MIN_WEEK_DAYS,
  });

  return { summary, logs, readings, goalMl, loading };
}
