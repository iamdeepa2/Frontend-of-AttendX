import { useEffect, useState } from "react";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, run]);

  function reload() {
    setLoading(true);
    setError(null);
    setRun(n => n + 1);
  }

  return { data, error, loading, setData, reload };
}
