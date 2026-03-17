import { Link as MUILink } from '@mui/material';
import { useStyles } from './styles';

export interface DSLinkProps {
  href?: string;
  children: React.ReactNode;
  underline?: 'none' | 'hover' | 'always';
  target?: '_blank' | '_self' | '_parent' | '_top';
  className?: string;
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

const Link: React.FC<DSLinkProps> = ({
  href,
  children,
  underline = 'hover',
  target,
  className,
  color = 'primary',
  variant = 'inherit',
  onClick,
  disabled = false,
  component,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <MUILink
      href={href}
      underline={underline}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className={cx(classes.root, className)}
      color={color}
      variant={variant}
      onClick={onClick}
      {...(component && { component })}
      sx={{ pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.5 : 1 }}
      {...rest}
    >
      {children}
    </MUILink>
  );
};

export default Link;
