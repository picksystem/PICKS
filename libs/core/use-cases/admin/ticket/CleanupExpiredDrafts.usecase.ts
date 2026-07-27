import { IAdminTicketGateway } from '@serviceops/interfaces';

export class CleanupExpiredDraftsUseCase {
  constructor(private readonly ticketGateway: IAdminTicketGateway) {}

  async execute(): Promise<number> {
    return this.ticketGateway.deleteExpiredDrafts();
  }
}
