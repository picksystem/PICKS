import dayjs, { ConfigType } from 'dayjs';
import { DATE_FORMATS } from './dateFormats';

// Re-export DATE_FORMATS for convenience
export { DATE_FORMATS };

/**
 * Centralized date formatting utilities
 * Provides consistent date formatting across the application
 */

export class DateFormatter {
  /**
   * Format a date using predefined format constants
   * @example DateFormatter.format(new Date(), 'DATE_SHORT') // "25/12/2024"
   */
  static format(date: ConfigType, format: keyof typeof DATE_FORMATS): string {
    if (!date) return '';
    return dayjs(date).format(DATE_FORMATS[format]);
  }

  /**
   * Format a date with a custom format string
   * @example DateFormatter.formatCustom(new Date(), 'DD-MM-YYYY') // "25-12-2024"
   */
  static formatCustom(date: ConfigType, customFormat: string): string {
    if (!date) return '';
    return dayjs(date).format(customFormat);
  }

  // ============================================================================
  // Date Only Formatters
  // ============================================================================

  /**
   * Format date in short format
   * @example DateFormatter.toDateShort(new Date('2024-12-25')) // "25/12/2024"
   */
  static toDateShort(date: ConfigType): string {
    return this.format(date, 'DATE_SHORT');
  }

  /**
   * Format date in medium format
   * @example DateFormatter.toDateMedium(new Date('2024-12-25')) // "25 Dec 2024"
   */
  static toDateMedium(date: ConfigType): string {
    return this.format(date, 'DATE_MEDIUM');
  }

  /**
   * Format date in long format
   * @example DateFormatter.toDateLong(new Date('2024-12-25')) // "25 December 2024"
   */
  static toDateLong(date: ConfigType): string {
    return this.format(date, 'DATE_LONG');
  }

  /**
   * Format date in full format with day name
   * @example DateFormatter.toDateFull(new Date('2024-12-25')) // "Wednesday, 25 December 2024"
   */
  static toDateFull(date: ConfigType): string {
    return this.format(date, 'DATE_FULL');
  }

  // ============================================================================
  // Time Only Formatters
  // ============================================================================

  /**
   * Format time in 12-hour format
   * @example DateFormatter.toTime12H(new Date('2024-12-25T14:30:45')) // "02:30 PM"
   */
  static toTime12H(date: ConfigType): string {
    return this.format(date, 'TIME_12H');
  }

  /**
   * Format time in 24-hour format
   * @example DateFormatter.toTime24H(new Date('2024-12-25T14:30:45')) // "14:30"
   */
  static toTime24H(date: ConfigType): string {
    return this.format(date, 'TIME_24H');
  }

  /**
   * Format time in 12-hour format with seconds
   * @example DateFormatter.toTimeWithSeconds12H(new Date('2024-12-25T14:30:45')) // "02:30:45 PM"
   */
  static toTimeWithSeconds12H(date: ConfigType): string {
    return this.format(date, 'TIME_WITH_SECONDS_12H');
  }

  /**
   * Format time in 24-hour format with seconds
   * @example DateFormatter.toTimeWithSeconds24H(new Date('2024-12-25T14:30:45')) // "14:30:45"
   */
  static toTimeWithSeconds24H(date: ConfigType): string {
    return this.format(date, 'TIME_WITH_SECONDS_24H');
  }

  // ============================================================================
  // DateTime Formatters
  // ============================================================================

  /**
   * Format date and time in short format
   * @example DateFormatter.toDateTimeShort(new Date('2024-12-25T14:30:45')) // "25/12/2024 14:30"
   */
  static toDateTimeShort(date: ConfigType): string {
    return this.format(date, 'DATETIME_SHORT');
  }

  /**
   * Format date and time in medium format
   * @example DateFormatter.toDateTimeMedium(new Date('2024-12-25T14:30:45')) // "25 Dec 2024, 02:30 PM"
   */
  static toDateTimeMedium(date: ConfigType): string {
    return this.format(date, 'DATETIME_MEDIUM');
  }

  /**
   * Format date and time in long format
   * @example DateFormatter.toDateTimeLong(new Date('2024-12-25T14:30:45')) // "25 December 2024, 02:30 PM"
   */
  static toDateTimeLong(date: ConfigType): string {
    return this.format(date, 'DATETIME_LONG');
  }

  /**
   * Format date and time in full format with day name
   * @example DateFormatter.toDateTimeFull(new Date('2024-12-25T14:30:45')) // "Wednesday, 25 December 2024, 02:30 PM"
   */
  static toDateTimeFull(date: ConfigType): string {
    return this.format(date, 'DATETIME_FULL');
  }

  // ============================================================================
  // ISO Formatters (for APIs)
  // ============================================================================

  /**
   * Format date in ISO format (YYYY-MM-DD)
   * @example DateFormatter.toISO(new Date('2024-12-25')) // "2024-12-25"
   */
  static toISO(date: ConfigType): string {
    return this.format(date, 'ISO');
  }

  /**
   * Format date and time in ISO format
   * @example DateFormatter.toISODateTime(new Date('2024-12-25T14:30:45')) // "2024-12-25T14:30:45"
   */
  static toISODateTime(date: ConfigType): string {
    return this.format(date, 'ISO_DATETIME');
  }

  // ============================================================================
  // Special Formatters
  // ============================================================================

  /**
   * Format date for file naming (no spaces, no special chars except dash/underscore)
   * @example DateFormatter.toFileTimestamp(new Date('2024-12-25T14:30:45')) // "2024-12-25_143045"
   */
  static toFileTimestamp(date: ConfigType): string {
    return this.format(date, 'FILE_TIMESTAMP');
  }

  /**
   * Format as month and year only
   * @example DateFormatter.toMonthYear(new Date('2024-12-25')) // "December 2024"
   */
  static toMonthYear(date: ConfigType): string {
    return this.format(date, 'MONTH_YEAR');
  }

  /**
   * Format as day and month only (compact)
   * @example DateFormatter.toDayMonth(new Date('2024-12-25')) // "25 Dec"
   */
  static toDayMonth(date: ConfigType): string {
    return this.format(date, 'DAY_MONTH');
  }

  /**
   * Format as year only
   * @example DateFormatter.toYearOnly(new Date('2024-12-25')) // "2024"
   */
  static toYearOnly(date: ConfigType): string {
    return this.format(date, 'YEAR_ONLY');
  }

  // ============================================================================
  // Current Date/Time Formatters
  // ============================================================================

  /**
   * Get current date/time formatted
   * @param format - Format key from DATE_FORMATS (default: DATETIME_SHORT)
   * @example DateFormatter.now() // "25/12/2024 14:30"
   * @example DateFormatter.now('DATETIME_FULL') // "Wednesday, 25 December 2024, 02:30 PM"
   */
  static now(format: keyof typeof DATE_FORMATS = 'DATETIME_SHORT'): string {
    return this.format(dayjs(), format);
  }

  /**
   * Get current date formatted
   * @param format - Format key from DATE_FORMATS (default: DATE_SHORT)
   * @example DateFormatter.today() // "25/12/2024"
   * @example DateFormatter.today('DATE_LONG') // "25 December 2024"
   */
  static today(format: keyof typeof DATE_FORMATS = 'DATE_SHORT'): string {
    return this.format(dayjs(), format);
  }
}

/**
 * Quick access formatters (function exports)
 * Convenient shorthand functions for the most commonly used formatters
 */

/**
 * Format date in short format (DD/MM/YYYY)
 * @example formatDate(new Date('2024-12-25')) // "25/12/2024"
 */
export const formatDate = DateFormatter.toDateShort;

/**
 * Format date and time in short format (DD/MM/YYYY HH:mm)
 * @example formatDateTime(new Date('2024-12-25T14:30:45')) // "25/12/2024 14:30"
 */
export const formatDateTime = DateFormatter.toDateTimeShort;

/**
 * Format time in 24-hour format (HH:mm)
 * @example formatTime(new Date('2024-12-25T14:30:45')) // "14:30"
 */
export const formatTime = DateFormatter.toTime24H;

/**
 * Format date in ISO format (YYYY-MM-DD)
 * @example formatISO(new Date('2024-12-25')) // "2024-12-25"
 */
export const formatISO = DateFormatter.toISO;
