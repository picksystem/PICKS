import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@picks/config';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

export class HttpException extends Error implements ApiError {
  statusCode: number;
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request', errors?: any[]) {
    super(StatusCodes.BAD_REQUEST, message, errors);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(StatusCodes.UNAUTHORIZED, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(StatusCodes.FORBIDDEN, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not Found') {
    super(StatusCodes.NOT_FOUND, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict') {
    super(StatusCodes.CONFLICT, message);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Internal Server Error') {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message);
  }
}

/**
 * Global Error Handler Middleware
 * Catches all errors and formats them consistently
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function errorHandler(err: ApiError, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  // Log error details for debugging
  logger.error({
    statusCode,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Format error response according to standard API response structure
  res.status(statusCode).json({
    status: 'error',
    message,
    errors: err.errors || undefined,
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  });
}

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 * @param req - Express request
 * @param res - Express response
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  });
}
