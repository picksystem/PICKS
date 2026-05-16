import { IAuthUser } from '@serviceops/interfaces';
import { RoleRequestRow, ActionType } from '../../types/roleRequests.types';

export interface DetailDialogProps {
  detailUser: IAuthUser | null;
  onClose: () => void;
  onOpenAction: (user: RoleRequestRow, type: ActionType) => void;
}