export interface DSSwitchProps {
  label?: string | React.ReactNode;
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  helperText?: string;
  className?: string;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  size?: 'small' | 'medium';
  sx?: Record<string, unknown>;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  name?: string;
}
