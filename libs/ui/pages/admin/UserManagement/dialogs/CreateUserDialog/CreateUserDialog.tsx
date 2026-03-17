import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Chip,
  Divider,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  FormHelperText,
  Stack,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { FormikProps } from 'formik';
import { useStyles } from './styles';
import { useNotification } from '@picks/hooks';
import {
  TIMEZONES,
  DATE_FORMATS,
  TIME_FORMATS,
  TIME_FORMAT_LABELS,
  LANGUAGES,
  SLA_WORKING_CALENDARS,
  SLA_LEAVE_CALENDARS,
  getTzDisplay,
  getDraftDaysRemaining,
  clearNewUserDraft,
  DRAFT_DAYS,
} from '../../utils/userManagement.utils';
import { InitialCreateValues } from '../../types/userManagement.types';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  isOpenedAsDraft: boolean;
  draftMeta: { savedAt: string; expiresAt: string } | null;
  setDraftMeta: (v: null) => void;
  setDraftValues: (v: null) => void;
  setIsOpenedAsDraft: (v: boolean) => void;
  createFormik: FormikProps<InitialCreateValues>;
  reqError: (
    touched: unknown,
    error: string | undefined,
  ) => string | React.ReactElement | undefined;
  genPassword: string;
  showGenPw: boolean;
  setShowGenPw: (v: boolean | ((prev: boolean) => boolean)) => void;
  onRegeneratePw: () => void;
  onApplyGenPw: () => void;
  onSaveDraft: () => void;
  adminNotes: string;
  setAdminNotes: (v: string) => void;
}

const CreateUserDialog = ({
  open,
  onClose,
  isOpenedAsDraft,
  draftMeta,
  setDraftMeta,
  setDraftValues,
  setIsOpenedAsDraft,
  createFormik,
  reqError,
  genPassword,
  showGenPw,
  setShowGenPw,
  onRegeneratePw,
  onApplyGenPw,
  onSaveDraft,
  adminNotes,
  setAdminNotes,
}: CreateUserDialogProps) => {
  const { classes } = useStyles();
  const notify = useNotification();

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
          <AddIcon className={classes.badgeIcon} />
          <Typography variant='caption' fontWeight={700} className={classes.badgeLabel}>
            New User
          </Typography>
          {draftMeta && isOpenedAsDraft && (
            <Chip
              label='Draft Restored'
              size='small'
              icon={<ScheduleIcon />}
              className={classes.draftChip}
              sx={{ ml: 0.5 }}
            />
          )}
        </Box>

        <Box className={classes.userCard}>
          <Avatar className={classes.headerAvatar}>
            <PersonIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Box>
            <Typography variant='h6' fontWeight={700} className={classes.headerTitle}>
              Create New User
            </Typography>
            <Typography variant='body2' className={classes.headerSubtitle}>
              Admin-created users are activated immediately. A welcome email with temporary
              credentials will be sent automatically.
            </Typography>
          </Box>
        </Box>

        <IconButton size='small' onClick={onClose} className={classes.closeBtn}>
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <DialogContent dividers>
        {/* Draft alert */}
        {draftMeta && isOpenedAsDraft && (
          <Alert
            severity='warning'
            icon={<ScheduleIcon />}
            sx={{ mb: 2 }}
            action={
              <Button
                size='small'
                color='inherit'
                onClick={() => {
                  clearNewUserDraft();
                  setDraftMeta(null);
                  setDraftValues(null);
                  setIsOpenedAsDraft(false);
                  createFormik.resetForm();
                }}
              >
                Clear Draft
              </Button>
            }
          >
            Draft restored — saved on{' '}
            <strong>{new Date(draftMeta.savedAt).toLocaleDateString()}</strong>. Expires in{' '}
            <strong>{getDraftDaysRemaining(draftMeta.expiresAt)} days</strong> and will be deleted
            automatically after {DRAFT_DAYS} days.
          </Alert>
        )}

        <form id='new-user-form' onSubmit={createFormik.handleSubmit} noValidate>
          {/* Personal Information */}
          <Typography variant='subtitle1' fontWeight={600} color='primary' sx={{ mb: 1.5 }}>
            Personal Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='firstName'
                name='firstName'
                label='First Name'
                required
                fullWidth
                size='small'
                value={createFormik.values.firstName}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.firstName && Boolean(createFormik.errors.firstName)}
                helperText={reqError(
                  createFormik.touched.firstName,
                  createFormik.errors.firstName as string,
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='lastName'
                name='lastName'
                label='Last Name'
                required
                fullWidth
                size='small'
                value={createFormik.values.lastName}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.lastName && Boolean(createFormik.errors.lastName)}
                helperText={reqError(
                  createFormik.touched.lastName,
                  createFormik.errors.lastName as string,
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='email'
                name='email'
                label='Work Email'
                required
                type='email'
                fullWidth
                size='small'
                value={createFormik.values.email}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.email && Boolean(createFormik.errors.email)}
                helperText={reqError(
                  createFormik.touched.email,
                  createFormik.errors.email as string,
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='phone'
                name='phone'
                label='Phone Number'
                type='tel'
                fullWidth
                size='small'
                value={createFormik.values.phone}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.phone && Boolean(createFormik.errors.phone)}
                helperText={reqError(
                  createFormik.touched.phone,
                  createFormik.errors.phone as string,
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {/* Work Details */}
          <Typography variant='subtitle1' fontWeight={600} color='primary' sx={{ mb: 1.5 }}>
            Work Details
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='workLocation'
                name='workLocation'
                label='Work Location'
                required
                fullWidth
                size='small'
                value={createFormik.values.workLocation}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={
                  createFormik.touched.workLocation && Boolean(createFormik.errors.workLocation)
                }
                helperText={reqError(
                  createFormik.touched.workLocation,
                  createFormik.errors.workLocation as string,
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='department'
                name='department'
                label='Department'
                fullWidth
                size='small'
                value={createFormik.values.department}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.department && Boolean(createFormik.errors.department)}
                helperText={reqError(
                  createFormik.touched.department,
                  createFormik.errors.department as string,
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='employeeId'
                name='employeeId'
                label='Employee ID (Optional)'
                fullWidth
                size='small'
                value={createFormik.values.employeeId}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='businessUnit'
                name='businessUnit'
                label='Business Unit (Optional)'
                fullWidth
                size='small'
                value={createFormik.values.businessUnit}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='managerName'
                name='managerName'
                label='Manager Name (Optional)'
                fullWidth
                size='small'
                value={createFormik.values.managerName}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='reasonForAccess'
                name='reasonForAccess'
                label='Reason for Access (Optional)'
                fullWidth
                size='small'
                placeholder='Describe why this user needs access'
                value={createFormik.values.reasonForAccess}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {/* Locale & Calendar */}
          <Typography variant='subtitle1' fontWeight={600} color='primary' sx={{ mb: 1.5 }}>
            Locale & Calendar
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Timezone</InputLabel>
                <Select
                  name='timezone'
                  value={createFormik.values.timezone}
                  label='Timezone'
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                >
                  <MenuItem value=''>— Not set —</MenuItem>
                  {TIMEZONES.map((tz) => (
                    <MenuItem key={tz} value={tz}>
                      {getTzDisplay(tz)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Language</InputLabel>
                <Select
                  name='language'
                  value={createFormik.values.language}
                  label='Language'
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                >
                  {LANGUAGES.map((l) => (
                    <MenuItem key={l.value} value={l.value}>
                      {l.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Date Format</InputLabel>
                <Select
                  name='dateFormat'
                  value={createFormik.values.dateFormat}
                  label='Date Format'
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                >
                  {DATE_FORMATS.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Time Format</InputLabel>
                <Select
                  name='timeFormat'
                  value={createFormik.values.timeFormat}
                  label='Time Format'
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                >
                  {TIME_FORMATS.map((f) => (
                    <MenuItem key={f} value={f}>
                      {TIME_FORMAT_LABELS[f]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Working Calendar</InputLabel>
                <Select
                  name='slaWorkingCalendar'
                  value={createFormik.values.slaWorkingCalendar}
                  label='Working Calendar'
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
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
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Leave Calendar</InputLabel>
                <Select
                  name='slaExceptionGroup'
                  value={createFormik.values.slaExceptionGroup}
                  label='Leave Calendar'
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
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
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {/* Account Security */}
          <Typography variant='subtitle1' fontWeight={600} color='primary' sx={{ mb: 1.5 }}>
            Account Security
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='password'
                name='password'
                label='Enter Password'
                required
                type='password'
                fullWidth
                size='small'
                value={createFormik.values.password}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.password && Boolean(createFormik.errors.password)}
                helperText={reqError(
                  createFormik.touched.password,
                  createFormik.errors.password as string,
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id='confirmPassword'
                name='confirmPassword'
                label='Re-enter Password'
                required
                type='password'
                fullWidth
                size='small'
                value={createFormik.values.confirmPassword}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={
                  createFormik.touched.confirmPassword &&
                  Boolean(createFormik.errors.confirmPassword)
                }
                helperText={reqError(
                  createFormik.touched.confirmPassword,
                  createFormik.errors.confirmPassword as string,
                )}
              />
            </Grid>
          </Grid>

          {/* Temporary Password generator */}
          <Typography variant='body2' fontWeight={600} color='text.secondary' sx={{ mb: 0.5 }}>
            Temporary Password
          </Typography>
          <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
            Auto-generated — click Apply to use it in the fields above, or copy it to share with the
            user.
          </Typography>
          <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
            <TextField
              fullWidth
              size='small'
              type={showGenPw ? 'text' : 'password'}
              value={genPassword}
              className={classes.monoInput}
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton size='small' onClick={() => setShowGenPw((v) => !v)} edge='end'>
                        {showGenPw ? (
                          <VisibilityOffIcon fontSize='small' />
                        ) : (
                          <VisibilityIcon fontSize='small' />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <IconButton
              size='small'
              onClick={() => {
                navigator.clipboard.writeText(genPassword);
                notify.success('Temporary password copied');
              }}
            >
              <ContentCopyIcon fontSize='small' />
            </IconButton>
            <IconButton size='small' color='primary' onClick={onRegeneratePw}>
              <AutorenewIcon fontSize='small' />
            </IconButton>
            <Button
              size='small'
              variant='outlined'
              onClick={onApplyGenPw}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Apply
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* Role Selection */}
          <Typography variant='subtitle1' fontWeight={600} color='primary' sx={{ mb: 1.5 }}>
            Role Selection
          </Typography>
          <FormControl
            fullWidth
            size='small'
            error={createFormik.touched.role && Boolean(createFormik.errors.role)}
            sx={{ mb: 1.5 }}
          >
            <InputLabel id='create-role-label' required>Role</InputLabel>
            <Select
              labelId='create-role-label'
              id='role'
              name='role'
              value={createFormik.values.role}
              label='Role'
              onChange={createFormik.handleChange}
              onBlur={createFormik.handleBlur}
            >
              <MenuItem value='user'>User</MenuItem>
              <MenuItem value='consultant'>Consultant</MenuItem>
              <MenuItem value='admin'>Admin</MenuItem>
            </Select>
            {reqError(createFormik.touched.role, createFormik.errors.role as string) && (
              <FormHelperText>
                {reqError(createFormik.touched.role, createFormik.errors.role as string)}
              </FormHelperText>
            )}
          </FormControl>

          <Alert severity='success' sx={{ mt: 1 }}>
            Admin-created users are <strong>activated immediately</strong>. A welcome email with
            temporary credentials will be sent. The user must reset their password on first login.
          </Alert>

          <Box>
            <Typography variant='subtitle1' fontWeight={600} color='primary' sx={{ mb: 1.5 }}>
              Admin Notes
            </Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder='Add notes about this approval or rejection (optional)'
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </Box>
        </form>
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button onClick={onClose} variant='outlined' sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button variant='outlined' color='secondary' onClick={onSaveDraft} sx={{ borderRadius: 2 }}>
          Save Draft
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={() => createFormik.handleSubmit()}
          disabled={createFormik.isSubmitting}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {createFormik.isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;
