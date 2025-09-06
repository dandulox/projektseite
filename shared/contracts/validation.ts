// Validation Schemas - Zod schemas for API validation
import { z } from 'zod';

// Common schemas
export const idSchema = z.string().cuid('Invalid ID format');
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long');

// Enums
export const userRoleSchema = z.enum(['ADMIN', 'USER', 'VIEWER']);
export const projectStatusSchema = z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']);
export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']);
export const prioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const visibilitySchema = z.enum(['PRIVATE', 'TEAM', 'PUBLIC']);
export const teamRoleSchema = z.enum(['LEADER', 'MEMBER', 'VIEWER']);
export const moduleStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'TESTING', 'COMPLETED']);

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Common schemas
export const commonSchemas = {
  id: z.object({ id: idSchema }),
  pagination: paginationSchema,
  sort: sortSchema,
};

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  priority: prioritySchema.optional(),
  assigneeId: idSchema.optional(),
  projectId: idSchema.optional(),
  moduleId: idSchema.optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).max(9999).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  assigneeId: idSchema.optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).max(9999).optional(),
  actualHours: z.number().min(0).max(9999).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const taskQuerySchema = z.object({
  ...paginationSchema.shape,
  ...sortSchema.shape,
  status: z.array(taskStatusSchema).optional(),
  priority: z.array(prioritySchema).optional(),
  assigneeId: idSchema.optional(),
  projectId: idSchema.optional(),
  search: z.string().max(100).optional(),
});

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: prioritySchema.optional(),
  teamId: idSchema.optional(),
  visibility: visibilitySchema.optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  status: projectStatusSchema.optional(),
  priority: prioritySchema.optional(),
  teamId: idSchema.optional(),
  visibility: visibilitySchema.optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
});

export const projectQuerySchema = z.object({
  ...paginationSchema.shape,
  ...sortSchema.shape,
  status: z.array(projectStatusSchema).optional(),
  priority: z.array(prioritySchema).optional(),
  visibility: z.array(visibilitySchema).optional(),
  search: z.string().max(100).optional(),
});

// Team schemas
export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

export const teamMembershipSchema = z.object({
  userId: idSchema,
  role: teamRoleSchema.optional(),
});

// Module schemas
export const createModuleSchema = z.object({
  projectId: idSchema,
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: prioritySchema.optional(),
  assignedTo: idSchema.optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).max(9999).optional(),
});

export const updateModuleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  status: moduleStatusSchema.optional(),
  priority: prioritySchema.optional(),
  assignedTo: idSchema.optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).max(9999).optional(),
  actualHours: z.number().min(0).max(9999).optional(),
});

// Admin schemas
export const apiDebugSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  path: z.string().min(1, 'Path is required').max(500, 'Path too long'),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
});

export const cleanupSchema = z.object({
  type: z.enum(['expired_tokens', 'old_logs', 'temp_files']),
});

// Export all schemas
export const validationSchemas = {
  // Common
  id: commonSchemas.id,
  pagination: commonSchemas.pagination,
  sort: commonSchemas.sort,
  
  // Auth
  login: loginSchema,
  createUser: createUserSchema,
  changePassword: changePasswordSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  
  // Tasks
  createTask: createTaskSchema,
  updateTask: updateTaskSchema,
  taskQuery: taskQuerySchema,
  
  // Projects
  createProject: createProjectSchema,
  updateProject: updateProjectSchema,
  projectQuery: projectQuerySchema,
  
  // Teams
  createTeam: createTeamSchema,
  updateTeam: updateTeamSchema,
  teamMembership: teamMembershipSchema,
  
  // Modules
  createModule: createModuleSchema,
  updateModule: updateModuleSchema,
  
  // Admin
  apiDebug: apiDebugSchema,
  cleanup: cleanupSchema,
};