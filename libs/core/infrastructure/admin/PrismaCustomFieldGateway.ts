import { ICustomField } from '@serviceops/interfaces';
import { ICustomFieldGateway } from './CustomFieldGateway';

/**
 * Prisma-backed gateway that manages custom fields stored as a JSON string
 * column on the AdminTicketType table. Because custom fields are embedded
 * (not a standalone table), every mutation reads the current payload,
 * applies the change in-memory, then writes the full array back.
 */
export class PrismaCustomFieldGateway implements ICustomFieldGateway {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly db: any) {}

  async getAll(ticketType: string): Promise<ICustomField[]> {
    const row = await this.db.adminTicketType.findUnique({
      where: { type: ticketType },
      select: { customFields: true },
    });
    return this.parse(row?.customFields);
  }

  async getById(ticketType: string, fieldId: string): Promise<ICustomField | null> {
    const fields = await this.getAll(ticketType);
    return fields.find((f: ICustomField) => f.id === fieldId) ?? null;
  }

  async create(ticketType: string, field: ICustomField): Promise<ICustomField[]> {
    const current = await this.getAll(ticketType);
    const next = [...current, field];
    await this.write(ticketType, next);
    return next;
  }

  async update(ticketType: string, field: ICustomField): Promise<ICustomField[]> {
    const current = await this.getAll(ticketType);
    const next = current.map((f: ICustomField) => (f.id === field.id ? field : f));
    await this.write(ticketType, next);
    return next;
  }

  async delete(ticketType: string, fieldId: string): Promise<ICustomField[]> {
    const current = await this.getAll(ticketType);
    const next = current.filter((f: ICustomField) => f.id !== fieldId);
    await this.write(ticketType, next);
    return next;
  }

  // ── helpers ──────────────────────────────────────────────────────

  private parse(raw: string | null | undefined): ICustomField[] {
    try {
      return JSON.parse(raw ?? '[]') as ICustomField[];
    } catch {
      return [];
    }
  }

  private async write(ticketType: string, fields: ICustomField[]): Promise<void> {
    const payload = JSON.stringify(fields);
    await this.db.adminTicketType.update({
      where: { type: ticketType },
      data: { customFields: payload },
    });
  }
}

export default PrismaCustomFieldGateway;
