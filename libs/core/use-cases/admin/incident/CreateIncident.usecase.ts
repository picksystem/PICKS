import {
  IIncidentGateway,
  IIncident,
  ICreateIncidentInput,
  ICreateIncidentUseCase,
  IncidentStatus,
} from '@serviceops/interfaces';

/**
 * Create Incident Use Case
 * Encapsulates the business logic for creating a new incident
 */
export class CreateIncidentUseCase implements ICreateIncidentUseCase {
  constructor(private readonly incidentGateway: IIncidentGateway) {}

  async execute(input: ICreateIncidentInput): Promise<IIncident> {
    // Use provided number or generate a unique one
    const number = input.number || (await this.incidentGateway.getNextNumber());

    // Auto-set draftExpiresAt to 30 days from now for drafts
    let draftExpiresAt: string | undefined = input.draftExpiresAt;
    if (input.status === IncidentStatus.DRAFT && !draftExpiresAt) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      draftExpiresAt = expiryDate.toISOString();
    }

    return this.incidentGateway.create({ ...input, number, draftExpiresAt });
  }
}
