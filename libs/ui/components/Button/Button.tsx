import { Button as MUIButton, CircularProgress } from '@mui/material';
import { useStyles } from './styles';

export interface DSButtonProps {
  label?: string;
  children?: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  size?: 'small' | 'medium' | 'large';
  sx?: Record<string, unknown>;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

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
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const resolvedStartIcon = startIconProp || (!loading && iconPosition === 'start' && icon ? icon : undefined);
  const resolvedEndIcon = endIconProp || (!loading && iconPosition === 'end' && icon ? icon : undefined);

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
