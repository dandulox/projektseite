const request = require('supertest');
const app = require('./server');

// Mock JWT Token für Admin-User
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzMzNzQ4MDAwfQ.test';

describe('Admin API Endpoints', () => {
  describe('GET /api/admin/health', () => {
    it('should return health status for admin user', async () => {
      const response = await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('app');
      expect(response.body.app).toHaveProperty('ok', true);
      expect(response.body.app).toHaveProperty('version');
      expect(response.body).toHaveProperty('db');
      expect(response.body.db).toHaveProperty('ok');
      expect(response.body.db).toHaveProperty('latencyMs');
      expect(response.body).toHaveProperty('time');
      expect(response.body).toHaveProperty('uptimeSec');
    });

    it('should require admin role', async () => {
      const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InVzZXIiLCJpYXQiOjE3MzM3NDgwMDB9.test';
      
      await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/admin/health')
        .expect(401);
    });
  });

  describe('GET /api/admin/db/status', () => {
    it('should return database status for admin user', async () => {
      const response = await request(app)
        .get('/api/admin/db/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('ok');
      expect(response.body).toHaveProperty('pendingMigrations');
      expect(response.body).toHaveProperty('drift');
      expect(response.body).toHaveProperty('summary');
      expect(Array.isArray(response.body.pendingMigrations)).toBe(true);
    });

    it('should require admin role', async () => {
      const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InVzZXIiLCJpYXQiOjE3MzM3NDgwMDB9.test';
      
      await request(app)
        .get('/api/admin/db/status')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('POST /api/admin/api-debug', () => {
    it('should execute API debug request for admin user', async () => {
      const response = await request(app)
        .post('/api/admin/api-debug')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          method: 'GET',
          path: '/api/me'
        })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('ms');
      expect(response.body).toHaveProperty('headers');
      expect(response.body).toHaveProperty('jsonTrunc');
      expect(typeof response.body.ms).toBe('number');
    });

    it('should reject absolute URLs', async () => {
      const response = await request(app)
        .post('/api/admin/api-debug')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          method: 'GET',
          path: 'https://example.com/api/test'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Absolute URLs sind nicht erlaubt');
    });

    it('should reject non-whitelisted paths', async () => {
      const response = await request(app)
        .post('/api/admin/api-debug')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          method: 'GET',
          path: '/api/unauthorized-endpoint'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Pfad nicht in der Whitelist');
    });

    it('should require method and path', async () => {
      const response = await request(app)
        .post('/api/admin/api-debug')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Method und Path sind erforderlich');
    });

    it('should enforce rate limiting', async () => {
      // Simuliere viele Anfragen
      const promises = Array(35).fill().map(() => 
        request(app)
          .post('/api/admin/api-debug')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            method: 'GET',
            path: '/api/me'
          })
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should require admin role', async () => {
      const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InVzZXIiLCJpYXQiOjE3MzM3NDgwMDB9.test';
      
      await request(app)
        .post('/api/admin/api-debug')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          method: 'GET',
          path: '/api/me'
        })
        .expect(403);
    });
  });
});
