import {
  IAdvisoryRequestGateway,
  IAdvisoryRequest,
  IUpdateAdvisoryRequestInput,
  IUpdateAdvisoryRequestUseCase,
} from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Update Advisory Request Use Case
 * Updates an existing advisory request
 */
export class UpdateAdvisoryRequestUseCase implements IUpdateAdvisoryRequestUseCase {
  constructor(private readonly advisoryRequestGateway: IAdvisoryRequestGateway) {}

  async execute(id: number, input: IUpdateAdvisoryRequestInput): Promise<IAdvisoryRequest> {
    const existing = await this.advisoryRequestGateway.findById(id);
    if (!existing) {
      throw new NotFoundException(`Advisory Request with ID ${id} not found`);
    }

    return this.advisoryRequestGateway.update(id, input);
  }
}
