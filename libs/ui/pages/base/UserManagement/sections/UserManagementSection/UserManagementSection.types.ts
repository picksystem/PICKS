import type { IAuthUser } from '@serviceops/interfaces';
import type { Column } from '@serviceops/component';
import type { UserRow as AppUserRow } from '../../types/userManagement.types';

export interface UserManagementSectionProps {
  allUsers: IAuthUser[];
  columns: Column<AppUserRow>[];
  tableSearch: string;
  onTableSearchChange: (value: string) => void;
  selectedRow: AppUserRow | null;
  onRowSelect: (row: AppUserRow | null) => void;
  onRowClick: (row: AppUserRow) => void;
  onOpenNew: () => void;
  onOpenDraft: () => void;
  onOpenEdit: () => void;
  onOpenDelete: () => void;
  onOpenChangesLog: () => void;
  onOpenLoginData: () => void;
  onOpenConsultantProfile: () => void;
  onOpenChangeProfile: () => void;
  onOpenTempPw: () => void;
  onOpenResetPw: () => void;
  onOpenAdminControls: () => void;
  adminControlsOpen: boolean;
  isDraft: boolean;
  isConsultant: boolean;
  draftValues?: unknown;
}
