import { prisma } from '@picks/database';
import { BaseRepository } from '@picks/core/repository';
import { CreateNotFoundDto, UpdateNotFoundDto } from './NotFound.dto';
import { UserNotFound, PrismaClient } from '@prisma/client';

/**
 * Repository for UserNotFound entity
 * Handles all data access operations with type-safe Prisma queries
 */
export class NotFoundRepository extends BaseRepository<
  UserNotFound,
  CreateNotFoundDto,
  UpdateNotFoundDto
> {
  constructor() {
    super(prisma as PrismaClient);
  }

  async create(data: CreateNotFoundDto): Promise<UserNotFound> {
    return this.prisma.userNotFound.create({ data });
  }

  async findAll(): Promise<UserNotFound[]> {
    return this.prisma.userNotFound.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<UserNotFound | null> {
    return this.prisma.userNotFound.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateNotFoundDto): Promise<UserNotFound> {
    return this.prisma.userNotFound.update({ where: { id }, data });
  }

  async delete(id: string): Promise<UserNotFound> {
    return this.prisma.userNotFound.delete({ where: { id } });
  }
}
