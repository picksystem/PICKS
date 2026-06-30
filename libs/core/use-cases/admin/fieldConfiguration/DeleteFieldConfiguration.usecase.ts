import { IFieldConfigurationGateway } from '@serviceops/core/infrastructure';

export class DeleteFieldConfigurationUseCase {
  constructor(private readonly gateway: IFieldConfigurationGateway) {}

  async execute(id: number): Promise<void> {
    const existing = await this.gateway.findById(id);
    if (!existing) {
      throw new Error(`Field Configuration with id ${id} not found`);
    }
    await this.gateway.delete(id);
  }
}
