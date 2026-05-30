export interface DSTopbarProps {
  title?: string;
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
  showMenuIcon?: boolean;
  position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative';
  className?: string;
  color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'transparent';
  elevation?: number;
  variant?: 'elevation' | 'outlined';
  enableColorOnDark?: boolean;
  sx?: any;
}
