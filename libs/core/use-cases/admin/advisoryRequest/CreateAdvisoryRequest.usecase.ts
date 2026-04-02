import {
  IAdvisoryRequestGateway,
  IAdvisoryRequest,
  ICreateAdvisoryRequestInput,
  ICreateAdvisoryRequestUseCase,
  AdvisoryRequestStatus,
} from '@serviceops/interfaces';

/**
 * Create Advisory Request Use Case
 * Encapsulates the business logic for creating a new advisory request
 */
export class CreateAdvisoryRequestUseCase implements ICreateAdvisoryRequestUseCase {
  constructor(private readonly advisoryRequestGateway: IAdvisoryRequestGateway) {}

  async execute(input: ICreateAdvisoryRequestInput): Promise<IAdvisoryRequest> {
    // Use provided number or generate a unique one
    const number = input.number || (await this.advisoryRequestGateway.getNextNumber());

    // Auto-set draftExpiresAt to 30 days from now for drafts
    let draftExpiresAt: string | undefined = input.draftExpiresAt;
    if (input.status === AdvisoryRequestStatus.DRAFT && !draftExpiresAt) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      draftExpiresAt = expiryDate.toISOString();
    }

    return this.advisoryRequestGateway.create({ ...input, number, draftExpiresAt });
  }
}
