// Verbessertes Error-Handling für API-Routen mit einheitlichem Error-Contract
const { 
  createErrorResponse, 
  ApiError, 
  ERROR_CODES, 
  STATUS_CODE_MAP 
} = require('../utils/errorContract');

const errorHandler = (err, req, res, next) => {
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // ApiError (unserer eigener Error-Typ)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(createErrorResponse(err));
  }

  // Datenbankfehler
  if (err.code && err.code.startsWith('23')) {
    const errorResponse = createErrorResponse(
      err, 
      ERROR_CODES.DATABASE_ERROR, 
      'Ungültige Daten oder Verletzung von Constraints'
    );
    return res.status(STATUS_CODE_MAP[ERROR_CODES.DATABASE_ERROR]).json(errorResponse);
  }

  // Verbindungsfehler
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    const errorResponse = createErrorResponse(
      err, 
      ERROR_CODES.EXTERNAL_SERVICE_ERROR, 
      'Datenbankverbindung fehlgeschlagen'
    );
    return res.status(STATUS_CODE_MAP[ERROR_CODES.EXTERNAL_SERVICE_ERROR]).json(errorResponse);
  }

  // Syntax-Fehler
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const errorResponse = createErrorResponse(
      err, 
      ERROR_CODES.INVALID_FORMAT, 
      'Request-Body enthält ungültiges JSON'
    );
    return res.status(STATUS_CODE_MAP[ERROR_CODES.INVALID_FORMAT]).json(errorResponse);
  }

  // JWT-Fehler
  if (err.name === 'JsonWebTokenError') {
    const errorResponse = createErrorResponse(
      err, 
      ERROR_CODES.INVALID_TOKEN, 
      'Ungültiger JWT-Token'
    );
    return res.status(STATUS_CODE_MAP[ERROR_CODES.INVALID_TOKEN]).json(errorResponse);
  }

  if (err.name === 'TokenExpiredError') {
    const errorResponse = createErrorResponse(
      err, 
      ERROR_CODES.TOKEN_EXPIRED, 
      'JWT-Token ist abgelaufen'
    );
    return res.status(STATUS_CODE_MAP[ERROR_CODES.TOKEN_EXPIRED]).json(errorResponse);
  }

  // Standard-Fehler
  const errorResponse = createErrorResponse(
    err, 
    ERROR_CODES.INTERNAL_ERROR, 
    'Interner Serverfehler'
  );
  res.status(STATUS_CODE_MAP[ERROR_CODES.INTERNAL_ERROR]).json(errorResponse);
};

// Async Error Wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler
};
