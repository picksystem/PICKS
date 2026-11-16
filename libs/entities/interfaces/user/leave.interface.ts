/**
 * My Leave / Time-Off API shapes.
 *
 * Mirror the backend Leave DTOs (gateways/api/user/Leave):
 * - per-user leave balances (Privilege / Casual / Sick / Optional Holiday)
 * - submitted leave requests that feed the dashboard's leave table
 */

export type ILeaveStatus = 'submitted' | 'approved' | 'rejected';

/** One balance row per leave type for a user. */
export interface ILeaveBalance {
  /** e.g. "Privilege Leave" */
  leaveType: string;
  total: number;
  consumed: number;
  available: number;
}

/** A submitted leave request (the dashboard's leave table row). */
export interface ILeaveRequest {
  id: string;
  leaveType: string;
  /** "01 Oct 2026 to 01 Oct 2026" */
  period: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: ILeaveStatus;
  submittedOn: string;
  /** The user's stated wish/reason for the leave ("Your wish" column). */
  note: string;
  approvedBy: string | null;
}

/** Payload for POST /api/user/leave/requests */
export interface ICreateLeaveRequestInput {
  leaveType: string;
  startDate: string;
  endDate: string;
  days?: number;
  reason?: string | null;
}

/** Response envelope used across the user API */
export interface ILeaveApiResponse<T> {
  message: string;
  data: T;
}
