import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import { NotFoundService } from './NotFound.service';
import { CreateNotFoundSchema, UpdateNotFoundSchema } from './NotFound.dto';
import { BadRequestException } from '@picks/middleware';

/**
 * Controller for ConsultantNotFound endpoints
 * Handles HTTP request/response and delegates to service
 */
export class NotFoundController {
  constructor(private readonly service: NotFoundService) {}

  /**
   * Create a new not-found entry
   * POST /
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await CreateNotFoundSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.service.create(validatedData);
      res.status(201).json({
        message: 'Not Found created successfully',
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
   * Get all not-found entries
   * GET /
   */
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.findAll();
      res.json({
        message: 'Not Found list retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get not-found entry by ID
   * GET /:id
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.findById(req.params.id);
      res.json({
        message: 'Not Found retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update not-found entry
   * PUT /:id or PATCH /:id
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await UpdateNotFoundSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.service.update(req.params.id, validatedData);
      res.json({
        message: 'Not Found updated successfully',
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
   * Delete not-found entry
   * DELETE /:id
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id);
      res.json({
        message: 'Not Found deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
