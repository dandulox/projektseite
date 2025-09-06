// Verbessertes Error-Handling für API-Routen
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Datenbankfehler
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      error: 'Datenbankfehler',
      message: 'Ungültige Daten oder Verletzung von Constraints',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Verbindungsfehler
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Service nicht verfügbar',
      message: 'Datenbankverbindung fehlgeschlagen',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Syntax-Fehler
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Ungültige JSON-Daten',
      message: 'Request-Body enthält ungültiges JSON'
    });
  }

  // Standard-Fehler
  res.status(err.status || 500).json({
    error: err.message || 'Interner Serverfehler',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
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
