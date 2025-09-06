// Project Service - Business Logic für Projekte
import { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput, 
  ProjectFilters,
  ProjectStatus,
  Priority,
  Visibility 
} from '@shared/types';
import { ProjectRepository } from '@/repositories/project.repository';
import { TeamRepository } from '@/repositories/team.repository';
import { UserRepository } from '@/repositories/user.repository';
import { 
  NotFoundError, 
  ForbiddenError, 
  ValidationError,
  ConflictError 
} from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class ProjectService {
  private projectRepository: ProjectRepository;
  private teamRepository: TeamRepository;
  private userRepository: UserRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.teamRepository = new TeamRepository();
    this.userRepository = new UserRepository();
  }

  // Create new project
  async createProject(input: CreateProjectInput, userId: string): Promise<Project> {
    try {
      // Validate team exists if provided
      if (input.teamId) {
        const team = await this.teamRepository.findById(input.teamId);
        if (!team) {
          throw new NotFoundError('Team', input.teamId);
        }

        // Check if user is team member
        const isMember = await this.teamRepository.isMember(input.teamId, userId);
        if (!isMember) {
          throw new ForbiddenError('Keine Berechtigung für dieses Team');
        }
      }

      const projectData = {
        ...input,
        ownerId: userId,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
      };

      const project = await this.projectRepository.create(projectData);

      logger.info('Project created', {
        projectId: project.id,
        name: project.name,
        createdBy: userId,
        teamId: input.teamId,
      });

      return project;
    } catch (error) {
      logger.error('Project create error', { input, userId, error });
      throw error;
    }
  }

  // Get project by ID
  async getProjectById(id: string, userId: string): Promise<Project> {
    try {
      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new NotFoundError('Projekt', id);
      }

      // Check permissions
      await this.checkProjectAccess(project, userId);

      return project;
    } catch (error) {
      logger.error('Project getById error', { id, userId, error });
      throw error;
    }
  }

  // Get user's projects
  async getMyProjects(
    userId: string,
    filters: ProjectFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
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
      const result = await this.projectRepository.findByOwner(userId, {
        ...filters,
        page,
        limit,
      });

      logger.debug('Project getMyProjects', {
        userId,
        filters,
        count: result.data.length,
        total: result.pagination.total,
      });

      return result;
    } catch (error) {
      logger.error('Project getMyProjects error', { userId, filters, error });
      throw error;
    }
  }

  // Update project
  async updateProject(id: string, input: UpdateProjectInput, userId: string): Promise<Project> {
    try {
      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new NotFoundError('Projekt', id);
      }

      // Check permissions
      await this.checkProjectAccess(project, userId, 'edit');

      // Validate team if provided
      if (input.teamId) {
        const team = await this.teamRepository.findById(input.teamId);
        if (!team) {
          throw new NotFoundError('Team', input.teamId);
        }

        // Check if user is team member
        const isMember = await this.teamRepository.isMember(input.teamId, userId);
        if (!isMember) {
          throw new ForbiddenError('Keine Berechtigung für dieses Team');
        }
      }

      const updateData = {
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
      };

      const updatedProject = await this.projectRepository.update(id, updateData);

      logger.info('Project updated', {
        projectId: id,
        updatedBy: userId,
        changes: Object.keys(input),
      });

      return updatedProject;
    } catch (error) {
      logger.error('Project update error', { id, input, userId, error });
      throw error;
    }
  }

  // Delete project
  async deleteProject(id: string, userId: string): Promise<void> {
    try {
      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new NotFoundError('Projekt', id);
      }

      // Check permissions
      await this.checkProjectAccess(project, userId, 'admin');

      await this.projectRepository.delete(id);

      logger.info('Project deleted', {
        projectId: id,
        deletedBy: userId,
      });
    } catch (error) {
      logger.error('Project delete error', { id, userId, error });
      throw error;
    }
  }

  // Get project statistics
  async getProjectStats(userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    onHold: number;
    cancelled: number;
  }> {
    try {
      const stats = await this.projectRepository.getStats(userId);

      logger.debug('Project getStats', { userId, stats });
      return stats;
    } catch (error) {
      logger.error('Project getStats error', { userId, error });
      throw error;
    }
  }

  // Update project completion percentage
  async updateProjectCompletion(id: string, userId: string): Promise<Project> {
    try {
      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new NotFoundError('Projekt', id);
      }

      // Check permissions
      await this.checkProjectAccess(project, userId, 'edit');

      const updatedProject = await this.projectRepository.updateCompletionPercentage(id);

      logger.info('Project completion updated', {
        projectId: id,
        updatedBy: userId,
        completionPercentage: updatedProject.completionPercentage,
      });

      return updatedProject;
    } catch (error) {
      logger.error('Project updateCompletion error', { id, userId, error });
      throw error;
    }
  }

  // Get projects with filters
  async getProjectsWithFilters(
    filters: ProjectFilters,
    page: number = 1,
    limit: number = 20,
    userId: string
  ): Promise<{
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
      // Add user filter to only show accessible projects
      const userFilters = {
        ...filters,
        ownerId: userId, // Only show user's own projects for now
      };

      const result = await this.projectRepository.findWithFilters({
        ...userFilters,
        page,
        limit,
      });

      logger.debug('Project getProjectsWithFilters', {
        userId,
        filters,
        count: result.data.length,
        total: result.pagination.total,
      });

      return result;
    } catch (error) {
      logger.error('Project getProjectsWithFilters error', { filters, userId, error });
      throw error;
    }
  }

  // Private helper methods
  private async checkProjectAccess(project: Project, userId: string, permission: 'view' | 'edit' | 'admin' = 'view'): Promise<void> {
    // Project owner has full access
    if (project.ownerId === userId) {
      return;
    }

    // Team members have view access
    if (project.teamId) {
      const isMember = await this.teamRepository.isMember(project.teamId, userId);
      if (isMember && permission === 'view') {
        return;
      }
    }

    // Admin has full access
    const user = await this.userRepository.findById(userId);
    if (user && user.role === UserRole.ADMIN) {
      return;
    }

    // Public projects are viewable by everyone
    if (project.visibility === Visibility.PUBLIC && permission === 'view') {
      return;
    }

    throw new ForbiddenError('Keine Berechtigung für dieses Projekt');
  }
}
