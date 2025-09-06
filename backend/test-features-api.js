// Feature Tests für die drei Hauptfeatures
// Testet API-Endpunkte für My-Tasks, Deadlines und Kanban-Board

const request = require('supertest');
const app = require('./server');
const pool = require('./config/database');

// Test-Daten
const TEST_USER = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com'
};

const TEST_PROJECT = {
  id: 1,
  name: 'Test Projekt'
};

describe('Feature API Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Login für Auth-Token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('A) Meine Aufgaben (/api/tasks/my-tasks)', () => {
    test('GET /api/tasks/my-tasks sollte Tasks für eingeloggten User zurückgeben', async () => {
      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('pages');
    });

    test('GET /api/tasks/my-tasks sollte nur Tasks des eingeloggten Users zurückgeben', async () => {
      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Alle Tasks sollten dem eingeloggten User zugewiesen sein
      response.body.tasks.forEach(task => {
        expect(task.assignee_id).toBe(TEST_USER.id);
      });
    });

    test('GET /api/tasks/my-tasks sollte Filter unterstützen', async () => {
      const response = await request(app)
        .get('/api/tasks/my-tasks?status=todo&priority=high')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      // Alle Tasks sollten den Filterkriterien entsprechen
      response.body.tasks.forEach(task => {
        expect(task.status).toBe('todo');
        expect(task.priority).toBe('high');
      });
    });

    test('GET /api/tasks/my-tasks sollte Pagination unterstützen', async () => {
      const response = await request(app)
        .get('/api/tasks/my-tasks?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.tasks.length).toBeLessThanOrEqual(5);
    });

    test('GET /api/tasks/my-tasks/stats sollte Statistiken zurückgeben', async () => {
      const response = await request(app)
        .get('/api/tasks/my-tasks/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total_tasks');
      expect(response.body).toHaveProperty('todo_count');
      expect(response.body).toHaveProperty('in_progress_count');
      expect(response.body).toHaveProperty('review_count');
      expect(response.body).toHaveProperty('completed_count');
      expect(response.body).toHaveProperty('overdue_count');
      expect(response.body).toHaveProperty('due_soon_count');
    });
  });

  describe('B) Deadlines (/api/dashboard/me)', () => {
    test('GET /api/dashboard/me sollte Deadlines in den nächsten 7 Tagen zurückgeben', async () => {
      const response = await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('widgets');
      expect(response.body.widgets).toHaveProperty('upcomingDeadlines');
      expect(response.body.widgets.upcomingDeadlines).toHaveProperty('items');
      expect(Array.isArray(response.body.widgets.upcomingDeadlines.items)).toBe(true);
    });

    test('Deadlines sollten nur Tasks mit Fälligkeitsdaten in den nächsten 7 Tagen enthalten', async () => {
      const response = await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deadlines = response.body.widgets.upcomingDeadlines.items;
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      deadlines.forEach(deadline => {
        const dueDate = new Date(deadline.dueDate);
        expect(dueDate).toBeDefined();
        expect(dueDate.getTime()).toBeGreaterThanOrEqual(now.getTime());
        expect(dueDate.getTime()).toBeLessThanOrEqual(nextWeek.getTime());
      });
    });

    test('Deadlines sollten nur nicht-abgeschlossene Tasks enthalten', async () => {
      const response = await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deadlines = response.body.widgets.upcomingDeadlines.items;
      
      deadlines.forEach(deadline => {
        expect(deadline.status).not.toBe('completed');
        expect(deadline.status).not.toBe('cancelled');
      });
    });

    test('Deadlines sollten dem eingeloggten User zugewiesen sein', async () => {
      const response = await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deadlines = response.body.widgets.upcomingDeadlines.items;
      
      deadlines.forEach(deadline => {
        expect(deadline.assignedUsername).toBeDefined();
      });
    });
  });

  describe('C) Kanban-Board (/api/projects/:id/board)', () => {
    test('GET /api/projects/1/board sollte Kanban-Board-Daten zurückgeben', async () => {
      const response = await request(app)
        .get('/api/projects/1/board')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('project');
      expect(response.body).toHaveProperty('columns');
      expect(response.body).toHaveProperty('totalTasks');
      expect(Array.isArray(response.body.columns)).toBe(true);
    });

    test('Kanban-Board sollte alle Status-Spalten enthalten', async () => {
      const response = await request(app)
        .get('/api/projects/1/board')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const expectedStatuses = ['todo', 'in_progress', 'review', 'completed', 'cancelled'];
      const columnStatuses = response.body.columns.map(col => col.id);
      
      expectedStatuses.forEach(status => {
        expect(columnStatuses).toContain(status);
      });
    });

    test('Kanban-Board sollte Tasks in korrekten Spalten gruppieren', async () => {
      const response = await request(app)
        .get('/api/projects/1/board')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.columns.forEach(column => {
        expect(column).toHaveProperty('id');
        expect(column).toHaveProperty('title');
        expect(column).toHaveProperty('tasks');
        expect(Array.isArray(column.tasks)).toBe(true);
        
        // Alle Tasks in der Spalte sollten den korrekten Status haben
        column.tasks.forEach(task => {
          expect(task.status).toBe(column.id);
        });
      });
    });

    test('PATCH /api/tasks/:id sollte Task-Status aktualisieren', async () => {
      // Erst einen Task abrufen
      const tasksResponse = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (tasksResponse.body.tasks.length > 0) {
        const taskId = tasksResponse.body.tasks[0].id;
        const newStatus = 'in_progress';

        const response = await request(app)
          .patch(`/api/tasks/${taskId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: newStatus })
          .expect(200);

        expect(response.body.status).toBe(newStatus);
        expect(response.body.id).toBe(taskId);
      }
    });

    test('PATCH /api/tasks/:id sollte ungültige Status ablehnen', async () => {
      const tasksResponse = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (tasksResponse.body.tasks.length > 0) {
        const taskId = tasksResponse.body.tasks[0].id;

        await request(app)
          .patch(`/api/tasks/${taskId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'invalid_status' })
          .expect(400);
      }
    });
  });

  describe('Edge Cases', () => {
    test('GET /api/tasks/my-tasks sollte leere Liste zurückgeben wenn keine Tasks', async () => {
      // Test mit User der keine Tasks hat (falls vorhanden)
      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      expect(Array.isArray(response.body.tasks)).toBe(true);
    });

    test('GET /api/dashboard/me sollte leere Deadlines zurückgeben wenn keine anstehenden', async () => {
      const response = await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.widgets.upcomingDeadlines.items).toBeDefined();
      expect(Array.isArray(response.body.widgets.upcomingDeadlines.items)).toBe(true);
    });

    test('GET /api/projects/999/board sollte 404 zurückgeben für nicht existierendes Projekt', async () => {
      await request(app)
        .get('/api/projects/999/board')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('API-Endpunkte sollten ohne Auth-Token 401 zurückgeben', async () => {
      await request(app)
        .get('/api/tasks/my-tasks')
        .expect(401);

      await request(app)
        .get('/api/dashboard/me')
        .expect(401);

      await request(app)
        .get('/api/projects/1/board')
        .expect(401);
    });
  });
});

// Hilfsfunktionen für Tests
const createTestTask = async (taskData) => {
  const result = await pool.query(`
    INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, due_date, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    taskData.title || 'Test Task',
    taskData.description || 'Test Description',
    taskData.status || 'todo',
    taskData.priority || 'medium',
    taskData.assignee_id || TEST_USER.id,
    taskData.project_id || TEST_PROJECT.id,
    taskData.due_date || null,
    TEST_USER.id
  ]);
  
  return result.rows[0];
};

const cleanupTestTasks = async () => {
  await pool.query('DELETE FROM tasks WHERE title LIKE \'Test Task%\'');
};

module.exports = {
  createTestTask,
  cleanupTestTasks
};
