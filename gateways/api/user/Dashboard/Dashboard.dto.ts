import * as yup from 'yup';

/* ── Dashboard reference data DTOs ── */

export interface DashboardItemResponseDto {
  id: string;
  title: string;
  subtitle: string;
  disabled: boolean;
}

export interface DashboardApprovalResponseDto {
  id: string;
  label: string;
  icon: string;
  count: number;
}

export interface DashboardEventResponseDto {
  id: string;
  day: string;
  month: string;
  title: string;
  subtitle: string;
}

export interface DashboardHolidayResponseDto {
  id: string;
  day: string;
  month: string;
  title: string;
  note: string | null;
}

export interface DashboardStatusResponseDto {
  date: string;
  status: 'draft' | 'approved' | 'missed' | 'holiday' | 'rejected' | 'none';
}

export interface DashboardSummaryResponseDto {
  /** Action items (My Action card) */
  actions: DashboardItemResponseDto[];
  /** Approval items (My Approvals card) */
  approvals: DashboardApprovalResponseDto[];
  /** Upcoming events */
  events: DashboardEventResponseDto[];
  /** Company holidays */
  holidays: DashboardHolidayResponseDto[];
  /** Per-day status for the current calendar month */
  statuses: DashboardStatusResponseDto[];
}

const YYYY_MM_DD = yup
  .string()
  .matches(/^\d{4}-\d{2}-\d{2}$/, 'date must be an ISO date in YYYY-MM-DD format');

export const DashboardQuerySchema = yup.object({
  month: yup.number().min(1).max(12).required(),
  year: yup.number().min(2000).max(2100).required(),
});

export type DashboardQueryDto = yup.InferType<typeof DashboardQuerySchema>;
