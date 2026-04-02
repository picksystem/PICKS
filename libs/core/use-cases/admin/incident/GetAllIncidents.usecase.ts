import { IIncidentGateway, IIncident, IGetAllIncidentsUseCase } from '@serviceops/interfaces';

/**
 * Get All Incidents Use Case
 * Retrieves all incidents
 */
export class GetAllIncidentsUseCase implements IGetAllIncidentsUseCase {
  constructor(private readonly incidentGateway: IIncidentGateway) {}

  async execute(): Promise<IIncident[]> {
    return this.incidentGateway.findAll();
  }
}
