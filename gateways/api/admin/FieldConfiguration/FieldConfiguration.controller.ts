import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import {
  CreateFieldConfigurationSchema,
  UpdateFieldConfigurationSchema,
} from './FieldConfiguration.dto';
import { BadRequestException } from '@serviceops/middleware';
import {
  CreateFieldConfigurationUseCase,
  GetFieldConfigurationUseCase,
  GetAllFieldConfigurationsUseCase,
  UpdateFieldConfigurationUseCase,
  DeleteFieldConfigurationUseCase,
} from '@serviceops/core/use-cases';

/**
 * Controller for FieldConfiguration endpoints
 * Handles HTTP request/response and delegates to use cases
 */
export class FieldConfigurationController {
  constructor(
    private readonly createFieldConfigurationUseCase: CreateFieldConfigurationUseCase,
    private readonly getFieldConfigurationUseCase: GetFieldConfigurationUseCase,
    private readonly getAllFieldConfigurationsUseCase: GetAllFieldConfigurationsUseCase,
    private readonly updateFieldConfigurationUseCase: UpdateFieldConfigurationUseCase,
    private readonly deleteFieldConfigurationUseCase: DeleteFieldConfigurationUseCase,
  ) {}

  /**
   * Create a new field configuration entry
   * POST /
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await CreateFieldConfigurationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.createFieldConfigurationUseCase.execute(validatedData);
      res.status(201).json({
        message: 'Field configuration created successfully',
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
   * Get all field configuration entries
   * GET /
   */
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getAllFieldConfigurationsUseCase.execute();
      res.json({
        message: 'Field configurations retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get field configuration entry by ID
   * GET /:id
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      const result = await this.getFieldConfigurationUseCase.execute(id);
      res.json({
        message: 'Field configuration retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update field configuration entry
   * PUT /:id or PATCH /:id
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      const validatedData = await UpdateFieldConfigurationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.updateFieldConfigurationUseCase.execute(id, validatedData);
      res.json({
        message: 'Field configuration updated successfully',
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
   * Delete field configuration entry
   * DELETE /:id
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      await this.deleteFieldConfigurationUseCase.execute(id);
      res.json({
        message: 'Field configuration deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
