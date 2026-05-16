import { UserRow, ResetPwErrors } from '../../types/userManagement.types';

export interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
  resetPwMode: 'auto' | 'manual';
  onModeChange: (v: 'auto' | 'manual') => void;
  autoResetPw: string;
  onAutoResetPwChange: (v: string) => void;
  showAutoResetPw: boolean;
  onShowAutoResetPwChange: (v: boolean) => void;
  newPassword: string;
  onNewPasswordChange: (v: string) => void;
  newPasswordConfirm: string;
  onNewPasswordConfirmChange: (v: string) => void;
  showManualPw: boolean;
  onShowManualPwChange: (v: boolean) => void;
  showManualPwConfirm: boolean;
  onShowManualPwConfirmChange: (v: boolean) => void;
  resetPwForceChange: boolean;
  onForceChangeChange: (v: boolean) => void;
  resetPwReason: string;
  onReasonChange: (v: string) => void;
  resetPwErrors: ResetPwErrors;
  onErrorsChange: (e: ResetPwErrors) => void;
  isResetting: boolean;
  onReset: () => void;
}
