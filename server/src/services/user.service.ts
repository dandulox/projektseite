// User Service - Business Logic für Benutzer
import { 
  User, 
  CreateUserInput, 
  UpdateUserInput, 
  UserRole 
} from '@shared/types';
import { UserRepository } from '@/repositories/user.repository';
import { 
  NotFoundError, 
  ForbiddenError, 
  ValidationError,
  ConflictError 
} from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Create new user
  async createUser(input: CreateUserInput, createdBy: string): Promise<User> {
    try {
      // Check if username already exists
      const usernameExists = await this.userRepository.usernameExists(input.username);
      if (usernameExists) {
        throw new ConflictError('Benutzername bereits vergeben');
      }

      // Check if email already exists
      const emailExists = await this.userRepository.emailExists(input.email);
      if (emailExists) {
        throw new ConflictError('E-Mail-Adresse bereits vergeben');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 12);

      const userData = {
        ...input,
        password: hashedPassword,
      };

      const user = await this.userRepository.create(userData);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      logger.info('User created', {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdBy,
      });

      return userWithoutPassword as User;
    } catch (error) {
      logger.error('User create error', { input, createdBy, error });
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string, requestingUserId: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('Benutzer', id);
      }

      // Check permissions
      await this.checkUserAccess(user, requestingUserId);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return userWithoutPassword as User;
    } catch (error) {
      logger.error('User getById error', { id, requestingUserId, error });
      throw error;
    }
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findByUsername(username);
      if (!user) {
        return null;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return userWithoutPassword as User;
    } catch (error) {
      logger.error('User getByUsername error', { username, error });
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, input: UpdateUserInput, requestingUserId: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('Benutzer', id);
      }

      // Check permissions
      await this.checkUserAccess(user, requestingUserId, 'edit');

      // Check if username already exists (excluding current user)
      if (input.username && input.username !== user.username) {
        const usernameExists = await this.userRepository.usernameExists(input.username, id);
        if (usernameExists) {
          throw new ConflictError('Benutzername bereits vergeben');
        }
      }

      // Check if email already exists (excluding current user)
      if (input.email && input.email !== user.email) {
        const emailExists = await this.userRepository.emailExists(input.email, id);
        if (emailExists) {
          throw new ConflictError('E-Mail-Adresse bereits vergeben');
        }
      }

      const updatedUser = await this.userRepository.update(id, input);

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      logger.info('User updated', {
        userId: id,
        updatedBy: requestingUserId,
        changes: Object.keys(input),
      });

      return userWithoutPassword as User;
    } catch (error) {
      logger.error('User update error', { id, input, requestingUserId, error });
      throw error;
    }
  }

  // Delete user
  async deleteUser(id: string, requestingUserId: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('Benutzer', id);
      }

      // Check permissions
      await this.checkUserAccess(user, requestingUserId, 'admin');

      // Prevent self-deletion
      if (id === requestingUserId) {
        throw new ValidationError('Sie können sich nicht selbst löschen');
      }

      await this.userRepository.delete(id);

      logger.info('User deleted', {
        userId: id,
        deletedBy: requestingUserId,
      });
    } catch (error) {
      logger.error('User delete error', { id, requestingUserId, error });
      throw error;
    }
  }

  // Get users with filters
  async getUsersWithFilters(
    filters: {
      role?: UserRole;
      isActive?: boolean;
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    requestingUserId: string
  ): Promise<{
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
      // Check if user has permission to view all users
      const requestingUser = await this.userRepository.findById(requestingUserId);
      if (!requestingUser || requestingUser.role !== 'ADMIN') {
        throw new ForbiddenError('Keine Berechtigung, alle Benutzer anzuzeigen');
      }

      const result = await this.userRepository.findWithFilters({
        page: filters.page || 1,
        limit: filters.limit || 20,
        role: filters.role,
        isActive: filters.isActive,
        search: filters.search,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
      });

      // Remove passwords from response
      const usersWithoutPasswords = result.data.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      });

      logger.debug('User getUsersWithFilters', {
        requestingUserId,
        filters,
        count: usersWithoutPasswords.length,
        total: result.pagination.total,
      });

      return {
        data: usersWithoutPasswords,
        pagination: result.pagination,
      };
    } catch (error) {
      logger.error('User getUsersWithFilters error', { filters, requestingUserId, error });
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    teamCount: number;
  }> {
    try {
      const stats = await this.userRepository.getStats(userId);

      logger.debug('User getStats', { userId, stats });
      return stats;
    } catch (error) {
      logger.error('User getStats error', { userId, error });
      throw error;
    }
  }

  // Search users
  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    try {
      const users = await this.userRepository.search(query, limit);

      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      });

      logger.debug('User searchUsers', { query, count: usersWithoutPasswords.length });
      return usersWithoutPasswords;
    } catch (error) {
      logger.error('User searchUsers error', { query, error });
      throw error;
    }
  }

  // Private helper methods
  private async checkUserAccess(user: User, requestingUserId: string, permission: 'view' | 'edit' | 'admin' = 'view'): Promise<void> {
    // User can always view/edit their own profile
    if (user.id === requestingUserId && permission !== 'admin') {
      return;
    }

    // Admin has full access
    const requestingUser = await this.userRepository.findById(requestingUserId);
    if (requestingUser && requestingUser.role === 'ADMIN') {
      return;
    }

    throw new ForbiddenError('Keine Berechtigung für diesen Benutzer');
  }
}
