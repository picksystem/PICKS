import { IIncidentGateway, IIncident } from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Get Incident By Number Use Case
 * Retrieves a single incident by its ticket number (e.g., INC0001234)
 */
export class GetIncidentByNumberUseCase {
  constructor(private readonly incidentGateway: IIncidentGateway) {}

  async execute(number: string): Promise<IIncident> {
    const incident = await this.incidentGateway.findByNumber(number);
    if (!incident) {
      throw new NotFoundException(`Incident with number ${number} not found`);
    }
    return incident;
  }
}
