import {
  IServiceRequestGateway,
  IServiceRequest,
  IUpdateServiceRequestInput,
  IUpdateServiceRequestUseCase,
} from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Update Service Request Use Case
 * Updates an existing service request
 */
export class UpdateServiceRequestUseCase implements IUpdateServiceRequestUseCase {
  constructor(private readonly serviceRequestGateway: IServiceRequestGateway) {}

  async execute(id: number, input: IUpdateServiceRequestInput): Promise<IServiceRequest> {
    const existing = await this.serviceRequestGateway.findById(id);
    if (!existing) {
      throw new NotFoundException(`Service Request with ID ${id} not found`);
    }

    return this.serviceRequestGateway.update(id, input);
  }
}
