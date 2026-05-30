import { Link as MUILink } from '@mui/material';
import { useStyles } from './styles';
import { DSLinkProps } from './Link.types';

const Link: React.FC<DSLinkProps> = ({
  href,
  children,
  underline = 'hover',
  target,
  className,
  sx,
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
      sx={{ pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.5 : 1, ...sx }}
      {...rest}
    >
      {children}
    </MUILink>
  );
};

export default Link;
