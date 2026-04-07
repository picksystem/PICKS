import { ITicketTypeGateway, IReorderTicketTypeInput } from '@serviceops/interfaces';

export class ReorderTicketTypesUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(orders: IReorderTicketTypeInput[]): Promise<void> {
    await this.ticketTypeGateway.reorder(orders);
  }
}
