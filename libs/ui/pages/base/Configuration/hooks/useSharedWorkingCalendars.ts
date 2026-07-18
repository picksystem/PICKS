import { useConfiguration } from '@serviceops/confighooks';
import type { IConfigWorkingCalendar } from '@serviceops/interfaces';

export interface WorkingCalendarOption {
  id: string;
  name: string;
  holidayCalendar: string;
}

/**
 * Shared hook for the Working Calendars list (Config > Calendars > Working
 * Calendars > Calendar name). Mirrors the convention used by
 * `useSharedServiceLines`.
 */
export const useSharedWorkingCalendars = () => {
  const { calendars: api } = useConfiguration();

  const workingCalendars: IConfigWorkingCalendar[] = api?.workingCalendars ?? [];
  const isLoading = !api;

  const options: WorkingCalendarOption[] = workingCalendars.map((wc) => ({
    id: wc.id,
    name: wc.name,
    holidayCalendar: wc.holidayCalendar ?? '',
  }));

  return { workingCalendars, options, isLoading };
};
