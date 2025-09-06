// Dashboard Types für TypeScript

export interface DashboardTask {
  id: number;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'testing' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage: number;
  projectName: string;
  projectId: number;
  assignedUsername?: string;
}

export interface DashboardDeadline {
  id: number;
  name: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  completionPercentage: number;
  projectName: string;
  projectId: number;
  assignedUsername?: string;
  daysUntilDue: number | null;
}

export interface DashboardProject {
  id: number;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completionPercentage: number;
  updatedAt: string;
  targetDate?: string;
  ownerUsername: string;
  teamName?: string;
  moduleCount: number;
}

export interface DashboardProjectProgress {
  id: number;
  name: string;
  status: string;
  completionPercentage: number;
  targetDate?: string;
  ownerUsername: string;
  teamName?: string;
  totalModules: number;
  completedModules: number;
  avgModuleProgress: number;
}

export interface DashboardWidget {
  title: string;
  count: number;
  items: (DashboardTask | DashboardDeadline | DashboardProject | DashboardProjectProgress)[];
}

export interface DashboardSummary {
  totalOpenTasks: number;
  totalUpcomingDeadlines: number;
  totalActiveProjects: number;
  averageProjectProgress: number;
}

export interface DashboardData {
  widgets: {
    openTasks: DashboardWidget;
    upcomingDeadlines: DashboardWidget;
    recentProjects: DashboardWidget;
    projectProgress: DashboardWidget;
  };
  summary: DashboardSummary;
  timezone: string;
  lastUpdated: string;
}

export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    averageProgress: number;
  };
  tasks: {
    open: number;
    completed: number;
    upcomingDeadlines: number;
    averageProgress: number;
  };
}

export interface DashboardStatsData {
  stats: DashboardStats;
  timezone: string;
  lastUpdated: string;
}

// Widget-Konfiguration
export interface WidgetConfig {
  id: string;
  title: string;
  type: 'tasks' | 'deadlines' | 'projects' | 'progress';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  visible: boolean;
}

// Dashboard-Layout
export interface DashboardLayout {
  widgets: WidgetConfig[];
  columns: number;
  gap: number;
}

// API Response Types
export interface DashboardApiResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
}

export interface DashboardStatsApiResponse {
  success: boolean;
  data?: DashboardStatsData;
  error?: string;
}

// Filter Types
export interface DashboardFilters {
  timeRange: 'today' | 'week' | 'month' | 'all';
  priority: 'all' | 'low' | 'medium' | 'high' | 'critical';
  status: 'all' | 'active' | 'completed' | 'overdue';
  team?: number;
}

// Hook Return Types
export interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: string | null;
}

export interface UseDashboardStatsReturn {
  stats: DashboardStatsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
