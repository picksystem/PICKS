import { IConfigApplication, IConfigServiceLine } from '@serviceops/interfaces';

export interface ApplicationsSectionProps {
  data?: IConfigApplication[];
  serviceLines?: IConfigServiceLine[];
  onDataChange?: (data: IConfigApplication[]) => void;
}

export type ApplicationActiveView =
  | 'applications'
  | 'approvals'
  | 'timesheet'
  | 'expenses'
  | 'supportLines'
  | 'billingCodes'
  | 'ticketTypes'
  | 'stickyNote';
