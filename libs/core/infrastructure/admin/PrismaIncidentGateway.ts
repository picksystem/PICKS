import { PrismaClient } from '@prisma/client';
import {
  IIncidentGateway,
  IIncident,
  ICreateIncidentInput,
  IUpdateIncidentInput,
  IncidentStatus,
} from '@picks/interfaces';

/**
 * Prisma implementation of Incident Gateway
 * Used for real database operations in production
 */
export class PrismaIncidentGateway implements IIncidentGateway {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: ICreateIncidentInput & { number: string }): Promise<IIncident> {
    const result = await this.prisma.adminIncident.create({ data });
    return this.mapToIncident(result);
  }

  async findAll(): Promise<IIncident[]> {
    const results = await this.prisma.adminIncident.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return results.map(this.mapToIncident);
  }

  async findById(id: number): Promise<IIncident | null> {
    const result = await this.prisma.adminIncident.findUnique({ where: { id } });
    return result ? this.mapToIncident(result) : null;
  }

  async findByNumber(number: string): Promise<IIncident | null> {
    const result = await this.prisma.adminIncident.findUnique({ where: { number } });
    return result ? this.mapToIncident(result) : null;
  }

  async findByStatus(status: IncidentStatus): Promise<IIncident[]> {
    const results = await this.prisma.adminIncident.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    return results.map(this.mapToIncident);
  }

  async update(id: number, data: IUpdateIncidentInput): Promise<IIncident> {
    const result = await this.prisma.adminIncident.update({ where: { id }, data });
    return this.mapToIncident(result);
  }

  async delete(id: number): Promise<IIncident> {
    const result = await this.prisma.adminIncident.delete({ where: { id } });
    return this.mapToIncident(result);
  }

  async deleteExpiredDrafts(): Promise<number> {
    const result = await this.prisma.adminIncident.deleteMany({
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
      number = `INC${randomNum}`;
      const existing = await this.prisma.adminIncident.findUnique({
        where: { number },
        select: { id: true },
      });
      exists = !!existing;
    }

    return number!;
  }

  private mapToIncident(data: any): IIncident {
    return {
      ...data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
