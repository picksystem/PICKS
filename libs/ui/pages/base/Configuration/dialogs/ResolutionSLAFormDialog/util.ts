import { IConfigResponseAckSLARow, ITicketType } from '@serviceops/interfaces';

export interface ResolutionSLAFormDialogProps {
  open: boolean;
  editingRow: IConfigResponseAckSLARow | null;
  ticketTypes: ITicketType[];
  usedTicketTypeIds: number[];
  onClose: () => void;
  onSubmit: (row: IConfigResponseAckSLARow) => void;
}