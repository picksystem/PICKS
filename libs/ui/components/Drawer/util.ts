export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}
