export interface DSReadOnlyFieldProps {
  label?: string;
  value?: string | number | readonly string[];
  variant?: 'standard' | 'outlined' | 'filled';
  className?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  helperText?: string;
  placeholder?: string;
  showCopyButton?: boolean;
  onCopy?: () => void;
  copyButtonText?: string;
}
