import { UserRow } from '../../types/userManagement.types';

export interface ConsultantProfileDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
}