import { Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import { AuthRequest, BadRequestException } from '@serviceops/middleware';
import { TimesheetService, currentWeekStart } from './Timesheet.service';
import {
  CreateTimesheetLineSchema,
  UpdateTimesheetLineSchema,
  SaveTimesheetSchema,
  GetTimesheetParamsSchema,
  GetTimesheetParamsDto,
  SaveTimesheetDto,
  UpdateTimesheetLineDto,
} from './Timesheet.dto';

/**
 * Controller for the My Timesheet endpoints.
 * Handles HTTP request/response and delegates to the service.
 */
export class TimesheetController {
  constructor(private readonly service: TimesheetService) {}

  private weekStartOf(req: AuthRequest): Promise<string> {
    return GetTimesheetParamsSchema.validate(
      { weekStart: req.query.weekStart },
      { stripUnknown: true },
    ).then((params: GetTimesheetParamsDto) => params.weekStart ?? currentWeekStart());
  }

  /** GET /api/user/timesheet?weekStart=YYYY-MM-DD */
  get = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStart = await this.weekStartOf(req);
      const result = await this.service.getForWeek(req.user!.id, { weekStart });
      res.json({ message: 'Timesheet retrieved successfully', data: result });
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/user/timesheet/save?weekStart=YYYY-MM-DD */
  save = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStart = await this.weekStartOf(req);
      const validated = await SaveTimesheetSchema.validate(
        { ...req.body, weekStart },
        { abortEarly: false, stripUnknown: true },
      );
      const data: SaveTimesheetDto = {
        ...validated,
        weekStart,
        externalNote: validated.externalNote ?? null,
        internalNote: validated.internalNote ?? null,
      };
      const result = await this.service.save(req.user!.id, data);
      res.json({ message: 'Timesheet saved successfully', data: result });
    } catch (error) {
      this.handle(error, next);
    }
  };

  /** POST /api/user/timesheet/submit?weekStart=YYYY-MM-DD */
  submit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStart = await this.weekStartOf(req);
      const result = await this.service.submit(req.user!.id, weekStart);
      res.json({ message: 'Timesheet submitted for approval', data: result });
    } catch (error) {
      this.handle(error, next);
    }
  };

  /** POST /api/user/timesheet/lines?weekStart=YYYY-MM-DD */
  addLine = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStart = await this.weekStartOf(req);
      const validated = await CreateTimesheetLineSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.service.addLine(req.user!.id, weekStart, validated);
      res.status(201).json({ message: 'Timesheet line created', data: result });
    } catch (error) {
      this.handle(error, next);
    }
  };

  /** PATCH /api/user/timesheet/lines/:id?weekStart=YYYY-MM-DD */
  updateLine = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStart = await this.weekStartOf(req);
      const validated = await UpdateTimesheetLineSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const data: UpdateTimesheetLineDto = {
        ...validated,
        project: validated.project ?? null,
      };
      const result = await this.service.updateLine(req.user!.id, weekStart, req.params.id, data);
      res.json({ message: 'Timesheet line updated', data: result });
    } catch (error) {
      this.handle(error, next);
    }
  };

  /** DELETE /api/user/timesheet/lines/:id?weekStart=YYYY-MM-DD */
  removeLine = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const weekStart = await this.weekStartOf(req);
      await this.service.removeLine(req.user!.id, weekStart, req.params.id);
      res.json({ message: 'Timesheet line removed' });
    } catch (error) {
      this.handle(error, next);
    }
  };

  /** GET /api/user/timesheet/approvals */
  approvalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.approvalHistory(req.user!.id);
      res.json({ message: 'Approval history retrieved', data: result });
    } catch (error) {
      next(error);
    }
  };

  private handle(error: unknown, next: NextFunction): void {
    if (error instanceof ValidationError) {
      const errors = error.inner.map((err) => ({
        path: err.path,
        message: err.message,
      }));
      next(new BadRequestException('Validation failed', errors));
      return;
    }
    next(error);
  }
}
