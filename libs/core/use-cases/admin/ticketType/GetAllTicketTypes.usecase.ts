import { ITicketTypeGateway, ITicketType, IGetAllTicketTypesUseCase } from '@serviceops/interfaces';

/**
 * Get All TicketTypes Use Case
 * Retrieves all ticket types ordered by order field
 */
export class GetAllTicketTypesUseCase implements IGetAllTicketTypesUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(): Promise<ITicketType[]> {
    return this.ticketTypeGateway.findAll();
  }
}
