import {
  IConfiguration,
  IConfigurationGateway,
  IGetConfigurationUseCase,
} from '@picks/interfaces';

export class GetConfigurationUseCase implements IGetConfigurationUseCase {
  constructor(private readonly configurationGateway: IConfigurationGateway) {}

  async execute(): Promise<IConfiguration> {
    return this.configurationGateway.get();
  }
}
