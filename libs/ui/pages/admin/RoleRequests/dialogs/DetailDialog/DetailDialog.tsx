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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CloseIcon from '@mui/icons-material/Close';
import { IAuthUser } from '@picks/interfaces';
import { RoleRequestRow, ActionType } from '../../types/roleRequests.types';
import DetailField from '../../components/DetailField';
import { useStyles } from './styles';

interface DetailDialogProps {
  detailUser: IAuthUser | null;
  onClose: () => void;
  onOpenAction: (user: RoleRequestRow, type: ActionType) => void;
}

const DetailDialog = ({ detailUser, onClose, onOpenAction }: DetailDialogProps) => {
  const { classes } = useStyles();
  return (
    <Dialog
      open={!!detailUser}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
    >
      {detailUser && (
        <>
          {/* Header banner */}
          <Box className={classes.dialogHeader}>
            <Box className={classes.dialogHeaderBadge}>
              <HowToRegIcon className={classes.dialogHeaderBadgeIcon} />
              <Typography
                variant='caption'
                fontWeight={700}
                className={classes.dialogHeaderBadgeText}
              >
                Access Request Review
              </Typography>
            </Box>
            <Box className={classes.dialogHeaderUserRow}>
              <Avatar
                src={detailUser.profilePicture || undefined}
                className={classes.dialogHeaderAvatar}
              >
                {!detailUser.profilePicture &&
                  `${detailUser.firstName?.[0] ?? ''}${detailUser.lastName?.[0] ?? ''}`.toUpperCase()}
              </Avatar>
              <Box className={classes.dialogHeaderUserInfo}>
                <Typography variant='h6' fontWeight={700} className={classes.dialogHeaderTitle}>
                  {detailUser.name}
                </Typography>
                <Typography variant='body2' className={classes.dialogHeaderSubtitle}>
                  {detailUser.email}
                </Typography>
                <Box className={classes.dialogHeaderChipsRow}>
                  <Chip
                    label={
                      (detailUser.requestedRole || 'user').charAt(0).toUpperCase() +
                      (detailUser.requestedRole || 'user').slice(1)
                    }
                    size='small'
                    className={classes.roleChip}
                  />
                  {detailUser.status === 'pending_approval' && (
                    <Chip label='Pending Review' size='small' className={classes.pendingChip} />
                  )}
                  {(detailUser.status === 'active' || detailUser.status === 'invited') && (
                    <Chip label='Approved' size='small' className={classes.approvedChip} />
                  )}
                  {detailUser.status === 'rejected' && (
                    <Chip label='Rejected' size='small' className={classes.rejectedChip} />
                  )}
                </Box>
              </Box>
              <IconButton onClick={onClose} className={classes.closeButton}>
                <CloseIcon fontSize='small' />
              </IconButton>
            </Box>
          </Box>

          <DialogContent dividers sx={{ p: 3 }}>
            <Typography variant='subtitle2' color='primary' className={classes.sectionTitle}>
              Personal Info
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6 }}>
                <DetailField label='First Name' value={detailUser.firstName} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DetailField label='Last Name' value={detailUser.lastName} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DetailField label='Email' value={detailUser.email} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DetailField label='Phone' value={detailUser.phone} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant='subtitle2' color='primary' className={classes.sectionTitle}>
              Work Details
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6 }}>
                <DetailField label='Department' value={detailUser.department} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DetailField label='Business Unit' value={detailUser.businessUnit} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DetailField label='Work Location' value={detailUser.workLocation} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DetailField label='Employee ID' value={detailUser.employeeId} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DetailField label='Manager Name' value={detailUser.managerName} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant='subtitle2' color='primary' className={classes.sectionTitle}>
              Access Request
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <DetailField
                  label='Requested Role'
                  value={
                    <Chip
                      label={
                        (detailUser.requestedRole || 'user').charAt(0).toUpperCase() +
                        (detailUser.requestedRole || 'user').slice(1)
                      }
                      color='primary'
                      size='small'
                      variant='outlined'
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DetailField
                  label='Account Status'
                  value={detailUser.isActive ? 'Active' : 'Inactive'}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DetailField
                  label='Signup Date'
                  value={new Date(detailUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
              </Grid>
              {detailUser.reasonForAccess && (
                <Grid size={{ xs: 12 }}>
                  <Box className={classes.reasonBox}>
                    <Typography variant='caption' color='text.secondary'>
                      Reason for Access
                    </Typography>
                    <Typography variant='body2'>{detailUser.reasonForAccess}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions className={classes.dialogActions}>
            <Button onClick={onClose} variant='outlined' className={classes.closeActionButton}>
              Close
            </Button>
            {detailUser.status === 'pending_approval' && (
              <>
                <Button
                  variant='outlined'
                  color='error'
                  startIcon={<CancelOutlinedIcon />}
                  className={classes.rejectButton}
                  onClick={() => {
                    onOpenAction(detailUser as RoleRequestRow, 'reject');
                    onClose();
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant='contained'
                  color='success'
                  startIcon={<CheckCircleOutlineIcon />}
                  className={classes.approveButton}
                  onClick={() => {
                    onOpenAction(detailUser as RoleRequestRow, 'approve');
                    onClose();
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default DetailDialog;
