export function getStrength(pw: string): { score: number; label: string; color: string } {
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

export function roleChipColor(role?: string): 'warning' | 'primary' | 'success' | 'default' {
  if (role === 'admin') return 'warning';
  if (role === 'consultant') return 'success';
  return 'primary';
}

export function getInitials(firstName?: string, lastName?: string, name?: string): string {
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

export function fmtDate(d?: string | Date | null): string {
  if (!d) return '—';
  return new Date(d as string).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const TIMEZONES = [
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

export const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Hindi'];
export const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MMM DD, YYYY'];
export const TIME_FORMATS = ['12-hour (AM/PM)', '24-hour'];
