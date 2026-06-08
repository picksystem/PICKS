import {
  ITicketTypeGateway,
  ITicketType,
  ICreateTicketTypeInput,
  IUpdateTicketTypeInput,
  IReorderTicketTypeInput,
} from '@serviceops/interfaces';

/**
 * Prisma implementation of TicketType Gateway
 * Used for real database operations in production
 */
export class PrismaTicketTypeGateway implements ITicketTypeGateway {
  constructor(private readonly prisma: any) {}

  // Convert accessControl string[] to JSON string for database storage
  private prepareDataForDb(data: ICreateTicketTypeInput | IUpdateTicketTypeInput): any {
    const dbData: any = { ...data };
    if (data.accessControl) {
      dbData.accessControl = JSON.stringify(data.accessControl);
    }
    // Remove frontend-only fields that don't exist in the database schema
    delete dbData.iconKey;
    delete dbData.tag;
    return dbData;
  }

  // Parse accessControl JSON string back to string[] for API response
  private parseAccessControl(ticketType: any): ITicketType {
    const result = { ...ticketType };
    if (ticketType.accessControl) {
      try {
        result.accessControl = JSON.parse(ticketType.accessControl);
      } catch {
        result.accessControl = [];
      }
    } else {
      result.accessControl = [];
    }
    return result;
  }

  async create(data: ICreateTicketTypeInput): Promise<ITicketType> {
    const dbData = this.prepareDataForDb(data);
    const result = await this.prisma.adminTicketType.create({ data: dbData });
    return this.parseAccessControl(result) as unknown as ITicketType;
  }

  async findAll(): Promise<ITicketType[]> {
    const results = await this.prisma.adminTicketType.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return results.map((r: any) => this.parseAccessControl(r)) as unknown as ITicketType[];
  }

  async findById(id: number): Promise<ITicketType | null> {
    const result = await this.prisma.adminTicketType.findUnique({
      where: { id },
    });
    return result ? this.parseAccessControl(result) : null;
  }

  async findByType(type: string): Promise<ITicketType | null> {
    const result = await this.prisma.adminTicketType.findUnique({
      where: { type },
    });
    return result ? this.parseAccessControl(result) : null;
  }

  async update(id: number, data: IUpdateTicketTypeInput): Promise<ITicketType> {
    const dbData = this.prepareDataForDb(data);
    const result = await this.prisma.adminTicketType.update({ where: { id }, data: dbData });
    return this.parseAccessControl(result) as unknown as ITicketType;
  }

  async delete(id: number): Promise<ITicketType> {
    const result = await this.prisma.adminTicketType.delete({ where: { id } });
    return this.parseAccessControl(result) as unknown as ITicketType;
  }

  async reorder(orders: IReorderTicketTypeInput[]): Promise<void> {
    await this.prisma.$transaction(
      orders.map(({ id, displayOrder }) =>
        this.prisma.adminTicketType.update({ where: { id }, data: { displayOrder } }),
      ),
    );
  }
}
