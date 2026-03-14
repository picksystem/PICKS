import {
  IServiceRequestGateway,
  IServiceRequest,
  IGetServiceRequestUseCase,
} from '@picks/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Get Service Request Use Case
 * Retrieves a single service request by ID
 */
export class GetServiceRequestUseCase implements IGetServiceRequestUseCase {
  constructor(private readonly serviceRequestGateway: IServiceRequestGateway) {}

  async execute(id: number): Promise<IServiceRequest> {
    const serviceRequest = await this.serviceRequestGateway.findById(id);
    if (!serviceRequest) {
      throw new NotFoundException(`Service Request with ID ${id} not found`);
    }
    return serviceRequest;
  }
}
