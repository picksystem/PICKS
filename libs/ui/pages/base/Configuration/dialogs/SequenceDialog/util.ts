import { ITicketType } from '@serviceops/interfaces';

export interface SequenceDialogProps {
  open: boolean;
  ticketTypes: ITicketType[];
  tagMap?: Record<string, string>;
  onClose: () => void;
  onSave: () => void;
}
