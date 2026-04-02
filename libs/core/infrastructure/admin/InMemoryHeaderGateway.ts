import { IHeaderGateway, IHeader, ICreateHeaderInput, IUpdateHeaderInput } from '@serviceops/interfaces';

/**
 * In-Memory implementation of Header Gateway
 * Used for unit testing without database dependency
 */
export class InMemoryHeaderGateway implements IHeaderGateway {
  private headers: IHeader[] = [];
  private nextId = 1;

  async create(data: ICreateHeaderInput): Promise<IHeader> {
    const header: IHeader = {
      id: this.nextId++,
      ticketType: data.ticketType,
      key: data.key,
      name: data.name,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
      app: data.app,
      order: data.order,
    };
    this.headers.push(header);
    return header;
  }

  async findAll(): Promise<IHeader[]> {
    return [...this.headers].sort((a, b) => a.order - b.order);
  }

  async findById(id: number): Promise<IHeader | null> {
    return this.headers.find((h) => h.id === id) ?? null;
  }

  async findByKey(key: string): Promise<IHeader | null> {
    return this.headers.find((h) => h.key === key) ?? null;
  }

  async findActiveByApp(app: string): Promise<IHeader[]> {
    return this.headers
      .filter((h) => h.app === app && h.isActive)
      .sort((a, b) => a.order - b.order);
  }

  async update(id: number, data: IUpdateHeaderInput): Promise<IHeader> {
    const index = this.headers.findIndex((h) => h.id === id);
    if (index === -1) {
      throw new Error(`Header with id ${id} not found`);
    }
    this.headers[index] = { ...this.headers[index], ...data };
    return this.headers[index];
  }

  async delete(id: number): Promise<IHeader> {
    const index = this.headers.findIndex((h) => h.id === id);
    if (index === -1) {
      throw new Error(`Header with id ${id} not found`);
    }
    const [deleted] = this.headers.splice(index, 1);
    return deleted;
  }

  // Helper methods for testing
  clear(): void {
    this.headers = [];
    this.nextId = 1;
  }

  seed(headers: IHeader[]): void {
    this.headers = [...headers];
    this.nextId = Math.max(...headers.map((h) => h.id), 0) + 1;
  }
}
