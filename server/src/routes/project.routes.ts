// Project Routes
import { Router } from 'express';
import { projectController } from '@/controllers/project.controller';
import { authenticateToken, requireUserOrAdmin } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { 
  createProjectSchema, 
  updateProjectSchema, 
  projectQuerySchema,
  commonSchemas 
} from '@shared/contracts/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/projects/my-projects - Get user's projects
router.get('/my-projects', 
  validateRequest({ query: projectQuerySchema }),
  projectController.getMyProjects
);

// GET /api/projects/stats - Get project statistics
router.get('/stats',
  projectController.getProjectStats
);

// GET /api/projects - Get projects with filters
router.get('/',
  validateRequest({ query: projectQuerySchema }),
  projectController.getProjectsWithFilters
);

// GET /api/projects/:id - Get project by ID
router.get('/:id',
  validateRequest({ params: commonSchemas.id }),
  projectController.getProjectById
);

// POST /api/projects - Create new project
router.post('/',
  validateRequest({ body: createProjectSchema }),
  projectController.createProject
);

// PATCH /api/projects/:id - Update project
router.patch('/:id',
  validateRequest({ 
    params: commonSchemas.id,
    body: updateProjectSchema 
  }),
  projectController.updateProject
);

// PATCH /api/projects/:id/completion - Update project completion
router.patch('/:id/completion',
  validateRequest({ params: commonSchemas.id }),
  projectController.updateProjectCompletion
);

// DELETE /api/projects/:id - Delete project
router.delete('/:id',
  validateRequest({ params: commonSchemas.id }),
  projectController.deleteProject
);

export { router as projectRoutes };
