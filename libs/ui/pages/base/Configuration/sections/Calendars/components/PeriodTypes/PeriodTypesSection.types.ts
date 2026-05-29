import type { IConfigPeriodType, IConfigTimesheetPeriod } from '@serviceops/interfaces';

export interface PeriodTypesSectionProps {
  periodTypeRows?: IConfigPeriodType[];
  timesheetPeriodRows?: IConfigTimesheetPeriod[];
  onDataChange?: (
    periodTypes: IConfigPeriodType[],
    timesheetPeriods: IConfigTimesheetPeriod[],
  ) => void;
  onSavePeriodTypes?: (periodTypes: IConfigPeriodType[]) => void;
  onSaveTimesheetPeriods?: (timesheetPeriods: IConfigTimesheetPeriod[]) => void;
}

export type PTActiveView = 'periodTypes' | 'timesheetPeriods';
