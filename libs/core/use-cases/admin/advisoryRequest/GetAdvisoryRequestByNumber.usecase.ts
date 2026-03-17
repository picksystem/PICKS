import { IAdvisoryRequestGateway, IAdvisoryRequest } from '@picks/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Get Advisory Request By Number Use Case
 * Retrieves a single advisory request by its ticket number (e.g., ADV0001234)
 */
export class GetAdvisoryRequestByNumberUseCase {
  constructor(private readonly advisoryRequestGateway: IAdvisoryRequestGateway) {}

  async execute(number: string): Promise<IAdvisoryRequest> {
    const advisoryRequest = await this.advisoryRequestGateway.findByNumber(number);
    if (!advisoryRequest) {
      throw new NotFoundException(`Advisory Request with number ${number} not found`);
    }
    return advisoryRequest;
  }
}
