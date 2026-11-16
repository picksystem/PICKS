import { Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import { AuthRequest, BadRequestException } from '@serviceops/middleware';
import { DashboardService } from './Dashboard.service';
import { DashboardQueryDto, DashboardQuerySchema } from './Dashboard.dto';

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  /** GET /api/user/dashboard */
  get = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query = await DashboardQuerySchema.validate(
        { month: req.query.month, year: req.query.year },
        { stripUnknown: true },
      ).then((v: DashboardQueryDto) => ({
        ...v,
        month: v.month || new Date().getMonth() + 1,
        year: v.year || new Date().getFullYear(),
      }));
      const result = await this.service.getSummary(query);
      res.json({ message: 'Dashboard data retrieved successfully', data: result });
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
