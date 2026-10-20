export type TimesheetStatus = 'pending' | 'approved' | 'submitted';

export interface DayEntry {
  key: string;
  day: string;
  date: string;
  hours: number;
}

export interface TimesheetLine {
  id: string;
  client: string;
  project?: string;
  task: string;
  externalNote: string;
  internalNote: string;
  billable: boolean;
  dayValues: Record<string, number>;
  status: TimesheetStatus;
  liked?: boolean;
  favourited?: boolean;
}

export interface ApprovalEntry {
  id: string;
  period: string;
  status: TimesheetStatus;
  submittedOn: string;
  submittedBy: string;
  approvedBy: string;
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
