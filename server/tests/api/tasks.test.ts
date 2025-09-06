// API Tests für Tasks
import request from 'supertest';
import app from '../../src/server';
import { prisma } from '../../src/config/database';
import { generateToken } from '../utils/auth';
import { createTestUser, createTestProject, createTestTask } from '../utils/fixtures';
import { TaskStatus, Priority } from '@shared/types';

describe('Tasks API', () => {
  let authToken: string;
  let testUser: any;
  let testProject: any;

  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup test database
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Create test user and get auth token
    testUser = await createTestUser();
    authToken = generateToken(testUser.id);

    // Create test project
    testProject = await createTestProject(testUser.id);
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('GET /api/tasks/my-tasks', () => {
    it('should return user tasks with pagination', async () => {
      // Create test tasks
      await createTestTask(testUser.id, testProject.id);
      await createTestTask(testUser.id, testProject.id);

      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.pagination).toBeDefined();
      expect(response.body.meta.pagination.total).toBe(2);
    });

    it('should filter tasks by status', async () => {
      // Create tasks with different statuses
      await createTestTask(testUser.id, testProject.id, { status: TaskStatus.TODO });
      await createTestTask(testUser.id, testProject.id, { status: TaskStatus.IN_PROGRESS });

      const response = await request(app)
        .get('/api/tasks/my-tasks?status=TODO')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('TODO');
    });

    it('should filter tasks by priority', async () => {
      // Create tasks with different priorities
      await createTestTask(testUser.id, testProject.id, { priority: Priority.HIGH });
      await createTestTask(testUser.id, testProject.id, { priority: Priority.LOW });

      const response = await request(app)
        .get('/api/tasks/my-tasks?priority=HIGH')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].priority).toBe('HIGH');
    });

    it('should search tasks by title', async () => {
      // Create tasks with different titles
      await createTestTask(testUser.id, testProject.id, { title: 'Important Task' });
      await createTestTask(testUser.id, testProject.id, { title: 'Regular Task' });

      const response = await request(app)
        .get('/api/tasks/my-tasks?search=Important')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('Important');
    });

    it('should return empty list when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.pagination.total).toBe(0);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/tasks/my-tasks')
        .expect(401);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'MEDIUM',
        projectId: testProject.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 8,
        tags: ['test', 'api'],
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.projectId).toBe(taskData.projectId);
      expect(response.body.data.tags).toEqual(taskData.tags);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate title length', async () => {
      const taskData = {
        title: 'a'.repeat(201), // Too long
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate priority enum', async () => {
      const taskData = {
        title: 'Test Task',
        priority: 'INVALID_PRIORITY',
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should require authentication', async () => {
      const taskData = {
        title: 'Test Task',
      };

      await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return task by ID', async () => {
      const task = await createTestTask(testUser.id, testProject.id);

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(task.id);
      expect(response.body.data.title).toBe(task.title);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/tasks/some-id')
        .expect(401);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task', async () => {
      const task = await createTestTask(testUser.id, testProject.id);
      const updateData = {
        title: 'Updated Task Title',
        description: 'Updated Description',
        priority: 'HIGH',
      };

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    it('should return 404 for non-existent task', async () => {
      const updateData = {
        title: 'Updated Title',
      };

      const response = await request(app)
        .patch('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should require authentication', async () => {
      const updateData = {
        title: 'Updated Title',
      };

      await request(app)
        .patch('/api/tasks/some-id')
        .send(updateData)
        .expect(401);
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('should update task status', async () => {
      const task = await createTestTask(testUser.id, testProject.id, { status: TaskStatus.TODO });

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: TaskStatus.IN_PROGRESS })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('IN_PROGRESS');
    });

    it('should set completedAt when status is COMPLETED', async () => {
      const task = await createTestTask(testUser.id, testProject.id, { status: TaskStatus.TODO });

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: TaskStatus.COMPLETED })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.completedAt).toBeDefined();
    });

    it('should validate status enum', async () => {
      const task = await createTestTask(testUser.id, testProject.id);

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task', async () => {
      const task = await createTestTask(testUser.id, testProject.id);

      await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify task is deleted
      const deletedTask = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should require authentication', async () => {
      await request(app)
        .delete('/api/tasks/some-id')
        .expect(401);
    });
  });

  describe('GET /api/tasks/stats', () => {
    it('should return task statistics', async () => {
      // Create tasks with different statuses
      await createTestTask(testUser.id, testProject.id, { status: TaskStatus.TODO });
      await createTestTask(testUser.id, testProject.id, { status: TaskStatus.IN_PROGRESS });
      await createTestTask(testUser.id, testProject.id, { status: TaskStatus.COMPLETED });

      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.todo).toBe(1);
      expect(response.body.data.inProgress).toBe(1);
      expect(response.body.data.completed).toBe(1);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/tasks/stats')
        .expect(401);
    });
  });

  describe('GET /api/tasks/overdue', () => {
    it('should return overdue tasks', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      await createTestTask(testUser.id, testProject.id, { 
        dueDate: pastDate,
        status: TaskStatus.TODO 
      });

      const response = await request(app)
        .get('/api/tasks/overdue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(new Date(response.body.data[0].dueDate)).toEqual(pastDate);
    });

    it('should not return completed overdue tasks', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      await createTestTask(testUser.id, testProject.id, { 
        dueDate: pastDate,
        status: TaskStatus.COMPLETED 
      });

      const response = await request(app)
        .get('/api/tasks/overdue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/tasks/overdue')
        .expect(401);
    });
  });

  describe('GET /api/tasks/due-soon', () => {
    it('should return tasks due soon', async () => {
      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
      await createTestTask(testUser.id, testProject.id, { 
        dueDate: futureDate,
        status: TaskStatus.TODO 
      });

      const response = await request(app)
        .get('/api/tasks/due-soon?days=7')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(new Date(response.body.data[0].dueDate)).toEqual(futureDate);
    });

    it('should respect days parameter', async () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
      await createTestTask(testUser.id, testProject.id, { 
        dueDate: futureDate,
        status: TaskStatus.TODO 
      });

      const response = await request(app)
        .get('/api/tasks/due-soon?days=7')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/tasks/due-soon')
        .expect(401);
    });
  });
});
