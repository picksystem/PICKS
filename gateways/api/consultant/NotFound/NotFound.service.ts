import { NotFoundRepository } from './NotFound.repository';
import { CreateNotFoundDto, UpdateNotFoundDto } from './NotFound.dto';
import { NotFoundException } from '@picks/middleware';

/**
 * Service for ConsultantNotFound business logic
 * Handles business rules and orchestrates repository operations
 */
export class NotFoundService {
  constructor(private readonly repository: NotFoundRepository) {}

  async create(data: CreateNotFoundDto) {
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException(`Not Found record with id ${id} not found`);
    }
    return record;
  }

  async update(id: string, data: UpdateNotFoundDto) {
    await this.findById(id);
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }
}
