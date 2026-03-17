import { useEffect } from 'react';
import { Modal as MUIModal, Fade, Box, Typography, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { hideNotification, NotificationSeverity } from '../../slices';
import { useStyles } from './styles';

const severityConfig: Record<
  NotificationSeverity,
  { icon: React.ElementType; gradient: string; glow: string; label: string }
> = {
  success: {
    icon: CheckCircleIcon,
    gradient: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
    glow: 'rgba(5, 150, 105, 0.5)',
    label: 'Success',
  },
  error: {
    icon: ErrorIcon,
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
    glow: 'rgba(220, 38, 38, 0.5)',
    label: 'Error',
  },
  warning: {
    icon: WarningIcon,
    gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)',
    glow: 'rgba(217, 119, 6, 0.5)',
    label: 'Warning',
  },
  info: {
    icon: InfoIcon,
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)',
    glow: 'rgba(2, 132, 199, 0.5)',
    label: 'Information',
  },
};

const NotificationModal = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const { open, message, severity, autoHideDuration } = useAppSelector(
    (state) => state.notification,
  );

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => dispatch(hideNotification()), autoHideDuration);
    return () => clearTimeout(timer);
  }, [open, autoHideDuration, dispatch]);

  const { icon: Icon, gradient, glow, label } = severityConfig[severity];

  return (
    <MUIModal
      open={open}
      onClose={() => dispatch(hideNotification())}
      className={classes.modal}
      closeAfterTransition
      hideBackdrop
      disableAutoFocus
    >
      <Fade in={open} timeout={280}>
        <Box
          className={classes.card}
          style={{
            background: gradient,
            boxShadow: `0 24px 64px ${glow}, 0 8px 24px rgba(0,0,0,0.28)`,
          }}
        >
          <Box className={classes.iconPill}>
            <Icon className={classes.icon} />
          </Box>
          <Box className={classes.textBlock}>
            <Typography className={classes.label}>{label}</Typography>
            <Typography className={classes.message}>{message}</Typography>
          </Box>
          <IconButton
            className={classes.closeBtn}
            size='small'
            onClick={() => dispatch(hideNotification())}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>
      </Fade>
    </MUIModal>
  );
};

export default NotificationModal;
