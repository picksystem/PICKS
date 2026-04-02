import { IHeaderGateway, IHeader, IGetAllHeadersUseCase } from '@serviceops/interfaces';

/**
 * Get All Headers Use Case
 * Encapsulates the business logic for retrieving all headers
 */
export class GetAllHeadersUseCase implements IGetAllHeadersUseCase {
  constructor(private readonly headerGateway: IHeaderGateway) {}

  async execute(): Promise<IHeader[]> {
    return this.headerGateway.findAll();
  }
}
