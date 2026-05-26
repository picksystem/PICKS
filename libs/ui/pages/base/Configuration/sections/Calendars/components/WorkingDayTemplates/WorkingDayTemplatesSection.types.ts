import { IConfigWorkingDayTemplate } from '@serviceops/interfaces';

export interface WorkingDayTemplatesSectionProps {
  data?: IConfigWorkingDayTemplate[];
  onDataChange?: (data: IConfigWorkingDayTemplate[]) => void;
}
