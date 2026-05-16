import { UserRow, EditFormShape } from '../../types/userManagement.types';

export interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
  editForm: EditFormShape;
  onFormChange: (updater: (prev: EditFormShape) => EditFormShape) => void;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
  currentUserId?: number;
}
