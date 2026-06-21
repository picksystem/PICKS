import {
  IConfiguration,
  IConfigurationData,
  IConfigurationGateway,
  IConfigMatrixMap,
  DEFAULT_CONFIGURATION_DATA,
  IConfigApproval,
  IConfigServiceLineTicketType,
  IConfigTimesheetProject,
  IConfigExpenseProject,
  IConfigSupportLine,
  IConfigBillingCode,
  IConfigApplicationQueue,
  IConfigTimesheetConversionCode,
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

    /**
     * Normalize a stored matrix value into the extended cell shape.
     * Older rows in the DB may still contain a plain `priorityId` string for
     * each (impact, urgency) cell; this helper lifts those to the full
     * `{ priorityId, shortDescription, description, internalNote }` shape
     * so downstream code can rely on it.
     */
    const normalizeMatrixCells = (raw: Record<string, unknown> | undefined): IConfigMatrixMap => {
      const result: IConfigMatrixMap = {};
      if (!raw) return result;
      for (const [impactId, byUrgency] of Object.entries(raw)) {
        if (!byUrgency || typeof byUrgency !== 'object') continue;
        const normalizedImpact: IConfigMatrixMap[string] = {};
        for (const [urgencyId, cell] of Object.entries(byUrgency as Record<string, unknown>)) {
          if (cell === null) continue;
          if (typeof cell === 'string') {
            normalizedImpact[urgencyId] = { priorityId: cell };
          } else if (typeof cell === 'object') {
            const c = cell as Partial<{
              priorityId: string;
              shortDescription?: string;
              description?: string;
              internalNote?: string;
            }>;
            normalizedImpact[urgencyId] = {
              priorityId: c.priorityId ?? '',
              shortDescription: c.shortDescription,
              description: c.description,
              internalNote: c.internalNote,
            };
          }
        }
        result[impactId] = normalizedImpact;
      }
      return result;
    };

    const rawMatrices = (data.priorities.matrices ?? {}) as Record<string, unknown>;
    const enrichedMatrices: Record<string, IConfigMatrixMap> = {};
    for (const [key, value] of Object.entries(rawMatrices)) {
      enrichedMatrices[key] = normalizeMatrixCells(value as Record<string, unknown>);
    }

    // Add missing matrix entries for new ticket types
    for (const key of typeKeys) {
      if (!enrichedMatrices[key]) {
        enrichedMatrices[key] = {
          high: {
            high: { priorityId: 'critical' },
            medium: { priorityId: 'high' },
            low: { priorityId: 'medium' },
          },
          medium: {
            high: { priorityId: 'high' },
            medium: { priorityId: 'medium' },
            low: { priorityId: 'low' },
          },
          low: {
            high: { priorityId: 'medium' },
            medium: { priorityId: 'low' },
            low: { priorityId: 'planning' },
          },
        };
      }
    }
    // Remove matrices for deleted ticket types
    for (const key of Object.keys(enrichedMatrices)) {
      if (!typeKeys.includes(key)) delete enrichedMatrices[key];
    }

    // Simple Properties lives in its own top-level field, but the on-disk
    // shape predates that and stored it under `matrices['__simple__']`.
    // Pull it out of there if present so older documents still load.
    const legacySimple = enrichedMatrices['__simple__'] as unknown as
      | Record<string, { active: boolean; description?: string }>
      | undefined;
    delete enrichedMatrices['__simple__'];
    const storedSimple =
      (data.priorities.simplePriorities as
        | Record<string, { active: boolean; description?: string }>
        | undefined) ?? legacySimple;

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
      matrices: enrichedMatrices,
      simplePriorities: storedSimple,
    };

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
        businessCategories: (data.categorization?.businessCategories ?? []).map((bc) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const b = bc as any;
          return {
            ...bc,
            shortDescription: (b.shortDescription as string | undefined) ?? '',
            internalNote: b.internalNote as string | undefined,
          };
        }),
        serviceLines: (data.categorization?.serviceLines ?? []).map((sl) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const s = sl as any;
          return {
            ...sl,
            shortDescription: (s.shortDescription as string | undefined) ?? '',
            internalNote: s.internalNote as string | undefined,
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
            shortDescription: (a.shortDescription as string | undefined) ?? '',
            internalNote: a.internalNote as string | undefined,
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
            shortDescription: (r.shortDescription as string | undefined) ?? '',
            predecessor: (r.predecessor as string | undefined) ?? '',
            successor: (r.successor as string | undefined) ?? '',
            queueSpecificLead: (r.queueSpecificLead as string | undefined) ?? '',
            managerLevel1: (r.managerLevel1 as string | undefined) ?? '',
            managerLevel2: (r.managerLevel2 as string | undefined) ?? '',
            internalNote: r.internalNote as string | undefined,
            approvals: (r.approvals ?? []) as IConfigApproval[],
            ticketTypeActivations: (r.ticketTypeActivations ??
              []) as IConfigServiceLineTicketType[],
            timesheetProjects: (r.timesheetProjects ?? []) as IConfigTimesheetProject[],
            expenseProjects: (r.expenseProjects ?? []) as IConfigExpenseProject[],
            stickyNote: (r.stickyNote as string | undefined) ?? '',
          } as IConfigApplicationQueue;
        }),
        applicationCategories: (data.categorization?.applicationCategories ?? []).map((ac) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const c = ac as any;
          return {
            ...ac,
            shortDescription: (c.shortDescription as string | undefined) ?? '',
            internalNote: c.internalNote as string | undefined,
          };
        }),
        applicationSubCategories: (data.categorization?.applicationSubCategories ?? []).map(
          (asc) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const s = asc as any;
            return {
              ...asc,
              shortDescription: (s.shortDescription as string | undefined) ?? '',
              internalNote: s.internalNote as string | undefined,
            };
          },
        ),
        applicationNumberSequences: (data.categorization?.applicationNumberSequences ?? []).map(
          (ans) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const n = ans as any;
            return {
              ...ans,
              numberSequenceCode: (n.numberSequenceCode as string | undefined) ?? '',
              numericCharLength: typeof n.numericCharLength === 'number' ? n.numericCharLength : 0,
              numberSequenceFormat: (n.numberSequenceFormat as string | undefined) ?? '',
              internalNote: n.internalNote as string | undefined,
            };
          },
        ),
      },
      userConfig: {
        workLocations: data.userConfig?.workLocations ?? [],
        workingTimes: data.userConfig?.workingTimes ?? [],
        shifts: data.userConfig?.shifts ?? [],
        associatedProfiles: data.userConfig?.associatedProfiles ?? [],
        workLocationAssociations: data.userConfig?.workLocationAssociations ?? [],
      },
      reasonCodes: {
        priorityChangeReasonCodes: data.reasonCodes?.priorityChangeReasonCodes ?? [],
        roleChangeReasonCodes: data.reasonCodes?.roleChangeReasonCodes ?? [],
        resolutionCodes: data.reasonCodes?.resolutionCodes ?? [],
        cancellationReasonCodes: data.reasonCodes?.cancellationReasonCodes ?? [],
        reopenReasonCodes: data.reasonCodes?.reopenReasonCodes ?? [],
        conversionReasonCodes: data.reasonCodes?.conversionReasonCodes ?? [],
      },
      calendars: {
        workingDayTemplates: data.calendars?.workingDayTemplates ?? [],
        holidayCalendars: data.calendars?.holidayCalendars ?? [],
        bankHolidays: data.calendars?.bankHolidays ?? [],
        workingCalendars: data.calendars?.workingCalendars ?? [],
        workingCalendarTimes: data.calendars?.workingCalendarTimes ?? [],
        composedWorkingTimes: data.calendars?.composedWorkingTimes ?? [],
        calendarWorkLocations: data.calendars?.calendarWorkLocations ?? [],
        calendarConsultants: data.calendars?.calendarConsultants ?? [],
        periodTypes: data.calendars?.periodTypes ?? [],
        timesheetPeriods: data.calendars?.timesheetPeriods ?? [],
        workingShifts: data.calendars?.workingShifts ?? [],
        shiftConsultants: data.calendars?.shiftConsultants ?? [],
      },
      timesheets: {
        conversionReasonCodes: (
          (data.timesheets?.conversionReasonCodes ?? []) as IConfigTimesheetConversionCode[]
        ).map((r) => ({
          ...r,
          serviceLines: r.serviceLines ?? [],
          applications: r.applications ?? [],
          queues: r.queues ?? [],
          resources: r.resources ?? [],
        })),
        cancellationReasonCodes: data.timesheets?.cancellationReasonCodes ?? [],
        timesheetProjects: data.timesheets?.timesheetProjects ?? [],
        serviceLineEntries: data.timesheets?.serviceLineEntries ?? [],
        applicationEntries: data.timesheets?.applicationEntries ?? [],
        queueEntries: data.timesheets?.queueEntries ?? [],
        resourceEntries: data.timesheets?.resourceEntries ?? [],
        projectCategories: data.timesheets?.projectCategories ?? [],
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
    // Deep merge nested section data so that partial updates don't lose existing nested fields
    const currentSection = current.data[section];
    const mergedSection =
      typeof currentSection === 'object' &&
      currentSection !== null &&
      !Array.isArray(currentSection)
        ? { ...currentSection, ...(value as object) }
        : value;
    const merged: IConfigurationData = { ...current.data, [section]: mergedSection };
    return this.upsert(merged, updatedBy);
  }
}
