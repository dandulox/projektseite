// Auth Routes
import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { 
  loginSchema, 
  createUserSchema 
} from '@shared/contracts/validation';
import { z } from 'zod';

const router = Router();

// POST /api/auth/login - User login
router.post('/login',
  validateRequest({ body: loginSchema }),
  authController.login
);

// POST /api/auth/register - User registration
router.post('/register',
  validateRequest({ body: createUserSchema }),
  authController.register
);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh',
  validateRequest({ 
    body: z.object({
      refreshToken: z.string().min(1, 'Refresh token ist erforderlich'),
    })
  }),
  authController.refreshToken
);

// POST /api/auth/logout - User logout
router.post('/logout',
  authenticateToken,
  authController.logout
);

// GET /api/auth/me - Get current user
router.get('/me',
  authenticateToken,
  authController.getCurrentUser
);

// PATCH /api/auth/change-password - Change password
router.patch('/change-password',
  authenticateToken,
  validateRequest({
    body: z.object({
      currentPassword: z.string().min(1, 'Aktuelles Passwort ist erforderlich'),
      newPassword: z.string().min(8, 'Neues Passwort muss mindestens 8 Zeichen lang sein'),
    })
  }),
  authController.changePassword
);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password',
  validateRequest({
    body: z.object({
      email: z.string().email('Ungültige E-Mail-Adresse'),
    })
  }),
  authController.forgotPassword
);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password',
  validateRequest({
    body: z.object({
      token: z.string().min(1, 'Reset token ist erforderlich'),
      newPassword: z.string().min(8, 'Neues Passwort muss mindestens 8 Zeichen lang sein'),
    })
  }),
  authController.resetPassword
);

export { router as authRoutes };
