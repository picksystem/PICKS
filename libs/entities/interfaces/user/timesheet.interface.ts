/**
 * My Timesheet API shapes.
 *
 * Mirror the backend Timesheet DTOs (gateways/api/user/Timesheet):
 * - a week sheet (one per user per weekStart)
 * - its lines (per-day decimal hours, billable flag, notes, attachments)
 * - the computed totals the KPI cards / totals rows render
 */

export type ITimesheetStatus = 'open' | 'draft' | 'pending' | 'approved' | 'rejected' | 'submitted';

export type ITimesheetDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface ITimesheetLine {
  id: string;
  client: string;
  project: string | null;
  task: string;
  externalNote: string | null;
  internalNote: string | null;
  billable: boolean;
  dayValues: Record<ITimesheetDayKey, number>;
  totalHours: number;
  favourited: boolean;
  liked: boolean;
  attachments: string[] | null;
}

export interface ITimesheetTotals {
  /** Mon–Sun, in that order */
  perDay: { all: number; billable: number; nonBillable: number }[];
  grand: { all: number; billable: number; nonBillable: number };
  /** 0–100, null when the sheet has no hours */
  billableRatio: number | null;
  /** Hours logged on "Fixed holidays" lines */
  holidayHours: number;
  /** Hours logged on "Vacation" lines */
  leaveHours: number;
}

export interface ITimesheet {
  /** Empty string when the week has no sheet yet (auto-created on first save) */
  id: string;
  /** Monday of the week, "YYYY-MM-DD" */
  weekStart: string;
  status: ITimesheetStatus;
  externalNote: string | null;
  internalNote: string | null;
  totals: ITimesheetTotals;
  lines: ITimesheetLine[];
}

/** Params for GET /api/user/timesheet */
export interface ITimesheetWeekParams {
  weekStart?: string;
}

export interface ITimesheetApprovalHistoryItem {
  id: string;
  /** "09 Nov 2026  -  15 Nov 2026" */
  period: string;
  status: ITimesheetStatus;
  submittedOn: string;
  submittedBy: string;
  approvedBy: string;
}

/** Payload for POST /api/user/timesheet/save */
export interface ISaveTimesheetInput {
  weekStart: string;
  status: ITimesheetStatus;
  externalNote?: string | null;
  internalNote?: string | null;
  lines: ISaveTimesheetLineInput[];
}

export interface ISaveTimesheetLineInput {
  client: string;
  project?: string | null;
  task: string;
  externalNote?: string | null;
  internalNote?: string | null;
  billable: boolean;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

/** Payload for POST /api/user/timesheet/lines */
export interface ICreateTimesheetLineInput extends ISaveTimesheetLineInput {}

/** Payload for PATCH /api/user/timesheet/lines/:id (all fields optional) */
export interface IUpdateTimesheetLineInput extends Partial<ISaveTimesheetLineInput> {}

/** Response envelope used across the user API */
export interface ITimesheetApiResponse<T> {
  message: string;
  data: T;
}
