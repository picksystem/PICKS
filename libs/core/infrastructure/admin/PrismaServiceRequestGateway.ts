import {
  IServiceRequestGateway,
  IServiceRequest,
  ICreateServiceRequestInput,
  IUpdateServiceRequestInput,
  ServiceRequestStatus,
} from '@picks/interfaces';

/**
 * Prisma implementation of Service Request Gateway
 * Used for real database operations in production
 */
export class PrismaServiceRequestGateway implements IServiceRequestGateway {
  constructor(private readonly prisma: any) {}

  async create(data: ICreateServiceRequestInput & { number: string }): Promise<IServiceRequest> {
    const result = await this.prisma.adminServiceRequest.create({ data });
    return this.mapToServiceRequest(result);
  }

  async findAll(): Promise<IServiceRequest[]> {
    const results = await this.prisma.adminServiceRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return results.map(this.mapToServiceRequest);
  }

  async findById(id: number): Promise<IServiceRequest | null> {
    const result = await this.prisma.adminServiceRequest.findUnique({ where: { id } });
    return result ? this.mapToServiceRequest(result) : null;
  }

  async findByNumber(number: string): Promise<IServiceRequest | null> {
    const result = await this.prisma.adminServiceRequest.findUnique({ where: { number } });
    return result ? this.mapToServiceRequest(result) : null;
  }

  async findByStatus(status: ServiceRequestStatus): Promise<IServiceRequest[]> {
    const results = await this.prisma.adminServiceRequest.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    return results.map(this.mapToServiceRequest);
  }

  async update(id: number, data: IUpdateServiceRequestInput): Promise<IServiceRequest> {
    const result = await this.prisma.adminServiceRequest.update({ where: { id }, data });
    return this.mapToServiceRequest(result);
  }

  async delete(id: number): Promise<IServiceRequest> {
    const result = await this.prisma.adminServiceRequest.delete({ where: { id } });
    return this.mapToServiceRequest(result);
  }

  async deleteExpiredDrafts(): Promise<number> {
    const result = await this.prisma.adminServiceRequest.deleteMany({
      where: { status: 'draft', draftExpiresAt: { lt: new Date() } },
    });
    return result.count;
  }

  async getNextNumber(): Promise<string> {
    let number: string;
    let exists = true;

    // Generate unique random number
    while (exists) {
      const randomNum = Math.floor(1000000 + Math.random() * 9000000); // 7 digit random number
      number = `SRQ${randomNum}`;
      const existing = await this.prisma.adminServiceRequest.findUnique({
        where: { number },
        select: { id: true },
      });
      exists = !!existing;
    }

    return number!;
  }

  private mapToServiceRequest(data: any): IServiceRequest {
    return {
      ...data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
