import { useMemo } from 'react';
import dayjs, { ConfigType, ManipulateType, OpUnitType } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

/**
 * Returns a set of stable date utility functions
 * Provides common date operations without recreating functions on each render
 *
 * @example
 * const { isToday, isBefore, isAfter, isBetween, add, subtract, startOf, endOf } = useDateUtils();
 *
 * if (isToday(someDate)) {
 *   console.log('Date is today!');
 * }
 *
 * const nextWeek = add(new Date(), 7, 'day');
 * const startOfMonth = startOf(new Date(), 'month');
 */
export function useDateUtils() {
  return useMemo(
    () => ({
      /**
       * Check if a date is today
       */
      isToday: (date: ConfigType): boolean => {
        if (!date) return false;
        return dayjs(date).isSame(dayjs(), 'day');
      },

      /**
       * Check if a date is yesterday
       */
      isYesterday: (date: ConfigType): boolean => {
        if (!date) return false;
        return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
      },

      /**
       * Check if a date is tomorrow
       */
      isTomorrow: (date: ConfigType): boolean => {
        if (!date) return false;
        return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
      },

      /**
       * Check if date1 is before date2
       */
      isBefore: (date1: ConfigType, date2: ConfigType, unit?: OpUnitType): boolean => {
        if (!date1 || !date2) return false;
        return dayjs(date1).isBefore(dayjs(date2), unit);
      },

      /**
       * Check if date1 is after date2
       */
      isAfter: (date1: ConfigType, date2: ConfigType, unit?: OpUnitType): boolean => {
        if (!date1 || !date2) return false;
        return dayjs(date1).isAfter(dayjs(date2), unit);
      },

      /**
       * Check if date is between startDate and endDate
       */
      isBetween: (
        date: ConfigType,
        startDate: ConfigType,
        endDate: ConfigType,
        unit?: OpUnitType,
        inclusivity?: '()' | '[]' | '[)' | '(]',
      ): boolean => {
        if (!date || !startDate || !endDate) return false;
        return dayjs(date).isBetween(dayjs(startDate), dayjs(endDate), unit, inclusivity);
      },

      /**
       * Check if two dates are the same
       */
      isSame: (date1: ConfigType, date2: ConfigType, unit?: OpUnitType): boolean => {
        if (!date1 || !date2) return false;
        return dayjs(date1).isSame(dayjs(date2), unit);
      },

      /**
       * Add time to a date
       */
      add: (date: ConfigType, amount: number, unit: ManipulateType) => {
        if (!date) return null;
        return dayjs(date).add(amount, unit).toDate();
      },

      /**
       * Subtract time from a date
       */
      subtract: (date: ConfigType, amount: number, unit: ManipulateType) => {
        if (!date) return null;
        return dayjs(date).subtract(amount, unit).toDate();
      },

      /**
       * Get start of a time unit (e.g., start of month, start of day)
       */
      startOf: (date: ConfigType, unit: OpUnitType) => {
        if (!date) return null;
        return dayjs(date).startOf(unit).toDate();
      },

      /**
       * Get end of a time unit (e.g., end of month, end of day)
       */
      endOf: (date: ConfigType, unit: OpUnitType) => {
        if (!date) return null;
        return dayjs(date).endOf(unit).toDate();
      },

      /**
       * Get difference between two dates
       */
      diff: (
        date1: ConfigType,
        date2: ConfigType,
        unit?: OpUnitType,
        precise?: boolean,
      ): number => {
        if (!date1 || !date2) return 0;
        return dayjs(date1).diff(dayjs(date2), unit, precise);
      },

      /**
       * Parse a date string with specific format
       */
      parse: (dateString: string, format: string) => {
        if (!dateString) return null;
        return dayjs(dateString, format).toDate();
      },

      /**
       * Check if a date is valid
       */
      isValid: (date: ConfigType): boolean => {
        return dayjs(date).isValid();
      },
    }),
    [],
  );
}
