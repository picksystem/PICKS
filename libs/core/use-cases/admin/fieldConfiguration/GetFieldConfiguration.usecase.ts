import { IFieldConfigurationEntity } from '@serviceops/interfaces';
import { IFieldConfigurationGateway } from '@serviceops/core/infrastructure';

export class GetFieldConfigurationUseCase {
  constructor(private readonly gateway: IFieldConfigurationGateway) {}

  async execute(id: number): Promise<IFieldConfigurationEntity> {
    const result = await this.gateway.findById(id);
    if (!result) {
      throw new Error(`Field Configuration with id ${id} not found`);
    }
    return result;
  }
}
