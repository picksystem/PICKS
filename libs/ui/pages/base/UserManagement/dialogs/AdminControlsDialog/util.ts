import { PageStyles } from '../../types/userManagement.types';

export interface AdminControlsDialogProps {
  open: boolean;
  onClose: () => void;
  adminTwoLevel: boolean;
  onAdminTwoLevelChange: (v: boolean) => void;
  adminManagerOnly: boolean;
  onAdminManagerOnlyChange: (v: boolean) => void;
  adminAdditionalApproval: boolean;
  onAdminAdditionalApprovalChange: (v: boolean) => void;
  adminApprover: string;
  onAdminApproverChange: (v: string) => void;
  onAdminApproverBlur?: () => void;
  isSaving?: boolean;
  pageStyles: PageStyles;
  onPageStyleChange: (page: 'signIn' | 'signUp' | 'forgotPassword', value: 'old' | 'new') => void;
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}
