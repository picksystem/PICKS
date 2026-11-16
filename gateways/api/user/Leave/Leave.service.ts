import { BaseService } from '@serviceops/core/service';
import { UserLeaveBalance, UserLeaveRequest } from '@prisma/client';
import { LeaveRepository } from './Leave.repository';
import {
  CreateLeaveRequestDto,
  LeaveBalanceResponseDto,
  LeaveRequestResponseDto,
} from './Leave.dto';

/**
 * Default balances shown when a user has no balance rows yet — matches the
 * reference dashboard (Privilege / Casual / Sick / Optional Holiday).
 */
const DEFAULT_BALANCES: LeaveBalanceResponseDto[] = [
  { leaveType: 'Privilege Leave', total: 12, consumed: 1.5, available: 10.5 },
  { leaveType: 'Casual Leave', total: 7, consumed: 7, available: 0 },
  { leaveType: 'Sick Leave', total: 5, consumed: 4.5, available: 0.5 },
  { leaveType: 'Optional Holiday', total: 2, consumed: 1, available: 1 },
];

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

  /** GET balances — falls back to the reference defaults when none are stored. */
  async getBalances(userId: number): Promise<LeaveBalanceResponseDto[]> {
    const rows = await this.leaveRepo.findBalances(userId);
    if (rows.length === 0) return DEFAULT_BALANCES;
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
