import { NotFoundException } from '../middleware';
import { IBaseRepository } from '../repository/base.repository';

/**
 * Abstract base service class providing common business logic patterns
 * Extend this class to create services with custom business rules
 */
export abstract class BaseService<T, CreateDto, UpdateDto> {
  constructor(
    protected readonly repository: IBaseRepository<T, CreateDto, UpdateDto>,
    protected readonly entityName: string,
  ) {}

  /**
   * Create a new entity
   */
  async create(data: CreateDto): Promise<T> {
    return this.repository.create(data);
  }

  /**
   * Get all entities
   */
  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  /**
   * Get entity by ID, throws NotFoundException if not found
   */
  async findById(id: string | number): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return entity;
  }

  /**
   * Update entity by ID, throws NotFoundException if not found
   */
  async update(id: string | number, data: UpdateDto): Promise<T> {
    await this.findById(id); // Ensure entity exists
    return this.repository.update(id, data);
  }

  /**
   * Delete entity by ID, throws NotFoundException if not found
   */
  async delete(id: string | number): Promise<T> {
    await this.findById(id); // Ensure entity exists
    return this.repository.delete(id);
  }
}
