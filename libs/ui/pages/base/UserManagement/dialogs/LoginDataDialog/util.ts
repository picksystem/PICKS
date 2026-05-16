import { UserRow } from '../../types/userManagement.types';

export interface LoginDataDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
}
