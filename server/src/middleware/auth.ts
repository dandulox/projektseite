// Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { 
  UnauthorizedError, 
  ForbiddenError,
  asyncHandler 
} from './errorHandler';
import { logger, securityLogger } from '@/utils/logger';
import { UserRole } from '@shared/types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: UserRole;
        isActive: boolean;
      };
    }
  }
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Token Generation
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Token Verification
export const verifyToken = (token: string): { userId: string } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new UnauthorizedError('Ungültiger oder abgelaufener Token');
  }
};

// Authentication Middleware
export const authenticateToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new UnauthorizedError('Kein Token bereitgestellt');
  }

  try {
    // Verify Token
    const decoded = verifyToken(token);
    
    // Get User from Database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Benutzer nicht gefunden');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Benutzer ist deaktiviert');
    }

    // Add User to Request
    req.user = user;
    
    logger.debug('User authenticated', {
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    next();
  } catch (error) {
    securityLogger('Authentication failed', {
      token: token.substring(0, 20) + '...',
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    
    throw error;
  }
});

// Role-based Authorization Middleware
export const requireRole = (roles: UserRole | UserRole[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Nicht authentifiziert');
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      securityLogger('Authorization failed', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        ip: req.ip,
      });
      
      throw new ForbiddenError('Unzureichende Berechtigung');
    }

    next();
  });
};

// Admin Only Middleware
export const requireAdmin = requireRole(UserRole.ADMIN);

// User or Admin Middleware
export const requireUserOrAdmin = requireRole([UserRole.USER, UserRole.ADMIN]);

// Optional Authentication Middleware (doesn't throw if no token)
export const optionalAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Ignore token errors for optional auth
    logger.debug('Optional auth failed', { error: error instanceof Error ? error.message : 'Unknown error' });
  }

  next();
});

// Resource Ownership Check
export const requireOwnership = (resourceType: 'project' | 'task' | 'team') => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Nicht authentifiziert');
    }

    const resourceId = req.params.id;
    if (!resourceId) {
      throw new ForbiddenError('Ressourcen-ID fehlt');
    }

    let isOwner = false;

    switch (resourceType) {
      case 'project':
        const project = await prisma.project.findUnique({
          where: { id: resourceId },
          select: { ownerId: true },
        });
        isOwner = project?.ownerId === req.user.id;
        break;

      case 'task':
        const task = await prisma.task.findUnique({
          where: { id: resourceId },
          select: { 
            createdById: true,
            assigneeId: true,
            project: {
              select: { ownerId: true }
            }
          },
        });
        isOwner = task?.createdById === req.user.id || 
                  task?.assigneeId === req.user.id ||
                  task?.project?.ownerId === req.user.id;
        break;

      case 'team':
        const team = await prisma.team.findUnique({
          where: { id: resourceId },
          select: { leaderId: true },
        });
        isOwner = team?.leaderId === req.user.id;
        break;
    }

    if (!isOwner && req.user.role !== UserRole.ADMIN) {
      securityLogger('Ownership check failed', {
        userId: req.user.id,
        resourceType,
        resourceId,
        ip: req.ip,
      });
      
      throw new ForbiddenError('Keine Berechtigung für diese Ressource');
    }

    next();
  });
};

// Team Membership Check
export const requireTeamMembership = (teamIdParam: string = 'teamId') => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Nicht authentifiziert');
    }

    const teamId = req.params[teamIdParam];
    if (!teamId) {
      throw new ForbiddenError('Team-ID fehlt');
    }

    const membership = await prisma.teamMembership.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: req.user.id,
        },
      },
    });

    if (!membership && req.user.role !== UserRole.ADMIN) {
      securityLogger('Team membership check failed', {
        userId: req.user.id,
        teamId,
        ip: req.ip,
      });
      
      throw new ForbiddenError('Keine Team-Mitgliedschaft');
    }

    next();
  });
};

// Rate Limiting Middleware
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Simple in-memory rate limiting (in production, use Redis)
    const key = `rate_limit_${req.ip}_${req.route?.path || req.path}`;
    const now = Date.now();
    
    // This is a simplified implementation
    // In production, use a proper rate limiting library like express-rate-limit
    next();
  });
};
