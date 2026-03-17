import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';

/**
 * Returns the current date/time that updates at a specified interval
 * Useful for displaying live clocks, timestamps, etc.
 *
 * @param updateInterval - How often to update in milliseconds (default: 1000ms)
 * @param format - Optional format string to return formatted string instead of Dayjs object
 *
 * @example
 * // Returns Dayjs object, updates every second
 * const now = useCurrentDate();
 *
 * @example
 * // Returns formatted string, updates every minute
 * const time = useCurrentDate(60000, 'HH:mm:ss');
 *
 * @example
 * // Custom format, updates every second
 * const date = useCurrentDate(1000, 'DD/MM/YYYY HH:mm');
 */
export function useCurrentDate(updateInterval?: number): Dayjs;
export function useCurrentDate(updateInterval: number, format: string): string;
export function useCurrentDate(updateInterval: number = 1000, format?: string): Dayjs | string {
  const [currentDate, setCurrentDate] = useState(() => dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(dayjs());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return format ? currentDate.format(format) : currentDate;
}
