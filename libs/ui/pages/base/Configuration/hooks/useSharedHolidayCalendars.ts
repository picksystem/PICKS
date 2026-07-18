import { useConfiguration } from '@serviceops/confighooks';
import type { IConfigHolidayCalendar } from '@serviceops/interfaces';

export interface HolidayCalendarOption {
  id: string;
  name: string;
}

/**
 * Shared hook for the Holiday Calendars list (Config > Calendars > Holiday
 * Calendars > Holiday Calendar name). Mirrors the convention used by
 * `useSharedWorkingCalendars`.
 */
export const useSharedHolidayCalendars = () => {
  const { calendars: api } = useConfiguration();

  const holidayCalendars: IConfigHolidayCalendar[] = api?.holidayCalendars ?? [];
  const isLoading = !api;

  const options: HolidayCalendarOption[] = holidayCalendars.map((hc) => ({
    id: hc.id,
    name: hc.name,
  }));

  return { holidayCalendars, options, isLoading };
};
