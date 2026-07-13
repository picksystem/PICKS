import type { IConfigApplication } from '@serviceops/interfaces';

export interface AppTicketTypeSectionProps {
  rows?: IConfigApplication[];
  onTicketTypeToggle?: (
    ticketTypeKey: string,
    enabled: boolean,
    ticketTypeId: string | number,
  ) => void;
  /** Hide the panel's own icon+title banner — use when it's already shown
   * by an outer dialog wrapper. */
  hideHeader?: boolean;
}
