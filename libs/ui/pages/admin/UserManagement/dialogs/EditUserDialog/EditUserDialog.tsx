import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useFieldError } from '@picks/hooks';
import { useStyles } from './styles';
import { UserRow, EditFormShape } from '../../types/userManagement.types';
import {
  TIMEZONES,
  DATE_FORMATS,
  TIME_FORMATS,
  LANGUAGES,
  SLA_WORKING_CALENDARS,
  SLA_LEAVE_CALENDARS,
  SOURCE_LABELS,
  getTzDisplay,
  fmtDateTimeUser,
} from '../../utils/userManagement.utils';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
  editForm: EditFormShape;
  onFormChange: (updater: (prev: EditFormShape) => EditFormShape) => void;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
  currentUserId?: number;
}

const EditUserDialog = ({
  open,
  onClose,
  selectedRow,
  editForm,
  onFormChange,
  isSaving,
  isDirty,
  onSave,
  currentUserId,
}: EditUserDialogProps) => {
  const { classes } = useStyles();
  const reqError = useFieldError();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset touched state when dialog closes
  useEffect(() => {
    if (!open) setTouched({});
  }, [open]);

  // Compute required-field errors
  const errors: Record<string, string> = {};
  if (!editForm.firstName?.trim()) errors.firstName = 'required';
  if (!editForm.lastName?.trim()) errors.lastName = 'required';
  if (!editForm.workLocation?.trim()) errors.workLocation = 'required';
  if (!editForm.managerName?.trim()) errors.managerName = 'required';
  if (!editForm.reasonForAccess?.trim()) errors.reasonForAccess = 'required';

  const touch = (field: string) => setTouched((p) => ({ ...p, [field]: true }));

  const handleSaveClick = () => {
    setTouched({
      firstName: true,
      lastName: true,
      workLocation: true,
      managerName: true,
      reasonForAccess: true,
    });
    if (Object.keys(errors).length === 0) onSave();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      slotProps={{ paper: { className: classes.dialogPaper } }}
    >
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.badgeRow}>
          <EditIcon className={classes.badgeIcon} />
          <Typography variant='caption' fontWeight={700} className={classes.badgeLabel}>
            Edit User Profile
          </Typography>
        </Box>

        <Box className={classes.userCard}>
          <UserAvatar user={selectedRow ?? {}} size={56} className={classes.headerAvatar} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box className={classes.nameRow}>
              <Typography variant='h6' fontWeight={700} className={classes.headerTitle}>
                {selectedRow?.name}
              </Typography>
              {isDirty && (
                <Chip label='Unsaved changes' size='small' className={classes.unsavedChip} />
              )}
            </Box>
            <Typography variant='body2' className={classes.headerEmail}>
              {selectedRow?.email}
            </Typography>
            <Box className={classes.chipRow}>
              <Chip
                label={
                  selectedRow?.role
                    ? selectedRow.role.charAt(0).toUpperCase() + selectedRow.role.slice(1)
                    : '-'
                }
                size='small'
                className={classes.roleChip}
              />
              <Chip
                label={selectedRow?.isActive ? 'Active' : 'Inactive'}
                size='small'
                className={selectedRow?.isActive ? classes.activeChip : classes.inactiveChip}
              />
              <Typography variant='caption' className={classes.metaCaption}>
                {SOURCE_LABELS[(selectedRow?.source || '').toLowerCase()] ||
                  selectedRow?.source ||
                  '-'}
                {selectedRow?.lastActivityAt
                  ? ` · Last active ${fmtDateTimeUser(selectedRow.lastActivityAt, selectedRow.timezone, selectedRow.dateFormat, selectedRow.timeFormat)}`
                  : ''}
              </Typography>
            </Box>
          </Box>
        </Box>

        <IconButton size='small' onClick={onClose} className={classes.closeBtn}>
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Personal */}
          <Grid size={{ xs: 12 }}>
            <Typography variant='subtitle2' color='primary'>
              Personal Info
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='First Name'
              fullWidth
              size='small'
              required
              value={editForm.firstName}
              onChange={(e) => onFormChange((p) => ({ ...p, firstName: e.target.value }))}
              onBlur={() => touch('firstName')}
              error={touched.firstName && !!errors.firstName}
              helperText={reqError(touched.firstName, errors.firstName)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Last Name'
              fullWidth
              size='small'
              required
              value={editForm.lastName}
              onChange={(e) => onFormChange((p) => ({ ...p, lastName: e.target.value }))}
              onBlur={() => touch('lastName')}
              error={touched.lastName && !!errors.lastName}
              helperText={reqError(touched.lastName, errors.lastName)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Phone'
              fullWidth
              size='small'
              value={editForm.phone}
              onChange={(e) => onFormChange((p) => ({ ...p, phone: e.target.value }))}
            />
          </Grid>

          {/* Work */}
          <Grid size={{ xs: 12 }}>
            <Divider />
            <Typography variant='subtitle2' color='primary' sx={{ mt: 1 }}>
              Work Details
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Department'
              fullWidth
              size='small'
              value={editForm.department}
              onChange={(e) => onFormChange((p) => ({ ...p, department: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Work Location'
              fullWidth
              size='small'
              required
              value={editForm.workLocation}
              onChange={(e) => onFormChange((p) => ({ ...p, workLocation: e.target.value }))}
              onBlur={() => touch('workLocation')}
              error={touched.workLocation && !!errors.workLocation}
              helperText={reqError(touched.workLocation, errors.workLocation)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Business Unit'
              fullWidth
              size='small'
              value={editForm.businessUnit}
              onChange={(e) => onFormChange((p) => ({ ...p, businessUnit: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Employee ID'
              fullWidth
              size='small'
              value={editForm.employeeId}
              onChange={(e) => onFormChange((p) => ({ ...p, employeeId: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label='Reporting Manager'
              fullWidth
              size='small'
              required
              value={editForm.managerName}
              onChange={(e) => onFormChange((p) => ({ ...p, managerName: e.target.value }))}
              onBlur={() => touch('managerName')}
              error={touched.managerName && !!errors.managerName}
              helperText={reqError(touched.managerName, errors.managerName)}
            />
          </Grid>

          {/* Account */}
          <Grid size={{ xs: 12 }}>
            <Divider />
            <Typography variant='subtitle2' color='primary' sx={{ mt: 1 }}>
              Account & Access
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size='small' disabled>
              <InputLabel>Role</InputLabel>
              <Select value={editForm.role} label='Role'>
                <MenuItem value='user'>User</MenuItem>
                <MenuItem value='consultant'>Consultant</MenuItem>
                <MenuItem value='admin'>Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isActive}
                  color='success'
                  disabled={!!(selectedRow && currentUserId === selectedRow.id)}
                  onChange={(e) => onFormChange((p) => ({ ...p, isActive: e.target.checked }))}
                />
              }
              label='Active'
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DatePicker
              label='Access Start Date'
              value={editForm.accessFromDate ? dayjs(editForm.accessFromDate) : null}
              onChange={(newValue) =>
                onFormChange((p) => ({
                  ...p,
                  accessFromDate: newValue ? newValue.format('YYYY-MM-DD') : '',
                }))
              }
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DatePicker
              label='Access End Date'
              value={editForm.accessToDate ? dayjs(editForm.accessToDate) : null}
              onChange={(newValue) =>
                onFormChange((p) => ({
                  ...p,
                  accessToDate: newValue ? newValue.format('YYYY-MM-DD') : '',
                }))
              }
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          {/* Locale */}
          <Grid size={{ xs: 12 }}>
            <Divider />
            <Typography variant='subtitle2' color='primary' sx={{ mt: 1 }}>
              Locale & Preferences
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={editForm.timezone}
                label='Timezone'
                onChange={(e) => onFormChange((p) => ({ ...p, timezone: e.target.value }))}
              >
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                {TIMEZONES.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {getTzDisplay(tz)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Date Format</InputLabel>
              <Select
                value={editForm.dateFormat}
                label='Date Format'
                onChange={(e) => onFormChange((p) => ({ ...p, dateFormat: e.target.value }))}
              >
                {DATE_FORMATS.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Time Format</InputLabel>
              <Select
                value={editForm.timeFormat}
                label='Time Format'
                onChange={(e) => onFormChange((p) => ({ ...p, timeFormat: e.target.value }))}
              >
                {TIME_FORMATS.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Language</InputLabel>
              <Select
                value={editForm.language}
                label='Language'
                onChange={(e) => onFormChange((p) => ({ ...p, language: e.target.value }))}
              >
                {LANGUAGES.map((l) => (
                  <MenuItem key={l.value} value={l.value}>
                    {l.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Working Calendar</InputLabel>
              <Select
                value={editForm.slaWorkingCalendar}
                label='Working Calendar'
                onChange={(e) =>
                  onFormChange((p) => ({ ...p, slaWorkingCalendar: e.target.value }))
                }
              >
                <MenuItem value=''>— Not set —</MenuItem>
                {SLA_WORKING_CALENDARS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Leave Calendar</InputLabel>
              <Select
                value={editForm.slaExceptionGroup}
                label='Leave Calendar'
                onChange={(e) => onFormChange((p) => ({ ...p, slaExceptionGroup: e.target.value }))}
              >
                <MenuItem value=''>— Not set —</MenuItem>
                {SLA_LEAVE_CALENDARS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Consultant fields */}
          {editForm.role === 'consultant' && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider />
                <Typography variant='subtitle2' color='secondary' sx={{ mt: 1 }}>
                  Consultant Info
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label='Application'
                  fullWidth
                  size='small'
                  value={editForm.application}
                  onChange={(e) => onFormChange((p) => ({ ...p, application: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label='Application Lead'
                  fullWidth
                  size='small'
                  value={editForm.applicationLead}
                  onChange={(e) => onFormChange((p) => ({ ...p, applicationLead: e.target.value }))}
                />
              </Grid>
            </>
          )}

          {/* Reason + Notes */}
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label='Reason for Access'
              fullWidth
              size='small'
              required
              multiline
              minRows={2}
              value={editForm.reasonForAccess}
              onChange={(e) => onFormChange((p) => ({ ...p, reasonForAccess: e.target.value }))}
              onBlur={() => touch('reasonForAccess')}
              error={touched.reasonForAccess && !!errors.reasonForAccess}
              helperText={reqError(touched.reasonForAccess, errors.reasonForAccess)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label='Admin Notes'
              fullWidth
              size='small'
              multiline
              minRows={2}
              value={editForm.adminNotes}
              onChange={(e) => onFormChange((p) => ({ ...p, adminNotes: e.target.value }))}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button onClick={onClose} variant='outlined' sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSaveClick}
          disabled={isSaving || !isDirty}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
