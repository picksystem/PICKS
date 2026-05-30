export interface DSLinkProps {
  href?: string;
  children: React.ReactNode;
  underline?: 'none' | 'hover' | 'always';
  target?: '_blank' | '_self' | '_parent' | '_top';
  className?: string;
  sx?: Record<string, unknown>;
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
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  disabled?: boolean;
  component?: React.ElementType;
}
