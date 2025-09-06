// Zentrale Status-Definitionen für das gesamte System
// Verhindert Inkonsistenzen zwischen verschiedenen Modulen

// Task-Status (Kanban Board)
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress', 
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Task-Prioritäten
const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Projekt-Status
const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Projekt-Prioritäten
const PROJECT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Status-Arrays für Validierung
const VALID_TASK_STATUSES = Object.values(TASK_STATUS);
const VALID_TASK_PRIORITIES = Object.values(TASK_PRIORITY);
const VALID_PROJECT_STATUSES = Object.values(PROJECT_STATUS);
const VALID_PROJECT_PRIORITIES = Object.values(PROJECT_PRIORITY);

// Status-Labels für UI
const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'Zu erledigen',
  [TASK_STATUS.IN_PROGRESS]: 'In Bearbeitung',
  [TASK_STATUS.REVIEW]: 'Review',
  [TASK_STATUS.COMPLETED]: 'Abgeschlossen',
  [TASK_STATUS.CANCELLED]: 'Abgebrochen'
};

const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Niedrig',
  [TASK_PRIORITY.MEDIUM]: 'Mittel',
  [TASK_PRIORITY.HIGH]: 'Hoch',
  [TASK_PRIORITY.CRITICAL]: 'Kritisch'
};

// Kanban-Spalten-Konfiguration
const KANBAN_COLUMNS = [
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
const isTaskCompleted = (status) => {
  return status === TASK_STATUS.COMPLETED || status === TASK_STATUS.CANCELLED;
};

const isTaskActive = (status) => {
  return !isTaskCompleted(status);
};

const getStatusColor = (status) => {
  const colors = {
    [TASK_STATUS.TODO]: 'bg-gray-100 text-gray-800',
    [TASK_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [TASK_STATUS.REVIEW]: 'bg-yellow-100 text-yellow-800',
    [TASK_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
    [TASK_STATUS.CANCELLED]: 'bg-red-100 text-red-800'
  };
  return colors[status] || colors[TASK_STATUS.TODO];
};

const getPriorityColor = (priority) => {
  const colors = {
    [TASK_PRIORITY.LOW]: 'bg-gray-100 text-gray-800',
    [TASK_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800',
    [TASK_PRIORITY.HIGH]: 'bg-orange-100 text-orange-800',
    [TASK_PRIORITY.CRITICAL]: 'bg-red-100 text-red-800'
  };
  return colors[priority] || colors[TASK_PRIORITY.MEDIUM];
};

module.exports = {
  TASK_STATUS,
  TASK_PRIORITY,
  PROJECT_STATUS,
  PROJECT_PRIORITY,
  VALID_TASK_STATUSES,
  VALID_TASK_PRIORITIES,
  VALID_PROJECT_STATUSES,
  VALID_PROJECT_PRIORITIES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  KANBAN_COLUMNS,
  isTaskCompleted,
  isTaskActive,
  getStatusColor,
  getPriorityColor
};
