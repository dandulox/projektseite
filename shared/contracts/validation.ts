// Validation Contracts mit Zod
// Wird von Frontend und Backend verwendet

import { z } from 'zod';
import { UserRole, ProjectStatus, TaskStatus, Priority, Visibility, TeamRole } from '../types';

// Base Schemas
export const cuidSchema = z.string().cuid();
export const emailSchema = z.string().email('Ungültige E-Mail-Adresse');
export const passwordSchema = z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein');
export const usernameSchema = z.string().min(3, 'Benutzername muss mindestens 3 Zeichen lang sein').max(50, 'Benutzername darf maximal 50 Zeichen lang sein');
export const dateSchema = z.string().datetime('Ungültiges Datumsformat');

// Enum Schemas
export const userRoleSchema = z.nativeEnum(UserRole);
export const projectStatusSchema = z.nativeEnum(ProjectStatus);
export const taskStatusSchema = z.nativeEnum(TaskStatus);
export const prioritySchema = z.nativeEnum(Priority);
export const visibilitySchema = z.nativeEnum(Visibility);
export const teamRoleSchema = z.nativeEnum(TeamRole);

// User Schemas
export const createUserSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.optional().default(UserRole.USER),
});

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Benutzername ist erforderlich'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

// Project Schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Projektname ist erforderlich').max(200, 'Projektname darf maximal 200 Zeichen lang sein'),
  description: z.string().max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein').optional(),
  priority: prioritySchema.optional().default(Priority.MEDIUM),
  teamId: cuidSchema.optional(),
  visibility: visibilitySchema.optional().default(Visibility.PRIVATE),
  startDate: dateSchema.optional(),
  targetDate: dateSchema.optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Projektname ist erforderlich').max(200, 'Projektname darf maximal 200 Zeichen lang sein').optional(),
  description: z.string().max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein').optional(),
  status: projectStatusSchema.optional(),
  priority: prioritySchema.optional(),
  teamId: cuidSchema.optional(),
  visibility: visibilitySchema.optional(),
  startDate: dateSchema.optional(),
  targetDate: dateSchema.optional(),
});

// Task Schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(200, 'Titel darf maximal 200 Zeichen lang sein'),
  description: z.string().max(2000, 'Beschreibung darf maximal 2000 Zeichen lang sein').optional(),
  priority: prioritySchema.optional().default(Priority.MEDIUM),
  assigneeId: cuidSchema.optional(),
  projectId: cuidSchema.optional(),
  moduleId: cuidSchema.optional(),
  dueDate: dateSchema.optional(),
  estimatedHours: z.number().positive('Geschätzte Stunden müssen positiv sein').max(9999, 'Geschätzte Stunden dürfen maximal 9999 betragen').optional(),
  tags: z.array(z.string().max(50, 'Tag darf maximal 50 Zeichen lang sein')).max(10, 'Maximal 10 Tags erlaubt').optional().default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(200, 'Titel darf maximal 200 Zeichen lang sein').optional(),
  description: z.string().max(2000, 'Beschreibung darf maximal 2000 Zeichen lang sein').optional(),
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  assigneeId: cuidSchema.optional(),
  dueDate: dateSchema.optional(),
  estimatedHours: z.number().positive('Geschätzte Stunden müssen positiv sein').max(9999, 'Geschätzte Stunden dürfen maximal 9999 betragen').optional(),
  actualHours: z.number().positive('Tatsächliche Stunden müssen positiv sein').max(9999, 'Tatsächliche Stunden dürfen maximal 9999 betragen').optional(),
  tags: z.array(z.string().max(50, 'Tag darf maximal 50 Zeichen lang sein')).max(10, 'Maximal 10 Tags erlaubt').optional(),
});

// Team Schemas
export const createTeamSchema = z.object({
  name: z.string().min(1, 'Teamname ist erforderlich').max(100, 'Teamname darf maximal 100 Zeichen lang sein'),
  description: z.string().max(500, 'Beschreibung darf maximal 500 Zeichen lang sein').optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, 'Teamname ist erforderlich').max(100, 'Teamname darf maximal 100 Zeichen lang sein').optional(),
  description: z.string().max(500, 'Beschreibung darf maximal 500 Zeichen lang sein').optional(),
  isActive: z.boolean().optional(),
});

export const addTeamMemberSchema = z.object({
  userId: cuidSchema,
  role: teamRoleSchema.optional().default(TeamRole.MEMBER),
});

// Query Parameter Schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Seite muss mindestens 1 sein').default(1),
  limit: z.coerce.number().int().min(1, 'Limit muss mindestens 1 sein').max(100, 'Limit darf maximal 100 sein').default(20),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Task Query Schema
export const taskQuerySchema = paginationSchema.merge(sortSchema).extend({
  status: z.array(taskStatusSchema).optional(),
  priority: z.array(prioritySchema).optional(),
  assigneeId: cuidSchema.optional(),
  projectId: cuidSchema.optional(),
  dueDateFrom: dateSchema.optional(),
  dueDateTo: dateSchema.optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().max(100, 'Suchbegriff darf maximal 100 Zeichen lang sein').optional(),
});

// Project Query Schema
export const projectQuerySchema = paginationSchema.merge(sortSchema).extend({
  status: z.array(projectStatusSchema).optional(),
  priority: z.array(prioritySchema).optional(),
  ownerId: cuidSchema.optional(),
  teamId: cuidSchema.optional(),
  visibility: z.array(visibilitySchema).optional(),
  search: z.string().max(100, 'Suchbegriff darf maximal 100 Zeichen lang sein').optional(),
});

// Deadline Query Schema
export const deadlineQuerySchema = z.object({
  days: z.coerce.number().int().min(1, 'Tage müssen mindestens 1 sein').max(365, 'Tage dürfen maximal 365 sein').default(7),
  status: z.enum(['active', 'all', 'overdue']).optional().default('active'),
  projectId: cuidSchema.optional(),
  priority: prioritySchema.optional(),
});

// Admin Schemas
export const apiDebugSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  path: z.string().min(1, 'Pfad ist erforderlich').max(500, 'Pfad darf maximal 500 Zeichen lang sein'),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
});

// Type Exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type DeadlineQueryInput = z.infer<typeof deadlineQuerySchema>;
export type ApiDebugInput = z.infer<typeof apiDebugSchema>;

// Validation Helper Functions
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = {
        code: 'VALIDATION_ERROR',
        message: 'Validierungsfehler',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
      throw validationError;
    }
    throw error;
  }
}

export function validateQuery<T>(schema: z.ZodSchema<T>, query: Record<string, any>): T {
  return validateInput(schema, query);
}
