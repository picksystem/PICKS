import { IFieldConfigurationEntity } from '@serviceops/interfaces';
import { IFieldConfigurationGateway } from '@serviceops/core/infrastructure';

export class UpdateFieldConfigurationUseCase {
  constructor(private readonly gateway: IFieldConfigurationGateway) {}

  async execute(
    id: number,
    data: Partial<Omit<IFieldConfigurationEntity, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<IFieldConfigurationEntity> {
    const existing = await this.gateway.findById(id);
    if (!existing) {
      throw new Error(`Field Configuration with id ${id} not found`);
    }
    return this.gateway.update(id, data);
  }
}
