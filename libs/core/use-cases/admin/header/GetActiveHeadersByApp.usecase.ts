import { IHeaderGateway, IHeader } from '@serviceops/interfaces';

/**
 * Get Active Headers By App Use Case
 * Encapsulates the business logic for retrieving active headers for a specific app
 */
export class GetActiveHeadersByAppUseCase {
  constructor(private readonly headerGateway: IHeaderGateway) {}

  async execute(app: string): Promise<IHeader[]> {
    return this.headerGateway.findActiveByApp(app);
  }
}
