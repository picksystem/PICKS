import {
  IServiceRequestGateway,
  IServiceRequest,
  IDeleteServiceRequestUseCase,
} from '@picks/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Delete Service Request Use Case
 * Deletes a service request by ID
 */
export class DeleteServiceRequestUseCase implements IDeleteServiceRequestUseCase {
  constructor(private readonly serviceRequestGateway: IServiceRequestGateway) {}

  async execute(id: number): Promise<IServiceRequest> {
    const existing = await this.serviceRequestGateway.findById(id);
    if (!existing) {
      throw new NotFoundException(`Service Request with ID ${id} not found`);
    }

    return this.serviceRequestGateway.delete(id);
  }
}
