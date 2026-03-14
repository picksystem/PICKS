import { useCallback } from 'react';
import dayjs, { ConfigType } from 'dayjs';

/**
 * Returns a stable date formatting function
 * Useful for formatting dates consistently throughout your app
 *
 * @param defaultFormat - Default format to use (default: 'DD/MM/YYYY')
 *
 * @example
 * const formatDate = useDateFormat('DD/MM/YYYY');
 * const formatted = formatDate('2024-01-15'); // Returns: "15/01/2024"
 *
 * @example
 * const formatDateTime = useDateFormat('DD/MM/YYYY HH:mm');
 * const formatted = formatDateTime(new Date()); // Returns: "15/01/2024 14:30"
 *
 * @example
 * // Use with custom format on the fly
 * const formatDate = useDateFormat();
 * const formatted = formatDate('2024-01-15', 'MMMM DD, YYYY'); // Returns: "January 15, 2024"
 */
export function useDateFormat(defaultFormat: string = 'DD/MM/YYYY') {
  return useCallback(
    (date: ConfigType, format?: string) => {
      if (!date) return '';
      return dayjs(date).format(format || defaultFormat);
    },
    [defaultFormat],
  );
}
