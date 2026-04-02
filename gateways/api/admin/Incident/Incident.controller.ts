import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import { CreateIncidentSchema, DraftIncidentSchema, UpdateIncidentSchema } from './Incident.dto';
import { BadRequestException } from '@serviceops/middleware';
import {
  IncidentStatus,
  IUpdateIncidentInput,
  CommentSchema,
  TimeEntrySchema,
  ResolutionSchema,
} from '@serviceops/interfaces';
import {
  CreateIncidentUseCase,
  GetIncidentUseCase,
  GetIncidentByNumberUseCase,
  GetAllIncidentsUseCase,
  UpdateIncidentUseCase,
  DeleteIncidentUseCase,
  CleanupExpiredDraftsUseCase,
} from '@serviceops/core/use-cases';
import { PrismaClient } from '@prisma/client';

/**
 * Controller for AdminIncident endpoints
 * Handles HTTP request/response and delegates to use cases
 */
export class IncidentController {
  constructor(
    private readonly createIncidentUseCase: CreateIncidentUseCase,
    private readonly getIncidentUseCase: GetIncidentUseCase,
    private readonly getIncidentByNumberUseCase: GetIncidentByNumberUseCase,
    private readonly getAllIncidentsUseCase: GetAllIncidentsUseCase,
    private readonly updateIncidentUseCase: UpdateIncidentUseCase,
    private readonly deleteIncidentUseCase: DeleteIncidentUseCase,
    private readonly cleanupExpiredDraftsUseCase: CleanupExpiredDraftsUseCase,
    private readonly prisma: PrismaClient,
  ) {}

  /**
   * Create a new incident entry
   * POST /
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isDraft = req.body.status === IncidentStatus.DRAFT;
      const schema = isDraft ? DraftIncidentSchema : CreateIncidentSchema;
      const validatedData = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.createIncidentUseCase.execute(validatedData);
      res.status(201).json({
        message: isDraft ? 'Draft saved successfully' : 'Incident created successfully',
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
   * Get all incident entries
   * GET /
   */
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getAllIncidentsUseCase.execute();
      res.json({
        message: 'Incidents retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get incident entry by ID
   * GET /:id
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      const result = await this.getIncidentUseCase.execute(id);
      res.json({
        message: 'Incident retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get incident entry by ticket number
   * GET /number/:number
   */
  getByNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { number } = req.params;
      const result = await this.getIncidentByNumberUseCase.execute(number);
      res.json({
        message: 'Incident retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update incident entry
   * PUT /:id or PATCH /:id
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      const validatedData = await UpdateIncidentSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.updateIncidentUseCase.execute(
        id,
        validatedData as IUpdateIncidentInput,
      );
      res.json({
        message: 'Incident updated successfully',
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
   * Get draft incidents
   * GET /drafts
   */
  getDrafts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getAllIncidentsUseCase.execute();
      const drafts = result.filter((i) => i.status === IncidentStatus.DRAFT);
      res.json({
        message: 'Draft incidents retrieved successfully',
        data: drafts,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete incident entry
   * DELETE /:id
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID format');
      }
      await this.deleteIncidentUseCase.execute(id);
      res.json({
        message: 'Incident deleted successfully',
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
      const incidentId = parseInt(req.params.id, 10);
      if (isNaN(incidentId)) throw new BadRequestException('Invalid ID format');

      const validatedData = await CommentSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const result = await this.prisma.adminIncidentComment.create({
        data: {
          incidentId,
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

      await this.prisma.adminIncidentActivity.create({
        data: {
          incidentId,
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
      const incidentId = parseInt(req.params.id, 10);
      if (isNaN(incidentId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminIncidentComment.findMany({
        where: { incidentId },
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
      const incidentId = parseInt(req.params.id, 10);
      if (isNaN(incidentId)) throw new BadRequestException('Invalid ID format');

      const validatedData = await TimeEntrySchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const result = await this.prisma.adminIncidentTimeEntry.create({
        data: {
          incidentId,
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

      await this.prisma.adminIncidentActivity.create({
        data: {
          incidentId,
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
      const incidentId = parseInt(req.params.id, 10);
      if (isNaN(incidentId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminIncidentTimeEntry.findMany({
        where: { incidentId },
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
      const incidentId = parseInt(req.params.id, 10);
      if (isNaN(incidentId)) throw new BadRequestException('Invalid ID format');

      const validatedData = await ResolutionSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const result = await this.prisma.adminIncidentResolution.create({
        data: {
          incidentId,
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

      await this.prisma.adminIncidentActivity.create({
        data: {
          incidentId,
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
      const incidentId = parseInt(req.params.id, 10);
      if (isNaN(incidentId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminIncidentResolution.findMany({
        where: { incidentId },
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
      const incidentId = parseInt(req.params.id, 10);
      if (isNaN(incidentId)) throw new BadRequestException('Invalid ID format');

      const results = await this.prisma.adminIncidentActivity.findMany({
        where: { incidentId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ message: 'Activities retrieved successfully', data: results });
    } catch (error) {
      next(error);
    }
  };
}
