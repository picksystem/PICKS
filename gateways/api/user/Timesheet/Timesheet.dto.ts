import * as yup from 'yup';

/* ── Response types (mirror the frontend TimesheetLine / ApprovalEntry shapes) ── */

export type TimesheetLineDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type TimesheetLineStatus =
  | 'open'
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'submitted';

export interface TimesheetLineResponseDto {
  id: string;
  client: string;
  project: string | null;
  task: string;
  externalNote: string | null;
  internalNote: string | null;
  billable: boolean;
  dayValues: Record<TimesheetLineDayKey, number>;
  totalHours: number;
  favourited: boolean;
  liked: boolean;
  attachments: string[] | null;
}

export interface TimesheetTotalsResponseDto {
  perDay: {
    all: number;
    billable: number;
    nonBillable: number;
  }[];
  grand: {
    all: number;
    billable: number;
    nonBillable: number;
  };
  billableRatio: number | null;
  /** Hours logged on "Fixed holidays" task lines (KPI card) */
  holidayHours: number;
  /** Hours logged on "Vacation" task lines (KPI card) */
  leaveHours: number;
}

export interface TimesheetResponseDto {
  id: string;
  weekStart: string;
  status: TimesheetLineStatus;
  externalNote: string | null;
  internalNote: string | null;
  totals: TimesheetTotalsResponseDto;
  lines: TimesheetLineResponseDto[];
}

export interface TimesheetApprovalHistoryItemDto {
  id: string;
  period: string;
  status: TimesheetLineStatus;
  submittedOn: string;
  submittedBy: string;
  approvedBy: string;
}

/* ── Week parameter ── */

/** "YYYY-MM-DD" (ISO, day-1 = Monday) */
const WEEK_START_SCHEMA = yup
  .string()
  .matches(/^\d{4}-\d{2}-\d{2}$/, 'weekStart must be an ISO date in YYYY-MM-DD format');

export const GetTimesheetParamsSchema = yup.object({
  weekStart: WEEK_START_SCHEMA,
});

export type GetTimesheetParamsDto = yup.InferType<typeof GetTimesheetParamsSchema>;

/* ── Line create / update ── */

const DAY_HOURS = (label: string) =>
  yup
    .number()
    .min(0, `${label} hours must be non-negative`)
    .max(24, `${label} hours must be 24 or less`)
    .default(0);

export const CreateTimesheetLineSchema = yup.object({
  client: yup.string().required('Client is required').max(200),
  project: yup.string().max(200).nullable(),
  task: yup.string().required('Task is required').max(200),
  externalNote: yup.string().max(50_000).nullable(),
  internalNote: yup.string().max(50_000).nullable(),
  billable: yup.boolean().default(true),
  monday: DAY_HOURS('Monday'),
  tuesday: DAY_HOURS('Tuesday'),
  wednesday: DAY_HOURS('Wednesday'),
  thursday: DAY_HOURS('Thursday'),
  friday: DAY_HOURS('Friday'),
  saturday: DAY_HOURS('Saturday'),
  sunday: DAY_HOURS('Sunday'),
});

export type CreateTimesheetLineDto = yup.InferType<typeof CreateTimesheetLineSchema>;

export const UpdateTimesheetLineSchema = yup.object({
  client: yup.string().max(200),
  project: yup.string().max(200).nullable(),
  task: yup.string().max(200),
  externalNote: yup.string().max(50_000).nullable(),
  internalNote: yup.string().max(50_000).nullable(),
  billable: yup.boolean(),
  monday: DAY_HOURS('Monday'),
  tuesday: DAY_HOURS('Tuesday'),
  wednesday: DAY_HOURS('Wednesday'),
  thursday: DAY_HOURS('Thursday'),
  friday: DAY_HOURS('Friday'),
  saturday: DAY_HOURS('Saturday'),
  sunday: DAY_HOURS('Sunday'),
});

export type UpdateTimesheetLineDto = yup.InferType<typeof UpdateTimesheetLineSchema>;

/* ── Save / submit the whole sheet ── */

export const SaveTimesheetSchema = yup.object({
  weekStart: WEEK_START_SCHEMA.required(),
  status: yup.string().oneOf(['open', 'pending', 'submitted', 'approved', 'rejected']).required(),
  externalNote: yup.string().max(50_000).nullable(),
  internalNote: yup.string().max(50_000).nullable(),
  lines: yup.array(CreateTimesheetLineSchema).min(0).required('Lines are required'),
});

export type SaveTimesheetDto = yup.InferType<typeof SaveTimesheetSchema>;
