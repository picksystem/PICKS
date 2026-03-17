import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import { CreateAdvisoryRequestSchema, DraftAdvisoryRequestSchema, UpdateAdvisoryRequestSchema } from './AdvisoryRequest.dto';
import { BadRequestException } from '@picks/middleware';
import {
  AdvisoryRequestStatus,
  IUpdateAdvisoryRequestInput,
  CommentSchema,
  TimeEntrySchema,
  ResolutionSchema,
} from '@picks/interfaces';
import {
  CreateAdvisoryRequestUseCase,
  GetAdvisoryRequestUseCase,
  GetAdvisoryRequestByNumberUseCase,
  GetAllAdvisoryRequestsUseCase,
  UpdateAdvisoryRequestUseCase,
  DeleteAdvisoryRequestUseCase,
} from '@picks/core/use-cases';

/**
 * Controller for AdminAdvisoryRequest endpoints
 * Handles HTTP request/response and delegates to use cases
 */
export class AdvisoryRequestController {
  constructor(
    private readonly createAdvisoryRequestUseCase: CreateAdvisoryRequestUseCase,
    private readonly getAdvisoryRequestUseCase: GetAdvisoryRequestUseCase,
    private readonly getAdvisoryRequestByNumberUseCase: GetAdvisoryRequestByNumberUseCase,
    private readonly getAllAdvisoryRequestsUseCase: GetAllAdvisoryRequestsUseCase,
    private readonly updateAdvisoryRequestUseCase: UpdateAdvisoryRequestUseCase,
    private readonly deleteAdvisoryRequestUseCase: DeleteAdvisoryRequestUseCase,
    private readonly prisma: any,
  ) {}

  /**
   * Create a new advisory request entry
   * POST /
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isDraft = req.body.status === AdvisoryRequestStatus.DRAFT;
      const schema = isDraft ? DraftAdvisoryRequestSchema : CreateAdvisoryRequestSchema;
      const validatedData = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.createAdvisoryRequestUseCase.execute(validatedData);
      res.status(201).json({
        message: isDraft ? 'Draft saved successfully' : 'Advisory Request created successfully',
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
   * Get all advisory request entries
   * GET /
   */
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getAllAdvisoryRequestsUseCase.execute();
      res.json({
        message: 'Advisory Requests retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get advisory request entry by ID
   * GET /:id
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      const result = await this.getAdvisoryRequestUseCase.execute(id);
      res.json({
        message: 'Advisory Request retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get advisory request entry by ticket number
   * GET /number/:number
   */
  getByNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { number } = req.params;
      const result = await this.getAdvisoryRequestByNumberUseCase.execute(number);
      res.json({
        message: 'Advisory Request retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update advisory request entry
   * PUT /:id or PATCH /:id
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      const validatedData = await UpdateAdvisoryRequestSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.updateAdvisoryRequestUseCase.execute(
        id,
        validatedData as IUpdateAdvisoryRequestInput,
      );
      res.json({
        message: 'Advisory Request updated successfully',
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
   * Get draft advisory requests
   * GET /drafts
   */
  getDrafts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getAllAdvisoryRequestsUseCase.execute();
      const drafts = result.filter((ar) => ar.status === AdvisoryRequestStatus.DRAFT);
      res.json({
        message: 'Draft advisory requests retrieved successfully',
        data: drafts,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete advisory request entry
   * DELETE /:id
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      await this.deleteAdvisoryRequestUseCase.execute(id);
      res.json({
        message: 'Advisory Request deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // Comment endpoints
  // ============================================

  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const advisoryRequestId = parseInt(req.params.id, 10);
      if (isNaN(advisoryRequestId)) throw new BadRequestException('Invalid ID format');

      const validatedData = await CommentSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const result = await this.prisma.adminAdvisoryRequestComment.create({
        data: {
          advisoryRequestId,
          subject: validatedData.subject,
          message: validatedData.message,
          isInternal: validatedData.isInternal ?? false,
          isSelfNote: validatedData.isSelfNote ?? false,
          notifyAssigneesOnly: validatedData.notifyAssigneesOnly ?? false,
          status: validatedData.status || null,
          attachments: validatedData.attachments || null,
          createdBy: req.body.createdBy || '',
        },
      });

      await this.prisma.adminAdvisoryRequestActivity.create({
        data: {
          advisoryRequestId,
          activityType: 'comment_added',
          description: `Comment added: ${validatedData.subject}`,
          performedBy: req.body.createdBy || '',
        },
      });

      res.status(201).json({ message: 'Comment created successfully', data: result });
    } catch (error) {
      if (error instanceof ValidationError) {
        const errors = error.inner.map((err) => ({ path: err.path, message: err.message }));
        next(new BadRequestException('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };

  getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const advisoryRequestId = parseInt(req.params.id, 10);
      if (isNaN(advisoryRequestId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminAdvisoryRequestComment.findMany({
        where: { advisoryRequestId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ message: 'Comments retrieved successfully', data: results });
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // Time Entry endpoints
  // ============================================

  createTimeEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const advisoryRequestId = parseInt(req.params.id, 10);
      if (isNaN(advisoryRequestId)) throw new BadRequestException('Invalid ID format');

      const validatedData = await TimeEntrySchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const result = await this.prisma.adminAdvisoryRequestTimeEntry.create({
        data: {
          advisoryRequestId,
          date: validatedData.date,
          hours: validatedData.hours,
          minutes: validatedData.minutes,
          billingCode: validatedData.billingCode || null,
          activityTask: validatedData.activityTask || null,
          externalComment: validatedData.externalComment || null,
          internalComment: validatedData.internalComment || null,
          isNonBillable: validatedData.isNonBillable ?? false,
          attachments: validatedData.attachments || null,
          createdBy: req.body.createdBy || '',
        },
      });

      await this.prisma.adminAdvisoryRequestActivity.create({
        data: {
          advisoryRequestId,
          activityType: 'time_entry_added',
          description: `Time entry added: ${validatedData.hours}h ${validatedData.minutes}m`,
          performedBy: req.body.createdBy || '',
        },
      });

      res.status(201).json({ message: 'Time entry created successfully', data: result });
    } catch (error) {
      if (error instanceof ValidationError) {
        const errors = error.inner.map((err) => ({ path: err.path, message: err.message }));
        next(new BadRequestException('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };

  getTimeEntries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const advisoryRequestId = parseInt(req.params.id, 10);
      if (isNaN(advisoryRequestId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminAdvisoryRequestTimeEntry.findMany({
        where: { advisoryRequestId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ message: 'Time entries retrieved successfully', data: results });
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // Resolution endpoints
  // ============================================

  createResolution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const advisoryRequestId = parseInt(req.params.id, 10);
      if (isNaN(advisoryRequestId)) throw new BadRequestException('Invalid ID format');

      const validatedData = await ResolutionSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const result = await this.prisma.adminAdvisoryRequestResolution.create({
        data: {
          advisoryRequestId,
          application: validatedData.application || null,
          category: validatedData.category || null,
          subCategory: validatedData.subCategory || null,
          customerConfirmation: validatedData.customerConfirmation ?? false,
          isRecurring: validatedData.isRecurring ?? false,
          rootCauseIdentified: validatedData.rootCauseIdentified ?? false,
          rootCause: validatedData.rootCause || null,
          resolutionCode: validatedData.resolutionCode,
          resolution: validatedData.resolution,
          internalNote: validatedData.internalNote || null,
          attachments: validatedData.attachments || null,
          createdBy: req.body.createdBy || '',
        },
      });

      await this.prisma.adminAdvisoryRequestActivity.create({
        data: {
          advisoryRequestId,
          activityType: 'resolution_added',
          description: `Resolution added: ${validatedData.resolution}`,
          performedBy: req.body.createdBy || '',
        },
      });

      res.status(201).json({ message: 'Resolution created successfully', data: result });
    } catch (error) {
      if (error instanceof ValidationError) {
        const errors = error.inner.map((err) => ({ path: err.path, message: err.message }));
        next(new BadRequestException('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };

  getResolutions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const advisoryRequestId = parseInt(req.params.id, 10);
      if (isNaN(advisoryRequestId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminAdvisoryRequestResolution.findMany({
        where: { advisoryRequestId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ message: 'Resolutions retrieved successfully', data: results });
    } catch (error) {
      next(error);
    }
  };

  // ============================================
  // Activity endpoints
  // ============================================

  getActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const advisoryRequestId = parseInt(req.params.id, 10);
      if (isNaN(advisoryRequestId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminAdvisoryRequestActivity.findMany({
        where: { advisoryRequestId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ message: 'Activities retrieved successfully', data: results });
    } catch (error) {
      next(error);
    }
  };
}
