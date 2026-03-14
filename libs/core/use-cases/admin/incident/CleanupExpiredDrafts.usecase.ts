import {
  IIncidentGateway,
  ICleanupExpiredDraftsUseCase,
} from '@picks/interfaces';

/**
 * Cleanup Expired Drafts Use Case
 * Deletes draft incidents that have passed their draftExpiresAt date
 */
export class CleanupExpiredDraftsUseCase implements ICleanupExpiredDraftsUseCase {
  constructor(private readonly incidentGateway: IIncidentGateway) {}

  async execute(): Promise<number> {
    return this.incidentGateway.deleteExpiredDrafts();
  }
}
