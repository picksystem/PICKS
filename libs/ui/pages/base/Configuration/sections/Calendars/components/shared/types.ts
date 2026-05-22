export interface WorkingDayTemplateForm {
  name: string;
  description: string;
  mondayHours: number;
  tuesdayHours: number;
  wednesdayHours: number;
  thursdayHours: number;
  fridayHours: number;
  saturdayHours: number;
  sundayHours: number;
}

export type DayKey =
  | 'mondayHours'
  | 'tuesdayHours'
  | 'wednesdayHours'
  | 'thursdayHours'
  | 'fridayHours'
  | 'saturdayHours'
  | 'sundayHours';

export interface DayMeta {
  key: DayKey;
  label: string;
  short: string;
  letter: string;
  color: string;
  weekend: boolean;
}

export const DAY_META: DayMeta[] = [
  {
    key: 'mondayHours',
    label: 'Monday',
    short: 'MON',
    letter: 'M',
    color: '#2563eb',
    weekend: false,
  },
  {
    key: 'tuesdayHours',
    label: 'Tuesday',
    short: 'TUE',
    letter: 'T',
    color: '#0891b2',
    weekend: false,
  },
  {
    key: 'wednesdayHours',
    label: 'Wednesday',
    short: 'WED',
    letter: 'W',
    color: '#059669',
    weekend: false,
  },
  {
    key: 'thursdayHours',
    label: 'Thursday',
    short: 'THU',
    letter: 'T',
    color: '#7c3aed',
    weekend: false,
  },
  {
    key: 'fridayHours',
    label: 'Friday',
    short: 'FRI',
    letter: 'F',
    color: '#4f46e5',
    weekend: false,
  },
  {
    key: 'saturdayHours',
    label: 'Saturday',
    short: 'SAT',
    letter: 'S',
    color: '#ea580c',
    weekend: true,
  },
  {
    key: 'sundayHours',
    label: 'Sunday',
    short: 'SUN',
    letter: 'S',
    color: '#dc2626',
    weekend: true,
  },
];

export const EMPTY_FORM: WorkingDayTemplateForm = {
  name: '',
  description: '',
  mondayHours: 8,
  tuesdayHours: 8,
  wednesdayHours: 8,
  thursdayHours: 8,
  fridayHours: 8,
  saturdayHours: 0,
  sundayHours: 0,
};

export const ACCENT_WDT = '#0369a1';
export const ACCENT_HC = '#0369a1';
export const ACCENT_BH = '#0369a1';
export const ACCENT_WC = '#0369a1';
export const ACCENT_WT = '#0369a1';
export const ACCENT_CT = '#0369a1';
export const ACCENT_WL = '#0369a1';
export const ACCENT_CC = '#0369a1';
