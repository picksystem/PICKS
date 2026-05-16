import { IAuthUser, IConsultantRole } from '@serviceops/interfaces';
import { ProfileForm } from '../../types/consultantProfile.types';

export interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  editingProfileId: number | null;
  profileForm: ProfileForm;
  onFormChange: (form: ProfileForm) => void;
  isSaving: boolean;
  onSave: () => void;
  consultantUsers: IAuthUser[];
  consultantRoleOptions: IConsultantRole[];
}