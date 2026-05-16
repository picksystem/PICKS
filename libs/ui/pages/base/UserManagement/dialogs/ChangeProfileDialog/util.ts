import { UserRow, ChangeProfileErrors } from '../../types/userManagement.types';

export interface ChangeProfileDialogProps {
  open: boolean;
  onClose: () => void;
  confirmOpen: boolean;
  onConfirmClose: () => void;
  selectedRow: UserRow | null;
  changeProfileRole: string;
  onRoleChange: (v: string) => void;
  changeProfileReasonCode: string;
  onReasonCodeChange: (v: string) => void;
  changeProfileNoteText: string;
  onNoteTextChange: (v: string) => void;
  changeProfileAttachment: File | null;
  onAttachmentChange: (f: File | null) => void;
  changeProfileErrors: ChangeProfileErrors;
  onErrorsChange: (e: ChangeProfileErrors) => void;
  isSaving: boolean;
  noteRef: React.RefObject<HTMLTextAreaElement | null>;
  attachmentInputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  onConfirmSave: () => void;
}
