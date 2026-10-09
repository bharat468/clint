import { useCallback, useEffect, useRef, useState } from "react";
import { errMsg } from "@/lib/utils";

/** Robust data-fetching hook with fresh closure execution and instant local mutation */
export function useApi<T>(fn: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fnRef.current();
      setData(res);
      return res;
    } catch (e) {
      setError(errMsg(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mutate = useCallback((updater: T | ((prev: T) => T)) => {
    setData((prev) => (typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater));
  }, []);

  return { data, setData: mutate, loading, error, reload: load };
}
