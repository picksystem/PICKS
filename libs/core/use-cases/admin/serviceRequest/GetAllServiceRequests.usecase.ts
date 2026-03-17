import {
  IServiceRequestGateway,
  IServiceRequest,
  IGetAllServiceRequestsUseCase,
} from '@picks/interfaces';

/**
 * Get All Service Requests Use Case
 * Retrieves all service requests
 */
export class GetAllServiceRequestsUseCase implements IGetAllServiceRequestsUseCase {
  constructor(private readonly serviceRequestGateway: IServiceRequestGateway) {}

  async execute(): Promise<IServiceRequest[]> {
    return this.serviceRequestGateway.findAll();
  }
}
