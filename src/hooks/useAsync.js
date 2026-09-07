import { useEffect, useRef, useState } from "react";

export default function useAsync(task, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [v, setV] = useState(0);
  const ref = useRef(task);
  useEffect(() => { ref.current = task; });
  const sig = JSON.stringify(deps);

  useEffect(() => {
    let off = false;
    ref.current().then(d => !off && setData(d))
      .catch(e => !off && setError(e.message || "Something went wrong"))
      .finally(() => !off && setLoading(false));
    return () => { off = true; };
  }, [sig, v]);

  return {
    data, error, loading, setData,
    reload: () => { setLoading(true); setError(null); setV(x => x + 1); },
  };
}