// Error Handler Middleware
import { Request, Response, NextFunction } from 'express';
import { 
  ApiResponseFactory, 
  ApiErrorFactory, 
  ERROR_CODES,
  type ApiResponse 
} from '@shared/contracts/error';
import { logger, errorLogger } from '@/utils/logger';
import { stringUtils } from '@shared/utils';

// Custom Error Class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation Error Class
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly details?: any;

  constructor(message: string, field?: string, details?: any) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR);
    this.field = field;
    this.details = details;
  }
}

// Not Found Error Class
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` mit ID ${id}` : ''} nicht gefunden`, 404, ERROR_CODES.NOT_FOUND);
  }
}

// Unauthorized Error Class
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Nicht autorisiert') {
    super(message, 401, ERROR_CODES.UNAUTHORIZED);
  }
}

// Forbidden Error Class
export class ForbiddenError extends AppError {
  constructor(message: string = 'Zugriff verweigert') {
    super(message, 403, ERROR_CODES.FORBIDDEN);
  }
}

// Conflict Error Class
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, ERROR_CODES.CONFLICT);
  }
}

// Rate Limit Error Class
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Zu viele Anfragen. Bitte warten Sie einen Moment.', 429, ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
}

// Error Handler Middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string || stringUtils.generateRequestId();
  
  // Log Error
  errorLogger(error, req);
  
  let statusCode = 500;
  let apiError = ApiErrorFactory.internalError();
  
  // Handle Different Error Types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    apiError = {
      code: error.code,
      message: error.message,
      field: error instanceof ValidationError ? error.field : undefined,
      details: error instanceof ValidationError ? error.details : undefined,
    };
  } else if (error.name === 'ValidationError') {
    // Zod Validation Error
    statusCode = 400;
    apiError = ApiErrorFactory.validationError(
      'Validierungsfehler',
      undefined,
      { originalError: error.message }
    );
  } else if (error.name === 'PrismaClientKnownRequestError') {
    // Prisma Database Error
    statusCode = 400;
    apiError = ApiErrorFactory.internalError('Datenbankfehler');
  } else if (error.name === 'JsonWebTokenError') {
    // JWT Error
    statusCode = 401;
    apiError = ApiErrorFactory.unauthorized('Ungültiger Token');
  } else if (error.name === 'TokenExpiredError') {
    // JWT Expired
    statusCode = 401;
    apiError = ApiErrorFactory.unauthorized('Token abgelaufen');
  } else if (error.name === 'MulterError') {
    // File Upload Error
    statusCode = 400;
    apiError = ApiErrorFactory.validationError('Datei-Upload-Fehler');
  }
  
  // Create Error Response
  const response: ApiResponse = ApiResponseFactory.error(apiError, {
    requestId,
  });
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error!.details = {
      ...response.error!.details,
      stack: error.stack,
    };
  }
  
  res.status(statusCode).json(response);
};

// 404 Handler
export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = req.headers['x-request-id'] as string || stringUtils.generateRequestId();
  
  const response: ApiResponse = ApiResponseFactory.error(
    ApiErrorFactory.notFound('Route', req.path),
    { requestId }
  );
  
  res.status(404).json(response);
};

// Async Error Wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error Factory Functions
export const createValidationError = (message: string, field?: string, details?: any) => {
  return new ValidationError(message, field, details);
};

export const createNotFoundError = (resource: string, id?: string) => {
  return new NotFoundError(resource, id);
};

export const createUnauthorizedError = (message?: string) => {
  return new UnauthorizedError(message);
};

export const createForbiddenError = (message?: string) => {
  return new ForbiddenError(message);
};

export const createConflictError = (message: string, details?: any) => {
  return new ConflictError(message, details);
};

export const createRateLimitError = (retryAfter?: number) => {
  return new RateLimitError(retryAfter);
};
