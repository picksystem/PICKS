export interface DSCardProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  sx?: any;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  raised?: boolean;
  variant?: 'elevation' | 'outlined';
  elevation?: number;
}
