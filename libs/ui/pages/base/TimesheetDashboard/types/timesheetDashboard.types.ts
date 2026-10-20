export type DayStatus = 'draft' | 'approved' | 'missed' | 'holiday' | 'rejected' | 'none';

export interface TimesheetDay {
  day: number;
  inMonth: boolean;
  status: DayStatus;
  times?: string[];
  /** 0-indexed month (0-11) the day belongs to */
  monthIndex: number;
  dayOfWeek: number; // 0 = Sunday
}

export interface DayMenu {
  anchorEl: HTMLElement | null;
  day: number;
  open: boolean;
}

export interface TimeOffBalance {
  label: string;
  value: string;
}

export interface LeaveRow {
  id: string;
  period: string;
  type: string;
  note: string;
  status: 'submitted' | 'approved' | 'rejected';
}

export interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface ApprovalItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  count: number;
}

export interface HolidayItem {
  id: string;
  month: string;
  day: string;
  title: string;
  note?: string;
}

export interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  subtitle: string;
}
