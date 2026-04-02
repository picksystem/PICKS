import {
  IIncidentGateway,
  IIncident,
  IUpdateIncidentInput,
  IUpdateIncidentUseCase,
} from '@serviceops/interfaces';
import { NotFoundException } from '../../../middleware';

/**
 * Update Incident Use Case
 * Updates an existing incident
 */
export class UpdateIncidentUseCase implements IUpdateIncidentUseCase {
  constructor(private readonly incidentGateway: IIncidentGateway) {}

  async execute(id: number, input: IUpdateIncidentInput): Promise<IIncident> {
    const existing = await this.incidentGateway.findById(id);
    if (!existing) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    return this.incidentGateway.update(id, input);
  }
}
