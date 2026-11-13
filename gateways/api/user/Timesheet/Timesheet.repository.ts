import { prisma } from '@serviceops/database';
import { BaseRepository } from '@serviceops/core/repository';
import { NotFoundException } from '@serviceops/middleware';
import { PrismaClient, Timesheet, TimesheetLine } from '@prisma/client';
import { CreateTimesheetLineDto, UpdateTimesheetLineDto } from './Timesheet.dto';

/**
 * Repository for the Timesheet + TimesheetLine entities.
 *
 * Extends BaseRepository for type consistency with the other modules, but
 * the week-scoped operations below are the real access paths — a timesheet
 * is always owned by a user and keyed by weekStart.
 */
export class TimesheetRepository extends BaseRepository<
  Timesheet,
  CreateTimesheetLineDto,
  UpdateTimesheetLineDto
> {
  constructor() {
    super(prisma as PrismaClient);
  }

  /** Get the user's sheet for the week, creating an empty "open" one when absent. */
  async getOrCreateForWeek(userId: number, weekStart: string): Promise<Timesheet> {
    return this.prisma.timesheet.upsert({
      where: { userId_weekStart: { userId, weekStart } },
      update: {},
      create: { userId, weekStart, status: 'open' },
    });
  }

  async findByUserAndWeek(
    userId: number,
    weekStart: string,
  ): Promise<(Timesheet & { lines: TimesheetLine[] }) | null> {
    return this.prisma.timesheet.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
      include: { lines: true },
    });
  }

  /** The user's submitted / approved / rejected sheets, newest first. */
  async findApprovalHistory(userId: number): Promise<Timesheet[]> {
    return this.prisma.timesheet.findMany({
      where: {
        userId,
        status: { in: ['pending', 'submitted', 'approved', 'rejected'] },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /** Replace the sheet's lines wholesale. Returns the created rows — the input
   *  DTOs carry no ids, and the caller needs the server-assigned ones. */
  async replaceLines(
    timesheetId: string,
    lines: CreateTimesheetLineDto[],
  ): Promise<TimesheetLine[]> {
    await this.prisma.timesheetLine.deleteMany({ where: { timesheetId } });
    if (lines.length === 0) return [];
    await this.prisma.timesheetLine.createMany({
      data: lines.map((line) => ({
        ...line,
        timesheetId,
      })),
    });
    return this.prisma.timesheetLine.findMany({ where: { timesheetId } });
  }

  async createLine(timesheetId: string, data: CreateTimesheetLineDto): Promise<TimesheetLine> {
    return this.prisma.timesheetLine.create({
      data: {
        ...data,
        timesheetId,
      },
    });
  }

  async findLine(timesheetId: string, lineId: string): Promise<TimesheetLine | null> {
    return this.prisma.timesheetLine.findFirst({ where: { id: lineId, timesheetId } });
  }

  /** Prisma `update` treats `undefined` as "leave unchanged", so drop keys the
   *  caller did not send. Also throws 404 when the line isn't on this sheet. */
  async updateLine(
    timesheetId: string,
    lineId: string,
    data: UpdateTimesheetLineDto,
  ): Promise<TimesheetLine> {
    const existing = await this.findLine(timesheetId, lineId);
    if (!existing) {
      throw new NotFoundException('Timesheet line not found');
    }
    const patch: Record<string, string | number | boolean | null> = {};
    const cols = data as Record<string, unknown>;
    for (const key of [
      'client',
      'project',
      'task',
      'externalNote',
      'internalNote',
      'billable',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]) {
      if (cols[key] !== undefined) patch[key] = cols[key] as string | number | boolean | null;
    }
    return this.prisma.timesheetLine.update({
      where: { id: lineId },
      data: patch,
    });
  }

  async deleteLine(timesheetId: string, lineId: string): Promise<TimesheetLine> {
    const existing = await this.findLine(timesheetId, lineId);
    if (!existing) {
      throw new NotFoundException('Timesheet line not found');
    }
    return this.prisma.timesheetLine.delete({ where: { id: lineId } });
  }

  async updateSheet(
    timesheetId: string,
    data: {
      status?: string;
      externalNote?: string | null;
      internalNote?: string | null;
      totalHours?: number;
      billableHours?: number;
      nonBillableHours?: number;
      submittedAt?: Date | null;
      submittedBy?: string | null;
    },
  ): Promise<Timesheet> {
    return this.prisma.timesheet.update({ where: { id: timesheetId }, data });
  }

  /* ── BaseRepository contract (stubs — timesheets are week-scoped, not
       addressable by a bare sheet id, so these intentionally do nothing). */
  async create(_data: CreateTimesheetLineDto): Promise<Timesheet> {
    throw new Error('Timesheet creation is week-scoped — use getOrCreateForWeek');
  }

  async findAll(): Promise<Timesheet[]> {
    throw new Error('Timesheets are user-scoped — use findByUserAndWeek');
  }

  async findById(id: string): Promise<Timesheet | null> {
    return this.prisma.timesheet.findUnique({
      where: { id },
      include: { lines: true },
    }) as Promise<Timesheet | null>;
  }

  async update(_id: string, _data: UpdateTimesheetLineDto): Promise<Timesheet> {
    throw new Error('Timesheet update is week-scoped — use updateSheet');
  }

  async delete(_id: string): Promise<Timesheet> {
    throw new Error('Timesheets are not deletable — they are get-or-created per week');
  }
}
