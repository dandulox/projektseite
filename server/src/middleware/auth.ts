// Auth Middleware - JWT Authentication und Authorization
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { UserRole } from '@shared/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        username: string;
        email: string;
      };
    }
  }
}

// Generate JWT token
export function generateToken(userId: string, expiresIn: string = '24h'): string {
  const payload = { userId };
  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

// Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const decoded = verifyToken(token);
    
    // In a real application, you would fetch user from database
    // For now, we'll create a mock user object
    req.user = {
      id: decoded.userId,
      role: 'USER' as UserRole, // This should come from database
      username: 'user', // This should come from database
      email: 'user@example.com', // This should come from database
    };

    next();
  } catch (error) {
    logger.error('Authentication failed', { error, path: req.path });
    next(error);
  }
};

// Authorization middleware for specific roles
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new ForbiddenError('Admin access required');
  }

  next();
};

// User or Admin middleware
export const requireUserOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }

  if (!['USER', 'ADMIN'].includes(req.user.role)) {
    throw new ForbiddenError('User or Admin access required');
  }

  next();
};