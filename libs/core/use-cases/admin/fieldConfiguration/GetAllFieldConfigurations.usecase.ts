import { IFieldConfigurationEntity } from '@serviceops/interfaces';
import { IFieldConfigurationGateway } from '@serviceops/core/infrastructure';

export class GetAllFieldConfigurationsUseCase {
  constructor(private readonly gateway: IFieldConfigurationGateway) {}

  async execute(): Promise<IFieldConfigurationEntity[]> {
    return this.gateway.findAll();
  }
}
