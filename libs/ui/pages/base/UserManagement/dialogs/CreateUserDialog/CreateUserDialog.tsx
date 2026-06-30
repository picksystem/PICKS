import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  Alert,
  TextField,
  Select,
  MenuItem,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@serviceops/component';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Avatar,
  FormControl,
  InputLabel,
  InputAdornment,
  FormHelperText,
  ListItemButton,
  Stack,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useStyles } from './styles';
import { CreateUserDialogProps } from './util';
import { useNotification } from '@serviceops/hooks';
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
import {
  RichTextEditor,
  parseRichText,
} from '@serviceops/pages/base/Configuration/shared/RichTextEditor';
import { useState, useRef, useEffect } from 'react';

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

  // Custom searchable dropdown for Role
  const [roleInputValue, setRoleInputValue] = useState('');
  const [roleOpen, setRoleOpen] = useState(false);
  const roleContainerRef = useRef<HTMLDivElement>(null);

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'admin', label: 'Admin' },
  ];

  useEffect(() => {
    if (!createFormik.values.role) {
      setRoleInputValue('');
    } else {
      const match = roleOptions.find((opt) => opt.value === createFormik.values.role);
      setRoleInputValue(match?.label ?? '');
    }
  }, [createFormik.values.role]);

  const filteredRoleOptions = roleOptions.filter(
    (opt) =>
      !roleInputValue.trim() || opt.label.toLowerCase().includes(roleInputValue.toLowerCase()),
  );

  const handleRoleSelect = (roleValue: string) => {
    const match = roleOptions.find((opt) => opt.value === roleValue);
    setRoleInputValue(match?.label ?? '');
    setRoleOpen(false);
    createFormik.setFieldValue('role', roleValue);
  };

  const handleRoleClear = () => {
    setRoleInputValue('');
    setRoleOpen(false);
    createFormik.setFieldValue('role', '');
  };

  // Parse adminNotes for RichTextEditor
  const [richTextAdminNotes, setRichTextAdminNotes] = useState(() =>
    adminNotes ? parseRichText(adminNotes) : { segments: [] },
  );

  useEffect(() => {
    if (adminNotes) {
      setRichTextAdminNotes(parseRichText(adminNotes));
    }
  }, [adminNotes]);

  const handleAdminNotesChange = (value: {
    segments: Array<{ text: string; bold?: boolean; italic?: boolean; underline?: boolean }>;
  }) => {
    setRichTextAdminNotes(value);
    // Serialize to plain text for storage
    const text = value.segments.map((s) => s.text).join('\n');
    setAdminNotes(text);
  };

  // Parse reasonForAccess for RichTextEditor
  const [richTextReason, setRichTextReason] = useState(() =>
    createFormik.values.reasonForAccess
      ? parseRichText(createFormik.values.reasonForAccess)
      : { segments: [] },
  );

  useEffect(() => {
    if (createFormik.values.reasonForAccess) {
      setRichTextReason(parseRichText(createFormik.values.reasonForAccess));
    }
  }, [createFormik.values.reasonForAccess]);

  const handleReasonChange = (value: {
    segments: Array<{ text: string; bold?: boolean; italic?: boolean; underline?: boolean }>;
  }) => {
    setRichTextReason(value);
    const text = value.segments.map((s) => s.text).join('\n');
    createFormik.setFieldValue('reasonForAccess', text);
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
              <Typography variant='caption' fontWeight={600} color='text.primary' sx={{ mb: 0.5 }}>
                Reason for Access
              </Typography>
              <RichTextEditor
                value={richTextReason}
                onChange={handleReasonChange}
                accent='#0369a1'
                title='Reason'
                placeholder='Describe why this user needs access'
                showFooterActions={false}
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
          <Box ref={roleContainerRef}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label='Role'
                placeholder='Search role...'
                value={roleInputValue}
                onChange={(e) => {
                  setRoleInputValue(e.target.value);
                  setRoleOpen(true);
                }}
                onFocus={() => !createFormik.values.role && setRoleOpen(true)}
                onBlur={() => {
                  setTimeout(() => setRoleOpen(false), 200);
                }}
                required
                error={createFormik.touched.role && Boolean(createFormik.errors.role)}
                helperText={reqError(createFormik.touched.role, createFormik.errors.role as string)}
                fullWidth
                size='small'
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {roleInputValue ? (
                            <ClearIcon
                              onClick={handleRoleClear}
                              sx={{
                                fontSize: 18,
                                color: 'text.secondary',
                                cursor: 'pointer',
                                '&:hover': { color: 'text.primary' },
                              }}
                            />
                          ) : (
                            <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          )}
                        </Box>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {roleOpen && (
                <Paper
                  elevation={4}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1300,
                    mt: 0,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  <List dense disablePadding>
                    {filteredRoleOptions.map((opt) => {
                      const isActive = opt.value === createFormik.values.role;
                      return (
                        <ListItem key={opt.value} disablePadding>
                          <ListItemButton
                            onClick={() => handleRoleSelect(opt.value)}
                            sx={{
                              py: 1,
                              px: 1.5,
                              bgcolor: isActive ? alpha('#0369a1', 0.08) : 'transparent',
                              '&:hover': {
                                bgcolor: alpha('#0369a1', 0.12),
                              },
                            }}
                          >
                            <ListItemText
                              primary={opt.label}
                              primaryTypographyProps={{
                                fontSize: '0.84rem',
                                fontWeight: isActive ? 700 : 400,
                                noWrap: true,
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              )}
            </Box>
          </Box>

          <Alert severity='success' sx={{ mt: 1 }}>
            Admin-created users are <strong>activated immediately</strong>. A welcome email with
            temporary credentials will be sent. The user must reset their password on first login.
          </Alert>

          <Box>
            <Typography variant='subtitle1' fontWeight={600} color='primary' sx={{ mb: 1.5 }}>
              Admin Notes
            </Typography>
            <RichTextEditor
              value={richTextAdminNotes}
              onChange={handleAdminNotesChange}
              accent='#0369a1'
              title='Internal Note'
              placeholder='Add notes about this user (optional)'
              showFooterActions={false}
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
