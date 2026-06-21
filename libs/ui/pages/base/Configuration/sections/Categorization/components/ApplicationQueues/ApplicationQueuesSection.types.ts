import { IConfigApplicationQueue } from '@serviceops/interfaces';

export interface ApplicationQueuesSectionProps {
  data?: IConfigApplicationQueue[];
  onDataChange?: (data: IConfigApplicationQueue[]) => void;
}

export type ApplicationQueueActiveView =
  | 'queues'
  | 'approvals'
  | 'ticketTypes'
  | 'timesheet'
  | 'expenses'
  | 'stickyNote';
