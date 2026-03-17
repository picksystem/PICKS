import { UserAvatar } from '@picks/component';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
  Alert,
  Grid,
} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CloseIcon from '@mui/icons-material/Close';
import { useStyles } from './styles';
import { UserRow } from '../../types/userManagement.types';
import ReadField from '../../components/ReadField';

interface ConsultantProfileDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
}

const ConsultantProfileDialog = ({ open, onClose, selectedRow }: ConsultantProfileDialogProps) => {
  const { classes } = useStyles();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      slotProps={{ paper: { className: classes.dialogPaper } }}
    >
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.badgeRow}>
          <BusinessCenterIcon className={classes.badgeIcon} />
          <Typography variant='caption' fontWeight={700} className={classes.badgeLabel}>
            Consultant Profile
          </Typography>
        </Box>

        <Box className={classes.userCard}>
          <UserAvatar user={selectedRow ?? {}} size={56} className={classes.headerAvatar} />
          <Box className={classes.infoBox}>
            <Typography variant='h6' fontWeight={700} className={classes.headerTitle}>
              {selectedRow?.name}
            </Typography>
            <Typography variant='body2' className={classes.headerEmail}>
              {selectedRow?.email}
            </Typography>
            <Box className={classes.chipRow}>
              <Chip label='Consultant' size='small' className={classes.roleChip} />
              <Chip
                label={
                  selectedRow?.consultantProfileUpdated ? 'Profile Complete' : 'Profile Incomplete'
                }
                size='small'
                className={
                  selectedRow?.consultantProfileUpdated
                    ? classes.profileCompleteChip
                    : classes.profileIncompleteChip
                }
              />
            </Box>
          </Box>
          <IconButton onClick={onClose} className={classes.closeBtn}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      <DialogContent dividers sx={{ p: 3 }}>
        {selectedRow && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Typography variant='caption' color='text.secondary' className={classes.sectionLabel}>
                Application Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label='Application' value={selectedRow.application} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label='Application Lead' value={selectedRow.applicationLead} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant='caption' color='text.secondary' className={classes.sectionLabel}>
                Calendars
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label='Working Calendar' value={selectedRow.slaWorkingCalendar} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label='Leave Calendar' value={selectedRow.slaExceptionGroup} />
            </Grid>

            {!selectedRow.consultantProfileUpdated && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Divider />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Alert severity='warning' sx={{ borderRadius: 2 }}>
                    Consultant profile is incomplete. Go to <strong>Consultant Profiles</strong>{' '}
                    page to complete it.
                  </Alert>
                </Grid>
              </>
            )}
          </Grid>
        )}
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button onClick={onClose} variant='outlined' sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsultantProfileDialog;
