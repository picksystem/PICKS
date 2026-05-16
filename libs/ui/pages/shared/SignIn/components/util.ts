export interface SignInFormProps {
  formik: {
    values: { email: string; password: string };
    errors: { email?: string; password?: string };
    touched: { email?: boolean; password?: boolean };
    handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  };
  isLoading: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  onNavigate: (path: string) => void;
  loginError?: string | null;
  onClearError?: () => void;
}

export interface LeftPanelProps {
  classes: Record<string, string>;
  onNavigateSignUp: () => void;
}