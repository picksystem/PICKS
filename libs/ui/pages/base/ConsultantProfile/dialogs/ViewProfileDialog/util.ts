import { IAuthUser, IConsultantProfile } from '@serviceops/interfaces';

export interface ViewProfileDialogProps {
  viewProfile: IConsultantProfile | null;
  consultantUsers: IAuthUser[];
  onClose: () => void;
  onEdit: (profile: IConsultantProfile) => void;
}