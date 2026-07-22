import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getHydrationGoal,
  setHydrationGoal,
  DEFAULT_HYDRATION_GOAL_ML,
  MIN_HYDRATION_GOAL_ML,
  MAX_HYDRATION_GOAL_ML,
} from "@/lib/hydration.functions";
import { useAuth } from "@/hooks/use-auth";

/**
 * Returns the signed-in user's daily hydration goal (ml).
 * Falls back to the default until it loads or when the user is signed out.
 */
export function useHydrationGoal(): number {
  const { user } = useAuth();
  const fetchGoal = useServerFn(getHydrationGoal);
  const { data } = useQuery({
    queryKey: ["hydration-goal", user?.id ?? "anon"],
    queryFn: () => fetchGoal({}),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
  return data?.goalMl ?? DEFAULT_HYDRATION_GOAL_ML;
}

export function useSetHydrationGoal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const setFn = useServerFn(setHydrationGoal);
  return useMutation({
    mutationFn: (goalMl: number) => {
      const clamped = Math.max(
        MIN_HYDRATION_GOAL_ML,
        Math.min(MAX_HYDRATION_GOAL_ML, Math.round(goalMl)),
      );
      return setFn({ data: { goalMl: clamped } });
    },
    onSuccess: (res) => {
      qc.setQueryData(["hydration-goal", user?.id ?? "anon"], res);
    },
  });
}
