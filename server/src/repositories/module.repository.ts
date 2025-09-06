// Module Repository
import { Module, ModuleStatus, Priority } from '@shared/types';
import { BaseRepository } from './base.repository';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

export class ModuleRepository extends BaseRepository<Module> {
  constructor() {
    super('module');
  }

  // Find modules by project
  async findByProject(projectId: string, options: {
    status?: ModuleStatus[];
    priority?: Priority[];
    assignedTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    data: Module[];
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
        assignedTo,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const where: any = { projectId };

      if (status && status.length > 0) {
        where.status = { in: status };
      }

      if (priority && priority.length > 0) {
        where.priority = { in: priority };
      }

      if (assignedTo) {
        where.assignedTo = assignedTo;
      }

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const result = await this.paginate({
        where,
        orderBy,
        page,
        limit,
        include: {
          project: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      logger.debug('Module findByProject', {
        projectId,
        filters: options,
        count: result.data.length,
        total: result.pagination.total,
      });

      return result;
    } catch (error) {
      logger.error('Module findByProject error', { projectId, options, error });
      throw error;
    }
  }

  // Find modules by assignee
  async findByAssignee(assignedTo: string, options: {
    status?: ModuleStatus[];
    priority?: Priority[];
    projectId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<Module[]> {
    try {
      const { status, priority, projectId, page = 1, limit = 50 } = options;

      const where: any = { assignedTo };

      if (status && status.length > 0) {
        where.status = { in: status };
      }

      if (priority && priority.length > 0) {
        where.priority = { in: priority };
      }

      if (projectId) {
        where.projectId = projectId;
      }

      const modules = await prisma.module.findMany({
        where,
        include: {
          project: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      logger.debug('Module findByAssignee', {
        assignedTo,
        options,
        count: modules.length,
      });

      return modules;
    } catch (error) {
      logger.error('Module findByAssignee error', { assignedTo, options, error });
      throw error;
    }
  }

  // Get module statistics
  async getStats(projectId?: string): Promise<{
    total: number;
    notStarted: number;
    inProgress: number;
    testing: number;
    completed: number;
  }> {
    try {
      const where: any = {};
      if (projectId) {
        where.projectId = projectId;
      }

      const [
        total,
        notStarted,
        inProgress,
        testing,
        completed,
      ] = await Promise.all([
        prisma.module.count({ where }),
        prisma.module.count({ where: { ...where, status: 'NOT_STARTED' } }),
        prisma.module.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.module.count({ where: { ...where, status: 'TESTING' } }),
        prisma.module.count({ where: { ...where, status: 'COMPLETED' } }),
      ]);

      const stats = {
        total,
        notStarted,
        inProgress,
        testing,
        completed,
      };

      logger.debug('Module getStats', { projectId, stats });
      return stats;
    } catch (error) {
      logger.error('Module getStats error', { projectId, error });
      throw error;
    }
  }

  // Update module completion percentage
  async updateCompletionPercentage(id: string): Promise<Module> {
    try {
      // Calculate completion based on tasks
      const tasks = await prisma.task.findMany({
        where: { moduleId: id },
        select: { status: true },
      });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
      
      const completionPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

      const module = await prisma.module.update({
        where: { id },
        data: { completionPercentage },
      });

      logger.info('Module updateCompletionPercentage', {
        moduleId: id,
        completionPercentage,
        totalTasks,
        completedTasks,
      });

      return module;
    } catch (error) {
      logger.error('Module updateCompletionPercentage error', { id, error });
      throw error;
    }
  }

  // Assign module
  async assign(id: string, assignedTo: string): Promise<Module> {
    try {
      const module = await prisma.module.update({
        where: { id },
        data: { assignedTo },
      });

      logger.info('Module assign', {
        moduleId: id,
        assignedTo,
      });

      return module;
    } catch (error) {
      logger.error('Module assign error', { id, assignedTo, error });
      throw error;
    }
  }

  // Update module status
  async updateStatus(id: string, status: ModuleStatus): Promise<Module> {
    try {
      const module = await prisma.module.update({
        where: { id },
        data: { status },
      });

      logger.info('Module updateStatus', {
        moduleId: id,
        status,
      });

      return module;
    } catch (error) {
      logger.error('Module updateStatus error', { id, status, error });
      throw error;
    }
  }
}
