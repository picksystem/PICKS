import {
  IAdvisoryRequestGateway,
  IAdvisoryRequest,
  IGetAdvisoryRequestUseCase,
} from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Get Advisory Request Use Case
 * Retrieves a single advisory request by ID
 */
export class GetAdvisoryRequestUseCase implements IGetAdvisoryRequestUseCase {
  constructor(private readonly advisoryRequestGateway: IAdvisoryRequestGateway) {}

  async execute(id: number): Promise<IAdvisoryRequest> {
    const advisoryRequest = await this.advisoryRequestGateway.findById(id);
    if (!advisoryRequest) {
      throw new NotFoundException(`Advisory Request with ID ${id} not found`);
    }
    return advisoryRequest;
  }
}
