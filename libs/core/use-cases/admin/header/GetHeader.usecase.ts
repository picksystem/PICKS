import { IHeaderGateway, IHeader, IGetHeaderUseCase } from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Get Header Use Case
 * Encapsulates the business logic for retrieving a header by ID
 */
export class GetHeaderUseCase implements IGetHeaderUseCase {
  constructor(private readonly headerGateway: IHeaderGateway) {}

  async execute(id: number): Promise<IHeader> {
    const header = await this.headerGateway.findById(id);
    if (!header) {
      throw new NotFoundException(`Header with id ${id} not found`);
    }
    return header;
  }
}
