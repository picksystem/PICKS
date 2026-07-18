import { useGetConfigurationQuery } from '@serviceops/services';
import type { IConfigUserWorkLocation } from '@serviceops/interfaces';

export interface UserWorkLocationOption {
  workLocation: string;
  workingCalendar: string;
  holidayCalendar: string;
}

/**
 * Shared hook for the Work Locations list (User Management > Work Locations
 * > Work Location). Mirrors the convention used by `useSharedServiceLines` /
 * `useSharedConsultantRoles` — reads from the cached configuration query
 * rather than issuing its own fetch. Named "User" to distinguish from the
 * external city/geocoding search used elsewhere for a generic "work
 * location" text field.
 */
export const useSharedUserWorkLocations = () => {
  const { data: configData, isLoading } = useGetConfigurationQuery();

  const workLocations: IConfigUserWorkLocation[] =
    configData?.data?.userManagement?.workLocations?.workLocations ?? [];

  const options: UserWorkLocationOption[] = workLocations.map((wl) => ({
    workLocation: wl.workLocation ?? '',
    workingCalendar: wl.workingCalendar ?? '',
    holidayCalendar: wl.holidayCalendar ?? '',
  }));

  return { workLocations, options, isLoading };
};
