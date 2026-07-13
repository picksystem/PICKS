import { IConfigApplicationQueue } from '@serviceops/interfaces';

export interface QueueTicketTypeSectionProps {
  rows: IConfigApplicationQueue[];
  onTicketTypeToggle: (ticketTypeKey: string, enabled: boolean, ttId: string | number) => void;
  /** Hide the panel's own icon+title banner — use when it's already shown
   * by an outer dialog wrapper. */
  hideHeader?: boolean;
}
