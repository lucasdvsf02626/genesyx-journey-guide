import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listPhReadings,
  createPhReading,
  updatePhReading,
  deletePhReading,
  type PhReadingDTO,
} from "@/lib/ph.functions";
import { useAuth } from "@/hooks/use-auth";

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() { listeners.forEach((l) => l()); }

// Vaginal pH scale lives in one place — see src/lib/ph/scale.ts
export {
  phStatus,
  PH_STATUS_LABEL,
  PH_STATUS_COLOR,
  PH_BANDS,
  PH_BAND_NOTE,
  PH_MIN,
  PH_MAX,
  PH_STEP,
  PH_DEFAULT,
  PH_RANGE_TEXT,
  clampPh,
} from "@/lib/ph/scale";
export type { PhStatus } from "@/lib/ph/scale";


export function usePhReadings(sinceDays: number | null = null) {
  const { user } = useAuth();
  const fetchFn = useServerFn(listPhReadings);
  const [readings, setReadings] = useState<PhReadingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) { setReadings([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn({ data: { sinceDays } });
      setReadings(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load readings");
    } finally {
      setLoading(false);
    }
  }, [user, fetchFn, sinceDays]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    listeners.add(refresh);
    return () => { listeners.delete(refresh); };
  }, [refresh]);

  return { readings, loading, error, refresh };
}

export function usePhMutations() {
  const { user } = useAuth();
  const createFn = useServerFn(createPhReading);
  const updateFn = useServerFn(updatePhReading);
  const deleteFn = useServerFn(deletePhReading);

  const create = useCallback(
    async (input: { phValue: number; recordedAt?: string; notes?: string | null }) => {
      if (!user) throw new Error("Please sign in to save your reading.");
      await createFn({ data: input });
      emit();
    },
    [user, createFn],
  );
  const update = useCallback(
    async (input: { id: string; phValue: number; recordedAt: string; notes: string | null }) => {
      if (!user) throw new Error("Please sign in.");
      await updateFn({ data: input });
      emit();
    },
    [user, updateFn],
  );
  const remove = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Please sign in.");
      await deleteFn({ data: { id } });
      emit();
    },
    [user, deleteFn],
  );

  return { create, update, remove };
}
