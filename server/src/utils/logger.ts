// Logger Configuration mit Winston
import winston from 'winston';
import path from 'path';

// Log Levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log Colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Log Format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Transports
const transports = [
  // Console Transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  
  // File Transports
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create Logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
  defaultMeta: {
    service: 'projektseite-api',
    version: '3.0.0',
  },
});

// Request Logger Middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });
  
  next();
};

// Error Logger
export const errorLogger = (error: Error, req?: any) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    url: req?.url,
    method: req?.method,
    userId: req?.user?.id,
  });
};

// Structured Logging Helper
export const logWithContext = (level: string, message: string, context: any = {}) => {
  logger.log(level, message, {
    ...context,
    timestamp: new Date().toISOString(),
  });
};

// Performance Logger
export const performanceLogger = (operation: string, duration: number, context: any = {}) => {
  logger.info(`Performance: ${operation}`, {
    operation,
    duration: `${duration}ms`,
    ...context,
  });
};

// Security Logger
export const securityLogger = (event: string, details: any = {}) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};
