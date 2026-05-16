import {
  Box,
  Typography,
  Grid,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CloseIcon from '@mui/icons-material/Close';
import { IAuthUser, IConsultantRole } from '@serviceops/interfaces';
import { ProfileForm } from '../../types/consultantProfile.types';
import SectionLabel from '../../components/SectionLabel';
import { useStyles } from './styles';

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  editingProfileId: number | null;
  profileForm: ProfileForm;
  onFormChange: (form: ProfileForm) => void;
  isSaving: boolean;
  onSave: () => void;
  consultantUsers: IAuthUser[];
  consultantRoleOptions: IConsultantRole[];
}

const ProfileDialog = ({
  open,
  onClose,
  editingProfileId,
  profileForm,
  onFormChange,
  isSaving,
  onSave,
  consultantUsers,
  consultantRoleOptions,
}: ProfileDialogProps) => {
  const { classes } = useStyles();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
    >
      <Box className={classes.dialogHeader}>
        <Box className={classes.dialogHeaderBadge}>
          <BusinessCenterIcon className={classes.dialogHeaderBadgeIcon} />
          <Typography variant='caption' fontWeight={700} className={classes.dialogHeaderBadgeText}>
            {editingProfileId ? 'Edit Consultant Profile' : 'New Consultant Profile'}
          </Typography>
        </Box>
        <Box className={classes.dialogHeaderRow}>
          <Box>
            <Typography variant='h6' fontWeight={700} className={classes.dialogHeaderTitle}>
              {editingProfileId ? 'Update Profile Details' : 'Create Consultant Profile'}
            </Typography>
            <Typography variant='body2' className={classes.dialogHeaderSubtitle}>
              {editingProfileId
                ? 'Modify the consultant assignment and configuration below'
                : 'Assign a consultant to an application and configure their settings'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} className={classes.dialogCloseButton}>
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
            <FormControl fullWidth size='small' required>
              <InputLabel>Consultant</InputLabel>
              <Select
                value={profileForm.userId}
                label='Consultant'
                onChange={(e) => onFormChange({ ...profileForm, userId: Number(e.target.value) })}
                disabled={!!editingProfileId}
                className={classes.selectField}
              >
                <MenuItem value={0}>
                  <em>Select consultant…</em>
                </MenuItem>
                {consultantUsers.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Application'
              fullWidth
              size='small'
              required
              value={profileForm.application}
              onChange={(e) => onFormChange({ ...profileForm, application: e.target.value })}
              className={classes.textField}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Consultant Role</InputLabel>
              <Select
                value={profileForm.consultantRole}
                label='Consultant Role'
                onChange={(e) => onFormChange({ ...profileForm, consultantRole: e.target.value })}
                className={classes.selectField}
              >
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                {consultantRoleOptions.map((r) => (
                  <MenuItem key={r.id} value={r.roleName}>
                    {r.roleName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Lead Consultant'
              fullWidth
              size='small'
              value={profileForm.leadConsultant}
              onChange={(e) => onFormChange({ ...profileForm, leadConsultant: e.target.value })}
              className={classes.textField}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SectionLabel>SLA Calendars</SectionLabel>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='SLA Working Calendar'
              fullWidth
              size='small'
              value={profileForm.slaWorkingCalendar}
              onChange={(e) => onFormChange({ ...profileForm, slaWorkingCalendar: e.target.value })}
              className={classes.textField}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='SLA Exception Calendar'
              fullWidth
              size='small'
              value={profileForm.slaExceptionCalendar}
              onChange={(e) =>
                onFormChange({ ...profileForm, slaExceptionCalendar: e.target.value })
              }
              className={classes.textField}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SectionLabel>Management</SectionLabel>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Application Manager'
              fullWidth
              size='small'
              value={profileForm.applicationManager}
              onChange={(e) => onFormChange({ ...profileForm, applicationManager: e.target.value })}
              className={classes.textField}
            />
          </Grid>
          <Grid size={{ xs: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={profileForm.isPocLead}
                  onChange={(e) => onFormChange({ ...profileForm, isPocLead: e.target.checked })}
                  color='primary'
                />
              }
              label='POC / Lead'
            />
          </Grid>
          <Grid size={{ xs: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={profileForm.isActive}
                  onChange={(e) => onFormChange({ ...profileForm, isActive: e.target.checked })}
                  color='success'
                />
              }
              label='Active'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={onClose} variant='outlined' className={classes.cancelButton}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={onSave}
          disabled={isSaving}
          className={classes.saveButton}
        >
          {isSaving ? 'Saving…' : editingProfileId ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;
