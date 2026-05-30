export interface DSHelpBoxProps {
  title?: string;
  message: string | React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success';
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  closable?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}
