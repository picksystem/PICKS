import { useCallback } from 'react';
import { useLatest } from './useLatest';

/**
 * Creates a stable callback that has access to the latest props/state
 * The callback reference never changes, but it always has access to the latest closure
 * Perfect for event handlers that need to be stable for performance (avoid re-renders)
 *
 * @example
 * const handleSubmit = useEventCallback((values) => {
 *   // Can access latest state/props without re-creating this callback
 *   console.log(latestStateValue);
 *   onSubmit(values);
 * });
 */
export function useEventCallback<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
): (...args: TArgs) => TReturn {
  const ref = useLatest(fn);

  return useCallback((...args: TArgs) => {
    return ref.current(...args);
  }, []);
}
