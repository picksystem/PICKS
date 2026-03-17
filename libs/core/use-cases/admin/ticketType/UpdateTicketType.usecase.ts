import {
  ITicketTypeGateway,
  ITicketType,
  IUpdateTicketTypeInput,
  IUpdateTicketTypeUseCase,
} from '@picks/interfaces';
import { NotFoundException, ConflictException } from '../../../middleware';

/**
 * Update TicketType Use Case
 * Encapsulates the business logic for updating a ticket type
 */
export class UpdateTicketTypeUseCase implements IUpdateTicketTypeUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(id: number, input: IUpdateTicketTypeInput): Promise<ITicketType> {
    // Check if ticket type exists
    const existing = await this.ticketTypeGateway.findById(id);
    if (!existing) {
      throw new NotFoundException(`Ticket type with id ${id} not found`);
    }

    // If changing type, check for conflicts
    if (input.type && input.type !== existing.type) {
      const typeExists = await this.ticketTypeGateway.findByType(input.type);
      if (typeExists) {
        throw new ConflictException(`Ticket type '${input.type}' already exists`);
      }
    }

    return this.ticketTypeGateway.update(id, input);
  }
}
