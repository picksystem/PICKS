import type { IConfigWorkingShift, IConfigShiftConsultant } from '@serviceops/interfaces';

export interface WorkingShiftManagementSectionProps {
  workingShiftRows?: IConfigWorkingShift[];
  shiftConsultantRows?: IConfigShiftConsultant[];
  onDataChange?: (
    workingShifts: IConfigWorkingShift[],
    shiftConsultants: IConfigShiftConsultant[],
  ) => void;
  onSaveWorkingShifts?: (workingShifts: IConfigWorkingShift[]) => void;
  onSaveShiftConsultants?: (shiftConsultants: IConfigShiftConsultant[]) => void;
}

export type WSActiveView = 'workingShifts' | 'consultants';
