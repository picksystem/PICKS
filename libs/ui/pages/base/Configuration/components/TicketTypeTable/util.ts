import { ITicketType } from '@serviceops/interfaces';

export interface TicketTypeTableProps {
  ticketTypes: ITicketType[];
  selectedRowId?: number | null;
  onRowClick?: (row: ITicketType) => void;
  onToggleActive?: (row: ITicketType) => void;
}
