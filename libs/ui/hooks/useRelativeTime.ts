import { useState, useEffect } from 'react';
import dayjs, { ConfigType } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

/**
 * Returns relative time string that auto-updates (e.g., "2 hours ago", "in 5 minutes")
 * Requires dayjs relativeTime plugin
 *
 * @param date - The date to compare with now
 * @param updateInterval - How often to update in milliseconds (default: 60000ms = 1 minute)
 * @param withoutSuffix - If true, removes "ago" or "in" suffix (default: false)
 *
 * @example
 * // Returns "2 hours ago" and updates every minute
 * const timeAgo = useRelativeTime('2024-01-15T10:00:00');
 *
 * @example
 * // Returns "2 hours" without "ago" suffix
 * const time = useRelativeTime(someDate, 60000, true);
 *
 * @example
 * // Fast updates every 10 seconds
 * const timeAgo = useRelativeTime(recentDate, 10000);
 */
export function useRelativeTime(
  date: ConfigType,
  updateInterval: number = 60000,
  withoutSuffix: boolean = false,
): string {
  const [relativeTimeString, setRelativeTimeString] = useState(() => {
    if (!date) return '';
    return dayjs(date).fromNow(withoutSuffix);
  });

  useEffect(() => {
    if (!date) {
      setRelativeTimeString('');
      return;
    }

    // Update immediately
    setRelativeTimeString(dayjs(date).fromNow(withoutSuffix));

    // Then update at interval
    const interval = setInterval(() => {
      setRelativeTimeString(dayjs(date).fromNow(withoutSuffix));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [date, updateInterval, withoutSuffix]);

  return relativeTimeString;
}
