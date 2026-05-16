import { IAuthUser } from '@serviceops/interfaces';

export interface TempPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: import('../../types/userManagement.types').UserRow | null;
  allUsers: IAuthUser[];
  tempPwBulkMode: boolean;
  onBulkModeChange: (v: boolean) => void;
  bulkSelectedIds: number[];
  onBulkIdsChange: (ids: number[]) => void;
  tempPwValidity: string;
  onValidityChange: (v: string) => void;
  tempPwForceReset: boolean;
  onForceResetChange: (v: boolean) => void;
  tempPwNote: string;
  onNoteChange: (v: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}
