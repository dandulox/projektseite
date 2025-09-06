// Task Repository
import { Task, TaskStatus, Priority, TaskFilters } from '@shared/types';
import { BaseRepository } from './base.repository';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

export class TaskRepository extends BaseRepository<Task> {
  constructor() {
    super('task');
  }

  // Find tasks by assignee
  async findByAssignee(assigneeId: string, options: {
    status?: TaskStatus[];
    priority?: Priority[];
    projectId?: string;
    dueDateFrom?: Date;
    dueDateTo?: Date;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    data: Task[];
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
        projectId,
        dueDateFrom,
        dueDateTo,
        tags,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const where: any = { assigneeId };

      if (status && status.length > 0) {
        where.status = { in: status };
      }

      if (priority && priority.length > 0) {
        where.priority = { in: priority };
      }

      if (projectId) {
        where.projectId = projectId;
      }

      if (dueDateFrom || dueDateTo) {
        where.dueDate = {};
        if (dueDateFrom) where.dueDate.gte = dueDateFrom;
        if (dueDateTo) where.dueDate.lte = dueDateTo;
      }

      if (tags && tags.length > 0) {
        where.tags = { hasSome: tags };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
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
          assignee: {
            select: { id: true, username: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
          module: {
            select: { id: true, name: true },
          },
        },
      });

      logger.debug('Task findByAssignee', {
        assigneeId,
        filters: options,
        count: result.data.length,
        total: result.pagination.total,
      });

      return result;
    } catch (error) {
      logger.error('Task findByAssignee error', { assigneeId, options, error });
      throw error;
    }
  }

  // Find tasks by project
  async findByProject(projectId: string, options: {
    status?: TaskStatus[];
    assigneeId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<Task[]> {
    try {
      const { status, assigneeId, page = 1, limit = 50 } = options;

      const where: any = { projectId };

      if (status && status.length > 0) {
        where.status = { in: status };
      }

      if (assigneeId) {
        where.assigneeId = assigneeId;
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: { id: true, username: true, email: true },
          },
          module: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      logger.debug('Task findByProject', {
        projectId,
        options,
        count: tasks.length,
      });

      return tasks as unknown as Task[];
    } catch (error) {
      logger.error('Task findByProject error', { projectId, options, error });
      throw error;
    }
  }

  // Get overdue tasks
  async findOverdue(assigneeId?: string): Promise<Task[]> {
    try {
      const where: any = {
        dueDate: { lt: new Date() },
        status: { not: 'COMPLETED' },
      };

      if (assigneeId) {
        where.assigneeId = assigneeId;
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: { id: true, username: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      logger.debug('Task findOverdue', {
        assigneeId,
        count: tasks.length,
      });

      return tasks as unknown as Task[];
    } catch (error) {
      logger.error('Task findOverdue error', { assigneeId, error });
      throw error;
    }
  }

  // Get tasks due soon
  async findDueSoon(days: number = 7, assigneeId?: string): Promise<Task[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const where: any = {
        dueDate: {
          gte: new Date(),
          lte: futureDate,
        },
        status: { not: 'COMPLETED' },
      };

      if (assigneeId) {
        where.assigneeId = assigneeId;
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: { id: true, username: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      logger.debug('Task findDueSoon', {
        days,
        assigneeId,
        count: tasks.length,
      });

      return tasks as unknown as Task[];
    } catch (error) {
      logger.error('Task findDueSoon error', { days, assigneeId, error });
      throw error;
    }
  }

  // Get task statistics
  async getStats(assigneeId?: string): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    completed: number;
    overdue: number;
    dueSoon: number;
  }> {
    try {
      const where: any = {};
      if (assigneeId) {
        where.assigneeId = assigneeId;
      }

      const [
        total,
        todo,
        inProgress,
        review,
        completed,
        overdue,
        dueSoon,
      ] = await Promise.all([
        prisma.task.count({ where }),
        prisma.task.count({ where: { ...where, status: 'TODO' } }),
        prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { ...where, status: 'REVIEW' } }),
        prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.task.count({
          where: {
            ...where,
            dueDate: { lt: new Date() },
            status: { not: 'COMPLETED' },
          },
        }),
        prisma.task.count({
          where: {
            ...where,
            dueDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            status: { not: 'COMPLETED' },
          },
        }),
      ]);

      const stats = {
        total,
        todo,
        inProgress,
        review,
        completed,
        overdue,
        dueSoon,
      };

      logger.debug('Task getStats', { assigneeId, stats });
      return stats;
    } catch (error) {
      logger.error('Task getStats error', { assigneeId, error });
      throw error;
    }
  }

  // Update task status
  async updateStatus(id: string, status: TaskStatus, userId: string): Promise<Task> {
    try {
      const task = await prisma.task.update({
        where: { id },
        data: {
          status: status as any,
          updatedAt: new Date(),
          ...(status === TaskStatus.COMPLETED && { completedAt: new Date() }),
        },
        include: {
          assignee: {
            select: { id: true, username: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      });

      logger.info('Task updateStatus', {
        taskId: id,
        status,
        userId,
      });

      return task as unknown as Task;
    } catch (error) {
      logger.error('Task updateStatus error', { id, status, userId, error });
      throw error;
    }
  }

  // Assign task
  async assign(id: string, assigneeId: string, userId: string): Promise<Task> {
    try {
      const task = await prisma.task.update({
        where: { id },
        data: {
          assigneeId,
          updatedAt: new Date(),
        },
        include: {
          assignee: {
            select: { id: true, username: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      });

      logger.info('Task assign', {
        taskId: id,
        assigneeId,
        userId,
      });

      return task as unknown as Task;
    } catch (error) {
      logger.error('Task assign error', { id, assigneeId, userId, error });
      throw error;
    }
  }

  // Get tasks for Kanban board
  async getKanbanTasks(projectId: string): Promise<{
    [key in TaskStatus]: Task[];
  }> {
    try {
      const tasks = await prisma.task.findMany({
        where: { projectId },
        include: {
          assignee: {
            select: { id: true, username: true, email: true },
          },
          module: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform tasks to match TypeScript interface (convert null to undefined)
      const transformedTasks = tasks.map(task => ({
        ...task,
        description: task.description ?? undefined,
        assigneeId: task.assigneeId ?? undefined,
        projectId: task.projectId ?? undefined,
        moduleId: task.moduleId ?? undefined,
        createdById: task.createdById ?? undefined,
        dueDate: task.dueDate ?? undefined,
        estimatedHours: task.estimatedHours ?? undefined,
        actualHours: task.actualHours ?? undefined,
        completedAt: task.completedAt ?? undefined,
      }));

      const kanbanTasks = {
        TODO: transformedTasks.filter(t => t.status === 'TODO'),
        IN_PROGRESS: transformedTasks.filter(t => t.status === 'IN_PROGRESS'),
        REVIEW: transformedTasks.filter(t => t.status === 'REVIEW'),
        COMPLETED: transformedTasks.filter(t => t.status === 'COMPLETED'),
        CANCELLED: transformedTasks.filter(t => t.status === 'CANCELLED'),
      };

      logger.debug('Task getKanbanTasks', {
        projectId,
        totalTasks: tasks.length,
        byStatus: Object.fromEntries(
          Object.entries(kanbanTasks).map(([status, tasks]) => [status, tasks.length])
        ),
      });

      return kanbanTasks;
    } catch (error) {
      logger.error('Task getKanbanTasks error', { projectId, error });
      throw error;
    }
  }
}
