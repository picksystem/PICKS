import { Button as MUIButton, CircularProgress } from '@mui/material';
import { useStyles } from './styles';
import { DSButtonProps } from './util';

const Button: React.FC<DSButtonProps> = ({
  label,
  children,
  loading = false,
  icon,
  iconPosition = 'start',
  variant = 'contained',
  color = 'primary',
  disabled,
  className,
  onClick,
  type = 'button',
  size = 'medium',
  sx,
  startIcon: startIconProp,
  endIcon: endIconProp,
  form,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const resolvedStartIcon =
    startIconProp || (!loading && iconPosition === 'start' && icon ? icon : undefined);
  const resolvedEndIcon =
    endIconProp || (!loading && iconPosition === 'end' && icon ? icon : undefined);

  return (
    <MUIButton
      variant={variant}
      color={color}
      disabled={disabled || loading}
      startIcon={resolvedStartIcon}
      endIcon={resolvedEndIcon}
      onClick={onClick}
      type={type}
      size={size}
      className={cx(classes.root, className)}
      sx={sx}
      form={form}
      {...rest}
    >
      {loading ? (
        <>
          <CircularProgress size={20} color='inherit' style={{ marginRight: 8 }} />
          {label || children}
        </>
      ) : (
        label || children
      )}
    </MUIButton>
  );
};

export default Button;
