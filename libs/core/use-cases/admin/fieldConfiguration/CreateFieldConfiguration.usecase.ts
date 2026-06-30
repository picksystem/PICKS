import { IFieldConfigurationEntity } from '@serviceops/interfaces';
import { IFieldConfigurationGateway } from '@serviceops/core/infrastructure';

export class CreateFieldConfigurationUseCase {
  constructor(private readonly gateway: IFieldConfigurationGateway) {}

  async execute(data: Omit<IFieldConfigurationEntity, 'id'>): Promise<IFieldConfigurationEntity> {
    return this.gateway.create(data);
  }
}
