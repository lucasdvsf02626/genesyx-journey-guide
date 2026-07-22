import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getHydrationGoal, DEFAULT_HYDRATION_GOAL_ML } from "@/lib/hydration.functions";
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
