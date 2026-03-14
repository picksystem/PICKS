import { PrismaClient } from '@prisma/client';

/**
 * Base repository interface defining standard CRUD operations
 */
export interface IBaseRepository<T, CreateDto, UpdateDto> {
  create(data: CreateDto): Promise<T>;
  findAll(): Promise<T[]>;
  findById(id: string | number): Promise<T | null>;
  update(id: string | number, data: UpdateDto): Promise<T>;
  delete(id: string | number): Promise<T>;
}

/**
 * Abstract base repository class providing common data access patterns
 * Extend this class to create type-safe repositories for each entity
 */
export abstract class BaseRepository<T, CreateDto, UpdateDto> implements IBaseRepository<
  T,
  CreateDto,
  UpdateDto
> {
  constructor(protected readonly prisma: PrismaClient) {}

  abstract create(data: CreateDto): Promise<T>;
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string | number): Promise<T | null>;
  abstract update(id: string | number, data: UpdateDto): Promise<T>;
  abstract delete(id: string | number): Promise<T>;
}
