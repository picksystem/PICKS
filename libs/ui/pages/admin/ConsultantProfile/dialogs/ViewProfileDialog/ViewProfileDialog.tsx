import {
  Box,
  Typography,
  Chip,
  Grid,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { IAuthUser, IConsultantProfile } from '@picks/interfaces';
import ReadField from '../../components/ReadField';
import SectionLabel from '../../components/SectionLabel';
import {
  getUserName,
  getConsultantInitials,
  getConsultantProfilePicture,
} from '../../utils/consultantProfile.utils';
import { useStyles } from './styles';

interface ViewProfileDialogProps {
  viewProfile: IConsultantProfile | null;
  consultantUsers: IAuthUser[];
  onClose: () => void;
  onEdit: (profile: IConsultantProfile) => void;
}

const ViewProfileDialog = ({
  viewProfile,
  consultantUsers,
  onClose,
  onEdit,
}: ViewProfileDialogProps) => {
  const { classes } = useStyles();
  return (
    <Dialog
      open={!!viewProfile}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
    >
      {viewProfile && (
        <>
          <Box className={classes.dialogHeader}>
            <Box className={classes.dialogHeaderBadge}>
              <BusinessCenterIcon className={classes.dialogHeaderBadgeIcon} />
              <Typography
                variant='caption'
                fontWeight={700}
                className={classes.dialogHeaderBadgeText}
              >
                Consultant Profile Details
              </Typography>
            </Box>
            <Box className={classes.dialogHeaderUserRow}>
              <Avatar
                src={getConsultantProfilePicture(viewProfile.userId, consultantUsers)}
                className={classes.dialogHeaderAvatar}
              >
                {!getConsultantProfilePicture(viewProfile.userId, consultantUsers) &&
                  getConsultantInitials(viewProfile.userId, consultantUsers)}
              </Avatar>
              <Box className={classes.dialogHeaderUserInfo}>
                <Typography variant='h6' fontWeight={700} className={classes.dialogHeaderTitle}>
                  {getUserName(viewProfile.userId, consultantUsers)}
                </Typography>
                <Typography variant='body2' className={classes.dialogHeaderSubtitle}>
                  {viewProfile.application}
                </Typography>
                <Box className={classes.dialogHeaderChipsRow}>
                  {viewProfile.consultantRole && (
                    <Chip
                      label={viewProfile.consultantRole}
                      size='small'
                      className={classes.roleChip}
                    />
                  )}
                  <Chip
                    label={viewProfile.isActive ? 'Active' : 'Inactive'}
                    size='small'
                    className={viewProfile.isActive ? classes.activeChip : classes.inactiveChip}
                  />
                  {viewProfile.isPocLead && (
                    <Chip label='POC Lead' size='small' className={classes.pocChip} />
                  )}
                </Box>
              </Box>
              <IconButton onClick={onClose} className={classes.closeButton}>
                <CloseIcon fontSize='small' />
              </IconButton>
            </Box>
          </Box>

          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <SectionLabel>Assignment</SectionLabel>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <ReadField
                  label='Consultant'
                  value={getUserName(viewProfile.userId, consultantUsers)}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <ReadField label='Application' value={viewProfile.application} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <ReadField label='Consultant Role' value={viewProfile.consultantRole} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <ReadField label='Lead Consultant' value={viewProfile.leadConsultant} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <SectionLabel>SLA Calendars</SectionLabel>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <ReadField label='SLA Working Calendar' value={viewProfile.slaWorkingCalendar} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <ReadField
                  label='SLA Exception Calendar'
                  value={viewProfile.slaExceptionCalendar}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <SectionLabel>Management</SectionLabel>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <ReadField label='Application Manager' value={viewProfile.applicationManager} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box className={classes.pocFieldBox}>
                  <Typography variant='caption' color='text.secondary' className={classes.pocLabel}>
                    POC / Lead
                  </Typography>
                  <Chip
                    label={viewProfile.isPocLead ? 'Yes' : 'No'}
                    color={viewProfile.isPocLead ? 'primary' : 'default'}
                    size='small'
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Button onClick={onClose} variant='outlined' className={classes.closeActionButton}>
              Close
            </Button>
            <Button
              variant='contained'
              startIcon={<EditIcon />}
              className={classes.editButton}
              onClick={() => {
                onEdit(viewProfile);
                onClose();
              }}
            >
              Edit
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ViewProfileDialog;
