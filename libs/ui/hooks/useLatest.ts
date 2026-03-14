import { useRef, useEffect } from 'react';

/**
 * Returns a ref that always holds the latest value
 * Useful for accessing the latest props/state in callbacks without re-creating them
 *
 * @example
 * const latestValue = useLatest(someValue);
 * const handleClick = useCallback(() => {
 *   console.log(latestValue.current); // Always gets the latest value
 * }, []); // No dependencies needed
 */
export function useLatest<T>(value: T) {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  });

  return ref;
}
