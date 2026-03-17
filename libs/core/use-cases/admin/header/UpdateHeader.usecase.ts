import {
  IHeaderGateway,
  IHeader,
  IUpdateHeaderInput,
  IUpdateHeaderUseCase,
} from '@picks/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Update Header Use Case
 * Encapsulates the business logic for updating a header
 */
export class UpdateHeaderUseCase implements IUpdateHeaderUseCase {
  constructor(private readonly headerGateway: IHeaderGateway) {}

  async execute(id: number, input: IUpdateHeaderInput): Promise<IHeader> {
    // Ensure header exists
    const existing = await this.headerGateway.findById(id);
    if (!existing) {
      throw new NotFoundException(`Header with id ${id} not found`);
    }

    return this.headerGateway.update(id, input);
  }
}
