import { BaseService } from '@picks/core/service';
import { NotFoundRepository } from './NotFound.repository';
import { CreateNotFoundDto, UpdateNotFoundDto } from './NotFound.dto';
import { UserNotFound } from '@prisma/client';

/**
 * Service for UserNotFound business logic
 * Contains validation rules and business operations
 */
export class NotFoundService extends BaseService<
  UserNotFound,
  CreateNotFoundDto,
  UpdateNotFoundDto
> {
  constructor(repository: NotFoundRepository) {
    super(repository, 'Not Found');
  }

  /**
   * Create a new not-found entry
   * Override to add business logic if needed
   */
  async create(data: CreateNotFoundDto): Promise<UserNotFound> {
    return super.create(data);
  }
}
