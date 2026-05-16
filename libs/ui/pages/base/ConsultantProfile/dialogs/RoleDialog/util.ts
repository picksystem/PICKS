import { RoleForm } from '../../types/consultantProfile.types';

export interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  editingRoleId: number | null;
  roleForm: RoleForm;
  onFormChange: (form: RoleForm) => void;
  isSaving: boolean;
  onSave: () => void;
}