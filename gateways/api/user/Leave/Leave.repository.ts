import { prisma } from '@serviceops/database';
import { BaseRepository } from '@serviceops/core/repository';
import { UserLeaveBalance, UserLeaveRequest } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { CreateLeaveRequestDto } from './Leave.dto';

/**
 * Repository for the user's leave balances + submitted leave requests.
 *
 * A balance row and a request are always owned by a user, so every access
 * path below is user-scoped — the controller passes req.user.id through.
 * Mirrors the Timesheet repository's "concrete ops on top of BaseRepository"
 * pattern: the standard CRUD contract is stubbed because leave data is
 * addressed by (userId, ...) rather than a bare id.
 */
export class LeaveRepository extends BaseRepository<
  UserLeaveBalance,
  CreateLeaveRequestDto,
  Partial<CreateLeaveRequestDto>
> {
  constructor() {
    super(prisma as PrismaClient);
  }

  /** The user's balance rows, ordered for a stable display. */
  async findBalances(userId: number): Promise<UserLeaveBalance[]> {
    return this.prisma.userLeaveBalance.findMany({
      where: { userId },
      orderBy: { leaveType: 'asc' },
    });
  }

  /** The user's submitted / approved / rejected requests, newest first. */
  async findRequests(userId: number): Promise<UserLeaveRequest[]> {
    return this.prisma.userLeaveRequest.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async createRequest(userId: number, data: CreateLeaveRequestDto): Promise<UserLeaveRequest> {
    return this.prisma.userLeaveRequest.create({
      data: {
        userId,
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        days: data.days,
        reason: data.reason ?? null,
        status: 'submitted',
        submittedAt: new Date(),
        submittedBy: String(userId),
      },
    });
  }

  /* ── BaseRepository contract (stubs — leave data is user-scoped, not
       addressable by a bare balance id, so these intentionally do nothing). */
  async create(_data: CreateLeaveRequestDto): Promise<UserLeaveBalance> {
    throw new Error('Leave balance creation is user-scoped — use findBalances');
  }

  async findAll(): Promise<UserLeaveBalance[]> {
    throw new Error('Leave balances are user-scoped — use findBalances');
  }

  async findById(_id: string | number): Promise<UserLeaveBalance | null> {
    return null;
  }

  async update(_id: string | number, _data: Partial<CreateLeaveRequestDto>): Promise<UserLeaveBalance> {
    throw new Error('Leave balance update is user-scoped');
  }

  async delete(_id: string | number): Promise<UserLeaveBalance> {
    throw new Error('Leave balances are not deletable through this repository');
  }
}
