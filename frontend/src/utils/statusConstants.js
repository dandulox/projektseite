// Zentrale Status-Definitionen für das Frontend
// Synchronisiert mit backend/utils/statusConstants.js

// Task-Status (Kanban Board)
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress', 
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Task-Prioritäten
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Status-Arrays für Validierung
export const VALID_TASK_STATUSES = Object.values(TASK_STATUS);
export const VALID_TASK_PRIORITIES = Object.values(TASK_PRIORITY);

// Status-Labels für UI
export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'Zu erledigen',
  [TASK_STATUS.IN_PROGRESS]: 'In Bearbeitung',
  [TASK_STATUS.REVIEW]: 'Review',
  [TASK_STATUS.COMPLETED]: 'Abgeschlossen',
  [TASK_STATUS.CANCELLED]: 'Abgebrochen'
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Niedrig',
  [TASK_PRIORITY.MEDIUM]: 'Mittel',
  [TASK_PRIORITY.HIGH]: 'Hoch',
  [TASK_PRIORITY.CRITICAL]: 'Kritisch'
};

// Kanban-Spalten-Konfiguration
export const KANBAN_COLUMNS = [
  {
    id: TASK_STATUS.TODO,
    title: TASK_STATUS_LABELS[TASK_STATUS.TODO],
    status: TASK_STATUS.TODO
  },
  {
    id: TASK_STATUS.IN_PROGRESS,
    title: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS],
    status: TASK_STATUS.IN_PROGRESS
  },
  {
    id: TASK_STATUS.REVIEW,
    title: TASK_STATUS_LABELS[TASK_STATUS.REVIEW],
    status: TASK_STATUS.REVIEW
  },
  {
    id: TASK_STATUS.COMPLETED,
    title: TASK_STATUS_LABELS[TASK_STATUS.COMPLETED],
    status: TASK_STATUS.COMPLETED
  },
  {
    id: TASK_STATUS.CANCELLED,
    title: TASK_STATUS_LABELS[TASK_STATUS.CANCELLED],
    status: TASK_STATUS.CANCELLED
  }
];

// Hilfsfunktionen
export const isTaskCompleted = (status) => {
  return status === TASK_STATUS.COMPLETED || status === TASK_STATUS.CANCELLED;
};

export const isTaskActive = (status) => {
  return !isTaskCompleted(status);
};

export const getStatusColor = (status) => {
  const colors = {
    [TASK_STATUS.TODO]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    [TASK_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
    [TASK_STATUS.REVIEW]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
    [TASK_STATUS.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
    [TASK_STATUS.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
  };
  return colors[status] || colors[TASK_STATUS.TODO];
};

export const getPriorityColor = (priority) => {
  const colors = {
    [TASK_PRIORITY.LOW]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    [TASK_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
    [TASK_PRIORITY.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
    [TASK_PRIORITY.CRITICAL]: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
  };
  return colors[priority] || colors[TASK_PRIORITY.MEDIUM];
};

// Urgency-Funktionen für Deadlines
export const getUrgencyColor = (daysUntilDue) => {
  if (daysUntilDue === null) return 'text-gray-500';
  if (daysUntilDue < 0) return 'text-red-500';
  if (daysUntilDue <= 1) return 'text-red-500';
  if (daysUntilDue <= 3) return 'text-orange-500';
  return 'text-green-500';
};

export const getUrgencyText = (daysUntilDue) => {
  if (daysUntilDue === null) return 'Kein Datum';
  if (daysUntilDue < 0) return 'Überfällig';
  if (daysUntilDue === 0) return 'Heute';
  if (daysUntilDue === 1) return 'Morgen';
  return `in ${daysUntilDue} Tagen`;
};

export const getUrgencyIcon = (daysUntilDue) => {
  if (daysUntilDue === null) return 'Clock';
  if (daysUntilDue < 0) return 'AlertTriangle';
  if (daysUntilDue <= 1) return 'AlertTriangle';
  if (daysUntilDue <= 3) return 'Clock';
  return 'CheckCircle';
};

export default {
  TASK_STATUS,
  TASK_PRIORITY,
  VALID_TASK_STATUSES,
  VALID_TASK_PRIORITIES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  KANBAN_COLUMNS,
  isTaskCompleted,
  isTaskActive,
  getStatusColor,
  getPriorityColor,
  getUrgencyColor,
  getUrgencyText,
  getUrgencyIcon
};
