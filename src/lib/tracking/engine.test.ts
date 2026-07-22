import { describe, it, expect } from "vitest";
import { computeTrackingSummary, type TrackingLog } from "./engine";
import vectors from "./tracking_test_vectors.json";

type Case = {
  name: string;
  today: string;
  logs: TrackingLog[];
  phDates: string[];
  expected: {
    dailyActivity: number;
    dailyHydration: number;
    weeklyStreak: number;
    daysLoggedThisWeek: number;
    daysOnGoal: number;
  };
};

describe("computeTrackingSummary — vector contract", () => {
  const { goalMl, minWeekDays } = vectors.config;
  for (const c of vectors.cases as Case[]) {
    it(c.name, () => {
      const got = computeTrackingSummary({
        today: c.today,
        logs: c.logs,
        phDates: c.phDates,
        goalMl,
        minWeekDays,
      });
      expect(got).toEqual(c.expected);
    });
  }
});
