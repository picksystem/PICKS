import { FormikProps } from 'formik';
import { InitialCreateValues } from '../../types/userManagement.types';

export interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  isOpenedAsDraft: boolean;
  draftMeta: { savedAt: string; expiresAt: string } | null;
  setDraftMeta: (v: null) => void;
  setDraftValues: (v: null) => void;
  setIsOpenedAsDraft: (v: boolean) => void;
  createFormik: FormikProps<InitialCreateValues>;
  reqError: (
    touched: unknown,
    error: string | undefined,
  ) => string | React.ReactElement | undefined;
  genPassword: string;
  showGenPw: boolean;
  setShowGenPw: (v: boolean | ((prev: boolean) => boolean)) => void;
  onRegeneratePw: () => void;
  onApplyGenPw: () => void;
  onSaveDraft: () => void;
  adminNotes: string;
  setAdminNotes: (v: string) => void;
}