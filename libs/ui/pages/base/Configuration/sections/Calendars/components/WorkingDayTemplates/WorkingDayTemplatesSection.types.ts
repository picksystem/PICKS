import { IConfigWorkingDayTemplate, IConfigWorkingDayTemplateTime } from '@serviceops/interfaces';

export interface WorkingDayTemplatesSectionProps {
  data?: IConfigWorkingDayTemplate[];
  workingTimeRows?: IConfigWorkingDayTemplateTime[];
  onDataChange?: (data: IConfigWorkingDayTemplate[]) => void;
  onWorkingTimesChange?: (data: IConfigWorkingDayTemplateTime[]) => void;
}

export type WDTActiveView = 'templates' | 'workingTimes';
