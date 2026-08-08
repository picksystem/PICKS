import {
  ICustomField,
  ITicketType,
  ICreateTicketTypeInput,
  IUpdateTicketTypeInput,
  ITicketTypeGateway,
} from '@serviceops/interfaces';

export class PrismaTicketTypeGateway implements ITicketTypeGateway {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly db: any) {}

  async getAll(): Promise<ITicketType[]> {
    const rows = await this.db.adminTicketType.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return rows.map((r: any) => ({
      ...r,
      accessControl: JSON.parse(r.accessControl || '[]'),
      layoutConfig: r.layoutConfig ? JSON.parse(r.layoutConfig) : null,
      customFields: JSON.parse(r.customFields || '[]'),
    }));
  }

  async getById(id: number): Promise<ITicketType | null> {
    const r = await this.db.adminTicketType.findUnique({ where: { id } });
    if (!r) return null;
    return {
      ...r,
      accessControl: JSON.parse(r.accessControl || '[]'),
      layoutConfig: r.layoutConfig ? JSON.parse(r.layoutConfig) : null,
      customFields: JSON.parse(r.customFields || '[]'),
    };
  }

  async create(input: ICreateTicketTypeInput): Promise<ITicketType> {
    const { accessControl, layoutConfig, customFields, ...rest } = input;
    const r = await this.db.adminTicketType.create({
      data: {
        ...rest,
        accessControl: JSON.stringify(accessControl ?? []),
        layoutConfig: layoutConfig ? JSON.stringify(layoutConfig) : null,
        customFields: JSON.stringify(customFields ?? []),
      },
    });
    return {
      ...r,
      accessControl: JSON.parse(r.accessControl || '[]'),
      layoutConfig: r.layoutConfig ? JSON.parse(r.layoutConfig) : null,
      customFields: JSON.parse(r.customFields || '[]'),
    };
  }

  async update(id: number, input: IUpdateTicketTypeInput): Promise<ITicketType> {
    const { accessControl, layoutConfig, customFields, ...rest } = input;
    const data: Record<string, unknown> = { ...rest };
    if (accessControl !== undefined) data.accessControl = JSON.stringify(accessControl);
    if (layoutConfig !== undefined)
      data.layoutConfig = layoutConfig ? JSON.stringify(layoutConfig) : null;
    if (customFields !== undefined) data.customFields = JSON.stringify(customFields);

    const r = await this.db.adminTicketType.update({
      where: { id },
      data,
    });
    return {
      ...r,
      accessControl: JSON.parse(r.accessControl || '[]'),
      layoutConfig: r.layoutConfig ? JSON.parse(r.layoutConfig) : null,
      customFields: JSON.parse(r.customFields || '[]'),
    };
  }

  async delete(id: number): Promise<void> {
    await this.db.adminTicketType.delete({ where: { id } });
  }

  async reorder(orders: { id: number; displayOrder: number }[]): Promise<void> {
    for (const { id, displayOrder } of orders) {
      await this.db.adminTicketType.update({
        where: { id },
        data: { displayOrder },
      });
    }
  }
}

export default PrismaTicketTypeGateway;
