import {
  ITicketTypeGateway,
  ITicketType,
  ICreateTicketTypeInput,
  ICreateTicketTypeUseCase,
} from '@picks/interfaces';
import { ConflictException } from '../../../middleware';

/**
 * Create TicketType Use Case
 * Encapsulates the business logic for creating a new ticket type
 */
export class CreateTicketTypeUseCase implements ICreateTicketTypeUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(input: ICreateTicketTypeInput): Promise<ITicketType> {
    // Business rule: type must be unique
    const existing = await this.ticketTypeGateway.findByType(input.type);
    if (existing) {
      throw new ConflictException(`Ticket type '${input.type}' already exists`);
    }

    return this.ticketTypeGateway.create(input);
  }
}
