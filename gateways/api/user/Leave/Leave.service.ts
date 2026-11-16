import { BaseService } from '@serviceops/core/service';
import { UserLeaveBalance, UserLeaveRequest } from '@prisma/client';
import { LeaveRepository } from './Leave.repository';
import {
  CreateLeaveRequestDto,
  LeaveBalanceResponseDto,
  LeaveRequestResponseDto,
} from './Leave.dto';

const fmtDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const toBalanceDto = (b: UserLeaveBalance): LeaveBalanceResponseDto => ({
  leaveType: b.leaveType,
  total: b.total,
  consumed: b.consumed,
  available: b.available,
});

const toRequestDto = (r: UserLeaveRequest): LeaveRequestResponseDto => ({
  id: r.id,
  leaveType: r.leaveType,
  period: `${fmtDate(r.startDate)} to ${fmtDate(r.endDate)}`,
  startDate: r.startDate,
  endDate: r.endDate,
  days: r.days,
  reason: r.reason,
  status: r.status as LeaveRequestResponseDto['status'],
  submittedOn: new Date(r.submittedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
  note: r.reason ?? '—',
  approvedBy: r.approvedBy ?? null,
});

/**
 * Service for the user's leave / time-off endpoints.
 * All operations are user-bound; the controller passes req.user.id through.
 */
export class LeaveService extends BaseService<
  UserLeaveBalance,
  CreateLeaveRequestDto,
  Partial<CreateLeaveRequestDto>
> {
  /** Concrete repository — exposes the user-scoped operations the base IBaseRepository doesn't. */
  private readonly leaveRepo: LeaveRepository;

  constructor(repository: LeaveRepository) {
    super(repository, 'Leave');
    this.leaveRepo = repository;
  }

  /** GET the user's stored balances (empty when none have been set). */
  async getBalances(userId: number): Promise<LeaveBalanceResponseDto[]> {
    const rows = await this.leaveRepo.findBalances(userId);
    return rows.map(toBalanceDto);
  }

  /** GET the user's leave requests, newest first (the dashboard's leave table). */
  async getRequests(userId: number): Promise<LeaveRequestResponseDto[]> {
    const rows = await this.leaveRepo.findRequests(userId);
    return rows.map(toRequestDto);
  }

  /** POST submit a leave request — starts it in the "submitted" state. */
  async submit(userId: number, data: CreateLeaveRequestDto): Promise<LeaveRequestResponseDto> {
    const created = await this.leaveRepo.createRequest(userId, data);
    return toRequestDto(created);
  }
}
