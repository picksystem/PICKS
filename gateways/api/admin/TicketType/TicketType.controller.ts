import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import { CreateTicketTypeSchema, UpdateTicketTypeSchema } from './TicketType.dto';
import { BadRequestException } from '@serviceops/middleware';
import {
  CreateTicketTypeUseCase,
  GetTicketTypeUseCase,
  GetAllTicketTypesUseCase,
  UpdateTicketTypeUseCase,
  DeleteTicketTypeUseCase,
  ReorderTicketTypesUseCase,
} from '@serviceops/core/use-cases';

/**
 * Controller for AdminTicketType endpoints
 * Handles HTTP request/response and delegates to use cases
 */
export class TicketTypeController {
  constructor(
    private readonly createTicketTypeUseCase: CreateTicketTypeUseCase,
    private readonly getTicketTypeUseCase: GetTicketTypeUseCase,
    private readonly getAllTicketTypesUseCase: GetAllTicketTypesUseCase,
    private readonly updateTicketTypeUseCase: UpdateTicketTypeUseCase,
    private readonly deleteTicketTypeUseCase: DeleteTicketTypeUseCase,
    private readonly reorderTicketTypesUseCase: ReorderTicketTypesUseCase,
  ) {}

  /**
   * Create a new ticket type entry
   * POST /
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await CreateTicketTypeSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.createTicketTypeUseCase.execute(validatedData);
      res.status(201).json({
        message: 'Ticket type created successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        const errors = error.inner.map((err) => ({
          path: err.path,
          message: err.message,
        }));
        next(new BadRequestException('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };

  /**
   * Get all ticket type entries
   * GET /
   */
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getAllTicketTypesUseCase.execute();
      res.json({
        message: 'Ticket types retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get ticket type entry by ID
   * GET /:id
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      const result = await this.getTicketTypeUseCase.execute(id);
      res.json({
        message: 'Ticket type retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update ticket type entry
   * PUT /:id or PATCH /:id
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      const validatedData = await UpdateTicketTypeSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.updateTicketTypeUseCase.execute(id, validatedData);
      res.json({
        message: 'Ticket type updated successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        const errors = error.inner.map((err) => ({
          path: err.path,
          message: err.message,
        }));
        next(new BadRequestException('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };

  /**
   * Reorder ticket types
   * PATCH /reorder
   * Body: { orders: { id: number; displayOrder: number }[] }
   */
  reorder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orders } = req.body as { orders: { id: number; displayOrder: number }[] };
      if (!Array.isArray(orders)) {
        throw new BadRequestException('orders must be an array');
      }
      await this.reorderTicketTypesUseCase.execute(orders);
      res.json({ message: 'Ticket type order updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete ticket type entry
   * DELETE /:id
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      await this.deleteTicketTypeUseCase.execute(id);
      res.json({
        message: 'Ticket type deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
