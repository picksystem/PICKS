import { ICreateFieldConfigurationInput, IFieldConfigurationEntity } from '@serviceops/interfaces';
import { IFieldConfigurationGateway } from '@serviceops/core/infrastructure';

export class CreateFieldConfigurationUseCase {
  constructor(private readonly gateway: IFieldConfigurationGateway) {}

  async execute(data: ICreateFieldConfigurationInput): Promise<IFieldConfigurationEntity> {
    const now = new Date();
    return this.gateway.create({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }
}
