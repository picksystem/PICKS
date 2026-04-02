import { IIncidentGateway, IIncident, IDeleteIncidentUseCase } from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Delete Incident Use Case
 * Deletes an incident by ID
 */
export class DeleteIncidentUseCase implements IDeleteIncidentUseCase {
  constructor(private readonly incidentGateway: IIncidentGateway) {}

  async execute(id: number): Promise<IIncident> {
    const existing = await this.incidentGateway.findById(id);
    if (!existing) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    return this.incidentGateway.delete(id);
  }
}
