import {
  IIncidentGateway,
  IIncident,
  IGetIncidentUseCase,
} from '@picks/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Get Incident Use Case
 * Retrieves a single incident by ID
 */
export class GetIncidentUseCase implements IGetIncidentUseCase {
  constructor(private readonly incidentGateway: IIncidentGateway) {}

  async execute(id: number): Promise<IIncident> {
    const incident = await this.incidentGateway.findById(id);
    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }
    return incident;
  }
}
