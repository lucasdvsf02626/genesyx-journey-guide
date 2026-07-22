import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const DEFAULT_HYDRATION_GOAL_ML = 2400;
export const MIN_HYDRATION_GOAL_ML = 500;
export const MAX_HYDRATION_GOAL_ML = 6000;

export const getHydrationGoal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ goalMl: number }> => {
    const { supabase, userId } = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("hydration_goal_ml")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("[hydration:get]", error.message);
      return { goalMl: DEFAULT_HYDRATION_GOAL_ML };
    }
    const raw = data?.hydration_goal_ml;
    const goalMl = typeof raw === "number" && raw > 0 ? raw : DEFAULT_HYDRATION_GOAL_ML;
    return { goalMl };
  });

export const setHydrationGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { goalMl: number }) =>
    z
      .object({
        goalMl: z
          .number()
          .int()
          .min(MIN_HYDRATION_GOAL_ML)
          .max(MAX_HYDRATION_GOAL_ML),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ goalMl: number }> => {
    const { supabase, userId } = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ hydration_goal_ml: data.goalMl })
      .eq("id", userId);
    if (error) {
      console.error("[hydration:set]", error.message);
      throw new Error("Could not save your hydration goal.");
    }
    return { goalMl: data.goalMl };
  });
