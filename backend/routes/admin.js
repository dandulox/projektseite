const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Middleware für Admin-Berechtigung
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin-Berechtigung erforderlich' });
  }
  next();
};

// Alle Benutzer abrufen
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, email, role, is_active, created_at, updated_at FROM users';
    let countQuery = 'SELECT COUNT(*) FROM users';
    const queryParams = [];
    const conditions = [];

    // Suchfilter
    if (search) {
      conditions.push(`(username ILIKE $${queryParams.length + 1} OR email ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
    }

    // Rollenfilter
    if (role) {
      conditions.push(`role = $${queryParams.length + 1}`);
      queryParams.push(role);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // Gesamtanzahl abrufen
    const countResult = await pool.query(countQuery, queryParams);
    const totalUsers = parseInt(countResult.rows[0].count);

    // Benutzer mit Paginierung abrufen
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });

  } catch (error) {
    console.error('Benutzer-Abruf-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Einzelnen Benutzer abrufen
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, username, email, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Benutzer-Abruf-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzer erstellen
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Validierung
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Benutzername, E-Mail und Passwort sind erforderlich' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' });
    }

    if (!['admin', 'user', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Ungültige Rolle' });
    }

    // Prüfe ob Benutzer bereits existiert
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
    }

    // Passwort hashen
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Benutzer erstellen
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, is_active, created_at',
      [username, email, passwordHash, role]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'Benutzer erfolgreich erstellt',
      user
    });

  } catch (error) {
    console.error('Benutzer-Erstellungsfehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzer aktualisieren
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, is_active } = req.body;

    // Validierung
    if (role && !['admin', 'user', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Ungültige Rolle' });
    }

    // Prüfe ob Benutzer existiert
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Prüfe ob Benutzername/E-Mail bereits vergeben (außer für aktuellen Benutzer)
    if (username || email) {
      const conflictQuery = 'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3';
      const conflictResult = await pool.query(conflictQuery, [username, email, id]);
      
      if (conflictResult.rows.length > 0) {
        return res.status(400).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
      }
    }

    // Update-Felder zusammenstellen
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (username) {
      updateFields.push(`username = $${paramCount++}`);
      updateValues.push(username);
    }

    if (email) {
      updateFields.push(`email = $${paramCount++}`);
      updateValues.push(email);
    }

    if (role) {
      updateFields.push(`role = $${paramCount++}`);
      updateValues.push(role);
    }

    if (typeof is_active === 'boolean') {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Keine zu aktualisierenden Felder angegeben' });
    }

    updateValues.push(id);
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, role, is_active, created_at, updated_at`;

    const result = await pool.query(query, updateValues);

    res.json({
      message: 'Benutzer erfolgreich aktualisiert',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Benutzer-Update-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzer-Passwort zurücksetzen
router.put('/users/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Neues Passwort ist erforderlich' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' });
    }

    // Prüfe ob Benutzer existiert
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Neues Passwort hashen
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Passwort aktualisieren
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);

    res.json({ message: 'Passwort erfolgreich zurückgesetzt' });

  } catch (error) {
    console.error('Passwort-Reset-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzer löschen
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prüfe ob Benutzer existiert
    const existingUser = await pool.query('SELECT id, username FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Verhindere Löschung des eigenen Accounts
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Sie können Ihren eigenen Account nicht löschen' });
    }

    // Benutzer löschen
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'Benutzer erfolgreich gelöscht' });

  } catch (error) {
    console.error('Benutzer-Löschfehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// System-Statistiken
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Benutzer-Statistiken
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
        COUNT(CASE WHEN role = 'viewer' THEN 1 END) as viewer_users
      FROM users
    `);

    // Projekt-Statistiken
    const projectStats = await pool.query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_projects
      FROM projects
    `);

    // Modul-Statistiken
    const moduleStats = await pool.query(`
      SELECT 
        COUNT(*) as total_modules,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_modules,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_modules
      FROM project_modules
    `);

    res.json({
      users: userStats.rows[0],
      projects: projectStats.rows[0],
      modules: moduleStats.rows[0]
    });

  } catch (error) {
    console.error('Statistik-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;
