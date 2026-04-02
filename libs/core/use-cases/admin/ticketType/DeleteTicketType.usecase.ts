import { ITicketTypeGateway, ITicketType, IDeleteTicketTypeUseCase } from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Delete TicketType Use Case
 * Encapsulates the business logic for deleting a ticket type
 */
export class DeleteTicketTypeUseCase implements IDeleteTicketTypeUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(id: number): Promise<ITicketType> {
    // Check if ticket type exists
    const existing = await this.ticketTypeGateway.findById(id);
    if (!existing) {
      throw new NotFoundException(`Ticket type with id ${id} not found`);
    }

    return this.ticketTypeGateway.delete(id);
  }
}
