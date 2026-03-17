import { useRef, useEffect, useCallback } from 'react';

/**
 * Returns a function that returns true if component is still mounted
 * Useful for async operations to avoid state updates on unmounted components
 *
 * @example
 * const isMounted = useIsMounted();
 *
 * const fetchData = async () => {
 *   const data = await api.getData();
 *   if (isMounted()) {
 *     setData(data); // Only update state if component is still mounted
 *   }
 * };
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}
