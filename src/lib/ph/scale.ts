/**
 * Vaginal pH scale — single source of truth.
 *
 * The DB CHECK constraint on public.ph_readings mirrors PH_MIN/PH_MAX.
 * Widening past PH_MAX requires one migration; every UI/validation literal
 * below is derived from these constants, so no other file needs editing.
 *
 * Bands (no "Low" band — anything below 3.8 is Optimal):
 *   Optimal   3.5 – 4.5
 *   Elevated  4.6 – 5.5
 *   High      5.6 – 6.0
 *   Retest    > 6.0
 *
 * "Retest" is a DATA-QUALITY prompt, not a health verdict.
 */

export const PH_MIN = 3.5;
export const PH_MAX = 7.0;
export const PH_STEP = 0.1;
export const PH_DEFAULT = 4.2;

/** Upper bounds (inclusive) for each band, in order. */
export const PH_BAND_OPTIMAL_MAX = 4.5;
export const PH_BAND_ELEVATED_MAX = 5.5;
export const PH_BAND_HIGH_MAX = 6.0;

export type PhStatus = "optimal" | "elevated" | "high" | "retest";

export function phStatus(v: number): PhStatus {
  if (v <= PH_BAND_OPTIMAL_MAX) return "optimal";
  if (v <= PH_BAND_ELEVATED_MAX) return "elevated";
  if (v <= PH_BAND_HIGH_MAX) return "high";
  return "retest";
}

export const PH_STATUS_LABEL: Record<PhStatus, string> = {
  optimal: "Optimal",
  elevated: "Elevated",
  high: "High",
  retest: "Retest",
};

/** Retest is deliberately neutral — it must not read as an alarm state. */
export const PH_STATUS_COLOR: Record<PhStatus, string> = {
  optimal: "#3FA37A",
  elevated: "var(--color-electric-lavender, #4D4DAA)",
  high: "var(--color-electric-pink, #D85A8A)",
  retest: "#8A8A99",
};

export const PH_BANDS: ReadonlyArray<{
  status: PhStatus;
  from: number;
  to: number;
  label: string;
  range: string;
}> = [
  { status: "optimal", from: PH_MIN, to: PH_BAND_OPTIMAL_MAX, label: "Optimal", range: "3.5–4.5" },
  { status: "elevated", from: PH_BAND_OPTIMAL_MAX, to: PH_BAND_ELEVATED_MAX, label: "Elevated", range: "4.6–5.5" },
  { status: "high", from: PH_BAND_ELEVATED_MAX, to: PH_BAND_HIGH_MAX, label: "High", range: "5.6–6.0" },
  { status: "retest", from: PH_BAND_HIGH_MAX, to: PH_MAX, label: "Retest", range: ">6.0" },
];

export const PH_RANGE_TEXT = `${PH_MIN.toFixed(1)}–${PH_MAX.toFixed(1)}`;

export function clampPh(v: number): number {
  return Math.max(PH_MIN, Math.min(PH_MAX, Math.round(v * 10) / 10));
}

/** Neutral, non-diagnostic copy per band. */
export const PH_BAND_NOTE: Record<PhStatus, string> = {
  optimal: "This sits in the typical range.",
  elevated: "This is above the typical range.",
  high: "This is well above the typical range.",
  retest:
    "Readings this high are usually a sampling artefact — semen, blood, lubricant or menses in the sample. Retest in 24 hours before reading anything into it.",
};
