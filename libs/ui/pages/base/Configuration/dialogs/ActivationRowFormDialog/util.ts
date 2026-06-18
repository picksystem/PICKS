import { IConfigActivationRow, ITicketType } from '@serviceops/interfaces';

export interface ActivationRowFormDialogProps {
  open: boolean;
  title: string;
  editingRow: IConfigActivationRow | null;
  ticketTypes: ITicketType[];
  usedTicketTypeIds: number[];
  idPrefix: string;
  rows: IConfigActivationRow[];
  onClose: () => void;
  onSubmit: (row: IConfigActivationRow) => void;
}
