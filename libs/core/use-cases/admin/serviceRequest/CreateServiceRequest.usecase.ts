import {
  IServiceRequestGateway,
  IServiceRequest,
  ICreateServiceRequestInput,
  ICreateServiceRequestUseCase,
  ServiceRequestStatus,
} from '@picks/interfaces';

/**
 * Create Service Request Use Case
 * Encapsulates the business logic for creating a new service request
 */
export class CreateServiceRequestUseCase implements ICreateServiceRequestUseCase {
  constructor(private readonly serviceRequestGateway: IServiceRequestGateway) {}

  async execute(input: ICreateServiceRequestInput): Promise<IServiceRequest> {
    // Use provided number or generate a unique one
    const number = input.number || (await this.serviceRequestGateway.getNextNumber());

    // Auto-set draftExpiresAt to 30 days from now for drafts
    let draftExpiresAt: string | undefined = input.draftExpiresAt;
    if (input.status === ServiceRequestStatus.DRAFT && !draftExpiresAt) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      draftExpiresAt = expiryDate.toISOString();
    }

    return this.serviceRequestGateway.create({ ...input, number, draftExpiresAt });
  }
}
