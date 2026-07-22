/**
 * Genesyx tracking engine — pure, deterministic, cross-platform.
 *
 * Contract is defined by tracking_test_vectors.json. Do not add
 * platform-specific behaviour (timezones, storage, UI). All dates are
 * ISO local dates ("YYYY-MM-DD") interpreted in UTC for arithmetic.
 *
 * A log "omits" a field when the field is `undefined`. `null` and `0`
 * are real recorded values (an all-nighter with sleepMinutes:0 counts).
 */

export type TrackingLog = {
  date: string;
  mood?: string | null;
  energy?: string | null;
  symptoms?: string[];
  sleepMinutes?: number | null;
  waterMl?: number;
  supplements?: string[];
  notes?: string | null;
  note?: string | null;
};

export type TrackingInput = {
  today: string;
  logs: TrackingLog[];
  phDates: string[];
  goalMl: number;
  minWeekDays: number;
};

export type TrackingSummary = {
  dailyActivity: number;
  dailyHydration: number;
  weeklyStreak: number;
  daysLoggedThisWeek: number;
  daysOnGoal: number;
};

// ---------- date helpers (UTC) ----------

function parse(iso: string): Date {
  return new Date(iso + "T00:00:00Z");
}
function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, delta: number): string {
  const d = parse(iso);
  d.setUTCDate(d.getUTCDate() + delta);
  return fmt(d);
}
/** Monday of the ISO week that owns `iso` (Sunday belongs to previous week). */
function mondayOf(iso: string): string {
  const d = parse(iso);
  const dow = d.getUTCDay(); // 0=Sun..6=Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diff);
  return fmt(d);
}

// ---------- day classification ----------

function logIsMeaningful(l: TrackingLog): boolean {
  if (l.mood !== undefined && l.mood !== null && l.mood !== "") return true;
  if (l.energy !== undefined && l.energy !== null && l.energy !== "") return true;
  if (l.symptoms !== undefined && l.symptoms.length > 0) return true;
  if (l.sleepMinutes !== undefined) return true; // 0 is a real value
  if (l.waterMl !== undefined) return true;
  if (l.supplements !== undefined && l.supplements.length > 0) return true;
  if (l.notes !== undefined && l.notes !== null && l.notes !== "") return true;
  if (l.note !== undefined && l.note !== null && l.note !== "") return true;
  return false;
}

type DayIndex = {
  meaningful: Set<string>;
  hydration: Set<string>;
  onGoal: Set<string>;
};

function indexDays(input: TrackingInput): DayIndex {
  const meaningful = new Set<string>();
  const hydration = new Set<string>();
  const onGoal = new Set<string>();
  for (const l of input.logs) {
    if (logIsMeaningful(l)) meaningful.add(l.date);
    if (l.waterMl !== undefined) {
      hydration.add(l.date);
      if (l.waterMl >= input.goalMl) onGoal.add(l.date);
    }
  }
  for (const d of input.phDates) meaningful.add(d);
  return { meaningful, hydration, onGoal };
}

// ---------- streak helpers ----------

/**
 * Consecutive-day count ending at today (or yesterday if today is unlogged
 * — the "grace day"). Returns 0 if the most recent qualifying day is
 * older than yesterday, or if there are none.
 */
function consecutiveEndingAtToday(days: Set<string>, today: string): number {
  let anchor: string | null = null;
  if (days.has(today)) anchor = today;
  else if (days.has(addDays(today, -1))) anchor = addDays(today, -1);
  if (!anchor) return 0;
  let count = 0;
  let cursor: string | null = anchor;
  while (cursor && days.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

function countInWeek(days: Set<string>, mondayIso: string): number {
  let n = 0;
  for (let i = 0; i < 7; i++) if (days.has(addDays(mondayIso, i))) n += 1;
  return n;
}

// ---------- public API ----------

export function computeTrackingSummary(input: TrackingInput): TrackingSummary {
  const days = indexDays(input);

  const dailyActivity = consecutiveEndingAtToday(days.meaningful, input.today);
  const dailyHydration = consecutiveEndingAtToday(days.hydration, input.today);

  const currentMonday = mondayOf(input.today);
  const daysLoggedThisWeek = countInWeek(days.meaningful, currentMonday);
  const daysOnGoal = countInWeek(days.onGoal, currentMonday);

  // Weekly streak: incomplete current week never breaks the run — start
  // from the previous week and walk backwards while each week clears the
  // threshold; then add 1 if the current week already clears it.
  let weeklyStreak = 0;
  let cursor = addDays(currentMonday, -7);
  // Safety cap so a corrupt today never loops forever.
  for (let i = 0; i < 520; i++) {
    if (countInWeek(days.meaningful, cursor) >= input.minWeekDays) {
      weeklyStreak += 1;
      cursor = addDays(cursor, -7);
    } else break;
  }
  if (countInWeek(days.meaningful, currentMonday) >= input.minWeekDays) {
    weeklyStreak += 1;
  }

  return { dailyActivity, dailyHydration, weeklyStreak, daysLoggedThisWeek, daysOnGoal };
}
