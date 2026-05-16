export interface DSRadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface DSRadioGroupProps {
  options: DSRadioOption[];
  label?: string;
  helperText?: string;
  className?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  disabled?: boolean;
  required?: boolean;
  row?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  size?: 'small' | 'medium';
}
