import { IServiceRequestGateway, IServiceRequest } from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Get Service Request By Number Use Case
 * Retrieves a single service request by its ticket number (e.g., SRQ0001234)
 */
export class GetServiceRequestByNumberUseCase {
  constructor(private readonly serviceRequestGateway: IServiceRequestGateway) {}

  async execute(number: string): Promise<IServiceRequest> {
    const serviceRequest = await this.serviceRequestGateway.findByNumber(number);
    if (!serviceRequest) {
      throw new NotFoundException(`Service Request with number ${number} not found`);
    }
    return serviceRequest;
  }
}
