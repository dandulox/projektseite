// Admin Routes
import { Router } from 'express';
import { adminController } from '@/controllers/admin.controller';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { apiDebugSchema } from '@shared/contracts/validation';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = Router();

// Apply authentication and admin role to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Rate limiting for admin routes (more restrictive)
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window for admin
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Zu viele Admin-Anfragen. Bitte warten Sie einen Moment.',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: 'admin-rate-limit',
    },
  },
});

router.use(adminRateLimit);

// GET /api/admin/health - System health check
router.get('/health',
  adminController.getSystemHealth
);

// GET /api/admin/stats - System statistics
router.get('/stats',
  adminController.getSystemStats
);

// Database routes
router.get('/db/status',
  adminController.getDatabaseStatus
);

router.get('/db/tables',
  adminController.getDatabaseTables
);

router.get('/db/tables/:tableName',
  validateRequest({ 
    params: z.object({
      tableName: z.string().min(1, 'Tabellenname ist erforderlich'),
    })
  }),
  adminController.getTableInfo
);

// API debugging (with additional rate limiting)
const apiDebugRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 API debug requests per 5 minutes
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Zu viele API-Debug-Anfragen. Bitte warten Sie einen Moment.',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: 'api-debug-rate-limit',
    },
  },
});

router.post('/api-debug',
  apiDebugRateLimit,
  validateRequest({ body: apiDebugSchema }),
  adminController.performApiDebug
);

// User management routes
router.get('/users',
  validateRequest({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
      role: z.string().optional(),
      isActive: z.coerce.boolean().optional(),
    })
  }),
  adminController.getAllUsers
);

router.patch('/users/:id/status',
  validateRequest({
    params: z.object({
      id: z.string().cuid('Ungültige Benutzer-ID'),
    }),
    body: z.object({
      isActive: z.boolean(),
    })
  }),
  adminController.updateUserStatus
);

// System logs
router.get('/logs',
  validateRequest({
    query: z.object({
      level: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(1000).default(100),
      since: z.string().datetime().optional(),
    })
  }),
  adminController.getSystemLogs
);

// System cleanup
router.post('/cleanup',
  validateRequest({
    body: z.object({
      type: z.enum(['expired_tokens', 'old_logs', 'temp_files']),
    })
  }),
  adminController.performSystemCleanup
);

export { router as adminRoutes };
