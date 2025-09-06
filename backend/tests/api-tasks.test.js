const request = require('supertest');
const express = require('express');
const tasksRouter = require('../routes/tasks');
const authRouter = require('../routes/auth');

// Mock Database
const mockPool = {
  query: jest.fn()
};

jest.mock('../config/database', () => mockPool);

// Mock Auth Middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 1, username: 'testuser', role: 'user' };
  next();
};

// Test App Setup
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/tasks', mockAuth, tasksRouter);

describe('Tasks API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks/my-tasks', () => {
    it('should return user tasks with correct status mapping', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task 1',
          description: 'Test Description',
          status: 'todo',
          priority: 'high',
          due_date: '2024-12-25',
          estimated_hours: 8,
          created_at: '2024-12-19T10:00:00Z'
        },
        {
          id: 2,
          title: 'Test Task 2',
          description: 'Test Description 2',
          status: 'in_progress',
          priority: 'medium',
          due_date: '2024-12-30',
          estimated_hours: 16,
          created_at: '2024-12-19T11:00:00Z'
        }
      ];

      mockPool.query.mockResolvedValue({ rows: mockTasks });

      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body.tasks).toHaveLength(2);
      expect(response.body.tasks[0]).toMatchObject({
        id: 1,
        title: 'Test Task 1',
        status: 'todo',
        priority: 'high'
      });
    });

    it('should handle empty task list', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .expect(200);

      expect(response.body.tasks).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should filter tasks by status', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'todo', priority: 'high' },
        { id: 2, title: 'Task 2', status: 'in_progress', priority: 'medium' }
      ];

      mockPool.query.mockResolvedValue({ rows: mockTasks });

      const response = await request(app)
        .get('/api/tasks/my-tasks?status=todo')
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('todo');
    });
  });

  describe('GET /api/tasks/:taskId', () => {
    it('should return single task with details', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'high',
        due_date: '2024-12-25',
        project_name: 'Test Project',
        assignee_username: 'testuser',
        is_overdue: false,
        is_due_soon: true
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ role: 'user' }] }) // User role check
        .mockResolvedValueOnce({ rows: [mockTask] }); // Task details

      const response = await request(app)
        .get('/api/tasks/1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        title: 'Test Task',
        status: 'todo',
        is_overdue: false,
        is_due_soon: true
      });
    });

    it('should return 404 for non-existent task', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ role: 'user' }] }) // User role check
        .mockResolvedValueOnce({ rows: [] }); // No task found

      await request(app)
        .get('/api/tasks/999')
        .expect(404);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        status: 'todo',
        priority: 'medium',
        due_date: '2024-12-31',
        estimated_hours: 8
      };

      const createdTask = {
        id: 3,
        ...newTask,
        created_by: 1,
        created_at: '2024-12-19T12:00:00Z'
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ role: 'user' }] }) // User role check
        .mockResolvedValueOnce({ rows: [createdTask] }); // Task creation

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 3,
        title: 'New Task',
        status: 'todo',
        created_by: 1
      });
    });

    it('should return 400 for missing title', async () => {
      const invalidTask = {
        description: 'No title provided'
      };

      await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);
    });
  });

  describe('PUT /api/tasks/:taskId', () => {
    it('should update task status', async () => {
      const updateData = {
        status: 'in_progress',
        actual_hours: 4
      };

      const updatedTask = {
        id: 1,
        title: 'Test Task',
        status: 'in_progress',
        actual_hours: 4,
        updated_at: '2024-12-19T13:00:00Z'
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ role: 'user' }] }) // User role check
        .mockResolvedValueOnce({ rows: [{ id: 1, assignee_id: 1 }] }) // Permission check
        .mockResolvedValueOnce({ rows: [updatedTask] }); // Task update

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        status: 'in_progress',
        actual_hours: 4
      });
    });
  });
});
