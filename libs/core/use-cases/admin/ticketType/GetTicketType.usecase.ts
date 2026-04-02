import { ITicketTypeGateway, ITicketType, IGetTicketTypeUseCase } from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Get TicketType Use Case
 * Retrieves a single ticket type by ID
 */
export class GetTicketTypeUseCase implements IGetTicketTypeUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(id: number): Promise<ITicketType> {
    const ticketType = await this.ticketTypeGateway.findById(id);
    if (!ticketType) {
      throw new NotFoundException(`Ticket type with id ${id} not found`);
    }
    return ticketType;
  }
}
