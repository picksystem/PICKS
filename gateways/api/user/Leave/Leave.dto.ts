import * as yup from 'yup';

/* ── Leave / time-off API shapes (mirror the frontend leave interfaces) ── */

export type LeaveStatus = 'submitted' | 'approved' | 'rejected';

export interface LeaveBalanceResponseDto {
  /** e.g. "Privilege Leave" */
  leaveType: string;
  total: number;
  consumed: number;
  available: number;
}

export interface LeaveRequestResponseDto {
  id: string;
  leaveType: string;
  /** "01 Oct 2026 to 01 Oct 2026" */
  period: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: LeaveStatus;
  submittedOn: string;
  /** The user's stated wish/reason for the leave ("Your wish" column). */
  note: string;
  approvedBy: string | null;
}

/* ── Create (submit) payload ── */

const ISO_DATE = yup
  .string()
  .matches(/^\d{4}-\d{2}-\d{2}$/, 'date must be an ISO date in YYYY-MM-DD format');

export const CreateLeaveRequestSchema = yup.object({
  leaveType: yup.string().required('Leave type is required').max(80),
  startDate: ISO_DATE.required('Start date is required'),
  endDate: ISO_DATE.required('End date is required'),
  days: yup
    .number()
    .min(0, 'Days must be non-negative')
    .max(366, 'Days must be 366 or less')
    .default(1),
  reason: yup.string().max(2000).nullable(),
});

export type CreateLeaveRequestDto = yup.InferType<typeof CreateLeaveRequestSchema>;
