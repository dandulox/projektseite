// Validation Middleware
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { 
  ValidationError,
  asyncHandler 
} from './errorHandler';
import { logger } from '@/utils/logger';

// Validation Middleware Factory
export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate Body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate Query
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate Params
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Validation failed', {
          errors: validationErrors,
          body: req.body,
          query: req.query,
          params: req.params,
          userId: req.user?.id,
        });

        throw new ValidationError(
          'Validierungsfehler',
          undefined,
          validationErrors
        );
      }
      
      throw error;
    }
  });
};

// Common Validation Schemas
export const commonSchemas = {
  id: z.string().cuid('Ungültige ID'),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
  sort: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
  search: z.object({
    search: z.string().max(100).optional(),
  }),
};

// Validation Helper Functions
export const validateId = (id: string): string => {
  try {
    return z.string().cuid().parse(id);
  } catch {
    throw new ValidationError('Ungültige ID', 'id');
  }
};

export const validatePagination = (query: any) => {
  try {
    return commonSchemas.pagination.parse(query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Ungültige Paginierungsparameter',
        undefined,
        error.errors
      );
    }
    throw error;
  }
};

export const validateSort = (query: any) => {
  try {
    return commonSchemas.sort.parse(query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Ungültige Sortierungsparameter',
        undefined,
        error.errors
      );
    }
    throw error;
  }
};

// File Upload Validation
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
} = {}) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [], required = false } = options;
    
    if (!req.file && required) {
      throw new ValidationError('Datei ist erforderlich', 'file');
    }

    if (req.file) {
      // Check file size
      if (req.file.size > maxSize) {
        throw new ValidationError(
          `Datei ist zu groß. Maximum: ${Math.round(maxSize / 1024 / 1024)}MB`,
          'file'
        );
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
        throw new ValidationError(
          `Ungültiger Dateityp. Erlaubt: ${allowedTypes.join(', ')}`,
          'file'
        );
      }
    }

    next();
  });
};

// Sanitization Middleware
export const sanitizeInput = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS protection
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  
  next();
});

// Content Type Validation
export const validateContentType = (allowedTypes: string[] = ['application/json']) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type');
    
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
        throw new ValidationError(
          `Ungültiger Content-Type. Erlaubt: ${allowedTypes.join(', ')}`,
          'Content-Type'
        );
      }
    }
    
    next();
  });
};

// Request Size Validation
export const validateRequestSize = (maxSize: number = 1024 * 1024) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSize) {
      throw new ValidationError(
        `Anfrage ist zu groß. Maximum: ${Math.round(maxSize / 1024)}KB`,
        'Content-Length'
      );
    }
    
    next();
  });
};
