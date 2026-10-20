export type TimesheetStatus = 'pending' | 'approved';

export interface DayEntry {
  key: string;
  day: string;
  date: string;
  hours: number;
}

export interface TimesheetLine {
  id: string;
  client: string;
  task: string;
  externalNote: string;
  internalNote: string;
  billable: boolean;
  dayValues: Record<string, number>;
  status: TimesheetStatus;
}

export const TIMESHEET_CLIENTS = ['Hive Implementation', 'Administrative', 'Internal'];

export const TIMESHEET_TASKS = [
  'Development',
  'Internal calls',
  'Vacation',
  'Fixed holidays',
  'Client meetings',
  'Documentation',
];
