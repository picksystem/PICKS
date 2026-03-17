import { Alert as MUIAlert } from '@mui/material';
import { useStyles } from './styles';

export interface DSAlertProps {
  severity?: 'error' | 'info' | 'success' | 'warning';
  variant?: 'filled' | 'outlined' | 'standard';
  message?: string;
  children?: React.ReactNode;
  onClose?: (event?: React.SyntheticEvent) => void;
  className?: string;
  sx?: any;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  closeText?: string;
}

const Alert: React.FC<DSAlertProps> = ({
  severity = 'info',
  variant = 'standard',
  message,
  children,
  onClose,
  className,
  sx,
  action,
  icon,
  closeText,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  return (
    <MUIAlert
      severity={severity}
      variant={variant}
      onClose={onClose}
      action={action}
      icon={icon}
      closeText={closeText}
      className={cx(classes.root, className)}
      sx={sx}
      {...rest}
    >
      {message || children}
    </MUIAlert>
  );
};

export default Alert;
