import { useCallback, useLayoutEffect, useRef } from 'react';
import { createSearchParams, useSearchParams, type SetURLSearchParams } from 'react-router-dom';

/** Compose successive selections even while the router is rendering the previous transition. */
export function useNavigationParams() {
  const [params, setParams] = useSearchParams();
  const latest = useRef(params);
  useLayoutEffect(() => { latest.current = params; }, [params]);
  const update = useCallback<SetURLSearchParams>((nextInit, options) => {
    const next = createSearchParams(typeof nextInit === 'function' ? nextInit(new URLSearchParams(latest.current)) : nextInit);
    latest.current = next;
    setParams(next, options);
  }, [setParams]);
  return [params, update] as const;
}
