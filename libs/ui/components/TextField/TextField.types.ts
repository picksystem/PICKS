export interface DSTextFieldProps {
  id?: string;
  name?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  error?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconAlignment?: 'left' | 'right';
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  size?: 'small' | 'medium';
  sx?: Record<string, unknown>;
  InputProps?: Record<string, unknown>;
  InputLabelProps?: Record<string, unknown>;
  slotProps?: {
    input?: Record<string, unknown>;
    inputLabel?: Record<string, unknown>;
    htmlInput?: Record<string, unknown>;
    root?: Record<string, unknown>;
    formHelperText?: Record<string, unknown>;
  };
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}
