// Task Service - Business Logic für Tasks
import { 
  Task, 
  CreateTaskInput, 
  UpdateTaskInput, 
  TaskFilters,
  TaskStatus,
  Priority 
} from '@shared/types';
import { TaskRepository } from '@/repositories/task.repository';
import { ProjectRepository } from '@/repositories/project.repository';
import { UserRepository } from '@/repositories/user.repository';
import { 
  NotFoundError, 
  ForbiddenError, 
  ValidationError,
  asyncHandler 
} from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponseFactory } from '@shared/contracts/error';

export class TaskService {
  private taskRepository: TaskRepository;
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
  }

  // Create new task
  async createTask(input: CreateTaskInput, userId: string): Promise<Task> {
    try {
      // Validate project exists if provided
      if (input.projectId) {
        const project = await this.projectRepository.findById(input.projectId);
        if (!project) {
          throw new NotFoundError('Projekt', input.projectId);
        }
      }

      // Validate assignee exists if provided
      if (input.assigneeId) {
        const assignee = await this.userRepository.findById(input.assigneeId);
        if (!assignee) {
          throw new NotFoundError('Benutzer', input.assigneeId);
        }
      }

      const taskData = {
        ...input,
        createdById: userId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      };

      const task = await this.taskRepository.create(taskData);

      logger.info('Task created', {
        taskId: task.id,
        title: task.title,
        createdBy: userId,
        assigneeId: input.assigneeId,
        projectId: input.projectId,
      });

      return task;
    } catch (error) {
      logger.error('Task create error', { input, userId, error });
      throw error;
    }
  }

  // Get task by ID
  async getTaskById(id: string, userId: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new NotFoundError('Task', id);
      }

      // Check permissions
      await this.checkTaskAccess(task, userId);

      return task;
    } catch (error) {
      logger.error('Task getById error', { id, userId, error });
      throw error;
    }
  }

  // Get user's tasks
  async getMyTasks(
    userId: string,
    filters: TaskFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
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
      const result = await this.taskRepository.findByAssignee(userId, {
        ...filters,
        page,
        limit,
      });

      logger.debug('Task getMyTasks', {
        userId,
        filters,
        count: result.data.length,
        total: result.pagination.total,
      });

      return result;
    } catch (error) {
      logger.error('Task getMyTasks error', { userId, filters, error });
      throw error;
    }
  }

  // Update task
  async updateTask(id: string, input: UpdateTaskInput, userId: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new NotFoundError('Task', id);
      }

      // Check permissions
      await this.checkTaskAccess(task, userId, 'edit');

      // Validate assignee if provided
      if (input.assigneeId) {
        const assignee = await this.userRepository.findById(input.assigneeId);
        if (!assignee) {
          throw new NotFoundError('Benutzer', input.assigneeId);
        }
      }

      const updateData = {
        ...input,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      };

      const updatedTask = await this.taskRepository.update(id, updateData);

      logger.info('Task updated', {
        taskId: id,
        updatedBy: userId,
        changes: Object.keys(input),
      });

      return updatedTask;
    } catch (error) {
      logger.error('Task update error', { id, input, userId, error });
      throw error;
    }
  }

  // Update task status
  async updateTaskStatus(id: string, status: TaskStatus, userId: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new NotFoundError('Task', id);
      }

      // Check permissions
      await this.checkTaskAccess(task, userId, 'edit');

      const updatedTask = await this.taskRepository.updateStatus(id, status, userId);

      logger.info('Task status updated', {
        taskId: id,
        status,
        updatedBy: userId,
      });

      return updatedTask;
    } catch (error) {
      logger.error('Task updateStatus error', { id, status, userId, error });
      throw error;
    }
  }

  // Assign task
  async assignTask(id: string, assigneeId: string, userId: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new NotFoundError('Task', id);
      }

      // Check permissions
      await this.checkTaskAccess(task, userId, 'edit');

      // Validate assignee
      const assignee = await this.userRepository.findById(assigneeId);
      if (!assignee) {
        throw new NotFoundError('Benutzer', assigneeId);
      }

      const updatedTask = await this.taskRepository.assign(id, assigneeId, userId);

      logger.info('Task assigned', {
        taskId: id,
        assigneeId,
        assignedBy: userId,
      });

      return updatedTask;
    } catch (error) {
      logger.error('Task assign error', { id, assigneeId, userId, error });
      throw error;
    }
  }

  // Delete task
  async deleteTask(id: string, userId: string): Promise<void> {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new NotFoundError('Task', id);
      }

      // Check permissions
      await this.checkTaskAccess(task, userId, 'admin');

      await this.taskRepository.delete(id);

      logger.info('Task deleted', {
        taskId: id,
        deletedBy: userId,
      });
    } catch (error) {
      logger.error('Task delete error', { id, userId, error });
      throw error;
    }
  }

  // Get task statistics
  async getTaskStats(userId: string): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    completed: number;
    overdue: number;
    dueSoon: number;
  }> {
    try {
      const stats = await this.taskRepository.getStats(userId);

      logger.debug('Task getStats', { userId, stats });
      return stats;
    } catch (error) {
      logger.error('Task getStats error', { userId, error });
      throw error;
    }
  }

  // Get overdue tasks
  async getOverdueTasks(userId: string): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.findOverdue(userId);

      logger.debug('Task getOverdueTasks', { userId, count: tasks.length });
      return tasks;
    } catch (error) {
      logger.error('Task getOverdueTasks error', { userId, error });
      throw error;
    }
  }

  // Get tasks due soon
  async getTasksDueSoon(userId: string, days: number = 7): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.findDueSoon(days, userId);

      logger.debug('Task getTasksDueSoon', { userId, days, count: tasks.length });
      return tasks;
    } catch (error) {
      logger.error('Task getTasksDueSoon error', { userId, days, error });
      throw error;
    }
  }

  // Get Kanban tasks for project
  async getKanbanTasks(projectId: string, userId: string): Promise<{
    [key in TaskStatus]: Task[];
  }> {
    try {
      // Check project access
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new NotFoundError('Projekt', projectId);
      }

      await this.checkProjectAccess(project, userId);

      const tasks = await this.taskRepository.getKanbanTasks(projectId);

      logger.debug('Task getKanbanTasks', {
        projectId,
        userId,
        totalTasks: Object.values(tasks).flat().length,
      });

      return tasks;
    } catch (error) {
      logger.error('Task getKanbanTasks error', { projectId, userId, error });
      throw error;
    }
  }

  // Private helper methods
  private async checkTaskAccess(task: Task, userId: string, permission: 'view' | 'edit' | 'admin' = 'view'): Promise<void> {
    // Task creator has full access
    if (task.createdById === userId) {
      return;
    }

    // Task assignee has view/edit access
    if (task.assigneeId === userId && permission !== 'admin') {
      return;
    }

    // Project owner has access
    if (task.projectId) {
      const project = await this.projectRepository.findById(task.projectId);
      if (project && project.ownerId === userId) {
        return;
      }
    }

    // Admin has full access
    const user = await this.userRepository.findById(userId);
    if (user && user.role === 'ADMIN') {
      return;
    }

    throw new ForbiddenError('Keine Berechtigung für diese Task');
  }

  private async checkProjectAccess(project: any, userId: string): Promise<void> {
    // Project owner has access
    if (project.ownerId === userId) {
      return;
    }

    // Admin has access
    const user = await this.userRepository.findById(userId);
    if (user && user.role === 'ADMIN') {
      return;
    }

    // Check team membership if project has team
    if (project.teamId) {
      // This would need team membership check
      // For now, we'll allow if user is in the team
    }

    throw new ForbiddenError('Keine Berechtigung für dieses Projekt');
  }
}
