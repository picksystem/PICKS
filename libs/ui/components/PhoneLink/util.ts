export interface DSPhoneLinkProps {
  phoneNumber: string;
  children?: React.ReactNode;
  displayNumber?: string;
  className?: string;
  showIcon?: boolean;
  iconPosition?: 'start' | 'end';
  color?:
    | 'inherit'
    | 'initial'
    | 'primary'
    | 'secondary'
    | 'textPrimary'
    | 'textSecondary'
    | 'error';
  variant?:
    | 'inherit'
    | 'body1'
    | 'body2'
    | 'button'
    | 'caption'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'overline'
    | 'subtitle1'
    | 'subtitle2';
  underline?: 'none' | 'hover' | 'always';
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}
