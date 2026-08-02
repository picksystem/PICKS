import {
  ITicketType,
  ICreateTicketTypeInput,
  IUpdateTicketTypeInput,
  ITicketTypeGateway,
} from '@serviceops/interfaces';

export interface IGetTicketTypesUseCase {
  execute(): Promise<ITicketType[]>;
}

export class GetTicketTypesUseCase implements IGetTicketTypesUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(): Promise<ITicketType[]> {
    return this.ticketTypeGateway.getAll();
  }
}

export interface IGetTicketTypeByIdUseCase {
  execute(id: number): Promise<ITicketType>;
}

export class GetTicketTypeByIdUseCase implements IGetTicketTypeByIdUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(id: number): Promise<ITicketType> {
    const ticketType = await this.ticketTypeGateway.getById(id);
    if (!ticketType) {
      throw new Error(`Ticket type not found: ${id}`);
    }
    return ticketType;
  }
}

export interface ICreateTicketTypeUseCase {
  execute(input: ICreateTicketTypeInput): Promise<ITicketType>;
}

export class CreateTicketTypeUseCase implements ICreateTicketTypeUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(input: ICreateTicketTypeInput): Promise<ITicketType> {
    return this.ticketTypeGateway.create(input);
  }
}

export interface IUpdateTicketTypeUseCase {
  execute(id: number, input: IUpdateTicketTypeInput): Promise<ITicketType>;
}

export class UpdateTicketTypeUseCase implements IUpdateTicketTypeUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(id: number, input: IUpdateTicketTypeInput): Promise<ITicketType> {
    return this.ticketTypeGateway.update(id, input);
  }
}

export interface IDeleteTicketTypeUseCase {
  execute(id: number): Promise<void>;
}

export class DeleteTicketTypeUseCase implements IDeleteTicketTypeUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(id: number): Promise<void> {
    await this.ticketTypeGateway.delete(id);
  }
}

export interface IReorderTicketTypesUseCase {
  execute(orders: { id: number; displayOrder: number }[]): Promise<void>;
}

export class ReorderTicketTypesUseCase implements IReorderTicketTypesUseCase {
  constructor(private readonly ticketTypeGateway: ITicketTypeGateway) {}

  async execute(orders: { id: number; displayOrder: number }[]): Promise<void> {
    return this.ticketTypeGateway.reorder(orders);
  }
}
