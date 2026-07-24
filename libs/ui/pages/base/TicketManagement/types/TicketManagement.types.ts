export type TicketKind = 'incident' | 'service_request' | 'advisory_request';

export interface TicketManagementRow {
  rowId: string;
  sno: number;
  id: number;
  number: string;
  ticketType: TicketKind;
  ticketTypeName: string;
  shortDescription: string | null;
  caller: string;
  priority: string | null;
  status: string;
  assignmentGroup: string | null;
  createdAt: Date;
}
