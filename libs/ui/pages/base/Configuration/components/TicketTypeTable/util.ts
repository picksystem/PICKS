import { ITicketType } from '@serviceops/interfaces';

export interface TicketTypeTableProps {
  ticketTypes: ITicketType[];
  selectedRowId?: number;
  onRowClick?: (row: ITicketType) => void;
  onToggleActive?: (row: ITicketType) => void;
}