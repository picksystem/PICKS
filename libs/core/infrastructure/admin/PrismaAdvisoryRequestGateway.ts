import {
  IAdvisoryRequestGateway,
  IAdvisoryRequest,
  ICreateAdvisoryRequestInput,
  IUpdateAdvisoryRequestInput,
  AdvisoryRequestStatus,
} from '@picks/interfaces';

/**
 * Prisma implementation of Advisory Request Gateway
 * Used for real database operations in production
 */
export class PrismaAdvisoryRequestGateway implements IAdvisoryRequestGateway {
  constructor(private readonly prisma: any) {}

  async create(data: ICreateAdvisoryRequestInput & { number: string }): Promise<IAdvisoryRequest> {
    const result = await this.prisma.adminAdvisoryRequest.create({ data });
    return this.mapToAdvisoryRequest(result);
  }

  async findAll(): Promise<IAdvisoryRequest[]> {
    const results = await this.prisma.adminAdvisoryRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return results.map(this.mapToAdvisoryRequest);
  }

  async findById(id: number): Promise<IAdvisoryRequest | null> {
    const result = await this.prisma.adminAdvisoryRequest.findUnique({ where: { id } });
    return result ? this.mapToAdvisoryRequest(result) : null;
  }

  async findByNumber(number: string): Promise<IAdvisoryRequest | null> {
    const result = await this.prisma.adminAdvisoryRequest.findUnique({ where: { number } });
    return result ? this.mapToAdvisoryRequest(result) : null;
  }

  async findByStatus(status: AdvisoryRequestStatus): Promise<IAdvisoryRequest[]> {
    const results = await this.prisma.adminAdvisoryRequest.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    return results.map(this.mapToAdvisoryRequest);
  }

  async update(id: number, data: IUpdateAdvisoryRequestInput): Promise<IAdvisoryRequest> {
    const result = await this.prisma.adminAdvisoryRequest.update({ where: { id }, data });
    return this.mapToAdvisoryRequest(result);
  }

  async delete(id: number): Promise<IAdvisoryRequest> {
    const result = await this.prisma.adminAdvisoryRequest.delete({ where: { id } });
    return this.mapToAdvisoryRequest(result);
  }

  async deleteExpiredDrafts(): Promise<number> {
    const result = await this.prisma.adminAdvisoryRequest.deleteMany({
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
      number = `ADV${randomNum}`;
      const existing = await this.prisma.adminAdvisoryRequest.findUnique({
        where: { number },
        select: { id: true },
      });
      exists = !!existing;
    }

    return number!;
  }

  private mapToAdvisoryRequest(data: any): IAdvisoryRequest {
    return {
      ...data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
