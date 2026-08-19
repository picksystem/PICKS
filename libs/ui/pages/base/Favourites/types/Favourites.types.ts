export type TicketKind = string;

export interface FavouriteRow {
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
