import {
  IConfiguration,
  IConfigurationData,
  IConfigurationGateway,
  DEFAULT_CONFIGURATION_DATA,
  IConfigApproval,
  IConfigServiceLineTicketType,
  IConfigTimesheetProject,
  IConfigExpenseProject,
  IConfigSupportLine,
  IConfigBillingCode,
  IConfigApplicationQueue,
} from '@serviceops/interfaces';

/**
 * Manages the singleton AdminConfiguration row.
 *
 * On first read the row is auto-created using DEFAULT_CONFIGURATION_DATA,
 * then enriched with the current AdminTicketType records so that
 * downstream sections (priorities.enabledFor, matrices keys, etc.)
 * always reflect the live set of ticket types.
 */
export class PrismaConfigurationGateway implements IConfigurationGateway {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly prisma: any) {}

  // ── helpers ────────────────────────────────────────────────────────────────

  /**
   * Fetch all active ticket types and use them to:
   *  1. Ensure every priority/impact/urgency level has an `enabledFor` entry
   *     for each ticket type (default true if the key is new).
   *  2. Ensure the priority matrices map has an entry for each ticket type.
   */
  private async enrichWithTicketTypes(data: IConfigurationData): Promise<IConfigurationData> {
    const ticketTypes: { type: string }[] = await this.prisma.adminTicketType.findMany({
      where: { isActive: true },
      select: { type: true },
    });
    const typeKeys = ticketTypes.map((t) => t.type);

    // Sync enabledFor on priority levels
    const syncEnabledFor = (enabledFor: Record<string, boolean>): Record<string, boolean> => {
      const result = { ...enabledFor };
      for (const key of typeKeys) {
        if (result[key] === undefined) result[key] = true;
      }
      // Remove stale keys that no longer exist as ticket types
      for (const key of Object.keys(result)) {
        if (!typeKeys.includes(key)) delete result[key];
      }
      return result;
    };

    const enrichedPriorities: IConfigurationData['priorities'] = {
      levels: data.priorities.levels.map((l) => ({
        ...l,
        enabledFor: syncEnabledFor(l.enabledFor),
      })),
      impactLevels: data.priorities.impactLevels.map((l) => ({
        ...l,
        enabledFor: syncEnabledFor(l.enabledFor),
      })),
      urgencyLevels: data.priorities.urgencyLevels.map((l) => ({
        ...l,
        enabledFor: syncEnabledFor(l.enabledFor),
      })),
      matrices: { ...data.priorities.matrices },
    };

    // Add missing matrix entries for new ticket types
    for (const key of typeKeys) {
      if (!enrichedPriorities.matrices[key]) {
        enrichedPriorities.matrices[key] = {
          high: { high: 'critical', medium: 'high', low: 'medium' },
          medium: { high: 'high', medium: 'medium', low: 'low' },
          low: { high: 'medium', medium: 'low', low: 'planning' },
        };
      }
    }
    // Remove matrices for deleted ticket types
    for (const key of Object.keys(enrichedPriorities.matrices)) {
      if (!typeKeys.includes(key)) delete enrichedPriorities.matrices[key];
    }

    const enrichedStatuses: IConfigurationData['statuses'] = {
      items: data.statuses?.items ?? [],
    };

    const enrichedReleaseStatuses: IConfigurationData['releaseStatuses'] = {
      items: data.releaseStatuses?.items ?? [],
    };

    // Normalize adminControls — merge defaults first so new fields (e.g.
    // activateOnTicketTypes) are always present even when the DB row was
    // written by an older version of the app that had different field names.
    const rawControls = data.slas?.adminControls as unknown as Record<string, unknown> | undefined;
    const adminControls = rawControls
      ? {
          ...DEFAULT_CONFIGURATION_DATA.slas.adminControls,
          ...rawControls,
          activateOnTicketTypes:
            (rawControls['activateOnTicketTypes'] as Record<string, boolean> | undefined) ?? {},
        }
      : DEFAULT_CONFIGURATION_DATA.slas.adminControls;

    const enrichedSlas: IConfigurationData['slas'] = {
      adminControls,
      items: data.slas?.items ?? [],
      responseAckRows: data.slas?.responseAckRows ?? [],
      resolutionRows: data.slas?.resolutionRows ?? [],
      dueDateRows: data.slas?.dueDateRows ?? [],
      etaActivationRows: data.slas?.etaActivationRows ?? [],
      timeLogActivationRows: data.slas?.timeLogActivationRows ?? [],
    };

    return {
      ...data,
      priorities: enrichedPriorities,
      statuses: enrichedStatuses,
      releaseStatuses: enrichedReleaseStatuses,
      slas: enrichedSlas,
      categorization: {
        businessCategories: data.categorization?.businessCategories ?? [],
        serviceLines: (data.categorization?.serviceLines ?? []).map((sl) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const s = sl as any;
          return {
            ...sl,
            timesheetProjects: (s.timesheetProjects ?? []) as IConfigTimesheetProject[],
            expenseProjects: (s.expenseProjects ?? []) as IConfigExpenseProject[],
            approvals: (s.approvals ?? []) as IConfigApproval[],
            ticketTypeActivations: (s.ticketTypeActivations ??
              []) as IConfigServiceLineTicketType[],
          };
        }),
        applications: (data.categorization?.applications ?? []).map((app) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const a = app as any;
          return {
            ...app,
            approvals: (a.approvals ?? []) as IConfigApproval[],
            ticketTypeActivations: (a.ticketTypeActivations ??
              []) as IConfigServiceLineTicketType[],
            supportLines: (a.supportLines ?? []) as IConfigSupportLine[],
            billingCodes: (a.billingCodes ?? []) as IConfigBillingCode[],
            timesheetProjects: (a.timesheetProjects ?? []) as IConfigTimesheetProject[],
            expenseProjects: (a.expenseProjects ?? []) as IConfigExpenseProject[],
            stickyNote: (a.stickyNote as string | undefined) ?? '',
          };
        }),
        queues: (data.categorization?.queues ?? []).map((q) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const r = q as any;
          return {
            ...q,
            predecessor: (r.predecessor as string | undefined) ?? '',
            successor: (r.successor as string | undefined) ?? '',
            queueSpecificLead: (r.queueSpecificLead as string | undefined) ?? '',
            managerLevel1: (r.managerLevel1 as string | undefined) ?? '',
            managerLevel2: (r.managerLevel2 as string | undefined) ?? '',
            approvals: (r.approvals ?? []) as IConfigApproval[],
            ticketTypeActivations: (r.ticketTypeActivations ??
              []) as IConfigServiceLineTicketType[],
            timesheetProjects: (r.timesheetProjects ?? []) as IConfigTimesheetProject[],
            expenseProjects: (r.expenseProjects ?? []) as IConfigExpenseProject[],
          } as IConfigApplicationQueue;
        }),
        applicationCategories: data.categorization?.applicationCategories ?? [],
        applicationSubCategories: data.categorization?.applicationSubCategories ?? [],
        applicationNumberSequences: data.categorization?.applicationNumberSequences ?? [],
      },
    };
  }

  // ── IConfigurationGateway ──────────────────────────────────────────────────

  async get(): Promise<IConfiguration> {
    let row = await this.prisma.adminConfiguration.findFirst();
    if (!row) {
      row = await this.prisma.adminConfiguration.create({
        data: { data: DEFAULT_CONFIGURATION_DATA as object },
      });
    }

    const enriched = await this.enrichWithTicketTypes(row.data as IConfigurationData);
    return { ...row, data: enriched };
  }

  async upsert(data: IConfigurationData, updatedBy?: number): Promise<IConfiguration> {
    const enriched = await this.enrichWithTicketTypes(data);
    let row = await this.prisma.adminConfiguration.findFirst();
    if (!row) {
      row = await this.prisma.adminConfiguration.create({
        data: { data: enriched as object, updatedBy: updatedBy ?? null },
      });
    } else {
      row = await this.prisma.adminConfiguration.update({
        where: { id: row.id },
        data: { data: enriched as object, updatedBy: updatedBy ?? null },
      });
    }
    return { ...row, data: enriched };
  }

  async updateSection<K extends keyof IConfigurationData>(
    section: K,
    value: IConfigurationData[K],
    updatedBy?: number,
  ): Promise<IConfiguration> {
    const current = await this.get();
    const merged: IConfigurationData = { ...current.data, [section]: value };
    return this.upsert(merged, updatedBy);
  }
}
