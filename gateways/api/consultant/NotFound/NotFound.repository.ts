import { prisma } from '@picks/database';
import { BaseRepository } from '@picks/core/repository';
import { CreateNotFoundDto, UpdateNotFoundDto } from './NotFound.dto';
import { ConsultantNotFound, PrismaClient } from '@prisma/client';

/**
 * Repository for ConsultantNotFound entity
 * Handles all data access operations with type-safe Prisma queries
 */
export class NotFoundRepository extends BaseRepository<
  ConsultantNotFound,
  CreateNotFoundDto,
  UpdateNotFoundDto
> {
  constructor() {
    super(prisma as PrismaClient);
  }

  async create(data: CreateNotFoundDto): Promise<ConsultantNotFound> {
    return this.prisma.consultantNotFound.create({ data });
  }

  async findAll(): Promise<ConsultantNotFound[]> {
    return this.prisma.consultantNotFound.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<ConsultantNotFound | null> {
    return this.prisma.consultantNotFound.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateNotFoundDto): Promise<ConsultantNotFound> {
    return this.prisma.consultantNotFound.update({ where: { id }, data });
  }

  async delete(id: string): Promise<ConsultantNotFound> {
    return this.prisma.consultantNotFound.delete({ where: { id } });
  }
}
