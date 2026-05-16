import { RoleRequestRow, ActionType } from '../../types/roleRequests.types';

export interface ActionDialogProps {
  actionTarget: { user: RoleRequestRow; type: ActionType } | null;
  actionNotes: string;
  actionInProgress: number | null;
  onClose: () => void;
  onNotesChange: (v: string) => void;
  onConfirm: () => void;
}