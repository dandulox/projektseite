// Project Repository
import { Project, ProjectStatus, Priority, Visibility } from '@shared/types';
import { BaseRepository } from './base.repository';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

export class ProjectRepository extends BaseRepository<Project> {
  constructor() {
    super('project');
  }

  // Find projects by owner
  async findByOwner(ownerId: string, options: {
    status?: ProjectStatus[];
    priority?: Priority[];
    visibility?: Visibility[];
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    data: Project[];
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
      const {
        status,
        priority,
        visibility,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const where: any = { ownerId };

      if (status && status.length > 0) {
        where.status = { in: status };
      }

      if (priority && priority.length > 0) {
        where.priority = { in: priority };
      }

      if (visibility && visibility.length > 0) {
        where.visibility = { in: visibility };
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const result = await this.paginate({
        where,
        orderBy,
        page,
        limit,
        include: {
          owner: {
            select: { id: true, username: true, email: true },
          },
          team: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              tasks: true,
              modules: true,
            },
          },
        },
      });

      logger.debug('Project findByOwner', {
        ownerId,
        filters: options,
        count: result.data.length,
        total: result.pagination.total,
      });

      return result;
    } catch (error) {
      logger.error('Project findByOwner error', { ownerId, options, error });
      throw error;
    }
  }

  // Find projects by team
  async findByTeam(teamId: string, options: {
    status?: ProjectStatus[];
    page?: number;
    limit?: number;
  } = {}): Promise<Project[]> {
    try {
      const { status, page = 1, limit = 50 } = options;

      const where: any = { teamId };

      if (status && status.length > 0) {
        where.status = { in: status };
      }

      const projects = await prisma.project.findMany({
        where,
        include: {
          owner: {
            select: { id: true, username: true, email: true },
          },
          team: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              tasks: true,
              modules: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      logger.debug('Project findByTeam', {
        teamId,
        options,
        count: projects.length,
      });

      return projects;
    } catch (error) {
      logger.error('Project findByTeam error', { teamId, options, error });
      throw error;
    }
  }

  // Get project statistics
  async getStats(ownerId?: string): Promise<{
    total: number;
    active: number;
    completed: number;
    onHold: number;
    cancelled: number;
  }> {
    try {
      const where: any = {};
      if (ownerId) {
        where.ownerId = ownerId;
      }

      const [
        total,
        active,
        completed,
        onHold,
        cancelled,
      ] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.count({ where: { ...where, status: 'ACTIVE' } }),
        prisma.project.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.project.count({ where: { ...where, status: 'ON_HOLD' } }),
        prisma.project.count({ where: { ...where, status: 'CANCELLED' } }),
      ]);

      const stats = {
        total,
        active,
        completed,
        onHold,
        cancelled,
      };

      logger.debug('Project getStats', { ownerId, stats });
      return stats;
    } catch (error) {
      logger.error('Project getStats error', { ownerId, error });
      throw error;
    }
  }

  // Update project completion percentage
  async updateCompletionPercentage(id: string): Promise<Project> {
    try {
      // Calculate completion based on modules
      const modules = await prisma.module.findMany({
        where: { projectId: id },
        select: { completionPercentage: true },
      });

      const totalModules = modules.length;
      const completedModules = modules.filter(m => m.completionPercentage === 100).length;
      
      const completionPercentage = totalModules > 0 
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

      const project = await prisma.project.update({
        where: { id },
        data: { completionPercentage },
      });

      logger.info('Project updateCompletionPercentage', {
        projectId: id,
        completionPercentage,
        totalModules,
        completedModules,
      });

      return project;
    } catch (error) {
      logger.error('Project updateCompletionPercentage error', { id, error });
      throw error;
    }
  }

  // Get projects with pagination and filters
  async findWithFilters(options: {
    page: number;
    limit: number;
    ownerId?: string;
    teamId?: string;
    status?: ProjectStatus[];
    priority?: Priority[];
    visibility?: Visibility[];
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    data: Project[];
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
      const {
        page,
        limit,
        ownerId,
        teamId,
        status,
        priority,
        visibility,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const where: any = {};

      if (ownerId) where.ownerId = ownerId;
      if (teamId) where.teamId = teamId;
      if (status && status.length > 0) where.status = { in: status };
      if (priority && priority.length > 0) where.priority = { in: priority };
      if (visibility && visibility.length > 0) where.visibility = { in: visibility };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      return await this.paginate({
        where,
        orderBy,
        page,
        limit,
        include: {
          owner: {
            select: { id: true, username: true, email: true },
          },
          team: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              tasks: true,
              modules: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Project findWithFilters error', { options, error });
      throw error;
    }
  }
}
