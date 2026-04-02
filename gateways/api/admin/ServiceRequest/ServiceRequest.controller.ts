import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import {
  CreateServiceRequestSchema,
  DraftServiceRequestSchema,
  UpdateServiceRequestSchema,
} from './ServiceRequest.dto';
import { BadRequestException } from '@serviceops/middleware';
import {
  ServiceRequestStatus,
  IUpdateServiceRequestInput,
  CommentSchema,
  TimeEntrySchema,
  ResolutionSchema,
} from '@serviceops/interfaces';
import {
  CreateServiceRequestUseCase,
  GetServiceRequestUseCase,
  GetServiceRequestByNumberUseCase,
  GetAllServiceRequestsUseCase,
  UpdateServiceRequestUseCase,
  DeleteServiceRequestUseCase,
} from '@serviceops/core/use-cases';

/**
 * Controller for AdminServiceRequest endpoints
 * Handles HTTP request/response and delegates to use cases
 */
export class ServiceRequestController {
  constructor(
    private readonly createServiceRequestUseCase: CreateServiceRequestUseCase,
    private readonly getServiceRequestUseCase: GetServiceRequestUseCase,
    private readonly getServiceRequestByNumberUseCase: GetServiceRequestByNumberUseCase,
    private readonly getAllServiceRequestsUseCase: GetAllServiceRequestsUseCase,
    private readonly updateServiceRequestUseCase: UpdateServiceRequestUseCase,
    private readonly deleteServiceRequestUseCase: DeleteServiceRequestUseCase,
    private readonly prisma: any,
  ) {}

  /**
   * Create a new service request entry
   * POST /
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isDraft = req.body.status === ServiceRequestStatus.DRAFT;
      const schema = isDraft ? DraftServiceRequestSchema : CreateServiceRequestSchema;
      const validatedData = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.createServiceRequestUseCase.execute(validatedData);
      res.status(201).json({
        message: isDraft ? 'Draft saved successfully' : 'Service Request created successfully',
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
   * Get all service request entries
   * GET /
   */
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getAllServiceRequestsUseCase.execute();
      res.json({
        message: 'Service Requests retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get service request entry by ID
   * GET /:id
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      const result = await this.getServiceRequestUseCase.execute(id);
      res.json({
        message: 'Service Request retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get service request entry by ticket number
   * GET /number/:number
   */
  getByNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { number } = req.params;
      const result = await this.getServiceRequestByNumberUseCase.execute(number);
      res.json({
        message: 'Service Request retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update service request entry
   * PUT /:id or PATCH /:id
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      const validatedData = await UpdateServiceRequestSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.updateServiceRequestUseCase.execute(
        id,
        validatedData as IUpdateServiceRequestInput,
      );
      res.json({
        message: 'Service Request updated successfully',
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
   * Get draft service requests
   * GET /drafts
   */
  getDrafts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getAllServiceRequestsUseCase.execute();
      const drafts = result.filter((sr) => sr.status === ServiceRequestStatus.DRAFT);
      res.json({
        message: 'Draft service requests retrieved successfully',
        data: drafts,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete service request entry
   * DELETE /:id
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      await this.deleteServiceRequestUseCase.execute(id);
      res.json({
        message: 'Service Request deleted successfully',
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
      const serviceRequestId = parseInt(req.params.id, 10);
      if (isNaN(serviceRequestId)) throw new BadRequestException('Invalid ID format');

      const validatedData = await CommentSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const result = await this.prisma.adminServiceRequestComment.create({
        data: {
          serviceRequestId,
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

      await this.prisma.adminServiceRequestActivity.create({
        data: {
          serviceRequestId,
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
      const serviceRequestId = parseInt(req.params.id, 10);
      if (isNaN(serviceRequestId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminServiceRequestComment.findMany({
        where: { serviceRequestId },
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
      const serviceRequestId = parseInt(req.params.id, 10);
      if (isNaN(serviceRequestId)) throw new BadRequestException('Invalid ID format');

      const validatedData = await TimeEntrySchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const result = await this.prisma.adminServiceRequestTimeEntry.create({
        data: {
          serviceRequestId,
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

      await this.prisma.adminServiceRequestActivity.create({
        data: {
          serviceRequestId,
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
      const serviceRequestId = parseInt(req.params.id, 10);
      if (isNaN(serviceRequestId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminServiceRequestTimeEntry.findMany({
        where: { serviceRequestId },
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
      const serviceRequestId = parseInt(req.params.id, 10);
      if (isNaN(serviceRequestId)) throw new BadRequestException('Invalid ID format');

      const validatedData = await ResolutionSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const result = await this.prisma.adminServiceRequestResolution.create({
        data: {
          serviceRequestId,
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

      await this.prisma.adminServiceRequestActivity.create({
        data: {
          serviceRequestId,
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
      const serviceRequestId = parseInt(req.params.id, 10);
      if (isNaN(serviceRequestId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminServiceRequestResolution.findMany({
        where: { serviceRequestId },
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
      const serviceRequestId = parseInt(req.params.id, 10);
      if (isNaN(serviceRequestId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminServiceRequestActivity.findMany({
        where: { serviceRequestId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ message: 'Activities retrieved successfully', data: results });
    } catch (error) {
      next(error);
    }
  };
}
