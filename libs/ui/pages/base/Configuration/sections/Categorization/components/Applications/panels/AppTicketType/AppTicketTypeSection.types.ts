import type { IConfigApplication } from '@serviceops/interfaces';

export interface AppTicketTypeSectionProps {
  rows?: IConfigApplication[];
  onTicketTypeToggle?: (
    ticketTypeKey: string,
    enabled: boolean,
    ticketTypeId: string | number,
  ) => void;
}
