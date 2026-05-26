import { IConfigBankHoliday, IConfigHolidayCalendar } from '@serviceops/interfaces';

// ── Types ─────────────────────────────────────────────────────────────────────

export type HCActiveView = 'holiday' | 'bankHolidays';

// ── Holiday Calendars Section ─────────────────────────────────────────────────

export interface HolidayCalendarsSectionProps {
  holidayRows?: IConfigHolidayCalendar[];
  bankHolidays?: IConfigBankHoliday[];
  onDataChange?: (
    holidayRows: IConfigHolidayCalendar[],
    bankHolidays: IConfigBankHoliday[],
  ) => void;
  onSaveBankHolidays?: (next: IConfigBankHoliday[]) => void;
}
