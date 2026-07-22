/**
 * Adapters that turn raw DB rows into the shape the tracking engine expects.
 * Kept in a separate file so both hooks and pages can share them.
 */
import type { TrackingLog } from "./engine";

// Minimal shape of a full daily-log row from listDailyLogsFull.
export type DailyLogFull = {
  date: string;
  mood: string | null;
  energy: string | null;
  symptoms: string[];
  sleepMinutes: number | null;
  waterMl: number;
  supplements: string[];
  notes: string | null;
};

export function toEngineLogs(logs: DailyLogFull[]): TrackingLog[] {
  return logs.map((l) => {
    const t: TrackingLog = { date: l.date };
    if (l.mood !== null && l.mood !== "") t.mood = l.mood;
    if (l.energy !== null && l.energy !== "") t.energy = l.energy;
    if (l.symptoms.length > 0) t.symptoms = l.symptoms;
    if (l.sleepMinutes !== null) t.sleepMinutes = l.sleepMinutes;
    if (l.waterMl > 0) t.waterMl = l.waterMl;
    if (l.supplements.length > 0) t.supplements = l.supplements;
    if (l.notes !== null && l.notes !== "") t.notes = l.notes;
    return t;
  });
}

export function todayLocalIso(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
