export interface DSButtonMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DSButtonMenuProps {
  buttonLabel: string;
  items: DSButtonMenuItem[];
  buttonVariant?: 'text' | 'outlined' | 'contained';
  buttonColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  buttonSize?: 'small' | 'medium' | 'large';
  className?: string;
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  anchorOrigin?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  transformOrigin?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}
