const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware für JWT-Verifizierung
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Zugriffstoken erforderlich' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, username, email, role, is_active FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Ungültiger Token' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Ungültiger Token' });
  }
};

// Registrierung
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Validierung
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Benutzername, E-Mail und Passwort sind erforderlich' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' });
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
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, passwordHash, role]
    );

    const user = result.rows[0];

    // JWT Token erstellen
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Benutzer erfolgreich erstellt',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registrierungsfehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich' });
    }

    // Benutzer suchen
    const result = await pool.query(
      'SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const user = result.rows[0];

    // Prüfe ob Benutzer aktiv ist
    if (!user.is_active) {
      return res.status(401).json({ error: 'Benutzerkonto ist deaktiviert' });
    }

    // Passwort prüfen
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // JWT Token erstellen
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Erfolgreich angemeldet',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzerprofil abrufen
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Erweiterte Benutzerdaten mit Statistiken abrufen
    const userResult = await pool.query(`
      SELECT 
        u.id, u.username, u.email, u.role, u.is_active, u.created_at, u.updated_at,
        COUNT(DISTINCT p.id) as project_count,
        COUNT(DISTINCT tm.team_id) as team_count,
        COUNT(DISTINCT n.id) as notification_count,
        COUNT(DISTINCT CASE WHEN n.is_read = false THEN n.id END) as unread_notifications
      FROM users u
      LEFT JOIN projects p ON p.owner_id = u.id
      LEFT JOIN team_memberships tm ON tm.user_id = u.id
      LEFT JOIN notifications n ON n.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.email, u.role, u.is_active, u.created_at, u.updated_at
    `, [req.user.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const user = userResult.rows[0];

    // Letzte Aktivität abrufen
    const activityResult = await pool.query(`
      SELECT 
        MAX(created_at) as last_activity
      FROM (
        SELECT created_at FROM project_logs WHERE user_id = $1
        UNION ALL
        SELECT created_at FROM module_logs WHERE user_id = $1
        UNION ALL
        SELECT updated_at FROM projects WHERE owner_id = $1
        UNION ALL
        SELECT updated_at FROM project_modules WHERE assigned_to = $1
      ) activities
    `, [req.user.id]);

    user.last_activity = activityResult.rows[0]?.last_activity || user.created_at;

    res.json({
      user: user
    });
  } catch (error) {
    console.error('Profil-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzerprofil aktualisieren
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Benutzername und E-Mail sind erforderlich' });
    }

    // Prüfe ob Benutzername oder E-Mail bereits von anderen Benutzern verwendet wird
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
      [username, email, req.user.id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
    }

    // Profil aktualisieren
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email, role, created_at, updated_at',
      [username, email, req.user.id]
    );

    const updatedUser = result.rows[0];

    res.json({
      message: 'Profil erfolgreich aktualisiert',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profil-Update-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Passwort ändern
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Aktuelles und neues Passwort sind erforderlich' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Neues Passwort muss mindestens 6 Zeichen lang sein' });
    }

    // Aktuelles Passwort prüfen
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Aktuelles Passwort ist falsch' });
    }

    // Neues Passwort hashen
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Passwort aktualisieren
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, req.user.id]);

    res.json({ message: 'Passwort erfolgreich geändert' });

  } catch (error) {
    console.error('Passwort-Änderungsfehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Token validieren
router.get('/validate', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Detaillierte Benutzerstatistiken abrufen
router.get('/profile/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Projekt-Statistiken
    const projectStats = await pool.query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_projects,
        AVG(completion_percentage) as avg_completion
      FROM projects 
      WHERE owner_id = $1
    `, [userId]);

    // Modul-Statistiken
    const moduleStats = await pool.query(`
      SELECT 
        COUNT(*) as total_modules,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_modules,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_modules,
        SUM(actual_hours) as total_hours,
        SUM(estimated_hours) as estimated_hours
      FROM project_modules 
      WHERE assigned_to = $1
    `, [userId]);

    // Team-Statistiken
    const teamStats = await pool.query(`
      SELECT 
        COUNT(*) as total_teams,
        COUNT(CASE WHEN tm.role = 'leader' THEN 1 END) as leading_teams,
        COUNT(CASE WHEN tm.role = 'member' THEN 1 END) as member_teams
      FROM team_memberships tm
      WHERE tm.user_id = $1
    `, [userId]);

    // Aktivitäts-Statistiken (letzte 30 Tage)
    const activityStats = await pool.query(`
      SELECT 
        COUNT(*) as recent_activities,
        MAX(created_at) as last_activity
      FROM (
        SELECT created_at FROM project_logs WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
        UNION ALL
        SELECT created_at FROM module_logs WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
      ) activities
    `, [userId]);

    res.json({
      projects: projectStats.rows[0],
      modules: moduleStats.rows[0],
      teams: teamStats.rows[0],
      activity: activityStats.rows[0]
    });

  } catch (error) {
    console.error('Statistik-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Anderen Benutzer abrufen
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prüfe ob der Benutzer existiert
    const userResult = await pool.query(`
      SELECT 
        u.id, u.username, u.email, u.role, u.is_active, u.created_at, u.updated_at,
        COUNT(DISTINCT p.id) as project_count,
        COUNT(DISTINCT tm.team_id) as team_count,
        COUNT(DISTINCT n.id) as notification_count,
        COUNT(DISTINCT CASE WHEN n.is_read = false THEN n.id END) as unread_notifications
      FROM users u
      LEFT JOIN projects p ON p.owner_id = u.id
      LEFT JOIN team_memberships tm ON tm.user_id = u.id
      LEFT JOIN notifications n ON n.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.email, u.role, u.is_active, u.created_at, u.updated_at
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const user = userResult.rows[0];

    // Letzte Aktivität abrufen
    const activityResult = await pool.query(`
      SELECT 
        MAX(created_at) as last_activity
      FROM (
        SELECT created_at FROM project_logs WHERE user_id = $1
        UNION ALL
        SELECT created_at FROM module_logs WHERE user_id = $1
        UNION ALL
        SELECT updated_at FROM projects WHERE owner_id = $1
        UNION ALL
        SELECT updated_at FROM project_modules WHERE assigned_to = $1
      ) activities
    `, [userId]);

    user.last_activity = activityResult.rows[0]?.last_activity || user.created_at;

    res.json({
      user: user
    });
  } catch (error) {
    console.error('Benutzer-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Statistiken für anderen Benutzer abrufen
router.get('/user/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Projekt-Statistiken
    const projectStats = await pool.query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_projects,
        AVG(completion_percentage) as avg_completion
      FROM projects 
      WHERE owner_id = $1
    `, [userId]);

    // Modul-Statistiken
    const moduleStats = await pool.query(`
      SELECT 
        COUNT(*) as total_modules,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_modules,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_modules,
        SUM(actual_hours) as total_hours,
        SUM(estimated_hours) as estimated_hours
      FROM project_modules 
      WHERE assigned_to = $1
    `, [userId]);

    // Team-Statistiken
    const teamStats = await pool.query(`
      SELECT 
        COUNT(*) as total_teams,
        COUNT(CASE WHEN tm.role = 'leader' THEN 1 END) as leading_teams,
        COUNT(CASE WHEN tm.role = 'member' THEN 1 END) as member_teams
      FROM team_memberships tm
      WHERE tm.user_id = $1
    `, [userId]);

    // Aktivitäts-Statistiken (letzte 30 Tage)
    const activityStats = await pool.query(`
      SELECT 
        COUNT(*) as recent_activities,
        MAX(created_at) as last_activity
      FROM (
        SELECT created_at FROM project_logs WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
        UNION ALL
        SELECT created_at FROM module_logs WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
      ) activities
    `, [userId]);

    res.json({
      projects: projectStats.rows[0],
      modules: moduleStats.rows[0],
      teams: teamStats.rows[0],
      activity: activityStats.rows[0]
    });

  } catch (error) {
    console.error('Statistik-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Logout (Client-seitig - Token wird gelöscht)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Erfolgreich abgemeldet' });
});

module.exports = { router, authenticateToken };
