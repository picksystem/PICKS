export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const EMPTY_WT_FORM = {
  calendarName: '',
  dayOfWeek: '',
  timeBlocks: [{ startTime: '09:00', endTime: '17:00' }],
  isWorkingDay: true,
};

export const EMPTY_CT_FORM = {
  calendarName: '',
  date: '',
  day: '',
  startTime: '09:00',
  endTime: '17:00',
  isWorkingDay: false,
  note: '',
};

export const EMPTY_WL_FORM = {
  calendarName: '',
  workLocation: '',
  effectiveFrom: '',
  effectiveTo: '',
};
export const EMPTY_CO_FORM = {
  calendarName: '',
  consultantName: '',
  role: '',
  application: '',
  effectiveFrom: '',
  effectiveTo: '',
};

export type WCActiveView =
  | 'calendar'
  | 'workingTimes'
  | 'composedTimes'
  | 'workLocations'
  | 'consultants';

export const dayFromDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
};
