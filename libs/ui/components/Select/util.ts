import { Select as MUISelect } from '@mui/material';

export interface DSSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface DSSelectProps extends Omit<React.ComponentProps<typeof MUISelect>, 'children'> {
  options?: DSSelectOption[];
  label?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  className?: string;
  value?: string | number | (string | number)[];
  onChange?: (event: any) => void;
  onBlur?: (event: any) => void;
  onFocus?: (event: any) => void;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  placeholder?: string;
  size?: 'small' | 'medium';
  children?: React.ReactNode;
  renderValue?: (value: any) => React.ReactNode;
  MenuProps?: Record<string, unknown>;
  notched?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}
