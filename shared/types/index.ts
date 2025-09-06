// Shared Types für Frontend und Backend
// Diese Datei wird von beiden Seiten verwendet

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  ownerId: string;
  teamId?: string;
  visibility: Visibility;
  startDate?: Date;
  targetDate?: Date;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  projectId?: string;
  moduleId?: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  fromUserId?: string;
  teamId?: string;
  projectId?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// Enums
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum Visibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public'
}

export enum TeamRole {
  LEADER = 'leader',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

// Utility Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

// API Request/Response Types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: Priority;
  assigneeId?: string;
  projectId?: string;
  moduleId?: string;
  dueDate?: string; // ISO string
  estimatedHours?: number;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  dueDate?: string; // ISO string
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  priority?: Priority;
  teamId?: string;
  visibility?: Visibility;
  startDate?: string; // ISO string
  targetDate?: string; // ISO string
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  teamId?: string;
  visibility?: Visibility;
  startDate?: string; // ISO string
  targetDate?: string; // ISO string
}

// Dashboard Types
export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
    completionRate: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
  teams: {
    total: number;
    leading: number;
    member: number;
  };
  deadlines: {
    upcoming: number;
    overdue: number;
    nextWeek: number;
  };
}

// Kanban Board Types
export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
}

export interface KanbanBoard {
  projectId: string;
  columns: KanbanColumn[];
  totalTasks: number;
}

// Search and Filter Types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  assigneeId?: string;
  projectId?: string;
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  tags?: string[];
  search?: string;
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: Priority[];
  ownerId?: string;
  teamId?: string;
  visibility?: Visibility[];
  search?: string;
}
