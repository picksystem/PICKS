import { PrismaClient } from '@prisma/client';
import {
  ITicketTypeGateway,
  ITicketType,
  ICreateTicketTypeInput,
  IUpdateTicketTypeInput,
} from '@serviceops/interfaces';

/**
 * Prisma implementation of TicketType Gateway
 * Used for real database operations in production
 */
export class PrismaTicketTypeGateway implements ITicketTypeGateway {
  constructor(private readonly prisma: any) {}

  async create(data: ICreateTicketTypeInput): Promise<ITicketType> {
    return this.prisma.adminTicketType.create({ data }) as unknown as ITicketType;
  }

  async findAll(): Promise<ITicketType[]> {
    return this.prisma.adminTicketType.findMany() as unknown as ITicketType[];
  }

  async findById(id: number): Promise<ITicketType | null> {
    return this.prisma.adminTicketType.findUnique({
      where: { id },
    }) as unknown as ITicketType | null;
  }

  async findByType(type: string): Promise<ITicketType | null> {
    return this.prisma.adminTicketType.findUnique({
      where: { type },
    }) as unknown as ITicketType | null;
  }

  async update(id: number, data: IUpdateTicketTypeInput): Promise<ITicketType> {
    return this.prisma.adminTicketType.update({ where: { id }, data }) as unknown as ITicketType;
  }

  async delete(id: number): Promise<ITicketType> {
    return this.prisma.adminTicketType.delete({ where: { id } }) as unknown as ITicketType;
  }
}
