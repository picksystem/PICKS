import { ITicketType } from '@serviceops/interfaces';

export interface TicketTypeCardsProps {
  ticketTypes: ITicketType[];
  selectedRowId?: number;
  iconMap: Record<string, string>;
  onSelect: (row: ITicketType) => void;
  onEdit: (row: ITicketType) => void;
  onDelete: (row: ITicketType) => void;
}
