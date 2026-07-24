import { Request, Response } from 'express';
import {
  CreateIncidentUseCase,
  CreateServiceRequestUseCase,
  CreateAdvisoryRequestUseCase,
  GetIncidentByNumberUseCase,
  GetServiceRequestByNumberUseCase,
  GetAdvisoryRequestByNumberUseCase,
  GetAllIncidentsUseCase,
  GetAllServiceRequestsUseCase,
  GetAllAdvisoryRequestsUseCase,
  GetIncidentUseCase,
  GetServiceRequestUseCase,
  GetAdvisoryRequestUseCase,
  UpdateIncidentUseCase,
  UpdateServiceRequestUseCase,
  UpdateAdvisoryRequestUseCase,
  DeleteIncidentUseCase,
  DeleteServiceRequestUseCase,
  DeleteAdvisoryRequestUseCase,
} from '@serviceops/core/use-cases';

const TICKET_TYPE_KEYS = ['incident', 'service_request', 'advisory_request'] as const;
type TicketTypeKey = (typeof TICKET_TYPE_KEYS)[number];

const PREFIX_TYPE_MAP: Record<string, TicketTypeKey> = {
  INC: 'incident',
  SRQ: 'service_request',
  ADV: 'advisory_request',
};

const detectTypeFromNumber = (number: string): TicketTypeKey | null => {
  const prefix = number?.match(/^([A-Z]+)/)?.[1];
  return prefix ? (PREFIX_TYPE_MAP[prefix] ?? null) : null;
};

/**
 * Unified Ticket Controller
 * Handles all CRUD + sub-resource operations for any ticket type via a single endpoint.
 * Routes to the appropriate use case based on `ticketType` in the request body / query params / number prefix.
 */
export class TicketController {
  constructor(
    // Create
    private readonly createIncidentUseCase: CreateIncidentUseCase,
    private readonly createServiceRequestUseCase: CreateServiceRequestUseCase,
    private readonly createAdvisoryRequestUseCase: CreateAdvisoryRequestUseCase,
    // Get by number
    private readonly getIncidentByNumberUseCase: GetIncidentByNumberUseCase,
    private readonly getServiceRequestByNumberUseCase: GetServiceRequestByNumberUseCase,
    private readonly getAdvisoryRequestByNumberUseCase: GetAdvisoryRequestByNumberUseCase,
    // List
    private readonly getAllIncidentsUseCase: GetAllIncidentsUseCase,
    private readonly getAllServiceRequestsUseCase: GetAllServiceRequestsUseCase,
    private readonly getAllAdvisoryRequestsUseCase: GetAllAdvisoryRequestsUseCase,
    // Get by ID
    private readonly getIncidentUseCase: GetIncidentUseCase,
    private readonly getServiceRequestUseCase: GetServiceRequestUseCase,
    private readonly getAdvisoryRequestUseCase: GetAdvisoryRequestUseCase,
    // Update
    private readonly updateIncidentUseCase: UpdateIncidentUseCase,
    private readonly updateServiceRequestUseCase: UpdateServiceRequestUseCase,
    private readonly updateAdvisoryRequestUseCase: UpdateAdvisoryRequestUseCase,
    // Delete
    private readonly deleteIncidentUseCase: DeleteIncidentUseCase,
    private readonly deleteServiceRequestUseCase: DeleteServiceRequestUseCase,
    private readonly deleteAdvisoryRequestUseCase: DeleteAdvisoryRequestUseCase,
  ) {}

  // ============================================
  // CREATE
  // ============================================

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

  // ============================================
  // GET BY NUMBER
  // ============================================

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

  // ============================================
  // LIST ALL (with optional ticketType filter)
  // ============================================

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketType = (req.query.ticketType as TicketTypeKey | undefined) || undefined;
      let results: unknown[] = [];

      if (!ticketType) {
        // Return all tickets from all types
        const [incidents, serviceRequests, advisoryRequests] = await Promise.all([
          this.getAllIncidentsUseCase.execute(),
          this.getAllServiceRequestsUseCase.execute(),
          this.getAllAdvisoryRequestsUseCase.execute(),
        ]);
        results = [...incidents, ...serviceRequests, ...advisoryRequests];
      } else {
        switch (ticketType) {
          case 'incident':
            results = await this.getAllIncidentsUseCase.execute();
            break;
          case 'service_request':
            results = await this.getAllServiceRequestsUseCase.execute();
            break;
          case 'advisory_request':
            results = await this.getAllAdvisoryRequestsUseCase.execute();
            break;
          default:
            res.status(400).json({ message: `Unknown ticket type: ${ticketType}` });
            return;
        }
      }

      res.json({ message: 'Tickets retrieved successfully', data: results });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch tickets' });
    }
  };

  // ============================================
  // GET BY ID
  // ============================================

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const ticketType = (req.query.ticketType as TicketTypeKey | undefined) || undefined;

      let result: unknown | null = null;

      if (ticketType) {
        switch (ticketType) {
          case 'incident':
            result = await this.getIncidentUseCase.execute(id);
            break;
          case 'service_request':
            result = await this.getServiceRequestUseCase.execute(id);
            break;
          case 'advisory_request':
            result = await this.getAdvisoryRequestUseCase.execute(id);
            break;
        }
      } else {
        // No ticketType provided — try all three
        result =
          (await this.getIncidentUseCase.execute(id)) ||
          (await this.getServiceRequestUseCase.execute(id)) ||
          (await this.getAdvisoryRequestUseCase.execute(id));
      }

      if (!result) {
        res.status(404).json({ message: `Ticket with ID ${id} not found` });
        return;
      }

      const resolvedType = ticketType || (result as any)?.__ticketType;
      res.json({
        message: 'Ticket retrieved successfully',
        data: { ...(result as object), ticketType: resolvedType },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch ticket' });
    }
  };

  // ============================================
  // UPDATE
  // ============================================

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const { ticketType, ...data } = req.body;

      if (!ticketType) {
        res.status(400).json({ message: 'ticketType is required for update' });
        return;
      }

      let result: unknown;

      switch (ticketType) {
        case 'incident':
          result = await this.updateIncidentUseCase.execute(id, data);
          break;
        case 'service_request':
          result = await this.updateServiceRequestUseCase.execute(id, data);
          break;
        case 'advisory_request':
          result = await this.updateAdvisoryRequestUseCase.execute(id, data);
          break;
        default:
          res.status(400).json({ message: `Unknown ticket type: ${ticketType}` });
          return;
      }

      res.json({ message: 'Ticket updated successfully', data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to update ticket' });
    }
  };

  // ============================================
  // DELETE
  // ============================================

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const ticketType = (req.body.ticketType || req.query.ticketType) as TicketTypeKey | undefined;

      if (!ticketType) {
        res.status(400).json({ message: 'ticketType is required for delete' });
        return;
      }

      let result: unknown;

      switch (ticketType) {
        case 'incident':
          result = await this.deleteIncidentUseCase.execute(id);
          break;
        case 'service_request':
          result = await this.deleteServiceRequestUseCase.execute(id);
          break;
        case 'advisory_request':
          result = await this.deleteAdvisoryRequestUseCase.execute(id);
          break;
        default:
          res.status(400).json({ message: `Unknown ticket type: ${ticketType}` });
          return;
      }

      res.json({ message: 'Ticket deleted successfully', data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to delete ticket' });
    }
  };

  // ============================================
  // DRAFTS (with optional ticketType filter)
  // ============================================

  getDrafts = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketType = (req.query.ticketType as TicketTypeKey | undefined) || undefined;

      let results: unknown[] = [];

      if (!ticketType) {
        // Return all drafts from all types
        const [incidents, serviceRequests, advisoryRequests] = await Promise.all([
          this.getAllIncidentsUseCase.execute(),
          this.getAllServiceRequestsUseCase.execute(),
          this.getAllAdvisoryRequestsUseCase.execute(),
        ]);
        const isDraft = (t: { status?: string }) => t.status === 'draft' || t.status === 'DRAFT';
        results = [
          ...incidents.filter(isDraft),
          ...serviceRequests.filter(isDraft),
          ...advisoryRequests.filter(isDraft),
        ];
      } else {
        let all: unknown[] = [];
        switch (ticketType) {
          case 'incident':
            all = await this.getAllIncidentsUseCase.execute();
            break;
          case 'service_request':
            all = await this.getAllServiceRequestsUseCase.execute();
            break;
          case 'advisory_request':
            all = await this.getAllAdvisoryRequestsUseCase.execute();
            break;
        }
        results = all.filter((t) => (t as any).status === 'draft' || (t as any).status === 'DRAFT');
      }

      res.json({ message: 'Draft tickets retrieved successfully', data: results });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch drafts' });
    }
  };
}
