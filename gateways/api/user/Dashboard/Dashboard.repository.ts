import { prisma } from '@serviceops/database';
import { BaseRepository } from '@serviceops/core/repository';
import { PrismaClient } from '@prisma/client';
import {
  DashboardApprovalResponseDto,
  DashboardEventResponseDto,
  DashboardHolidayResponseDto,
  DashboardItemResponseDto,
  DashboardStatusResponseDto,
} from './Dashboard.dto';

/**
 * Repository for dashboard reference data.
 *
 * All data is global (no userId scoping) — these are system-wide configuration
 * items that seed the dashboard cards. The frontend reads them all at once.
 */
export class DashboardRepository extends BaseRepository<
  DashboardItemResponseDto,
  DashboardItemResponseDto,
  Partial<DashboardItemResponseDto>
> {
  constructor() {
    super(prisma as PrismaClient);
  }

  /* ── Actions ── */
  async getActions(): Promise<DashboardItemResponseDto[]> {
    return this.prisma.userDashboardItem.findMany({
      orderBy: { order: 'asc' },
    }).then((rows) =>
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        disabled: r.disabled,
      })),
    );
  }

  /* ── Approvals ── */
  async getApprovals(): Promise<DashboardApprovalResponseDto[]> {
    return this.prisma.userApprovalItem.findMany({
      orderBy: { order: 'asc' },
    }).then((rows) =>
      rows.map((r) => ({
        id: r.id,
        label: r.label,
        icon: r.icon,
        count: r.count,
      })),
    );
  }

  /* ── Events ── */
  async getEvents(): Promise<DashboardEventResponseDto[]> {
    return this.prisma.userEvent.findMany({
      orderBy: { order: 'asc' },
    }).then((rows) =>
      rows.map((r) => ({
        id: r.id,
        day: r.day,
        month: r.month,
        title: r.title,
        subtitle: r.subtitle,
      })),
    );
  }

  /* ── Holidays ── */
  async getHolidays(): Promise<DashboardHolidayResponseDto[]> {
    return this.prisma.userHoliday.findMany({
      orderBy: { order: 'asc' },
    }).then((rows) =>
      rows.map((r) => ({
        id: r.id,
        day: r.day,
        month: r.month,
        title: r.title,
        note: r.note,
      })),
    );
  }

  /* ── Calendar statuses for a given month/year ── */
  async getCalendarStatuses(
    year: number,
    month: number, // 1-12
  ): Promise<DashboardStatusResponseDto[]> {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const statuses: DashboardStatusResponseDto[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${prefix}-${String(d).padStart(2, '0')}`;
      // Default: no status unless overridden below
      statuses.push({ date: dateStr, status: 'none' });
    }
    return statuses;
  }

  /* ── BaseRepository contract stubs ── */
  async create(_data: DashboardItemResponseDto): Promise<DashboardItemResponseDto> {
    throw new Error('Dashboard items are created via seeded data');
  }
  async findAll(): Promise<DashboardItemResponseDto[]> {
    throw new Error('Use getActions / getApprovals / getEvents / getHolidays');
  }
  async findById(_id: string | number): Promise<DashboardItemResponseDto | null> {
    return null;
  }
  async update(
    _id: string | number,
    _data: Partial<DashboardItemResponseDto>,
  ): Promise<DashboardItemResponseDto> {
    throw new Error('Dashboard items are updated via seeded data');
  }
  async delete(_id: string | number): Promise<DashboardItemResponseDto> {
    throw new Error('Dashboard items are not deletable through this repository');
  }
}
