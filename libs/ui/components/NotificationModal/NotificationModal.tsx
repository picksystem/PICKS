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
    glow: 'rgba(20, 184, 166, 0.4)',
    label: 'Success',
    accent: '#14b8a6',
  },
  error: {
    icon: ErrorIcon,
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)',
    glow: 'rgba(239, 68, 68, 0.4)',
    label: 'Error',
    accent: '#ef4444',
  },
  warning: {
    icon: WarningIcon,
    gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
    glow: 'rgba(245, 158, 11, 0.4)',
    label: 'Warning',
    accent: '#f59e0b',
  },
  info: {
    icon: InfoIcon,
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #3b82f6 100%)',
    glow: 'rgba(59, 130, 246, 0.4)',
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

  const { icon: Icon, label, accent } = severityConfig[severity];

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
        <Box className={classes.card}>
          <Box className={classes.accentBar} style={{ background: accent }} />
          <Box className={classes.iconPill} style={{ background: `${accent}15` }}>
            <Icon className={classes.icon} style={{ color: accent }} />
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
