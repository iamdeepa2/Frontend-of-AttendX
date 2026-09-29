import { useEffect, useState } from "react";

/**
 * Runs one async task and exposes its data, error and loading state.
 *
 * `task` is re-run whenever `deps` change, and again whenever `reload()` is
 * called. The last result stays on screen while a reload is in flight.
 */
export default function useAsync(task, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    let active = true;

    task().then(
      (value) => {
        if (!active) return;
        setData(value);
        setError(null);
      },
      (err) => active && setError(err.message || "Something went wrong")
    ).finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // `task` is rebuilt on every render, so the caller's `deps` decide when
    // the request is repeated. `run` adds manual reloads on top.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, run]);

  function reload() {
    setLoading(true);
    setError(null);
    setRun(n => n + 1);
  }

  return { data, error, loading, setData, reload };
}
