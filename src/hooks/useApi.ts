import { useCallback, useEffect, useState } from "react";
import { errMsg } from "@/lib/utils";

/** Small data-fetching hook. Swap for RTK Query / TanStack Query later. */
export function useApi<T>(fn: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await fn()); } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}
