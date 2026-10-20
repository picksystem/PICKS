import MoreTimeIcon from '@mui/icons-material/MoreTime';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import {
  ActionItem,
  ApprovalItem,
  DayStatus,
  HolidayItem,
  LeaveRow,
  TimeOffBalance,
  TimesheetDay,
} from '../types/timesheetDashboard.types';

/** Build a month grid (Sunday-first). `monthIndex` is 0-based. */
export const buildMonthDays = (
  year: number,
  monthIndex: number,
  statusByDay: Record<number, DayStatus>,
): TimesheetDay[] => {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startWeekday = first.getDay();

  // Leading days from previous month
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const days: TimesheetDay[] = [];

  // Previous month tail (only up to the first week needed)
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    days.push({
      day,
      inMonth: false,
      status: 'none',
      monthIndex: monthIndex - 1,
      dayOfWeek: startWeekday - 1 - i,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      inMonth: true,
      status: statusByDay[d] || 'none',
      times: ['08:00'],
      monthIndex,
      dayOfWeek: (first.getDay() + d - 1) % 7,
    });
  }

  // Next month head (fill to complete the final week)
  let next = 1;
  while (days.length % 7 !== 0) {
    days.push({
      day: next++,
      inMonth: false,
      status: 'none',
      monthIndex: monthIndex + 1,
      dayOfWeek: days.length % 7,
    });
  }

  return days;
};

export const OCTOBER_2026_STATUS: Record<number, DayStatus> = {
  1: 'draft',
  2: 'draft',
  3: 'holiday',
  4: 'draft',
  5: 'approved',
  6: 'draft',
  7: 'missed',
  8: 'draft',
  9: 'approved',
  10: 'rejected',
  11: 'draft',
  12: 'approved',
  13: 'draft',
  14: 'approved',
  15: 'draft',
  16: 'approved',
  17: 'holiday',
  18: 'missed',
  19: 'draft',
  20: 'draft',
  21: 'holiday',
  22: 'holiday',
  23: 'holiday',
  24: 'holiday',
  25: 'holiday',
  26: 'approved',
  27: 'approved',
  28: 'approved',
  29: 'holiday',
  30: 'holiday',
  31: 'holiday',
};

export const OCTOBER_2026 = { year: 2026, monthIndex: 9 };

export const timeOffBalance: TimeOffBalance[] = [
  { label: 'Privilege Leave', value: '10.5' },
  { label: 'Casual Leave', value: '0' },
  { label: 'Sick Leave', value: '0.5' },
  { label: 'Optional Holiday', value: '1' },
];

export const leaveRows: LeaveRow[] = [
  {
    id: 'lv-1',
    period: '01 Oct 2026 to 01 Oct 2026',
    type: 'Privilege Leave',
    note: 'Srinivas Penumalla',
    status: 'approved',
  },
  {
    id: 'lv-2',
    period: '30 Sep 2026 to 30 Sep 2026',
    type: 'Privilege Leave',
    note: 'Srinivas Penumalla',
    status: 'approved',
  },
  {
    id: 'lv-3',
    period: '31 Jul 2026 to 31 Jul 2026',
    type: 'Privilege Leave',
    note: 'Srinivas Penumalla',
    status: 'submitted',
  },
];

export const actionItems: ActionItem[] = [
  {
    id: 'act-1',
    title: 'Employee Privacy Policy',
    subtitle: 'Click to view the Policy',
  },
  {
    id: 'act-2',
    title: 'Missed Timesheet Entry',
    subtitle: '(10-Sep-2023 to 16-Sep-2023)',
    disabled: true,
  },
  {
    id: 'act-3',
    title: 'Timesheet Info Required',
    subtitle: '(10-May-2026 to 16-May-2026)',
    disabled: true,
  },
  {
    id: 'act-4',
    title: 'Time-Off Rejected',
    subtitle: '(08-Sep-2025 to 08-Sep-2025)',
    disabled: true,
  },
  {
    id: 'act-5',
    title: 'Time-Off Rejected',
    subtitle: '(09-Sep-2025 to 09-Sep-2025)',
    disabled: true,
  },
];

export const approvalItems: ApprovalItem[] = [
  {
    id: 'app-1',
    icon: <MoreTimeIcon sx={{ fontSize: 18 }} />,
    label: 'Timesheet Approval',
    count: 3,
  },
  {
    id: 'app-2',
    icon: <RestartAltIcon sx={{ fontSize: 18 }} />,
    label: 'Reopen Timesheet Approval',
    count: 0,
  },
  {
    id: 'app-3',
    icon: <EventBusyIcon sx={{ fontSize: 18 }} />,
    label: 'Time-Off Approval',
    count: 0,
  },
  {
    id: 'app-4',
    icon: <AssignmentIcon sx={{ fontSize: 18 }} />,
    label: 'Project Approval',
    count: 0,
  },
  {
    id: 'app-5',
    icon: <SupportAgentIcon sx={{ fontSize: 18 }} />,
    label: 'Customer Approval',
    count: 0,
  },
  {
    id: 'app-6',
    icon: <BadgeIcon sx={{ fontSize: 18 }} />,
    label: 'Exti Approval',
    count: 0,
  },
  {
    id: 'app-7',
    icon: <ReceiptIcon sx={{ fontSize: 18 }} />,
    label: 'Expense Approval',
    count: 0,
  },
  {
    id: 'app-8',
    icon: <PeopleIcon sx={{ fontSize: 18 }} />,
    label: 'Employee Self Service Approval',
    count: 0,
  },
];

export const holidays: HolidayItem[] = [
  {
    id: 'hol-1',
    month: 'OCT',
    day: '21',
    title: 'Ayutha Pooja',
    note: 'Click this to view optional holidays applicable to your project. Consult with your manager before going on a holiday.',
  },
  { id: 'hol-2', month: 'OCT', day: '28', title: 'Ayutha Pooja' },
  { id: 'hol-3', month: 'NOV', day: '9', title: 'Day after Deepavali' },
];

export const events = [
  {
    id: 'ev-1',
    day: '21',
    month: 'OCT',
    title: 'Heartfulness at work',
    subtitle: 'We invite you to join the session of Heartfulness...',
  },
  {
    id: 'ev-2',
    day: '28',
    month: 'OCT',
    title: 'Heartfulness at work',
    subtitle: 'We invite you to join the session of Heartfulness...',
  },
];
