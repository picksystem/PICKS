import {
  IConfiguration,
  IConfigurationData,
  IConfigurationGateway,
  DEFAULT_CONFIGURATION_DATA,
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

    // Pass statuses through unchanged (flat items list, no enrichment needed)
    const enrichedStatuses: IConfigurationData['statuses'] = {
      items: data.statuses?.items ?? [],
    };

    return { ...data, priorities: enrichedPriorities, statuses: enrichedStatuses };
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
