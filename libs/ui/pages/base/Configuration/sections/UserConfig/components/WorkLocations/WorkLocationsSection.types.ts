export type UserConfigActiveView =
  | 'workLocations'
  | 'workingTimes'
  | 'associatedProfiles'
  | 'shifts'
  | 'associations';

export interface WorkLocationsSectionProps {
  workLocations?: import('@serviceops/interfaces').IConfigWorkLocation[];
  workingTimes?: import('@serviceops/interfaces').IConfigWorkLocationWorkingTime[];
  associatedProfiles?: import('@serviceops/interfaces').IConfigWorkLocationAssociatedProfile[];
  shifts?: import('@serviceops/interfaces').IConfigWorkLocationShift[];
  associations?: import('@serviceops/interfaces').IConfigWorkLocationAssociation[];
  onWorkLocationsChange?: (data: import('@serviceops/interfaces').IConfigWorkLocation[]) => void;
  onWorkingTimesChange?: (
    data: import('@serviceops/interfaces').IConfigWorkLocationWorkingTime[],
  ) => void;
  onAssociatedProfilesChange?: (
    data: import('@serviceops/interfaces').IConfigWorkLocationAssociatedProfile[],
  ) => void;
  onShiftsChange?: (data: import('@serviceops/interfaces').IConfigWorkLocationShift[]) => void;
  onAssociationsChange?: (
    data: import('@serviceops/interfaces').IConfigWorkLocationAssociation[],
  ) => void;
}
