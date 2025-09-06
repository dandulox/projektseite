// Project Controller - HTTP Request/Response Handler
import { Request, Response } from 'express';
import { ProjectService } from '@/services/project.service';
import { 
  ApiResponseFactory, 
  ApiErrorFactory 
} from '@shared/contracts/error';
import { 
  CreateProjectInput, 
  UpdateProjectInput, 
  ProjectFilters 
} from '@shared/types';
import { logger } from '@/utils/logger';
import { stringUtils } from '@shared/utils';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  // GET /api/projects/my-projects
  getMyProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        visibility,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters: ProjectFilters = {
        status: status ? (Array.isArray(status) ? status as any[] : [status as any]) : undefined,
        priority: priority ? (Array.isArray(priority) ? priority as any[] : [priority as any]) : undefined,
        visibility: visibility ? (Array.isArray(visibility) ? visibility as any[] : [visibility as any]) : undefined,
        search: search as string,
      };

      const result = await this.projectService.getMyProjects(
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
      logger.error('ProjectController getMyProjects error', { error, userId: req.user?.id });
      throw error;
    }
  };

  // GET /api/projects/:id
  getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const project = await this.projectService.getProjectById(id, userId);

      const response = ApiResponseFactory.success(project, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('ProjectController getProjectById error', { error, id: req.params.id, userId: req.user?.id });
      throw error;
    }
  };

  // POST /api/projects
  createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const input: CreateProjectInput = req.body;

      const project = await this.projectService.createProject(input, userId);

      const response = ApiResponseFactory.success(project, {
        requestId: stringUtils.generateRequestId(),
      });

      res.status(201).json(response);
    } catch (error) {
      logger.error('ProjectController createProject error', { error, input: req.body, userId: req.user?.id });
      throw error;
    }
  };

  // PATCH /api/projects/:id
  updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const input: UpdateProjectInput = req.body;

      const project = await this.projectService.updateProject(id, input, userId);

      const response = ApiResponseFactory.success(project, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('ProjectController updateProject error', { error, id: req.params.id, input: req.body, userId: req.user?.id });
      throw error;
    }
  };

  // DELETE /api/projects/:id
  deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await this.projectService.deleteProject(id, userId);

      const response = ApiResponseFactory.success(null, {
        requestId: stringUtils.generateRequestId(),
      });

      res.status(204).json(response);
    } catch (error) {
      logger.error('ProjectController deleteProject error', { error, id: req.params.id, userId: req.user?.id });
      throw error;
    }
  };

  // GET /api/projects/stats
  getProjectStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const stats = await this.projectService.getProjectStats(userId);

      const response = ApiResponseFactory.success(stats, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('ProjectController getProjectStats error', { error, userId: req.user?.id });
      throw error;
    }
  };

  // PATCH /api/projects/:id/completion
  updateProjectCompletion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const project = await this.projectService.updateProjectCompletion(id, userId);

      const response = ApiResponseFactory.success(project, {
        requestId: stringUtils.generateRequestId(),
      });

      res.json(response);
    } catch (error) {
      logger.error('ProjectController updateProjectCompletion error', { error, id: req.params.id, userId: req.user?.id });
      throw error;
    }
  };

  // GET /api/projects
  getProjectsWithFilters = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        visibility,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters: ProjectFilters = {
        status: status ? (Array.isArray(status) ? status as any[] : [status as any]) : undefined,
        priority: priority ? (Array.isArray(priority) ? priority as any[] : [priority as any]) : undefined,
        visibility: visibility ? (Array.isArray(visibility) ? visibility as any[] : [visibility as any]) : undefined,
        search: search as string,
      };

      const result = await this.projectService.getProjectsWithFilters(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
        userId
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
      logger.error('ProjectController getProjectsWithFilters error', { error, userId: req.user?.id });
      throw error;
    }
  };
}

// Export controller instance
export const projectController = new ProjectController();
