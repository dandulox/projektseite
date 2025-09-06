// Main Server - Express Application
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';

// Load environment variables
config();

// Import middleware
import { requestLogger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { validateContentType, validateRequestSize } from '@/middleware/validation';

// Import routes
import { taskRoutes } from '@/routes/task.routes';
import { projectRoutes } from '@/routes/project.routes';
import { authRoutes } from '@/routes/auth.routes';
import { adminRoutes } from '@/routes/admin.routes';
// import { userRoutes } from '@/routes/user.routes';

// Import database
import { prisma, checkDatabaseHealth } from '@/config/database';

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: 'rate-limit',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
});

app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Validation
app.use(validateContentType('application/json'));
app.use(validateRequestSize(10 * 1024 * 1024)); // 10MB

// Logging
app.use(requestLogger);

// Health Check
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      uptime: process.uptime(),
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/users', userRoutes);

// API Info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Projektseite API',
      version: '3.0.0',
      description: 'Moderne Projektmanagement-API',
      endpoints: {
        tasks: '/api/tasks',
        projects: '/api/projects',
        users: '/api/users',
        auth: '/api/auth',
        admin: '/api/admin',
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'api-info',
    },
  });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close database connection
    await prisma.$disconnect();
    console.log('Database connection closed.');
    
    // Close server
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start Server
const startServer = async () => {
  try {
    // Test database connection
    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.ok) {
      throw new Error(`Database connection failed: ${dbHealth.error}`);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`
🚀 Projektseite API Server v3.0.0
📡 Server läuft auf Port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health Check: http://localhost:${PORT}/health
🔧 API Info: http://localhost:${PORT}/api
📚 Database: ${dbHealth.ok ? '✅ Connected' : '❌ Failed'}
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
