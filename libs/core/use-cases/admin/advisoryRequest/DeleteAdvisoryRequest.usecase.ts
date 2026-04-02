import {
  IAdvisoryRequestGateway,
  IAdvisoryRequest,
  IDeleteAdvisoryRequestUseCase,
} from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Delete Advisory Request Use Case
 * Deletes an advisory request by ID
 */
export class DeleteAdvisoryRequestUseCase implements IDeleteAdvisoryRequestUseCase {
  constructor(private readonly advisoryRequestGateway: IAdvisoryRequestGateway) {}

  async execute(id: number): Promise<IAdvisoryRequest> {
    const existing = await this.advisoryRequestGateway.findById(id);
    if (!existing) {
      throw new NotFoundException(`Advisory Request with ID ${id} not found`);
    }

    return this.advisoryRequestGateway.delete(id);
  }
}
