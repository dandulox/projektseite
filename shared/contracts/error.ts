// Error Contract - Einheitliche Fehlerbehandlung
// Wird von Frontend und Backend verwendet

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string; // Für Validierungsfehler
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta: {
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Error Codes - Einheitlich für Frontend und Backend
export const ERROR_CODES = {
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  BAD_REQUEST: 'BAD_REQUEST',
  
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Resource Errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // Business Logic Errors
  INVALID_OPERATION: 'INVALID_OPERATION',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  DEPENDENCY_CONFLICT: 'DEPENDENCY_CONFLICT',
  
  // System Errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

// Error Factory Functions
export class ApiErrorFactory {
  static validationError(message: string, field?: string, details?: Record<string, any>): ApiError {
    return {
      code: ERROR_CODES.VALIDATION_ERROR,
      message,
      field,
      details,
    };
  }

  static notFound(resource: string, id?: string): ApiError {
    return {
      code: ERROR_CODES.NOT_FOUND,
      message: `${resource}${id ? ` mit ID ${id}` : ''} nicht gefunden`,
      details: { resource, id },
    };
  }

  static unauthorized(message: string = 'Nicht autorisiert'): ApiError {
    return {
      code: ERROR_CODES.UNAUTHORIZED,
      message,
    };
  }

  static forbidden(message: string = 'Zugriff verweigert'): ApiError {
    return {
      code: ERROR_CODES.FORBIDDEN,
      message,
    };
  }

  static conflict(message: string, details?: Record<string, any>): ApiError {
    return {
      code: ERROR_CODES.CONFLICT,
      message,
      details,
    };
  }

  static rateLimitExceeded(retryAfter?: number): ApiError {
    return {
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
      details: retryAfter ? { retryAfter } : undefined,
    };
  }

  static internalError(message: string = 'Ein unerwarteter Fehler ist aufgetreten'): ApiError {
    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message,
    };
  }
}

// Response Factory Functions
export class ApiResponseFactory {
  static success<T>(data: T, meta?: Partial<ApiResponse<T>['meta']>): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        ...meta,
      },
    };
  }

  static error(error: ApiError, meta?: Partial<ApiResponse['meta']>): ApiResponse {
    return {
      success: false,
      error,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        ...meta,
      },
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    meta?: Partial<ApiResponse<T[]>['meta']>
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        pagination,
        ...meta,
      },
    };
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Utility Functions
export function isApiError(error: any): error is ApiError {
  return error && typeof error === 'object' && 'code' in error && 'message' in error;
}

export function isApiResponse<T>(response: any): response is ApiResponse<T> {
  return response && typeof response === 'object' && 'success' in response && 'meta' in response;
}

// Error Message Mappings (für i18n)
export const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Validierungsfehler',
  [ERROR_CODES.UNAUTHORIZED]: 'Nicht autorisiert',
  [ERROR_CODES.FORBIDDEN]: 'Zugriff verweigert',
  [ERROR_CODES.NOT_FOUND]: 'Nicht gefunden',
  [ERROR_CODES.CONFLICT]: 'Konflikt',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Zu viele Anfragen',
  [ERROR_CODES.INTERNAL_ERROR]: 'Interner Serverfehler',
} as const;
