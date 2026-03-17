import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Alert,
  InputAdornment,
  Stack,
} from '@mui/material';
import { useStyles } from './styles';
import { useAuth, useNotification } from '@picks/hooks';
import { useAuthActionMutation } from '@picks/services';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { updateUser } from '../../../store/authStore';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import TuneIcon from '@mui/icons-material/Tune';
import LockIcon from '@mui/icons-material/Lock';
import HistoryIcon from '@mui/icons-material/History';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import { DataTable, Loader } from '../../../components';
import type { Column } from '../../../components/DataTable/DataTable';

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: '', color: '#e0e0e0' },
    1: { label: 'Very Weak', color: '#d32f2f' },
    2: { label: 'Weak', color: '#f57c00' },
    3: { label: 'Fair', color: '#fbc02d' },
    4: { label: 'Strong', color: '#388e3c' },
    5: { label: 'Very Strong', color: '#1b5e20' },
  };
  return { score, ...map[score] };
}

// ─── Role chip color ──────────────────────────────────────────────────────────
function roleChipColor(role?: string): 'warning' | 'primary' | 'success' | 'default' {
  if (role === 'admin') return 'warning';
  if (role === 'consultant') return 'success';
  return 'primary';
}

// ─── Initials ─────────────────────────────────────────────────────────────────
function getInitials(firstName?: string, lastName?: string, name?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (name)
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  return '?';
}

// ─── Format date ──────────────────────────────────────────────────────────────
function fmtDate(d?: string | Date | null): string {
  if (!d) return '—';
  return new Date(d as string).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Options ─────────────────────────────────────────────────────────────────
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Hindi'];
const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MMM DD, YYYY'];
const TIME_FORMATS = ['12-hour (AM/PM)', '24-hour'];

// ─── Tab Panel ────────────────────────────────────────────────────────────────
const TabPanel = ({
  children,
  value,
  index,
}: {
  children?: React.ReactNode;
  value: number;
  index: number;
}) => <div hidden={value !== index}>{value === index && children}</div>;

// ─── Read-only field ──────────────────────────────────────────────────────────
const ReadField = ({
  label,
  value,
  classes,
}: {
  label: string;
  value: React.ReactNode;
  classes: Record<string, string>;
}) => (
  <Box className={classes.readField}>
    <span className={classes.readLabel}>{label}</span>
    <Box className={classes.readValue}>{value || <span style={{ color: '#9e9e9e' }}>—</span>}</Box>
  </Box>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({
  icon,
  title,
  classes,
}: {
  icon: React.ReactNode;
  title: string;
  classes: Record<string, string>;
}) => (
  <Box className={classes.sectionHeader}>
    <Box className={classes.sectionIcon}>{icon}</Box>
    <Typography className={classes.sectionTitle}>{title}</Typography>
  </Box>
);

// ─── Component ────────────────────────────────────────────────────────────────
const Profile = () => {
  const { classes } = useStyles();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [authAction, { isLoading: isSaving }] = useAuthActionMutation();
  const notify = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [loginLogs, setLoginLogs] = useState<
    { loginTime: string; ipAddress: string; userAgent: string }[]
  >([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── Profile form ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    department: '',
    workLocation: '',
    employeeId: '',
    businessUnit: '',
    managerName: '',
    timezone: '',
    language: '',
    dateFormat: '',
    timeFormat: '',
  });

  // ── Password form ───────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [isSavingPw, setIsSavingPw] = useState(false);
  const strength = getStrength(pwForm.next);

  // ── Sync user → state ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setProfilePic(user.profilePicture || null);
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      department: user.department || '',
      workLocation: user.workLocation || '',
      employeeId: user.employeeId || '',
      businessUnit: user.businessUnit || '',
      managerName: user.managerName || '',
      timezone: user.timezone || '',
      language: user.language || '',
      dateFormat: user.dateFormat || '',
      timeFormat: user.timeFormat || '',
    });
  }, [user]);

  // ── Load login logs when Activity tab selected ──────────────────────────────
  useEffect(() => {
    if (tab !== 2 || !user || loginLogs.length) return;
    setLogsLoading(true);
    authAction({ action: 'get-login-logs', userId: user.id })
      .unwrap()
      .then((res: unknown) =>
        setLoginLogs(
          (res as { data?: { loginTime: string; ipAddress: string; userAgent: string }[] })?.data ||
            [],
        ),
      )
      .catch(() => notify.error('Failed to load login history'))
      .finally(() => setLogsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);

  // ── Photo upload ────────────────────────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notify.error('Image must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target?.result as string;
      const prev = profilePic;
      setProfilePic(b64);
      try {
        await authAction({ action: 'update-my-profile', data: { profilePicture: b64 } }).unwrap();
        dispatch(updateUser({ profilePicture: b64 }));
        notify.success('Profile photo updated');
      } catch {
        setProfilePic(prev);
        notify.error('Failed to save photo');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = async () => {
    setProfilePic(null);
    try {
      await authAction({ action: 'update-my-profile', data: { profilePicture: null } }).unwrap();
      dispatch(updateUser({ profilePicture: null }));
      notify.success('Photo removed');
    } catch {
      notify.error('Failed to remove photo');
    }
  };

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const result = (await authAction({
        action: 'update-my-profile',
        data: form,
      }).unwrap()) as { message?: string };
      dispatch(
        updateUser({
          ...form,
          name: `${form.firstName} ${form.lastName}`,
        }),
      );
      notify.success(result?.message || 'Profile updated');
      setIsEditing(false);
    } catch (err: unknown) {
      notify.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to update profile',
      );
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      department: user.department || '',
      workLocation: user.workLocation || '',
      employeeId: user.employeeId || '',
      businessUnit: user.businessUnit || '',
      managerName: user.managerName || '',
      timezone: user.timezone || '',
      language: user.language || '',
      dateFormat: user.dateFormat || '',
      timeFormat: user.timeFormat || '',
    });
    setIsEditing(false);
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.next) {
      notify.error('All fields are required');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      notify.error('New passwords do not match');
      return;
    }
    if (pwForm.next.length < 6) {
      notify.error('Password must be at least 6 characters');
      return;
    }
    setIsSavingPw(true);
    try {
      await authAction({
        action: 'change-password',
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      }).unwrap();
      notify.success('Password changed successfully');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err: unknown) {
      notify.error(
        (err as { data?: { message?: string } })?.data?.message || 'Failed to change password',
      );
    } finally {
      setIsSavingPw(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const displayName =
    user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const initials = getInitials(user?.firstName, user?.lastName, user?.name);
  const f = (k: keyof typeof form) => form[k];

  // ── Login log columns ───────────────────────────────────────────────────────
  type LogRow = { sno: number; loginTime: string; ipAddress: string; userAgent: string };
  const logColumns: Column<LogRow>[] = [
    { id: 'sno', label: '#', minWidth: 50, align: 'center', sortable: false },
    {
      id: 'loginTime',
      label: 'Date & Time',
      minWidth: 160,
      format: (v): React.ReactNode =>
        v
          ? new Date(v as string).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—',
    },
    { id: 'ipAddress', label: 'IP Address', minWidth: 130, format: (v) => String(v || '—') },
    {
      id: 'userAgent',
      label: 'Browser / Device',
      minWidth: 240,
      format: (v): React.ReactNode => (
        <Typography variant='body2' noWrap sx={{ maxWidth: 300, fontSize: '0.8rem' }}>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  const logData: LogRow[] = loginLogs.slice(0, 50).map((l, i) => ({ ...l, sno: i + 1 }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box className={classes.container}>
      {/* ══════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════ */}
      <Box className={classes.heroBanner}>
        <Box className={classes.heroInner}>
          {/* Avatar */}
          <Box
            className={classes.avatarWrapper}
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Box className={classes.avatarRing}>
              {profilePic ? (
                <img src={profilePic} alt='avatar' className={classes.avatarImg} />
              ) : (
                <Box className={classes.avatarInitials}>{initials}</Box>
              )}
            </Box>
            <Box className={classes.avatarOverlay} sx={{ opacity: isHovering ? 1 : 0 }}>
              <CameraAltIcon sx={{ fontSize: 22, mb: 0.25 }} />
              <span>Change Photo</span>
            </Box>
          </Box>
          <input
            type='file'
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept='image/*'
            style={{ display: 'none' }}
          />

          {/* Text */}
          <Box className={classes.heroText}>
            <Typography className={classes.heroName}>{displayName}</Typography>
            <Typography className={classes.heroEmail}>{user?.email}</Typography>
            <Box className={classes.heroBadges}>
              <Chip
                label={user?.role?.toUpperCase() || 'USER'}
                color={roleChipColor(user?.role)}
                size='small'
                sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: 0.5 }}
              />
              {user?.isActive ? (
                <Chip
                  icon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important' }} />}
                  label='Active'
                  color='success'
                  size='small'
                  sx={{ fontSize: '0.72rem' }}
                />
              ) : (
                <Chip
                  icon={<WarningAmberIcon sx={{ fontSize: '14px !important' }} />}
                  label='Inactive'
                  color='error'
                  size='small'
                  sx={{ fontSize: '0.72rem' }}
                />
              )}
              {user?.mustResetPassword && (
                <Chip
                  icon={<VpnKeyIcon sx={{ fontSize: '14px !important' }} />}
                  label='Must Reset Password'
                  color='warning'
                  size='small'
                  sx={{ fontSize: '0.72rem' }}
                />
              )}
            </Box>
            <Box className={classes.heroMeta}>
              {user?.department && (
                <Box className={classes.heroMetaItem}>
                  <BusinessIcon sx={{ fontSize: 13 }} />
                  <span>{user.department}</span>
                </Box>
              )}
              {user?.workLocation && (
                <Box className={classes.heroMetaItem}>
                  <WorkIcon sx={{ fontSize: 13 }} />
                  <span>{user.workLocation}</span>
                </Box>
              )}
              <Box className={classes.heroMetaItem}>
                <CalendarTodayIcon sx={{ fontSize: 13 }} />
                <span>Member since {fmtDate(user?.createdAt)}</span>
              </Box>
              {user?.lastActivityAt && (
                <Box className={classes.heroMetaItem}>
                  <AccessTimeIcon sx={{ fontSize: 13 }} />
                  <span>Last active {fmtDate(user.lastActivityAt)}</span>
                </Box>
              )}
            </Box>
          </Box>

          {/* Hero actions */}
          <Box className={classes.heroActions}>
            {profilePic && (
              <Tooltip title='Remove photo'>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto();
                  }}
                  sx={{
                    color: 'rgba(255,100,100,0.9)',
                    borderColor: 'rgba(255,100,100,0.5)',
                    '&:hover': {
                      borderColor: 'rgba(255,100,100,0.9)',
                      bgcolor: 'rgba(255,0,0,0.08)',
                    },
                    minWidth: 0,
                    px: 1.5,
                  }}
                >
                  Remove Photo
                </Button>
              </Tooltip>
            )}
            {!isEditing ? (
              <Button
                size='small'
                startIcon={<EditIcon />}
                onClick={() => {
                  setTab(0);
                  setIsEditing(true);
                }}
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.5)',
                  border: '1px solid',
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Chip label='Editing' color='warning' size='small' sx={{ fontWeight: 700 }} />
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Tabs bar ── */}
      <Box className={classes.tabsBar}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition='start' label='Profile' />
          <Tab icon={<LockIcon sx={{ fontSize: 18 }} />} iconPosition='start' label='Security' />
          <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition='start' label='Activity' />
        </Tabs>
      </Box>

      {/* ════════════════════════════════════════════════════════════════
          CONTENT
      ════════════════════════════════════════════════════════════════ */}
      <Box className={classes.content}>
        {/* ══ Tab 0: Profile Info ══════════════════════════════════════════ */}
        <TabPanel value={tab} index={0}>
          {/* Personal Information */}
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<PersonIcon sx={{ fontSize: 16 }} />}
              title='Personal Information'
              classes={classes}
            />
            {isEditing ? (
              <Box className={classes.fieldGrid}>
                <TextField
                  label='First Name'
                  value={f('firstName')}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  fullWidth
                  size='small'
                  slotProps={{ htmlInput: { maxLength: 50 } }}
                />
                <TextField
                  label='Last Name'
                  value={f('lastName')}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  fullWidth
                  size='small'
                  slotProps={{ htmlInput: { maxLength: 50 } }}
                />
                <TextField
                  label='Phone'
                  value={f('phone')}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  fullWidth
                  size='small'
                  type='tel'
                  slotProps={{ htmlInput: { maxLength: 20 } }}
                />
                <TextField
                  label='Date of Birth'
                  value={f('dateOfBirth')}
                  onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  fullWidth
                  size='small'
                  type='date'
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
            ) : (
              <Box className={classes.fieldGrid}>
                <ReadField label='First Name' value={user?.firstName} classes={classes} />
                <ReadField label='Last Name' value={user?.lastName} classes={classes} />
                <ReadField label='Phone' value={user?.phone} classes={classes} />
                <ReadField
                  label='Date of Birth'
                  value={user?.dateOfBirth ? fmtDate(user.dateOfBirth) : null}
                  classes={classes}
                />
              </Box>
            )}
          </Box>

          {/* Organization */}
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<BusinessIcon sx={{ fontSize: 16 }} />}
              title='Organization'
              classes={classes}
            />
            {isEditing ? (
              <Box className={classes.fieldGrid}>
                <TextField
                  label='Email'
                  value={user?.email || ''}
                  disabled
                  fullWidth
                  size='small'
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label='Department'
                  value={f('department')}
                  onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                  fullWidth
                  size='small'
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <TextField
                  label='Business Unit'
                  value={f('businessUnit')}
                  onChange={(e) => setForm((p) => ({ ...p, businessUnit: e.target.value }))}
                  fullWidth
                  size='small'
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <TextField
                  label='Employee ID'
                  value={f('employeeId')}
                  onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
                  fullWidth
                  size='small'
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <BadgeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label='Manager Name'
                  value={f('managerName')}
                  onChange={(e) => setForm((p) => ({ ...p, managerName: e.target.value }))}
                  fullWidth
                  size='small'
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <TextField
                  label='Work Location'
                  value={f('workLocation')}
                  onChange={(e) => setForm((p) => ({ ...p, workLocation: e.target.value }))}
                  fullWidth
                  size='small'
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              </Box>
            ) : (
              <Box className={classes.fieldGrid}>
                <ReadField label='Email' value={user?.email} classes={classes} />
                <ReadField label='Department' value={user?.department} classes={classes} />
                <ReadField label='Business Unit' value={user?.businessUnit} classes={classes} />
                <ReadField label='Employee ID' value={user?.employeeId} classes={classes} />
                <ReadField label='Manager Name' value={user?.managerName} classes={classes} />
                <ReadField label='Work Location' value={user?.workLocation} classes={classes} />
              </Box>
            )}
          </Box>

          {/* Preferences */}
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<TuneIcon sx={{ fontSize: 16 }} />}
              title='Preferences'
              classes={classes}
            />
            {isEditing ? (
              <Box className={classes.fieldGrid}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={f('timezone')}
                    label='Timezone'
                    onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    {TIMEZONES.map((tz) => (
                      <MenuItem key={tz} value={tz}>
                        {tz}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size='small'>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={f('language')}
                    label='Language'
                    onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    {LANGUAGES.map((l) => (
                      <MenuItem key={l} value={l}>
                        {l}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size='small'>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={f('dateFormat')}
                    label='Date Format'
                    onChange={(e) => setForm((p) => ({ ...p, dateFormat: e.target.value }))}
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    {DATE_FORMATS.map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size='small'>
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value={f('timeFormat')}
                    label='Time Format'
                    onChange={(e) => setForm((p) => ({ ...p, timeFormat: e.target.value }))}
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    {TIME_FORMATS.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <Box className={classes.fieldGrid}>
                <ReadField label='Timezone' value={user?.timezone} classes={classes} />
                <ReadField label='Language' value={user?.language} classes={classes} />
                <ReadField label='Date Format' value={user?.dateFormat} classes={classes} />
                <ReadField label='Time Format' value={user?.timeFormat} classes={classes} />
              </Box>
            )}

            {isEditing && (
              <Box className={classes.saveBar}>
                <Button variant='outlined' onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* ══ Tab 1: Security ════════════════════════════════════════════════ */}
        <TabPanel value={tab} index={1}>
          {/* Account status */}
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
              title='Account Status'
              classes={classes}
            />

            {user?.mustResetPassword && (
              <Alert severity='warning' sx={{ mb: 2 }}>
                Your password must be reset before you can continue.
              </Alert>
            )}

            <Box className={classes.securityGrid}>
              <Box className={classes.securityItem}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={600}
                  textTransform='uppercase'
                  letterSpacing={0.5}
                >
                  Account Created
                </Typography>
                <Typography variant='body2' fontWeight={600} mt={0.5}>
                  {fmtDate(user?.createdAt)}
                </Typography>
              </Box>
              <Box className={classes.securityItem}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={600}
                  textTransform='uppercase'
                  letterSpacing={0.5}
                >
                  Last Updated
                </Typography>
                <Typography variant='body2' fontWeight={600} mt={0.5}>
                  {fmtDate(user?.updatedAt)}
                </Typography>
              </Box>
              <Box className={classes.securityItem}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={600}
                  textTransform='uppercase'
                  letterSpacing={0.5}
                >
                  Last Active
                </Typography>
                <Typography variant='body2' fontWeight={600} mt={0.5}>
                  {user?.lastActivityAt ? fmtDate(user.lastActivityAt) : '—'}
                </Typography>
              </Box>
              <Box className={classes.securityItem}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={600}
                  textTransform='uppercase'
                  letterSpacing={0.5}
                >
                  Role
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={user?.role?.toUpperCase()}
                    color={roleChipColor(user?.role)}
                    size='small'
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>
              <Box className={classes.securityItem}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={600}
                  textTransform='uppercase'
                  letterSpacing={0.5}
                >
                  Status
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={String(user?.status || '')
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    color={user?.isActive ? 'success' : 'default'}
                    size='small'
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
              <Box className={classes.securityItem}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={600}
                  textTransform='uppercase'
                  letterSpacing={0.5}
                >
                  Source
                </Typography>
                <Typography
                  variant='body2'
                  fontWeight={600}
                  mt={0.5}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {user?.source || '—'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Change password */}
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
              title='Change Password'
              classes={classes}
            />
            <Stack spacing={2} sx={{ maxWidth: 440 }}>
              <TextField
                label='Current Password'
                type={showPw.current ? 'text' : 'password'}
                value={pwForm.current}
                onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                fullWidth
                size='small'
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                        >
                          {showPw.current ? (
                            <VisibilityOffIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Box>
                <TextField
                  label='New Password'
                  type={showPw.next ? 'text' : 'password'}
                  value={pwForm.next}
                  onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                  fullWidth
                  size='small'
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}
                          >
                            {showPw.next ? (
                              <VisibilityOffIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                {pwForm.next && (
                  <Box sx={{ mt: 1 }}>
                    <Box className={classes.strengthRow}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Box
                          key={n}
                          className={classes.strengthSegment}
                          sx={{ bgcolor: n <= strength.score ? strength.color : '#e0e0e0' }}
                        />
                      ))}
                    </Box>
                    {strength.label && (
                      <Typography className={classes.strengthLabel} sx={{ color: strength.color }}>
                        {strength.label}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
              <TextField
                label='Confirm New Password'
                type={showPw.confirm ? 'text' : 'password'}
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                fullWidth
                size='small'
                error={!!pwForm.confirm && pwForm.confirm !== pwForm.next}
                helperText={
                  pwForm.confirm && pwForm.confirm !== pwForm.next ? 'Passwords do not match' : ''
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                        >
                          {showPw.confirm ? (
                            <VisibilityOffIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Box>
                <Button
                  variant='contained'
                  startIcon={<LockIcon />}
                  onClick={handleChangePassword}
                  disabled={isSavingPw || !pwForm.current || !pwForm.next || !pwForm.confirm}
                  sx={{ px: 3 }}
                >
                  {isSavingPw ? 'Updating…' : 'Update Password'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        {/* ══ Tab 2: Activity ════════════════════════════════════════════════ */}
        <TabPanel value={tab} index={2}>
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<HistoryIcon sx={{ fontSize: 16 }} />}
              title='Login History'
              classes={classes}
            />
            {logsLoading ? (
              <Box sx={{ py: 4 }}>
                <Loader />
              </Box>
            ) : logData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color='text.secondary'>No login history available</Typography>
              </Box>
            ) : (
              <DataTable
                columns={logColumns}
                data={logData}
                rowKey='sno'
                searchable={false}
                initialRowsPerPage={10}
              />
            )}
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Profile;
