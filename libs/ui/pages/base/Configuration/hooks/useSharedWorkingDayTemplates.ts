import { useConfiguration } from '@serviceops/confighooks';
import type { IConfigWorkingDayTemplate } from '@serviceops/interfaces';

export interface WorkingDayTemplateOption {
  id: string;
  name: string;
}

/**
 * Shared hook for the Working Time Template list (Config > Calendars >
 * Working Time Template > Working time template name). Mirrors the
 * convention used by `useSharedHolidayCalendars` / `useSharedWorkingCalendars`.
 */
export const useSharedWorkingDayTemplates = () => {
  const { calendars: api } = useConfiguration();

  const workingDayTemplates: IConfigWorkingDayTemplate[] = api?.workingDayTemplates ?? [];
  const isLoading = !api;

  const options: WorkingDayTemplateOption[] = workingDayTemplates.map((wdt) => ({
    id: wdt.id,
    name: wdt.name,
  }));

  return { workingDayTemplates, options, isLoading };
};
