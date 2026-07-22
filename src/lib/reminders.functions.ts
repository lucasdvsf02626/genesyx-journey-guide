import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ReminderPrefsDTO = {
  dailyLogEnabled: boolean;
  weeklyDigestEnabled: boolean;
  quietStart: string; // "HH:MM"
  quietEnd: string;   // "HH:MM"
  timezone: string;
  consentedAt: string | null;
};

const DEFAULTS: ReminderPrefsDTO = {
  dailyLogEnabled: false,
  weeklyDigestEnabled: false,
  quietStart: "22:00",
  quietEnd: "08:00",
  timezone: "Europe/London",
  consentedAt: null,
};

function toHm(v: string | null | undefined): string {
  if (!v) return "00:00";
  // Postgres returns "HH:MM:SS"
  return v.length >= 5 ? v.slice(0, 5) : v;
}

export const getReminderPrefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReminderPrefsDTO> => {
    const { supabase, userId } = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("reminder_preferences")
      .select("daily_log_enabled, weekly_digest_enabled, quiet_start, quiet_end, timezone, consented_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.error("[reminders:get]", error.message);
      return DEFAULTS;
    }
    if (!data) return DEFAULTS;
    return {
      dailyLogEnabled: !!data.daily_log_enabled,
      weeklyDigestEnabled: !!data.weekly_digest_enabled,
      quietStart: toHm(data.quiet_start),
      quietEnd: toHm(data.quiet_end),
      timezone: data.timezone || "Europe/London",
      consentedAt: data.consented_at,
    };
  });

const Hm = z.string().regex(/^\d{2}:\d{2}$/);

export const setReminderPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    dailyLogEnabled: boolean;
    weeklyDigestEnabled: boolean;
    quietStart: string;
    quietEnd: string;
    timezone: string;
  }) =>
    z.object({
      dailyLogEnabled: z.boolean(),
      weeklyDigestEnabled: z.boolean(),
      quietStart: Hm,
      quietEnd: Hm,
      timezone: z.string().min(1).max(64),
    }).parse(input),
  )
  .handler(async ({ data, context }): Promise<ReminderPrefsDTO> => {
    const { supabase, userId } = context;
    const consent = data.dailyLogEnabled || data.weeklyDigestEnabled;
    const payload = {
      user_id: userId,
      daily_log_enabled: data.dailyLogEnabled,
      weekly_digest_enabled: data.weeklyDigestEnabled,
      quiet_start: data.quietStart,
      quiet_end: data.quietEnd,
      timezone: data.timezone,
      consented_at: consent ? new Date().toISOString() : null,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("reminder_preferences")
      .upsert(payload, { onConflict: "user_id" });
    if (error) {
      console.error("[reminders:set]", error.message);
      throw new Error("Could not save reminder preferences.");
    }
    return {
      dailyLogEnabled: data.dailyLogEnabled,
      weeklyDigestEnabled: data.weeklyDigestEnabled,
      quietStart: data.quietStart,
      quietEnd: data.quietEnd,
      timezone: data.timezone,
      consentedAt: consent ? new Date().toISOString() : null,
    };
  });

/**
 * TODO(email): wire this to the Lovable email provider once configured.
 * This function intentionally does not send email — it only records intent.
 * Do not claim emails were sent.
 */
export async function sendReminderEmailStub(_kind: "daily_log" | "weekly_digest", _userId: string) {
  // no-op stub
  return { queued: false, reason: "email-provider-not-configured" };
}
