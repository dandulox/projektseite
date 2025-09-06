// Task Controller - HTTP Request/Response Handler
import { Request, Response } from 'express';
import { TaskService } from '@/services/task.service';
import { 
  ApiResponseFactory, 
  ApiErrorFactory 
} from '@shared/contracts/error';
import { 
  CreateTaskInput, 
  UpdateTaskInput, 
  TaskFilters 
} from '@shared/types';
import { logger } from '@/utils/logger';
import { stringUtils } from '@shared/utils';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  // GET /api/tasks/my-tasks
  getMyTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        projectId,
        dueDateFrom,
        dueDateTo,
        tags,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters: TaskFilters = {
        status: status ? (Array.isArray(status) ? status as any[] : [status as any]) : undefined,
        priority: priority ? (Array.isArray(priority) ? priority as any[] : [priority as any]) : undefined,
        projectId: projectId as string,
        dueDate: {
          from: dueDateFrom ? new Date(dueDateFrom as string) : undefined,
          to: dueDateTo ? new Date(dueDateTo as string) : undefined,
        },
        tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
        search: search as string,
      };

      const result = await this.taskService.getMyTasks(
        userId,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      const response = ApiResponseFactory.paginated(
        result.data,
        result.pagination,
        {
          requestId: stringUtils.generateRequestId(),
        }
      );

      res.json(response);
    } catch (error) {
      logger.error('TaskController getMyTasks error', { error, userId: req.user?.id });
      throw error;
    }
  };

  // GET /api/tasks/:id
  getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const task = await this.taskService.getTaskById(id, userId);

      const response = ApiResponseFactory.success(task, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('TaskController getTaskById error', { error, id: req.params.id, userId: req.user?.id });
      throw error;
    }
  };

  // POST /api/tasks
  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const input: CreateTaskInput = req.body;

      const task = await this.taskService.createTask(input, userId);

      const response = ApiResponseFactory.success(task, {
        requestId: stringUtils.generateRequestId(),
      });

      res.status(201).json(response);
    } catch (error) {
      logger.error('TaskController createTask error', { error, input: req.body, userId: req.user?.id });
      throw error;
    }
  };

  // PATCH /api/tasks/:id
  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const input: UpdateTaskInput = req.body;

      const task = await this.taskService.updateTask(id, input, userId);

      const response = ApiResponseFactory.success(task, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('TaskController updateTask error', { error, id: req.params.id, input: req.body, userId: req.user?.id });
      throw error;
    }
  };

  // PATCH /api/tasks/:id/status
  updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.id;

      const task = await this.taskService.updateTaskStatus(id, status, userId);

      const response = ApiResponseFactory.success(task, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('TaskController updateTaskStatus error', { error, id: req.params.id, status: req.body.status, userId: req.user?.id });
      throw error;
    }
  };

  // PATCH /api/tasks/:id/assign
  assignTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { assigneeId } = req.body;
      const userId = req.user!.id;

      const task = await this.taskService.assignTask(id, assigneeId, userId);

      const response = ApiResponseFactory.success(task, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('TaskController assignTask error', { error, id: req.params.id, assigneeId: req.body.assigneeId, userId: req.user?.id });
      throw error;
    }
  };

  // DELETE /api/tasks/:id
  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await this.taskService.deleteTask(id, userId);

      const response = ApiResponseFactory.success(null, {
        requestId: stringUtils.generateRequestId(),
      });

      res.status(204).json(response);
    } catch (error) {
      logger.error('TaskController deleteTask error', { error, id: req.params.id, userId: req.user?.id });
      throw error;
    }
  };

  // GET /api/tasks/stats
  getTaskStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const stats = await this.taskService.getTaskStats(userId);

      const response = ApiResponseFactory.success(stats, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('TaskController getTaskStats error', { error, userId: req.user?.id });
      throw error;
    }
  };

  // GET /api/tasks/overdue
  getOverdueTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const tasks = await this.taskService.getOverdueTasks(userId);

      const response = ApiResponseFactory.success(tasks, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('TaskController getOverdueTasks error', { error, userId: req.user?.id });
      throw error;
    }
  };

  // GET /api/tasks/due-soon
  getTasksDueSoon = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { days = 7 } = req.query;

      const tasks = await this.taskService.getTasksDueSoon(userId, parseInt(days as string));

      const response = ApiResponseFactory.success(tasks, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('TaskController getTasksDueSoon error', { error, userId: req.user?.id, days: req.query.days });
      throw error;
    }
  };

  // GET /api/projects/:projectId/tasks/kanban
  getKanbanTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const userId = req.user!.id;

      const tasks = await this.taskService.getKanbanTasks(projectId, userId);

      const response = ApiResponseFactory.success(tasks, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('TaskController getKanbanTasks error', { error, projectId: req.params.projectId, userId: req.user?.id });
      throw error;
    }
  };
}

// Export controller instance
export const taskController = new TaskController();
