import { useEffect } from 'react';
import { Modal as MUIModal, Fade, Box, Typography, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { hideNotification, NotificationSeverity } from '@serviceops/services';
import { useStyles } from './styles';

const severityConfig: Record<
  NotificationSeverity,
  { icon: React.ElementType; gradient: string; glow: string; label: string; accent: string }
> = {
  success: {
    icon: CheckCircleIcon,
    gradient: 'linear-gradient(135deg, #0d5f54 0%, #14b8a6 100%)',
    glow: 'rgba(20, 184, 166, 0.5)',
    label: 'Success',
    accent: '#14b8a6',
  },
  error: {
    icon: ErrorIcon,
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)',
    glow: 'rgba(239, 68, 68, 0.5)',
    label: 'Error',
    accent: '#ef4444',
  },
  warning: {
    icon: WarningIcon,
    gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
    glow: 'rgba(245, 158, 11, 0.5)',
    label: 'Warning',
    accent: '#f59e0b',
  },
  info: {
    icon: InfoIcon,
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #3b82f6 100%)',
    glow: 'rgba(59, 130, 246, 0.5)',
    label: 'Information',
    accent: '#3b82f6',
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

  const { icon: Icon, gradient, glow, label, accent } = severityConfig[severity];

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
          <Box className={classes.accentBar} style={{ background: accent }} />
          <Box className={classes.iconPill} style={{ background: `rgba(255,255,255,0.9)` }}>
            <Icon className={classes.icon} style={{ color: accent }} />
          </Box>
          <Box className={classes.textBlock}>
            <Typography className={classes.label} style={{ color: '#fff' }}>{label}</Typography>
            <Typography className={classes.message} style={{ color: 'rgba(255,255,255,0.9)' }}>{message}</Typography>
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
