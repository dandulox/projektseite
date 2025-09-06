const request = require('supertest');
const app = require('./server');

// Test-Daten für Dashboard-API
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpassword123'
};

let authToken = '';

describe('Dashboard API Tests', () => {
  beforeAll(async () => {
    // Test-Benutzer erstellen und anmelden
    try {
      // Registrierung
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      authToken = loginResponse.body.token;
    } catch (error) {
      console.warn('Test-Benutzer bereits vorhanden oder Fehler bei der Erstellung:', error.message);
      
      // Versuche Login mit existierendem Benutzer
      try {
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            username: testUser.username,
            password: testUser.password
          });
        authToken = loginResponse.body.token;
      } catch (loginError) {
        console.error('Login-Fehler:', loginError.message);
      }
    }
  });

  describe('GET /api/dashboard/me', () => {
    test('sollte Dashboard-Daten für authentifizierten Benutzer zurückgeben', async () => {
      const response = await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('widgets');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('timezone');
      expect(response.body).toHaveProperty('lastUpdated');

      // Widgets-Struktur prüfen
      expect(response.body.widgets).toHaveProperty('openTasks');
      expect(response.body.widgets).toHaveProperty('upcomingDeadlines');
      expect(response.body.widgets).toHaveProperty('recentProjects');
      expect(response.body.widgets).toHaveProperty('projectProgress');

      // Summary-Struktur prüfen
      expect(response.body.summary).toHaveProperty('totalOpenTasks');
      expect(response.body.summary).toHaveProperty('totalUpcomingDeadlines');
      expect(response.body.summary).toHaveProperty('totalActiveProjects');
      expect(response.body.summary).toHaveProperty('averageProjectProgress');

      // Timezone prüfen
      expect(response.body.timezone).toBe('Europe/Berlin');
    });

    test('sollte 401 für nicht authentifizierte Anfragen zurückgeben', async () => {
      await request(app)
        .get('/api/dashboard/me')
        .expect(401);
    });

    test('sollte 401 für ungültige Token zurückgeben', async () => {
      await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('GET /api/dashboard/me/stats', () => {
    test('sollte Dashboard-Statistiken für authentifizierten Benutzer zurückgeben', async () => {
      const response = await request(app)
        .get('/api/dashboard/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('timezone');
      expect(response.body).toHaveProperty('lastUpdated');

      // Stats-Struktur prüfen
      expect(response.body.stats).toHaveProperty('projects');
      expect(response.body.stats).toHaveProperty('tasks');

      // Projects-Stats prüfen
      expect(response.body.stats.projects).toHaveProperty('total');
      expect(response.body.stats.projects).toHaveProperty('active');
      expect(response.body.stats.projects).toHaveProperty('completed');
      expect(response.body.stats.projects).toHaveProperty('overdue');
      expect(response.body.stats.projects).toHaveProperty('averageProgress');

      // Tasks-Stats prüfen
      expect(response.body.stats.tasks).toHaveProperty('open');
      expect(response.body.stats.tasks).toHaveProperty('completed');
      expect(response.body.stats.tasks).toHaveProperty('upcomingDeadlines');
      expect(response.body.stats.tasks).toHaveProperty('averageProgress');

      // Timezone prüfen
      expect(response.body.timezone).toBe('Europe/Berlin');
    });

    test('sollte 401 für nicht authentifizierte Anfragen zurückgeben', async () => {
      await request(app)
        .get('/api/dashboard/me/stats')
        .expect(401);
    });
  });

  describe('Dashboard Widget-Daten', () => {
    test('sollte korrekte Widget-Datenstruktur zurückgeben', async () => {
      const response = await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { widgets } = response.body;

      // OpenTasks Widget prüfen
      expect(widgets.openTasks).toHaveProperty('title');
      expect(widgets.openTasks).toHaveProperty('count');
      expect(widgets.openTasks).toHaveProperty('items');
      expect(Array.isArray(widgets.openTasks.items)).toBe(true);

      // UpcomingDeadlines Widget prüfen
      expect(widgets.upcomingDeadlines).toHaveProperty('title');
      expect(widgets.upcomingDeadlines).toHaveProperty('count');
      expect(widgets.upcomingDeadlines).toHaveProperty('items');
      expect(Array.isArray(widgets.upcomingDeadlines.items)).toBe(true);

      // RecentProjects Widget prüfen
      expect(widgets.recentProjects).toHaveProperty('title');
      expect(widgets.recentProjects).toHaveProperty('count');
      expect(widgets.recentProjects).toHaveProperty('items');
      expect(Array.isArray(widgets.recentProjects.items)).toBe(true);

      // ProjectProgress Widget prüfen
      expect(widgets.projectProgress).toHaveProperty('title');
      expect(widgets.projectProgress).toHaveProperty('count');
      expect(widgets.projectProgress).toHaveProperty('items');
      expect(Array.isArray(widgets.projectProgress.items)).toBe(true);
    });

    test('sollte Task-Daten mit korrekten Feldern zurückgeben', async () => {
      const response = await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const tasks = response.body.widgets.openTasks.items;

      if (tasks.length > 0) {
        const task = tasks[0];
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('name');
        expect(task).toHaveProperty('status');
        expect(task).toHaveProperty('priority');
        expect(task).toHaveProperty('completionPercentage');
        expect(task).toHaveProperty('projectName');
        expect(task).toHaveProperty('projectId');
      }
    });

    test('sollte Deadline-Daten mit korrekten Feldern zurückgeben', async () => {
      const response = await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deadlines = response.body.widgets.upcomingDeadlines.items;

      if (deadlines.length > 0) {
        const deadline = deadlines[0];
        expect(deadline).toHaveProperty('id');
        expect(deadline).toHaveProperty('name');
        expect(deadline).toHaveProperty('dueDate');
        expect(deadline).toHaveProperty('daysUntilDue');
        expect(deadline).toHaveProperty('projectName');
        expect(deadline).toHaveProperty('projectId');
      }
    });
  });

  describe('Performance Tests', () => {
    test('sollte Dashboard-Daten schnell laden', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Dashboard sollte innerhalb von 2 Sekunden laden
      expect(responseTime).toBeLessThan(2000);
    });

    test('sollte Dashboard-Statistiken schnell laden', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/dashboard/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Statistiken sollten innerhalb von 1 Sekunde laden
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Error Handling', () => {
    test('sollte graceful mit Datenbankfehlern umgehen', async () => {
      // Dieser Test würde normalerweise Datenbankfehler simulieren
      // Für jetzt testen wir nur, dass die API strukturierte Fehler zurückgibt
      const response = await request(app)
        .get('/api/dashboard/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Auch bei leeren Daten sollte die Struktur korrekt sein
      expect(response.body).toHaveProperty('widgets');
      expect(response.body).toHaveProperty('summary');
    });
  });
});

// Hilfsfunktionen für Tests
const createTestProject = async (token, projectData) => {
  return await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send(projectData);
};

const createTestModule = async (token, moduleData) => {
  return await request(app)
    .post('/api/modules/project')
    .set('Authorization', `Bearer ${token}`)
    .send(moduleData);
};

module.exports = {
  createTestProject,
  createTestModule
};
