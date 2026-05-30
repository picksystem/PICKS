export interface DSAlertProps {
  severity?: 'error' | 'info' | 'success' | 'warning';
  variant?: 'filled' | 'outlined' | 'standard';
  message?: string;
  children?: React.ReactNode;
  onClose?: (event?: React.SyntheticEvent) => void;
  className?: string;
  sx?: any;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  closeText?: string;
}
