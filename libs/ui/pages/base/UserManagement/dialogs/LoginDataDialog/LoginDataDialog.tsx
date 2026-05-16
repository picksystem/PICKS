import { UserAvatar } from '@serviceops/component';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';
import { useStyles } from './styles';
import { UserRow } from '../../types/userManagement.types';
import ReadField from '../../components/ReadField';
import { fmtDateTime, fmtDate } from '../../utils/userManagement.utils';

interface LoginDataDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
}

const LoginDataDialog = ({ open, onClose, selectedRow }: LoginDataDialogProps) => {
  const { classes } = useStyles();
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <Box className={classes.header}>
        <Box className={classes.badgeRow}>
          <LoginIcon className={classes.badgeIcon} />
          <Typography variant='caption' fontWeight={700} className={classes.badgeLabel}>
            Login Activity
          </Typography>
        </Box>
        <Box className={classes.userCard}>
          <UserAvatar user={selectedRow ?? {}} size={52} className={classes.headerAvatar} />
          <Box className={classes.userInfo}>
            <Typography variant='h6' fontWeight={700} className={classes.headerTitle}>
              {selectedRow?.name}
            </Typography>
            <Typography variant='body2' className={classes.headerEmail}>
              {selectedRow?.email}
            </Typography>
          </Box>
          <IconButton onClick={onClose} className={classes.closeBtn}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      <DialogContent dividers>
        {selectedRow && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <ReadField label='Work Email' value={selectedRow.email} muted />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <ReadField label='Last Login' value={fmtDateTime(selectedRow.lastLoginAt)} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <ReadField label='Last Activity' value={fmtDateTime(selectedRow.lastActivityAt)} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <ReadField
                label='Failed Login Attempts'
                value={String(selectedRow.failedLoginAttempts ?? 0)}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <ReadField
                label='Locked Until'
                value={
                  selectedRow.lockedUntil ? fmtDateTime(selectedRow.lockedUntil) : 'Not locked'
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <ReadField
                label='Password Changed'
                value={fmtDateTime(selectedRow.passwordChangedAt)}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <ReadField
                label='Must Reset Password'
                value={selectedRow.mustResetPassword ? 'Yes' : 'No'}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <ReadField label='Source' value={selectedRow.source || 'self_signup'} muted />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <ReadField label='Joined' value={fmtDate(selectedRow.createdAt)} />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDataDialog;
