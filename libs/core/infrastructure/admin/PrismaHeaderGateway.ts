import { PrismaClient } from '@prisma/client';
import {
  IHeaderGateway,
  IHeader,
  ICreateHeaderInput,
  IUpdateHeaderInput,
} from '@serviceops/interfaces';

/**
 * Prisma implementation of Header Gateway
 * Used for real database operations in production
 */
export class PrismaHeaderGateway implements IHeaderGateway {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: ICreateHeaderInput): Promise<IHeader> {
    return this.prisma.adminHeader.create({ data });
  }

  async findAll(): Promise<IHeader[]> {
    return this.prisma.adminHeader.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: number): Promise<IHeader | null> {
    return this.prisma.adminHeader.findUnique({ where: { id } });
  }

  async findByKey(key: string): Promise<IHeader | null> {
    return this.prisma.adminHeader.findUnique({ where: { key } });
  }

  async findActiveByApp(app: string): Promise<IHeader[]> {
    return this.prisma.adminHeader.findMany({
      where: { app, isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async update(id: number, data: IUpdateHeaderInput): Promise<IHeader> {
    return this.prisma.adminHeader.update({ where: { id }, data });
  }

  async delete(id: number): Promise<IHeader> {
    return this.prisma.adminHeader.delete({ where: { id } });
  }
}
