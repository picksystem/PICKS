import { IHeaderGateway, IHeader, IDeleteHeaderUseCase } from '@picks/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Delete Header Use Case
 * Encapsulates the business logic for deleting a header
 */
export class DeleteHeaderUseCase implements IDeleteHeaderUseCase {
  constructor(private readonly headerGateway: IHeaderGateway) {}

  async execute(id: number): Promise<IHeader> {
    // Ensure header exists
    const existing = await this.headerGateway.findById(id);
    if (!existing) {
      throw new NotFoundException(`Header with id ${id} not found`);
    }

    return this.headerGateway.delete(id);
  }
}
