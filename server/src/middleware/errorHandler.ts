// Error Handler Middleware - Centralized error handling
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponseFactory, ERROR_CODES } from '@shared/contracts/error';
import { logger } from '@/utils/logger';

// Custom Error Classes
export class ApiError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(statusCode: number, errorCode: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    super(404, ERROR_CODES.NOT_FOUND, `${resource} not found${id ? ` with ID: ${id}` : ''}`);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(401, ERROR_CODES.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(403, ERROR_CODES.FORBIDDEN, message);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(422, ERROR_CODES.VALIDATION_ERROR, message, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(409, ERROR_CODES.CONFLICT, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request') {
    super(400, ERROR_CODES.BAD_REQUEST, message);
  }
}

// Async Handler Wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Centralized Error Handling Middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let errorResponse = {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
  };

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorResponse = {
      code: err.errorCode,
      message: err.message,
      details: err.details,
    };
  } else if (err instanceof ZodError) {
    statusCode = 422;
    errorResponse = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: err.errors.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  } else {
    // Log unexpected errors
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
    });
  }

  res.status(statusCode).json(
    ApiResponseFactory.error(
      errorResponse.code as any,
      errorResponse.message,
      errorResponse.details,
      statusCode,
      { requestId: req.headers['x-request-id'] as string || 'N/A' }
    )
  );
};

// 404 Not Found Handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(
    ApiResponseFactory.error(
      ERROR_CODES.NOT_FOUND,
      `Route ${req.originalUrl} not found`,
      undefined,
      404,
      { requestId: req.headers['x-request-id'] as string || 'N/A' }
    )
  );
};