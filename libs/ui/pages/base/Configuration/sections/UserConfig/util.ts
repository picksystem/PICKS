import {
  IConfigWorkLocation,
  IConfigWorkLocationWorkingTime,
  IConfigWorkLocationShift,
  IConfigWorkLocationAssociatedProfile,
} from '@serviceops/interfaces';

export interface WorkingTimesPanelProps {
  locations: IConfigWorkLocation[];
  workingTimes: IConfigWorkLocationWorkingTime[];
  defaultLocationId: string | null;
  onBack: () => void;
  onSave: (times: IConfigWorkLocationWorkingTime[]) => void;
}

export interface ShiftsPanelProps {
  locations: IConfigWorkLocation[];
  shifts: IConfigWorkLocationShift[];
  defaultLocationId: string | null;
  onBack: () => void;
  onSave: (shifts: IConfigWorkLocationShift[]) => void;
}

export interface AssocProfilesPanelProps {
  locations: IConfigWorkLocation[];
  associatedProfiles: IConfigWorkLocationAssociatedProfile[];
  defaultLocationId: string | null;
  onBack: () => void;
  onSave: (profiles: IConfigWorkLocationAssociatedProfile[]) => void;
}
