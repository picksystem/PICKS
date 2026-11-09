import {
  ITicketType,
  ICreateTicketTypeInput,
  IUpdateTicketTypeInput,
  ITicketTypeGateway,
  ICacheGateway,
} from '@serviceops/interfaces';

export class PrismaTicketTypeGateway implements ITicketTypeGateway {
  private static readonly CACHE_KEY = 'ticketTypes:all';
  private static readonly CACHE_TTL_SECONDS = 5 * 60; // 5 min — invalidated explicitly on write

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly db: any,
    /** Optional PostgreSQL-backed cache. Reads are served from the cache and
     * every write (create / update / delete / reorder) invalidates it. */
    private readonly cache?: ICacheGateway,
  ) {}

  async getAll(): Promise<ITicketType[]> {
    if (this.cache) {
      const cached = await this.cache.get<ITicketType[]>(PrismaTicketTypeGateway.CACHE_KEY);
      if (cached) return cached;
    }

    const rows = await this.db.adminTicketType.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    const result = rows.map((r: any) => ({
      ...r,
      lastUpdatedBy: r.lastUpdatedBy || '',
      lastUpdatedAt: r.lastUpdatedAt ? new Date(r.lastUpdatedAt).toISOString() : '',
      accessControl: JSON.parse(r.accessControl || '[]'),
      layoutConfig: r.layoutConfig ? JSON.parse(r.layoutConfig) : null,
      customFields: JSON.parse(r.customFields || '[]'),
    })) as ITicketType[];

    if (this.cache) {
      await this.cache.set(
        PrismaTicketTypeGateway.CACHE_KEY,
        result,
        PrismaTicketTypeGateway.CACHE_TTL_SECONDS,
      );
    }
    return result;
  }

  async getById(id: number): Promise<ITicketType | null> {
    const r = await this.db.adminTicketType.findUnique({ where: { id } });
    if (!r) return null;
    return {
      ...r,
      lastUpdatedBy: r.lastUpdatedBy || '',
      lastUpdatedAt: r.lastUpdatedAt ? new Date(r.lastUpdatedAt).toISOString() : '',
      accessControl: JSON.parse(r.accessControl || '[]'),
      layoutConfig: r.layoutConfig ? JSON.parse(r.layoutConfig) : null,
      customFields: JSON.parse(r.customFields || '[]'),
    };
  }

  /** Drop the cached ticket-type list so the next `getAll` reflects writes. */
  private async invalidateCache(): Promise<void> {
    if (this.cache) await this.cache.delete(PrismaTicketTypeGateway.CACHE_KEY);
  }

  async create(input: ICreateTicketTypeInput): Promise<ITicketType> {
    const {
      accessControl,
      layoutConfig,
      customFields,
      lastUpdatedBy,
      lastUpdatedAt,
      iconKey,
      tag,
      ...rest
    } = input;
    const r = await this.db.adminTicketType.create({
      data: {
        ...rest,
        lastUpdatedBy: lastUpdatedBy || '',
        accessControl: JSON.stringify(accessControl ?? []),
        layoutConfig: layoutConfig ? JSON.stringify(layoutConfig) : '',
        customFields: JSON.stringify(customFields ?? []),
      },
    });
    await this.invalidateCache();
    return {
      ...r,
      lastUpdatedBy: r.lastUpdatedBy || '',
      lastUpdatedAt: r.lastUpdatedAt ? new Date(r.lastUpdatedAt).toISOString() : '',
      accessControl: JSON.parse(r.accessControl || '[]'),
      layoutConfig: r.layoutConfig ? JSON.parse(r.layoutConfig) : null,
      customFields: JSON.parse(r.customFields || '[]'),
    };
  }

  async update(id: number, input: IUpdateTicketTypeInput): Promise<ITicketType> {
    const { accessControl, layoutConfig, customFields, lastUpdatedBy, iconKey, tag, ...rest } =
      input;
    const data: Record<string, unknown> = { ...rest };
    if (accessControl !== undefined) data.accessControl = JSON.stringify(accessControl);
    if (layoutConfig !== undefined)
      data.layoutConfig = layoutConfig ? JSON.stringify(layoutConfig) : null;
    if (customFields !== undefined) data.customFields = JSON.stringify(customFields);
    if (lastUpdatedBy !== undefined) data.lastUpdatedBy = lastUpdatedBy;

    const r = await this.db.adminTicketType.update({
      where: { id },
      data,
    });
    await this.invalidateCache();
    return {
      ...r,
      lastUpdatedBy: r.lastUpdatedBy || '',
      lastUpdatedAt: r.lastUpdatedAt ? new Date(r.lastUpdatedAt).toISOString() : '',
      accessControl: JSON.parse(r.accessControl || '[]'),
      layoutConfig: r.layoutConfig ? JSON.parse(r.layoutConfig) : null,
      customFields: JSON.parse(r.customFields || '[]'),
    };
  }

  async delete(id: number): Promise<void> {
    await this.db.adminTicketType.delete({ where: { id } });
    await this.invalidateCache();
  }

  async reorder(orders: { id: number; displayOrder: number }[]): Promise<void> {
    for (const { id, displayOrder } of orders) {
      await this.db.adminTicketType.update({
        where: { id },
        data: { displayOrder },
      });
    }
    await this.invalidateCache();
  }
}

export default PrismaTicketTypeGateway;
