import { ITicketType } from '@serviceops/interfaces';

export interface TicketTypeFormDialogProps {
  open: boolean;
  editingItem: ITicketType | null;
  advancedSequences: boolean;
  iconMap: Record<string, string>;
  tagMap: Record<string, string>;
  onClose: () => void;
  onSubmit: (data: {
    type: string;
    name: string;
    displayName: string;
    description: string;
    prefix: string;
    isActive: boolean;
    numberLength: number;
    iconKey: string;
    tag: string;
  }) => Promise<void>;
}
