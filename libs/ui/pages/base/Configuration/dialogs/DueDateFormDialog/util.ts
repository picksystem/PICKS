import { IConfigResponseAckSLARow, ITicketType } from '@serviceops/interfaces';

export interface DueDateFormDialogProps {
  open: boolean;
  editingRow: IConfigResponseAckSLARow | null;
  ticketTypes: ITicketType[];
  usedTicketTypeIds: number[];
  onClose: () => void;
  onSubmit: (row: IConfigResponseAckSLARow) => void;
}
