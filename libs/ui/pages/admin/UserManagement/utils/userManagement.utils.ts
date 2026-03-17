import * as yup from 'yup';
import { IAuthUser } from '@picks/interfaces';
import {
  EditFormShape,
  InitialCreateValues,
  NewUserDraftData,
} from '../types/userManagement.types';

// ─── Constants ────────────────────────────────────────────────────────────────
export const TIMEZONES = [
  // Americas
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'America/Caracas',
  // Europe
  'Europe/London',
  'Europe/Dublin',
  'Europe/Lisbon',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Brussels',
  'Europe/Zurich',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Copenhagen',
  'Europe/Helsinki',
  'Europe/Warsaw',
  'Europe/Prague',
  'Europe/Vienna',
  'Europe/Bucharest',
  'Europe/Athens',
  'Europe/Kiev',
  'Europe/Moscow',
  // Africa
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Africa/Casablanca',
  // Middle East
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Kuwait',
  'Asia/Doha',
  'Asia/Muscat',
  'Asia/Jerusalem',
  'Asia/Beirut',
  'Asia/Tehran',
  'Asia/Baghdad',
  // Asia
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Colombo',
  'Asia/Kathmandu',
  'Asia/Tashkent',
  'Asia/Almaty',
  'Asia/Bangkok',
  'Asia/Jakarta',
  'Asia/Kuala_Lumpur',
  'Asia/Singapore',
  'Asia/Manila',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Taipei',
  'Asia/Seoul',
  'Asia/Tokyo',
  // Oceania
  'Australia/Perth',
  'Australia/Darwin',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'Pacific/Fiji',
];

export const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
export const TIME_FORMATS = ['12h', '24h'];

export const SLA_WORKING_CALENDARS = [
  'Standard 8x5',
  'Extended 10x5',
  '24x5 (Mon-Fri)',
  '24x7',
  'APAC 8x5',
  'EMEA 8x5',
  'AMER 8x5',
];

export const SLA_LEAVE_CALENDARS = [
  'US Federal Holidays',
  'UK Bank Holidays',
  'India Public Holidays',
  'EU Holidays',
  'APAC Holidays',
  'No Holiday Calendar',
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
];

export const ROLE_CHANGE_REASON_CODES = [
  { value: 'promotion', label: 'Promotion' },
  { value: 'demotion', label: 'Demotion' },
  { value: 'department_transfer', label: 'Department Transfer' },
  { value: 'role_correction', label: 'Role Correction' },
  { value: 'temp_access', label: 'Temporary Access' },
  { value: 'policy_change', label: 'Policy Change' },
  { value: 'other', label: 'Other' },
];

export const LANG_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
};

export const TIME_FORMAT_LABELS: Record<string, string> = {
  '12h': '12-hour (AM/PM)',
  '24h': '24-hour',
};

export const SOURCE_LABELS: Record<string, string> = {
  signup: 'Self Sign-Up',
  admin: 'Admin Created',
  ticket: 'Ticket',
  ad: 'Active Directory',
  manual: 'Manual',
  ldap: 'LDAP',
  sso: 'SSO',
  draft: 'Draft',
  import: 'Import',
};

export const CHANGE_TYPE_COLORS: Record<
  string,
  'error' | 'warning' | 'info' | 'success' | 'default'
> = {
  role_change: 'error',
  password_reset: 'warning',
  profile_update: 'info',
  status_change: 'warning',
  access_change: 'info',
  created: 'success',
  deactivated: 'error',
  activated: 'success',
  login: 'default',
};

export const LOG_COLUMNS = [
  { id: 'createdAt', label: 'Date & Time' },
  { id: 'changeType', label: 'Change Type' },
  { id: 'fieldName', label: 'Field Changed' },
  { id: 'previousValue', label: 'Previous Value' },
  { id: 'newValue', label: 'New Value' },
  { id: 'changedByName', label: 'Changed By' },
  { id: 'reasonCode', label: 'Reason Code' },
  { id: 'reasonNotes', label: 'Reason Note' },
];

export const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
export const NEW_USER_DRAFT_KEY = 'um_new_user_draft';
export const NEW_USER_SESSION_KEY = 'um_new_user_session';
export const DRAFT_DAYS = 30;
export const UM_SESSION_KEY = 'form_um_new_user';

// ─── Formatters ───────────────────────────────────────────────────────────────
export const fmtDate = (v: string | null | undefined) => {
  if (!v) return '-';
  return new Date(v).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const fmtDateTime = (v: string | null | undefined) => {
  if (!v) return '-';
  return new Date(v).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTzDisplay = (tz: string | null | undefined): string => {
  if (!tz) return '-';
  try {
    const now = new Date();
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const diffMs = tzDate.getTime() - utcDate.getTime();
    const sign = diffMs >= 0 ? '+' : '-';
    const absMs = Math.abs(diffMs);
    const hours = Math.floor(absMs / 3600000);
    const mins = Math.floor((absMs % 3600000) / 60000);
    const offset = `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    }).formatToParts(now);
    const abbr = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    const city = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
    return `${city} (${offset}${abbr ? `, ${abbr}` : ''})`;
  } catch {
    return tz;
  }
};

export const fmtDateUser = (
  v: string | null | undefined,
  timezone?: string | null,
  dateFormat?: string | null,
): string => {
  if (!v) return '-';
  try {
    const date = new Date(v);
    const tz = timezone || undefined;
    const fmt = dateFormat || 'MM/DD/YYYY';
    const parts = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: tz,
    }).formatToParts(date);
    const p: Record<string, string> = {};
    parts.forEach(({ type, value }) => {
      p[type] = value;
    });
    return fmt
      .replace('YYYY', p.year || '')
      .replace('MM', p.month || '')
      .replace('DD', p.day || '');
  } catch {
    return fmtDate(v);
  }
};

export const fmtDateTimeUser = (
  v: string | null | undefined,
  timezone?: string | null,
  dateFormat?: string | null,
  timeFormat?: string | null,
): string => {
  if (!v) return '-';
  try {
    const date = new Date(v);
    const tz = timezone || undefined;
    const is12h = (timeFormat || '24h') === '12h';
    const dateStr = fmtDateUser(v, timezone, dateFormat);
    const timeParts = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: is12h,
      timeZone: tz,
    }).formatToParts(date);
    const tp: Record<string, string> = {};
    timeParts.forEach(({ type, value }) => {
      tp[type] = value;
    });
    const timeStr = is12h
      ? `${tp.hour}:${tp.minute} ${tp.dayPeriod || ''}`.trim()
      : `${tp.hour}:${tp.minute}`;
    return `${dateStr}, ${timeStr}`;
  } catch {
    return fmtDateTime(v);
  }
};

export const formatChangeType = (t: string) =>
  (t || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const getPasswordStrength = (pw: string) => {
  if (!pw) return { score: 0, label: '', color: '#9e9e9e', pct: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: '', color: '#9e9e9e', pct: 0 },
    { label: 'Very Weak', color: '#ef4444', pct: 20 },
    { label: 'Weak', color: '#f97316', pct: 40 },
    { label: 'Fair', color: '#eab308', pct: 60 },
    { label: 'Strong', color: '#22c55e', pct: 80 },
    { label: 'Very Strong', color: '#15803d', pct: 100 },
  ];
  return { score, ...levels[Math.min(score, 5)] };
};

// ─── Password generator ───────────────────────────────────────────────────────
export const generateTempPassword = (length = 12): string => {
  let pw = '';
  for (let i = 0; i < length; i++) {
    pw += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return pw;
};

// ─── Draft helpers ────────────────────────────────────────────────────────────
export const loadNewUserDraft = (): NewUserDraftData | null => {
  try {
    const raw = localStorage.getItem(NEW_USER_DRAFT_KEY);
    if (!raw) return null;
    const draft: NewUserDraftData = JSON.parse(raw);
    if (new Date(draft.expiresAt) <= new Date()) {
      localStorage.removeItem(NEW_USER_DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
};

export const saveNewUserDraft = (values: InitialCreateValues): NewUserDraftData => {
  const savedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + DRAFT_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const draft: NewUserDraftData = { values, savedAt, expiresAt };
  localStorage.setItem(NEW_USER_DRAFT_KEY, JSON.stringify(draft));
  return draft;
};

export const clearNewUserDraft = () => {
  localStorage.removeItem(NEW_USER_DRAFT_KEY);
  sessionStorage.removeItem(NEW_USER_SESSION_KEY);
  sessionStorage.removeItem(UM_SESSION_KEY);
};

export const getDraftDaysRemaining = (expiresAt: string): number =>
  Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

// ─── Form helpers ─────────────────────────────────────────────────────────────
export const buildEditForm = (u: IAuthUser): EditFormShape => ({
  firstName: u.firstName || '',
  lastName: u.lastName || '',
  phone: u.phone || '',
  department: u.department || '',
  workLocation: u.workLocation || '',
  businessUnit: u.businessUnit || '',
  employeeId: u.employeeId || '',
  managerName: u.managerName || '',
  role: u.role || 'user',
  isActive: u.isActive,
  accessFromDate: u.accessFromDate ? u.accessFromDate.split('T')[0] : '',
  accessToDate: u.accessToDate ? u.accessToDate.split('T')[0] : '',
  timezone: u.timezone || '',
  dateFormat: u.dateFormat || 'MM/DD/YYYY',
  timeFormat: u.timeFormat || '12h',
  language: u.language || 'en',
  slaWorkingCalendar: u.slaWorkingCalendar || '',
  slaExceptionGroup: u.slaExceptionGroup || '',
  application: u.application || '',
  applicationLead: u.applicationLead || '',
  reasonForAccess: u.reasonForAccess || '',
  adminNotes: u.adminNotes || '',
});

export const initialCreateValues: InitialCreateValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  workLocation: '',
  department: '',
  employeeId: '',
  businessUnit: '',
  managerName: '',
  reasonForAccess: '',
  timezone: '',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  language: 'en',
  slaWorkingCalendar: '',
  slaExceptionGroup: '',
  password: '',
  confirmPassword: '',
  role: 'user',
};

// ─── Validation schema ────────────────────────────────────────────────────────
export const AdminCreateUserSchema = yup.object({
  firstName: yup.string().required('required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('required'),
  phone: yup
    .string()
    .matches(/^[\d\s+\-()]*$/, 'Phone number must contain only numbers')
    .optional()
    .nullable(),
  workLocation: yup.string().required('required'),
  department: yup.string().optional().nullable(),
  reasonForAccess: yup.string().optional().nullable(),
  employeeId: yup.string().matches(/^\d*$/, 'Employee ID must be numeric').optional(),
  businessUnit: yup.string().optional(),
  managerName: yup.string().optional().nullable(),
  timezone: yup.string().optional().nullable(),
  dateFormat: yup.string().optional().nullable(),
  timeFormat: yup.string().optional().nullable(),
  language: yup.string().optional().nullable(),
  slaWorkingCalendar: yup.string().optional().nullable(),
  slaExceptionGroup: yup.string().optional().nullable(),
  password: yup.string().required('required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  role: yup
    .string()
    .required('required')
    .oneOf(['user', 'consultant', 'admin'], 'Role must be user, consultant, or admin'),
});
