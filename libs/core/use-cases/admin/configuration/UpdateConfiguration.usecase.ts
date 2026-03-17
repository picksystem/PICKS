import {
  IConfiguration,
  IConfigurationGateway,
  IUpdateConfigurationInput,
  IUpdateConfigurationUseCase,
} from '@picks/interfaces';

export class UpdateConfigurationUseCase implements IUpdateConfigurationUseCase {
  constructor(private readonly configurationGateway: IConfigurationGateway) {}

  async execute(input: IUpdateConfigurationInput): Promise<IConfiguration> {
    return this.configurationGateway.upsert(input.data, input.updatedBy);
  }
}
