import type { Step } from '../hooks/useForgotPassword';

export interface ResetStepProps {
  form: {
    values: { newPassword: string; confirmPassword: string };
    errors: { newPassword?: string; confirmPassword?: string };
    touched: { newPassword?: boolean; confirmPassword?: boolean };
    handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  };
  isResetting: boolean;
  showNew: boolean;
  showConfirm: boolean;
  onToggleNew: () => void;
  onToggleConfirm: () => void;
}

export interface StepProgressProps {
  step: Step;
  classes: Record<string, string>;
}

export interface OtpStepProps {
  email: string;
  form: {
    values: { otp: string };
    errors: { otp?: string };
    touched: { otp?: boolean };
    handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  };
  isVerifying: boolean;
  emailChipClass: string;
  onResend: () => void;
}

export interface EmailStepProps {
  form: {
    values: { email: string };
    errors: { email?: string };
    touched: { email?: boolean };
    handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  };
  isSendingOtp: boolean;
}

export interface LeftPanelProps {
  step: Step;
  stepIndex: number;
  classes: Record<string, string>;
  onNavigateSignIn: () => void;
}
