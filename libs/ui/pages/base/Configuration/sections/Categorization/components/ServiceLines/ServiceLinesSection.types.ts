import { IConfigServiceLine, IConfigBusinessCategory } from '@serviceops/interfaces';

export interface ServiceLinesSectionProps {
  data?: IConfigServiceLine[];
  businessCategories?: IConfigBusinessCategory[];
  onDataChange?: (data: IConfigServiceLine[]) => void;
}

export type ServiceLineActiveView =
  | 'servicelines'
  | 'approvals'
  | 'timesheet'
  | 'expenses'
  | 'ticketTypes';
