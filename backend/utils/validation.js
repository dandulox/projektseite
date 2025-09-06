// Zentrale Validierung mit Joi für alle API-Endpoints
const Joi = require('joi');
const { createValidationError, ERROR_CODES } = require('./errorContract');

// Gemeinsame Validierungs-Schemas
const commonSchemas = {
  // ID-Validierung
  id: Joi.number().integer().positive().required(),
  
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort_by: Joi.string().valid('created_at', 'updated_at', 'name', 'title', 'due_date', 'priority', 'status').default('created_at'),
    sort_order: Joi.string().valid('ASC', 'DESC').default('DESC')
  }),
  
  // Such-Validierung
  search: Joi.string().min(1).max(100).trim(),
  
  // Status-Validierung
  taskStatus: Joi.string().valid('todo', 'in_progress', 'review', 'completed', 'cancelled'),
  projectStatus: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled'),
  
  // Prioritäts-Validierung
  priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
  
  // Datum-Validierung
  date: Joi.date().iso(),
  dateOptional: Joi.date().iso().allow(null, ''),
  
  // Stunden-Validierung
  hours: Joi.number().precision(2).min(0).max(9999),
  hoursOptional: Joi.number().precision(2).min(0).max(9999).allow(null, ''),
  
  // Tags-Validierung
  tags: Joi.array().items(Joi.string().max(50)).max(10),
  
  // E-Mail-Validierung
  email: Joi.string().email().max(100),
  
  // Benutzername-Validierung
  username: Joi.string().alphanum().min(3).max(50),
  
  // Passwort-Validierung
  password: Joi.string().min(6).max(100),
  
  // Rolle-Validierung
  role: Joi.string().valid('admin', 'user', 'viewer')
};

// Task-Validierung
const taskSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).allow(''),
    status: commonSchemas.taskStatus.default('todo'),
    priority: commonSchemas.priority.default('medium'),
    assignee_id: Joi.number().integer().positive().allow(null),
    project_id: Joi.number().integer().positive().allow(null),
    module_id: Joi.number().integer().positive().allow(null),
    due_date: commonSchemas.dateOptional,
    estimated_hours: commonSchemas.hoursOptional,
    actual_hours: commonSchemas.hoursOptional,
    tags: commonSchemas.tags.default([])
  }),
  
  update: Joi.object({
    title: Joi.string().min(1).max(200),
    description: Joi.string().max(1000).allow(''),
    status: commonSchemas.taskStatus,
    priority: commonSchemas.priority,
    assignee_id: Joi.number().integer().positive().allow(null),
    project_id: Joi.number().integer().positive().allow(null),
    module_id: Joi.number().integer().positive().allow(null),
    due_date: commonSchemas.dateOptional,
    estimated_hours: commonSchemas.hoursOptional,
    actual_hours: commonSchemas.hoursOptional,
    tags: commonSchemas.tags
  }),
  
  statusUpdate: Joi.object({
    status: commonSchemas.taskStatus.required()
  }),
  
  query: Joi.object({
    status: commonSchemas.taskStatus,
    priority: commonSchemas.priority,
    project_id: Joi.number().integer().positive(),
    search: commonSchemas.search,
    ...commonSchemas.pagination.describe()
  })
};

// Projekt-Validierung
const projectSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).allow(''),
    status: commonSchemas.projectStatus.default('planning'),
    priority: commonSchemas.priority.default('medium'),
    start_date: commonSchemas.dateOptional,
    target_date: commonSchemas.dateOptional,
    team_id: Joi.number().integer().positive().allow(null),
    visibility: Joi.string().valid('private', 'team', 'public').default('private')
  }),
  
  update: Joi.object({
    name: Joi.string().min(1).max(200),
    description: Joi.string().max(1000).allow(''),
    status: commonSchemas.projectStatus,
    priority: commonSchemas.priority,
    start_date: commonSchemas.dateOptional,
    target_date: commonSchemas.dateOptional,
    team_id: Joi.number().integer().positive().allow(null),
    visibility: Joi.string().valid('private', 'team', 'public')
  }),
  
  query: Joi.object({
    team_id: Joi.number().integer().positive(),
    status: commonSchemas.projectStatus,
    visibility: Joi.string().valid('private', 'team', 'public'),
    search: commonSchemas.search,
    ...commonSchemas.pagination.describe()
  })
};

// Benutzer-Validierung
const userSchemas = {
  create: Joi.object({
    username: commonSchemas.username.required(),
    email: commonSchemas.email.required(),
    password: commonSchemas.password.required(),
    role: commonSchemas.role.default('user')
  }),
  
  update: Joi.object({
    username: commonSchemas.username,
    email: commonSchemas.email,
    role: commonSchemas.role
  }),
  
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),
  
  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: commonSchemas.password.required(),
    confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
  })
};

// Team-Validierung
const teamSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow(''),
    team_leader_id: Joi.number().integer().positive().allow(null)
  }),
  
  update: Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().max(500).allow(''),
    team_leader_id: Joi.number().integer().positive().allow(null)
  }),
  
  addMember: Joi.object({
    user_id: commonSchemas.id,
    role: Joi.string().valid('leader', 'member', 'viewer').default('member')
  })
};

// Deadline-Validierung
const deadlineSchemas = {
  query: Joi.object({
    days: Joi.number().integer().min(1).max(365).default(7),
    status: Joi.string().valid('active', 'all', 'overdue').default('active'),
    project_id: Joi.number().integer().positive(),
    priority: commonSchemas.priority,
    ...commonSchemas.pagination.describe()
  }),
  
  calendar: Joi.object({
    start_date: commonSchemas.date,
    end_date: commonSchemas.date,
    project_id: Joi.number().integer().positive(),
    priority: commonSchemas.priority
  }),
  
  reminders: Joi.object({
    hours_ahead: Joi.number().integer().min(1).max(168).default(24) // Max 1 Woche
  })
};

// Admin-Validierung
const adminSchemas = {
  apiDebug: Joi.object({
    method: Joi.string().valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').required(),
    path: Joi.string().min(1).max(500).required(),
    headers: Joi.object().pattern(Joi.string(), Joi.string()).max(20),
    body: Joi.object().max(50)
  })
};

// Validierungs-Middleware
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      const validationError = createValidationError(
        'validation',
        'Validierungsfehler',
        validationErrors
      );

      return res.status(400).json({
        error: validationError.message,
        code: validationError.code,
        details: validationError.details,
        timestamp: validationError.timestamp
      });
    }

    // Validierte und bereinigte Daten zurück in den Request
    req[property] = value;
    next();
  };
};

// Spezielle Validierungs-Middleware
const validateTaskCreate = validateRequest(taskSchemas.create);
const validateTaskUpdate = validateRequest(taskSchemas.update);
const validateTaskStatusUpdate = validateRequest(taskSchemas.statusUpdate);
const validateTaskQuery = validateRequest(taskSchemas.query, 'query');

const validateProjectCreate = validateRequest(projectSchemas.create);
const validateProjectUpdate = validateRequest(projectSchemas.update);
const validateProjectQuery = validateRequest(projectSchemas.query, 'query');

const validateUserCreate = validateRequest(userSchemas.create);
const validateUserUpdate = validateRequest(userSchemas.update);
const validateUserLogin = validateRequest(userSchemas.login);
const validateUserChangePassword = validateRequest(userSchemas.changePassword);

const validateTeamCreate = validateRequest(teamSchemas.create);
const validateTeamUpdate = validateRequest(teamSchemas.update);
const validateTeamAddMember = validateRequest(teamSchemas.addMember);

const validateDeadlineQuery = validateRequest(deadlineSchemas.query, 'query');
const validateDeadlineCalendar = validateRequest(deadlineSchemas.calendar, 'query');
const validateDeadlineReminders = validateRequest(deadlineSchemas.reminders, 'query');

const validateAdminApiDebug = validateRequest(adminSchemas.apiDebug);

// ID-Parameter-Validierung
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const { error } = commonSchemas.id.validate(parseInt(id));

    if (error) {
      return res.status(400).json({
        error: 'Ungültige ID',
        code: ERROR_CODES.VALIDATION_ERROR,
        details: { field: paramName, value: id, message: 'ID muss eine positive Ganzzahl sein' },
        timestamp: new Date().toISOString()
      });
    }

    req.params[paramName] = parseInt(id);
    next();
  };
};

module.exports = {
  // Schemas
  commonSchemas,
  taskSchemas,
  projectSchemas,
  userSchemas,
  teamSchemas,
  deadlineSchemas,
  adminSchemas,
  
  // Middleware
  validateRequest,
  validateId,
  
  // Task-Validierung
  validateTaskCreate,
  validateTaskUpdate,
  validateTaskStatusUpdate,
  validateTaskQuery,
  
  // Projekt-Validierung
  validateProjectCreate,
  validateProjectUpdate,
  validateProjectQuery,
  
  // Benutzer-Validierung
  validateUserCreate,
  validateUserUpdate,
  validateUserLogin,
  validateUserChangePassword,
  
  // Team-Validierung
  validateTeamCreate,
  validateTeamUpdate,
  validateTeamAddMember,
  
  // Deadline-Validierung
  validateDeadlineQuery,
  validateDeadlineCalendar,
  validateDeadlineReminders,
  
  // Admin-Validierung
  validateAdminApiDebug
};
