import {
  ITicketTypeGateway,
  ITicketType,
  ICreateTicketTypeInput,
  IUpdateTicketTypeInput,
  IReorderTicketTypeInput,
} from '@serviceops/interfaces';

/**
 * In-Memory implementation of TicketType Gateway
 * Used for unit testing without database dependency
 */
export class InMemoryTicketTypeGateway implements ITicketTypeGateway {
  private ticketTypes: ITicketType[] = [];
  private nextId = 1;

  async create(data: ICreateTicketTypeInput): Promise<ITicketType> {
    const ticketType: ITicketType = {
      id: this.nextId++,
      type: data.type,
      name: data.name,
      displayName: data.displayName ?? '',
      description: data.description ?? '',
      prefix: data.prefix ?? '',
      isActive: data.isActive ?? true,
      numberLength: data.numberLength ?? 7,
      displayOrder: data.displayOrder ?? 0,
    };
    this.ticketTypes.push(ticketType);
    return ticketType;
  }

  async findAll(): Promise<ITicketType[]> {
    return [...this.ticketTypes].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async reorder(orders: IReorderTicketTypeInput[]): Promise<void> {
    orders.forEach(({ id, displayOrder }) => {
      const t = this.ticketTypes.find((x) => x.id === id);
      if (t) t.displayOrder = displayOrder;
    });
  }

  async findById(id: number): Promise<ITicketType | null> {
    return this.ticketTypes.find((t) => t.id === id) ?? null;
  }

  async findByType(type: string): Promise<ITicketType | null> {
    return this.ticketTypes.find((t) => t.type === type) ?? null;
  }

  async update(id: number, data: IUpdateTicketTypeInput): Promise<ITicketType> {
    const index = this.ticketTypes.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`TicketType with id ${id} not found`);
    }
    const updated: ITicketType = {
      ...this.ticketTypes[index],
      ...data,
    };
    this.ticketTypes[index] = updated;
    return updated;
  }

  async delete(id: number): Promise<ITicketType> {
    const index = this.ticketTypes.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`TicketType with id ${id} not found`);
    }
    const [deleted] = this.ticketTypes.splice(index, 1);
    return deleted;
  }

  // Helper methods for testing
  clear(): void {
    this.ticketTypes = [];
    this.nextId = 1;
  }

  seed(data: ITicketType[]): void {
    this.ticketTypes = [...data];
    this.nextId = Math.max(...data.map((t) => t.id), 0) + 1;
  }
}
