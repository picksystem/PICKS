import { BaseService } from '@serviceops/core/service';
import { DashboardRepository } from './Dashboard.repository';
import {
  DashboardApprovalResponseDto,
  DashboardEventResponseDto,
  DashboardHolidayResponseDto,
  DashboardItemResponseDto,
  DashboardQueryDto,
  DashboardStatusResponseDto,
} from './Dashboard.dto';

/**
 * Service for the dashboard endpoint.
 * Returns the complete set of data needed to render all dashboard cards
 * from a single API call (plus leave data from the existing leave module).
 */
export class DashboardService extends BaseService<
  DashboardItemResponseDto,
  DashboardItemResponseDto,
  Partial<DashboardItemResponseDto>
> {
  private readonly repo: DashboardRepository;

  constructor(repository: DashboardRepository) {
    super(repository, 'Dashboard');
    this.repo = repository;
  }

  async getSummary(query: DashboardQueryDto): Promise<{
    actions: DashboardItemResponseDto[];
    approvals: DashboardApprovalResponseDto[];
    events: DashboardEventResponseDto[];
    holidays: DashboardHolidayResponseDto[];
    statuses: DashboardStatusResponseDto[];
  }> {
    const [actions, approvals, events, holidays, statuses] = await Promise.all([
      this.repo.getActions(),
      this.repo.getApprovals(),
      this.repo.getEvents(),
      this.repo.getHolidays(),
      this.repo.getCalendarStatuses(query.year, query.month),
    ]);
    return { actions, approvals, events, holidays, statuses };
  }
}
