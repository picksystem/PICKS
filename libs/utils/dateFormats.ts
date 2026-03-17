/**
 * Centralized date format constants for the entire application
 * Use these constants to ensure consistent date formatting across all apps
 */

export const DATE_FORMATS = {
  // Date only formats
  DATE_SHORT: 'DD/MM/YYYY', // 25/12/2024
  DATE_MEDIUM: 'DD MMM YYYY', // 25 Dec 2024
  DATE_LONG: 'DD MMMM YYYY', // 25 December 2024
  DATE_FULL: 'dddd, DD MMMM YYYY', // Wednesday, 25 December 2024

  // Time only formats
  TIME_12H: 'hh:mm A', // 02:30 PM
  TIME_24H: 'HH:mm', // 14:30
  TIME_WITH_SECONDS_12H: 'hh:mm:ss A', // 02:30:45 PM
  TIME_WITH_SECONDS_24H: 'HH:mm:ss', // 14:30:45

  // Date and time formats
  DATETIME_SHORT: 'DD/MM/YYYY HH:mm', // 25/12/2024 14:30
  DATETIME_MEDIUM: 'DD MMM YYYY, hh:mm A', // 25 Dec 2024, 02:30 PM
  DATETIME_LONG: 'DD MMMM YYYY, hh:mm A', // 25 December 2024, 02:30 PM
  DATETIME_FULL: 'dddd, DD MMMM YYYY, hh:mm A', // Wednesday, 25 December 2024, 02:30 PM

  // ISO and API formats
  ISO: 'YYYY-MM-DD', // 2024-12-25
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss', // 2024-12-25T14:30:45

  // File naming formats
  FILE_TIMESTAMP: 'YYYY-MM-DD_HHmmss', // 2024-12-25_143045

  // Custom formats
  MONTH_YEAR: 'MMMM YYYY', // December 2024
  DAY_MONTH: 'DD MMM', // 25 Dec
  YEAR_ONLY: 'YYYY', // 2024
} as const;

export type DateFormatKey = keyof typeof DATE_FORMATS;
export type DateFormatValue = (typeof DATE_FORMATS)[DateFormatKey];
