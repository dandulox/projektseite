const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const rateLimit = require('express-rate-limit');

// Admin-Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin-Berechtigung erforderlich' });
  }
  next();
};

// Rate-Limiting für API-Debug
const apiDebugRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 Minuten
  max: 30, // 30 Requests pro IP
  message: { error: 'Zu viele API-Debug-Anfragen. Bitte warten Sie.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health-Check Service
const performHealthChecks = async () => {
  const results = {
    app: { ok: true, version: '2.1.0' },
    db: { ok: false, latencyMs: 0 },
    time: { server: new Date().toISOString(), tz: 'Europe/Berlin' },
    uptimeSec: Math.floor(process.uptime())
  };

  // DB-Check
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    results.db.latencyMs = Date.now() - start;
    results.db.ok = true;
  } catch (error) {
    results.db.ok = false;
    results.db.error = error.message;
  }

  // Optional: SMTP-Check (falls konfiguriert)
  if (process.env.ENABLE_SMTP_CHECK === 'true') {
    results.smtp = { ok: false, error: 'SMTP-Check nicht implementiert' };
  }

  // Optional: Storage-Check (falls konfiguriert)
  if (process.env.ENABLE_STORAGE_CHECK === 'true') {
    results.storage = { ok: false, error: 'Storage-Check nicht implementiert' };
  }

  // Optional: Cache-Check (falls konfiguriert)
  if (process.env.ENABLE_CACHE_CHECK === 'true') {
    results.cache = { ok: false, error: 'Cache-Check nicht implementiert' };
  }

  return results;
};

// DB-Status Service
const getDbStatus = async () => {
  try {
    // Prüfe ob alle erwarteten Tabellen existieren
    const expectedTables = [
      'users', 'projects', 'project_modules', 'tasks', 'teams', 
      'team_memberships', 'notifications', 'project_activity_logs',
      'module_activity_logs', 'system_versions'
    ];

    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ANY($1)
    `, [expectedTables]);

    const existingTables = result.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    // Prüfe auf Schema-Drift (vereinfacht)
    let drift = false;
    let summary = 'Schema ist aktuell';

    if (missingTables.length > 0) {
      drift = true;
      summary = `Fehlende Tabellen: ${missingTables.join(', ')}`;
    }

    // Prüfe auf Pending-Migrations (vereinfacht - keine echte Migration-Erkennung)
    const pendingMigrations = [];

    return {
      ok: !drift,
      pendingMigrations,
      drift,
      summary,
      existingTables: existingTables.length,
      expectedTables: expectedTables.length
    };

  } catch (error) {
    return {
      ok: false,
      error: error.message,
      pendingMigrations: [],
      drift: true,
      summary: `Fehler beim Prüfen des Schemas: ${error.message}`
    };
  }
};

// API-Debug Service
const performApiDebug = async (method, path, headers = {}, body = null) => {
  // SSRF-Schutz: Nur relative Pfade erlauben
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    throw new Error('Absolute URLs sind nicht erlaubt');
  }

  // Nur erlaubte Pfade
  const allowedPaths = [
    '/api/me', '/api/projects', '/api/tasks', '/api/health', 
    '/api/dashboard/me', '/api/teams', '/api/notifications'
  ];

  if (!allowedPaths.some(allowed => path.startsWith(allowed))) {
    throw new Error('Pfad nicht in der Whitelist');
  }

  // Body-Größe begrenzen
  if (body && JSON.stringify(body).length > 256 * 1024) {
    throw new Error('Body zu groß (max 256KB)');
  }

  const start = Date.now();
  
  try {
    // Simuliere API-Aufruf (vereinfacht)
    const response = {
      status: 200,
      headers: { 'content-type': 'application/json' },
      data: { message: 'API-Debug erfolgreich', path, method }
    };

    const duration = Date.now() - start;

    return {
      status: response.status,
      ms: duration,
      headers: response.headers,
      jsonTrunc: JSON.stringify(response.data).substring(0, 1000) + '...'
    };

  } catch (error) {
    return {
      status: 500,
      ms: Date.now() - start,
      headers: { 'content-type': 'application/json' },
      jsonTrunc: JSON.stringify({ error: error.message }).substring(0, 1000)
    };
  }
};

// Routes

// GET /api/admin/health
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const health = await performHealthChecks();
    res.json(health);
  } catch (error) {
    console.error('Health-Check-Fehler:', error);
    res.status(500).json({ 
      error: 'Health-Check fehlgeschlagen',
      message: error.message 
    });
  }
});

// GET /api/admin/db/status
router.get('/db/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dbStatus = await getDbStatus();
    res.json(dbStatus);
  } catch (error) {
    console.error('DB-Status-Fehler:', error);
    res.status(500).json({ 
      error: 'DB-Status-Check fehlgeschlagen',
      message: error.message 
    });
  }
});

// POST /api/admin/api-debug
router.post('/api-debug', authenticateToken, requireAdmin, apiDebugRateLimit, async (req, res) => {
  try {
    const { method, path, headers, body } = req.body;

    if (!method || !path) {
      return res.status(400).json({ error: 'Method und Path sind erforderlich' });
    }

    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      return res.status(400).json({ error: 'Ungültige HTTP-Methode' });
    }

    const result = await performApiDebug(method, path, headers, body);
    res.json(result);

  } catch (error) {
    console.error('API-Debug-Fehler:', error);
    res.status(400).json({ 
      error: 'API-Debug fehlgeschlagen',
      message: error.message 
    });
  }
});

module.exports = router;