import { Request, Response } from 'express';
import {
  CreateIncidentUseCase,
  CreateServiceRequestUseCase,
  CreateAdvisoryRequestUseCase,
  GetIncidentByNumberUseCase,
  GetServiceRequestByNumberUseCase,
  GetAdvisoryRequestByNumberUseCase,
} from '@picks/core/use-cases';

/** Detect ticket type from number prefix (e.g. INC0001234 → incident) */
const PREFIX_TYPE_MAP: Record<string, string> = {
  INC: 'incident',
  SRQ: 'service_request',
  ADV: 'advisory_request',
};

const detectTypeFromNumber = (number: string): string | null => {
  const prefix = number?.match(/^([A-Z]+)/)?.[1];
  return prefix ? (PREFIX_TYPE_MAP[prefix] ?? null) : null;
};

/**
 * Unified Ticket Controller
 * Handles create + get for all ticket types via a single endpoint.
 * Routes to the appropriate use case based on `ticketType` in the request body / number prefix.
 */
export class TicketController {
  constructor(
    private readonly createIncidentUseCase: CreateIncidentUseCase,
    private readonly createServiceRequestUseCase: CreateServiceRequestUseCase,
    private readonly createAdvisoryRequestUseCase: CreateAdvisoryRequestUseCase,
    private readonly getIncidentByNumberUseCase: GetIncidentByNumberUseCase,
    private readonly getServiceRequestByNumberUseCase: GetServiceRequestByNumberUseCase,
    private readonly getAdvisoryRequestByNumberUseCase: GetAdvisoryRequestByNumberUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ticketType, ...data } = req.body;

      if (!ticketType) {
        res.status(400).json({ message: 'ticketType is required' });
        return;
      }

      let result: unknown;

      switch (ticketType) {
        case 'incident':
          result = await this.createIncidentUseCase.execute(data);
          break;
        case 'service_request':
          result = await this.createServiceRequestUseCase.execute(data);
          break;
        case 'advisory_request':
          result = await this.createAdvisoryRequestUseCase.execute(data);
          break;
        default:
          res.status(400).json({ message: `Unknown ticket type: ${ticketType}` });
          return;
      }

      res.status(201).json({ message: 'Ticket created successfully', data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to create ticket' });
    }
  };

  getByNumber = async (req: Request, res: Response): Promise<void> => {
    try {
      const { number } = req.params;
      const ticketType = detectTypeFromNumber(number);

      if (!ticketType) {
        res.status(400).json({ message: `Cannot determine ticket type from number: ${number}` });
        return;
      }

      let result: unknown;

      switch (ticketType) {
        case 'incident':
          result = await this.getIncidentByNumberUseCase.execute(number);
          break;
        case 'service_request':
          result = await this.getServiceRequestByNumberUseCase.execute(number);
          break;
        case 'advisory_request':
          result = await this.getAdvisoryRequestByNumberUseCase.execute(number);
          break;
        default:
          res.status(400).json({ message: `Unknown ticket type for number: ${number}` });
          return;
      }

      res.status(200).json({ message: 'OK', data: { ...(result as object), ticketType } });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch ticket' });
    }
  };
}
