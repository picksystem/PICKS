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

const mondayHours = '#2563eb';
const tuesdayHours = '#0891b2';
const wednesdayHours = '#059669';
const thursdayHours = '#7c3aed';
const fridayHours = '#4f46e5';
const saturdayHours = '#ea580c';
const sundayHours = '#dc2626';

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
    color: mondayHours,
    weekend: false,
  },
  {
    key: 'tuesdayHours',
    label: 'Tuesday',
    short: 'TUE',
    letter: 'T',
    color: tuesdayHours,
    weekend: false,
  },
  {
    key: 'wednesdayHours',
    label: 'Wednesday',
    short: 'WED',
    letter: 'W',
    color: wednesdayHours,
    weekend: false,
  },
  {
    key: 'thursdayHours',
    label: 'Thursday',
    short: 'THU',
    letter: 'T',
    color: thursdayHours,
    weekend: false,
  },
  {
    key: 'fridayHours',
    label: 'Friday',
    short: 'FRI',
    letter: 'F',
    color: fridayHours,
    weekend: false,
  },
  {
    key: 'saturdayHours',
    label: 'Saturday',
    short: 'SAT',
    letter: 'S',
    color: saturdayHours,
    weekend: true,
  },
  {
    key: 'sundayHours',
    label: 'Sunday',
    short: 'SUN',
    letter: 'S',
    color: sundayHours,
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
