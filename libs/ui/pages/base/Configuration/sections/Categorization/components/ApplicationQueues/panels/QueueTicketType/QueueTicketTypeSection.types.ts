import { IConfigApplicationQueue } from '@serviceops/interfaces';

export interface QueueTicketTypeSectionProps {
  rows: IConfigApplicationQueue[];
  onTicketTypeToggle: (ticketTypeKey: string, enabled: boolean, ttId: string | number) => void;
}
