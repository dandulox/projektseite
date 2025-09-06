// Validation Middleware - Request validation with Zod
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

// Validate request body, query, and params
export const validateRequest = (schema: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate params
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error', { 
          errors: error.errors, 
          path: req.path,
          method: req.method 
        });
        next(new ValidationError('Request validation failed', error.errors));
      } else {
        logger.error('Unexpected validation error', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          path: req.path 
        });
        next(error);
      }
    }
  };
};

// Validate content type
export const validateContentType = (expectedType: string = 'application/json') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }

    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes(expectedType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: `Expected content type: ${expectedType}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'N/A',
        },
      });
    }

    next();
  };
};

// Validate request size
export const validateRequestSize = (maxSize: number = 1024 * 1024) => { // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `Request size exceeds maximum allowed size of ${maxSize} bytes`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'N/A',
        },
      });
    }

    next();
  };
};