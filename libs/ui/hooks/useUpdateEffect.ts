import { useEffect, useRef, DependencyList, EffectCallback } from 'react';

/**
 * useEffect that skips the first render (mount)
 * Only runs on updates, not on initial mount
 *
 * @example
 * useUpdateEffect(() => {
 *   // This won't run on mount, only when dependencies change
 *   console.log('Value updated:', value);
 * }, [value]);
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return effect();
  }, deps);
}
