import { ITicketType } from '@serviceops/interfaces';

export interface SequenceDialogProps {
  open: boolean;
  ticketTypes: ITicketType[];
  onClose: () => void;
  onSave: () => void;
}