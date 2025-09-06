// User Repository
import { User, UserRole } from '@shared/types';
import { BaseRepository } from './base.repository';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('user');
  }

  // Find user by username
  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      
      logger.debug('User findByUsername', { username, found: !!user });
      return user;
    } catch (error) {
      logger.error('User findByUsername error', { username, error });
      throw error;
    }
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      logger.debug('User findByEmail', { email, found: !!user });
      return user;
    } catch (error) {
      logger.error('User findByEmail error', { email, error });
      throw error;
    }
  }

  // Find users by role
  async findByRole(role: UserRole): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: { role: role as any },
        orderBy: { createdAt: 'desc' },
      });
      
      logger.debug('User findByRole', { role, count: users.length });
      return users;
    } catch (error) {
      logger.error('User findByRole error', { role, error });
      throw error;
    }
  }

  // Find active users
  async findActive(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      
      logger.debug('User findActive', { count: users.length });
      return users;
    } catch (error) {
      logger.error('User findActive error', { error });
      throw error;
    }
  }

  // Search users
  async search(query: string, limit: number = 20): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        take: limit,
        orderBy: { username: 'asc' },
      });
      
      logger.debug('User search', { query, count: users.length });
      return users;
    } catch (error) {
      logger.error('User search error', { query, error });
      throw error;
    }
  }

  // Get user statistics
  async getStats(userId: string): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    teamCount: number;
  }> {
    try {
      const [
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        teamCount,
      ] = await Promise.all([
        prisma.project.count({
          where: { ownerId: userId },
        }),
        prisma.project.count({
          where: { 
            ownerId: userId,
            status: 'ACTIVE',
          },
        }),
        prisma.project.count({
          where: { 
            ownerId: userId,
            status: 'COMPLETED',
          },
        }),
        prisma.task.count({
          where: { assigneeId: userId },
        }),
        prisma.task.count({
          where: { 
            assigneeId: userId,
            status: 'COMPLETED',
          },
        }),
        prisma.task.count({
          where: { 
            assigneeId: userId,
            dueDate: { lt: new Date() },
            status: { not: 'COMPLETED' },
          },
        }),
        prisma.teamMembership.count({
          where: { userId },
        }),
      ]);

      const stats = {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        teamCount,
      };

      logger.debug('User getStats', { userId, stats });
      return stats;
    } catch (error) {
      logger.error('User getStats error', { userId, error });
      throw error;
    }
  }

  // Update user last login
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() },
      });
      
      logger.debug('User updateLastLogin', { userId });
    } catch (error) {
      logger.error('User updateLastLogin error', { userId, error });
      throw error;
    }
  }

  // Check if username exists
  async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    try {
      const count = await prisma.user.count({
        where: {
          username,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });
      
      return count > 0;
    } catch (error) {
      logger.error('User usernameExists error', { username, excludeId, error });
      throw error;
    }
  }

  // Check if email exists
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const count = await prisma.user.count({
        where: {
          email,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });
      
      return count > 0;
    } catch (error) {
      logger.error('User emailExists error', { email, excludeId, error });
      throw error;
    }
  }

  // Get users with pagination and filters
  async findWithFilters(options: {
    page: number;
    limit: number;
    role?: UserRole;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    data: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const { page, limit, role, isActive, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      
      const where: any = {};
      
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;
      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      return await this.paginate({
        where,
        orderBy,
        page,
        limit,
      });
    } catch (error) {
      logger.error('User findWithFilters error', { options, error });
      throw error;
    }
  }
}
