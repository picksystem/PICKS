import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Returns the current window size
 * Debounced to avoid excessive re-renders during resize
 *
 * @example
 * const { width, height } = useWindowSize();
 *
 * return (
 *   <div>
 *     Window size: {width} x {height}
 *   </div>
 * );
 */
export function useWindowSize(debounceDelay: number = 200): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  const debouncedSize = useDebounce(windowSize, debounceDelay);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Set initial size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return debouncedSize;
}
