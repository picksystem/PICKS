import { BaseService } from '@serviceops/core/service';
import { NotFoundException, BadRequestException } from '@serviceops/middleware';
import { Timesheet, TimesheetLine } from '@prisma/client';
import { TimesheetRepository } from './Timesheet.repository';
import {
  CreateTimesheetLineDto,
  GetTimesheetParamsDto,
  SaveTimesheetDto,
  TimesheetApprovalHistoryItemDto,
  TimesheetLineResponseDto,
  TimesheetLineStatus,
  TimesheetResponseDto,
  TimesheetTotalsResponseDto,
  UpdateTimesheetLineDto,
} from './Timesheet.dto';

const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
const HOLIDAY_TASKS = new Set(['Fixed holidays']);
const LEAVE_TASKS = new Set(['Vacation']);

/** "YYYY-MM-DD" Monday (user's local date, UTC-normalised day parts) */
export const currentWeekStart = (): string => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const periodLabel = (weekStart: string, weekEnd: string): string => {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };
  return `${fmt(weekStart)}  -  ${fmt(weekEnd)}`;
};

/** Lines that log time as a holiday or a leave (KPI cards, task-name based —
 *   mirrors the frontend HOLIDAYS_HOURS / LEAVES_HOURS semantics). */
const lineHours = (line: TimesheetLine): number => DAY_KEYS.reduce((s, d) => s + (line[d] ?? 0), 0);

const computeTotals = (lines: TimesheetLine[]): TimesheetTotalsResponseDto => {
  const perDay = DAY_KEYS.map((day) => {
    let all = 0;
    let billable = 0;
    for (const line of lines) {
      const v = line[day] ?? 0;
      all += v;
      if (line.billable) billable += v;
    }
    return { all, billable, nonBillable: all - billable };
  });
  const grand = {
    all: perDay.reduce((s, d) => s + d.all, 0),
    billable: perDay.reduce((s, d) => s + d.billable, 0),
    nonBillable: 0,
  };
  grand.nonBillable = grand.all - grand.billable;
  const billableRatio = grand.all > 0 ? Math.round((grand.billable / grand.all) * 100) : null;
  const holidayHours = lines
    .filter((l) => HOLIDAY_TASKS.has(l.task))
    .reduce((s, l) => s + lineHours(l), 0);
  const leaveHours = lines
    .filter((l) => LEAVE_TASKS.has(l.task))
    .reduce((s, l) => s + lineHours(l), 0);
  return { perDay, grand, billableRatio, holidayHours, leaveHours };
};

const toLineDto = (line: TimesheetLine): TimesheetLineResponseDto => ({
  id: line.id,
  client: line.client,
  project: line.project,
  task: line.task,
  externalNote: line.externalNote,
  internalNote: line.internalNote,
  billable: line.billable,
  dayValues: {
    monday: line.monday,
    tuesday: line.tuesday,
    wednesday: line.wednesday,
    thursday: line.thursday,
    friday: line.friday,
    saturday: line.saturday,
    sunday: line.sunday,
  },
  totalHours: DAY_KEYS.reduce((s, d) => s + (line[d] ?? 0), 0),
  favourited: line.favourited,
  liked: line.liked,
  attachments: line.attachments ? (JSON.parse(line.attachments) as string[]) : null,
});

/**
 * Service for the My Timesheet endpoints.
 * All week-scoped operations are user-bound; the controller passes
 * req.user.id through here.
 */
export class TimesheetService extends BaseService<
  Timesheet,
  CreateTimesheetLineDto,
  UpdateTimesheetLineDto
> {
  /** Concrete repository — exposes the week-scoped operations the base IBaseRepository doesn't. */
  private readonly tsRepo: TimesheetRepository;

  constructor(repository: TimesheetRepository) {
    super(repository, 'Timesheet');
    this.tsRepo = repository;
  }

  /** GET the sheet for a week — auto-creates an open sheet on first access. */
  async getForWeek(userId: number, params: GetTimesheetParamsDto): Promise<TimesheetResponseDto> {
    const weekStart = params.weekStart ?? currentWeekStart();
    const sheet = await this.tsRepo.findByUserAndWeek(userId, weekStart);
    if (!sheet) {
      // no sheet yet for this week — a fresh open one with no lines
      return {
        id: '',
        weekStart,
        status: 'open',
        externalNote: null,
        internalNote: null,
        totals: computeTotals([]),
        lines: [],
      };
    }
    return this.toResponse(sheet);
  }

  /** Persist the full sheet (save/draft), recomputing totals from lines. */
  async save(userId: number, data: SaveTimesheetDto): Promise<TimesheetResponseDto> {
    const sheet = await this.tsRepo.getOrCreateForWeek(userId, data.weekStart);
    const totals = computeTotals(data.lines.map((l) => l as unknown as TimesheetLine));
    const createdLines = await this.tsRepo.replaceLines(sheet.id, data.lines);
    const updated = await this.tsRepo.updateSheet(sheet.id, {
      status: data.status,
      externalNote: data.externalNote ?? null,
      internalNote: data.internalNote ?? null,
      totalHours: totals.grand.all,
      billableHours: totals.grand.billable,
      nonBillableHours: totals.grand.nonBillable,
      submittedAt: data.status === 'submitted' ? new Date() : sheet.submittedAt,
      submittedBy: data.status === 'submitted' ? String(userId) : sheet.submittedBy,
    });
    return this.toResponse({ ...updated, lines: createdLines });
  }

  /** Mark the sheet submitted for approval. */
  async submit(userId: number, weekStart: string): Promise<TimesheetResponseDto> {
    const sheet = await this.tsRepo.findByUserAndWeek(userId, weekStart);
    if (!sheet) throw new NotFoundException('Timesheet not found');
    if (['approved', 'rejected'].includes(sheet.status)) {
      throw new BadRequestException(`Timesheet is ${sheet.status} and cannot be resubmitted`);
    }
    const totals = computeTotals(sheet.lines as unknown as TimesheetLine[]);
    const updated = await this.tsRepo.updateSheet(sheet.id, {
      status: 'submitted',
      totalHours: totals.grand.all,
      billableHours: totals.grand.billable,
      nonBillableHours: totals.grand.nonBillable,
      submittedAt: new Date(),
      submittedBy: String(userId),
    });
    return this.toResponse({ ...updated, lines: sheet.lines as unknown as TimesheetLine[] });
  }

  /** POST a single line onto the week's sheet. */
  async addLine(
    userId: number,
    weekStart: string,
    data: CreateTimesheetLineDto,
  ): Promise<TimesheetLineResponseDto> {
    const sheet = await this.tsRepo.getOrCreateForWeek(userId, weekStart);
    const line = await this.tsRepo.createLine(sheet.id, data);
    return toLineDto(line);
  }

  async updateLine(
    userId: number,
    weekStart: string,
    lineId: string,
    data: UpdateTimesheetLineDto,
  ): Promise<TimesheetLineResponseDto> {
    const sheet = await this.tsRepo.findByUserAndWeek(userId, weekStart);
    if (!sheet) throw new NotFoundException('Timesheet not found');
    if (sheet.status === 'approved') {
      throw new BadRequestException('This timesheet is approved and cannot be edited');
    }
    const line = await this.tsRepo.updateLine(sheet.id, lineId, data);
    return toLineDto(line);
  }

  async removeLine(userId: number, weekStart: string, lineId: string): Promise<void> {
    const sheet = await this.tsRepo.findByUserAndWeek(userId, weekStart);
    if (!sheet) throw new NotFoundException('Timesheet not found');
    if (sheet.status === 'approved') {
      throw new BadRequestException('Lines of an approved timesheet cannot be removed');
    }
    await this.tsRepo.deleteLine(sheet.id, lineId);
  }

  /** Approval History tab: the user's non-open sheets, newest first. */
  async approvalHistory(userId: number): Promise<TimesheetApprovalHistoryItemDto[]> {
    const sheets = await this.tsRepo.findApprovalHistory(userId);
    return sheets.map((sheet) => ({
      id: sheet.id,
      period: periodLabel(sheet.weekStart, this.weekEndOf(sheet.weekStart)),
      status: sheet.status as TimesheetLineStatus,
      submittedOn: sheet.submittedAt
        ? new Date(sheet.submittedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—',
      submittedBy: sheet.submittedBy ?? '—',
      approvedBy: sheet.approvedBy ?? '—',
    }));
  }

  private weekEndOf(weekStart: string): string {
    const [y, m, d] = weekStart.split('-').map(Number);
    const end = new Date(Date.UTC(y, m - 1, d));
    end.setUTCDate(end.getUTCDate() + 6);
    const ey = end.getUTCFullYear();
    const em = String(end.getUTCMonth() + 1).padStart(2, '0');
    const ed = String(end.getUTCDate()).padStart(2, '0');
    return `${ey}-${em}-${ed}`;
  }

  private toResponse(sheet: Timesheet & { lines?: TimesheetLine[] }): TimesheetResponseDto {
    const lines = (sheet.lines ?? []) as TimesheetLine[];
    return {
      id: sheet.id,
      weekStart: sheet.weekStart,
      status: sheet.status as TimesheetLineStatus,
      externalNote: sheet.externalNote,
      internalNote: sheet.internalNote,
      totals: computeTotals(lines),
      lines: lines.map(toLineDto),
    };
  }
}
