import { PrismaClient } from '@prisma/client';
import { IFieldConfigurationEntity } from '@serviceops/interfaces';

export interface IFieldConfigurationGateway {
  findAll(): Promise<IFieldConfigurationEntity[]>;
  findById(id: number): Promise<IFieldConfigurationEntity | null>;
  create(data: Omit<IFieldConfigurationEntity, 'id'>): Promise<IFieldConfigurationEntity>;
  update(id: number, data: Partial<IFieldConfigurationEntity>): Promise<IFieldConfigurationEntity>;
  delete(id: number): Promise<void>;
}

export class PrismaFieldConfigurationGateway implements IFieldConfigurationGateway {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<IFieldConfigurationEntity[]> {
    return this.prisma.fieldConfiguration.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findById(id: number): Promise<IFieldConfigurationEntity | null> {
    return this.prisma.fieldConfiguration.findUnique({
      where: { id },
    });
  }

  async create(data: Omit<IFieldConfigurationEntity, 'id'>): Promise<IFieldConfigurationEntity> {
    return this.prisma.fieldConfiguration.create({
      data,
    });
  }

  async update(
    id: number,
    data: Partial<IFieldConfigurationEntity>,
  ): Promise<IFieldConfigurationEntity> {
    return this.prisma.fieldConfiguration.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.fieldConfiguration.delete({
      where: { id },
    });
  }
}
