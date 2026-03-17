import { Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { useStyles } from './styles';

export interface DSHelpBoxProps {
  title?: string;
  message: string | React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success';
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  closable?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const HelpBox: React.FC<DSHelpBoxProps> = ({
  title,
  message,
  type = 'info',
  icon,
  onClose,
  className,
  closable = true,
  variant = 'default',
  size = 'medium',
  onClick,
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const defaultIcons = {
    info: <InfoIcon />,
    warning: <WarningIcon />,
    error: <ErrorIcon />,
    success: <CheckCircleIcon />,
  };

  const typeClass = {
    info: classes.info,
    warning: classes.warning,
    error: classes.error,
    success: classes.success,
  };

  const variantClass = {
    default: '',
    outlined: classes.outlined,
    filled: classes.filled,
  };

  const sizeClass = {
    small: classes.small,
    medium: classes.medium,
    large: classes.large,
  };

  return (
    <Box
      className={cx(
        classes.root,
        typeClass[type],
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      onClick={onClick}
      {...rest}
    >
      {icon || defaultIcons[type]}
      <div className={classes.content}>
        {title && <div className={classes.title}>{title}</div>}
        <div className={classes.message}>{message}</div>
      </div>
      {onClose && closable && (
        <button className={classes.closeButton} onClick={onClose}>
          <CloseIcon fontSize='small' />
        </button>
      )}
    </Box>
  );
};

export default HelpBox;
