import {
  IConfiguration,
  IConfigurationData,
  IConfigurationGateway,
  IUpdateConfigurationSectionInput,
  IUpdateConfigurationSectionUseCase,
} from '@picks/interfaces';

export class UpdateConfigurationSectionUseCase implements IUpdateConfigurationSectionUseCase {
  constructor(private readonly configurationGateway: IConfigurationGateway) {}

  async execute<K extends keyof IConfigurationData>(
    input: IUpdateConfigurationSectionInput<K>,
  ): Promise<IConfiguration> {
    return this.configurationGateway.updateSection(input.section, input.value, input.updatedBy);
  }
}
