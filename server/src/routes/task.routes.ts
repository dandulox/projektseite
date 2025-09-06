// Task Routes
import { Router } from 'express';
import { taskController } from '@/controllers/task.controller';
import { authenticateToken, requireUserOrAdmin } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  taskQuerySchema,
  commonSchemas 
} from '@shared/contracts/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/tasks/my-tasks - Get user's tasks
router.get('/my-tasks', 
  validateRequest({ query: taskQuerySchema }),
  taskController.getMyTasks
);

// GET /api/tasks/stats - Get task statistics
router.get('/stats',
  taskController.getTaskStats
);

// GET /api/tasks/overdue - Get overdue tasks
router.get('/overdue',
  taskController.getOverdueTasks
);

// GET /api/tasks/due-soon - Get tasks due soon
router.get('/due-soon',
  validateRequest({ query: commonSchemas.pagination.extend({
    days: commonSchemas.pagination.shape.page.optional().default(7)
  }) }),
  taskController.getTasksDueSoon
);

// GET /api/tasks/:id - Get task by ID
router.get('/:id',
  validateRequest({ params: commonSchemas.id }),
  taskController.getTaskById
);

// POST /api/tasks - Create new task
router.post('/',
  validateRequest({ body: createTaskSchema }),
  taskController.createTask
);

// PATCH /api/tasks/:id - Update task
router.patch('/:id',
  validateRequest({ 
    params: commonSchemas.id,
    body: updateTaskSchema 
  }),
  taskController.updateTask
);

// PATCH /api/tasks/:id/status - Update task status
router.patch('/:id/status',
  validateRequest({ 
    params: commonSchemas.id,
    body: updateTaskSchema.pick({ status: true })
  }),
  taskController.updateTaskStatus
);

// PATCH /api/tasks/:id/assign - Assign task
router.patch('/:id/assign',
  validateRequest({ 
    params: commonSchemas.id,
    body: updateTaskSchema.pick({ assigneeId: true })
  }),
  taskController.assignTask
);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id',
  validateRequest({ params: commonSchemas.id }),
  taskController.deleteTask
);

export { router as taskRoutes };
