import { Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import { AuthRequest, BadRequestException } from '@serviceops/middleware';
import { LeaveService } from './Leave.service';
import { CreateLeaveRequestSchema, CreateLeaveRequestDto } from './Leave.dto';

/**
 * Controller for the user's leave / time-off endpoints.
 * Handles HTTP request/response and delegates to the service.
 */
export class LeaveController {
  constructor(private readonly service: LeaveService) {}

  /** GET /api/user/leave/balance */
  balance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getBalances(req.user!.id);
      res.json({ message: 'Leave balance retrieved successfully', data: result });
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/user/leave/requests */
  requests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getRequests(req.user!.id);
      res.json({ message: 'Leave requests retrieved successfully', data: result });
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/user/leave/requests — submit a new leave request */
  submit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validated = await CreateLeaveRequestSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const data: CreateLeaveRequestDto = {
        ...validated,
        reason: validated.reason ?? null,
      };
      const result = await this.service.submit(req.user!.id, data);
      res.status(201).json({ message: 'Leave request submitted for approval', data: result });
    } catch (error) {
      this.handle(error, next);
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
