// Einheitlicher Error-Contract für das gesamte System
// Verhindert Inkonsistenzen in Error-Responses

// Error-Codes
const ERROR_CODES = {
  // Validation Errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication Errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Authorization Errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Not Found Errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  
  // Conflict Errors (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_EXISTS: 'RESOURCE_EXISTS',
  
  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // Server Errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Custom Business Logic Errors
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  INVALID_WORKFLOW: 'INVALID_WORKFLOW',
  DEPENDENCY_NOT_MET: 'DEPENDENCY_NOT_MET'
};

// Statuscode-Mapping
const STATUS_CODE_MAP = {
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.INVALID_INPUT]: 400,
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 400,
  [ERROR_CODES.INVALID_FORMAT]: 400,
  
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.INVALID_TOKEN]: 401,
  [ERROR_CODES.TOKEN_EXPIRED]: 401,
  
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 403,
  [ERROR_CODES.ACCESS_DENIED]: 403,
  
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 404,
  [ERROR_CODES.USER_NOT_FOUND]: 404,
  [ERROR_CODES.PROJECT_NOT_FOUND]: 404,
  [ERROR_CODES.TASK_NOT_FOUND]: 404,
  
  [ERROR_CODES.CONFLICT]: 409,
  [ERROR_CODES.DUPLICATE_ENTRY]: 409,
  [ERROR_CODES.RESOURCE_EXISTS]: 409,
  
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  [ERROR_CODES.TOO_MANY_REQUESTS]: 429,
  
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.DATABASE_ERROR]: 500,
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 500,
  
  [ERROR_CODES.INVALID_STATUS_TRANSITION]: 422,
  [ERROR_CODES.INVALID_WORKFLOW]: 422,
  [ERROR_CODES.DEPENDENCY_NOT_MET]: 422
};

// Benutzerfreundliche Nachrichten
const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Die eingegebenen Daten sind ungültig',
  [ERROR_CODES.INVALID_INPUT]: 'Ungültige Eingabe',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Pflichtfeld fehlt',
  [ERROR_CODES.INVALID_FORMAT]: 'Ungültiges Format',
  
  [ERROR_CODES.UNAUTHORIZED]: 'Nicht autorisiert',
  [ERROR_CODES.INVALID_TOKEN]: 'Ungültiger Token',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Token abgelaufen',
  
  [ERROR_CODES.FORBIDDEN]: 'Zugriff verweigert',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'Unzureichende Berechtigung',
  [ERROR_CODES.ACCESS_DENIED]: 'Zugriff verweigert',
  
  [ERROR_CODES.NOT_FOUND]: 'Nicht gefunden',
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Ressource nicht gefunden',
  [ERROR_CODES.USER_NOT_FOUND]: 'Benutzer nicht gefunden',
  [ERROR_CODES.PROJECT_NOT_FOUND]: 'Projekt nicht gefunden',
  [ERROR_CODES.TASK_NOT_FOUND]: 'Aufgabe nicht gefunden',
  
  [ERROR_CODES.CONFLICT]: 'Konflikt',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'Eintrag bereits vorhanden',
  [ERROR_CODES.RESOURCE_EXISTS]: 'Ressource existiert bereits',
  
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Zu viele Anfragen',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Rate Limit überschritten',
  
  [ERROR_CODES.INTERNAL_ERROR]: 'Interner Serverfehler',
  [ERROR_CODES.DATABASE_ERROR]: 'Datenbankfehler',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'Externer Service-Fehler',
  
  [ERROR_CODES.INVALID_STATUS_TRANSITION]: 'Ungültiger Status-Übergang',
  [ERROR_CODES.INVALID_WORKFLOW]: 'Ungültiger Workflow',
  [ERROR_CODES.DEPENDENCY_NOT_MET]: 'Abhängigkeit nicht erfüllt'
};

// Error-Response-Struktur
class ApiError extends Error {
  constructor(code, message, details = null, statusCode = null) {
    super(message || ERROR_MESSAGES[code] || 'Unbekannter Fehler');
    this.code = code;
    this.details = details;
    this.statusCode = statusCode || STATUS_CODE_MAP[code] || 500;
    this.timestamp = new Date().toISOString();
    this.name = 'ApiError';
  }
}

// Error-Response erstellen
const createErrorResponse = (error, code = null, details = null) => {
  if (error instanceof ApiError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp
    };
  }
  
  const errorCode = code || ERROR_CODES.INTERNAL_ERROR;
  const statusCode = STATUS_CODE_MAP[errorCode] || 500;
  
  return {
    error: error.message || ERROR_MESSAGES[errorCode] || 'Unbekannter Fehler',
    code: errorCode,
    details: details || (process.env.NODE_ENV === 'development' ? error.stack : null),
    timestamp: new Date().toISOString()
  };
};

// Success-Response erstellen
const createSuccessResponse = (data, message = null, meta = null) => {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  if (message) response.message = message;
  if (meta) response.meta = meta;
  
  return response;
};

// Validation-Error erstellen
const createValidationError = (field, message, value = null) => {
  return new ApiError(
    ERROR_CODES.VALIDATION_ERROR,
    `Validierungsfehler: ${message}`,
    { field, value },
    STATUS_CODE_MAP[ERROR_CODES.VALIDATION_ERROR]
  );
};

// Not-Found-Error erstellen
const createNotFoundError = (resource, id = null) => {
  const code = resource === 'user' ? ERROR_CODES.USER_NOT_FOUND :
              resource === 'project' ? ERROR_CODES.PROJECT_NOT_FOUND :
              resource === 'task' ? ERROR_CODES.TASK_NOT_FOUND :
              ERROR_CODES.RESOURCE_NOT_FOUND;
  
  return new ApiError(
    code,
    `${resource} nicht gefunden${id ? ` (ID: ${id})` : ''}`,
    { resource, id },
    STATUS_CODE_MAP[code]
  );
};

// Permission-Error erstellen
const createPermissionError = (action, resource) => {
  return new ApiError(
    ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    `Keine Berechtigung für ${action} auf ${resource}`,
    { action, resource },
    STATUS_CODE_MAP[ERROR_CODES.INSUFFICIENT_PERMISSIONS]
  );
};

module.exports = {
  ERROR_CODES,
  STATUS_CODE_MAP,
  ERROR_MESSAGES,
  ApiError,
  createErrorResponse,
  createSuccessResponse,
  createValidationError,
  createNotFoundError,
  createPermissionError
};
