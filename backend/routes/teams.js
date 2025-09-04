const express = require('express');
const { Pool } = require('pg');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'projektseite',
  password: process.env.DB_PASSWORD || 'secure_password_123',
  port: process.env.DB_PORT || 5432,
});

// Hilfsfunktion: Prüft ob Benutzer Team-Leader oder Admin ist
const isTeamLeaderOrAdmin = async (userId, teamId) => {
  const result = await pool.query(`
    SELECT tm.role, u.role as user_role
    FROM team_memberships tm
    JOIN users u ON u.id = tm.user_id
    WHERE tm.team_id = $1 AND tm.user_id = $2
  `, [teamId, userId]);
  
  if (result.rows.length === 0) return false;
  const { role, user_role } = result.rows[0];
  return role === 'leader' || user_role === 'admin';
};

// Hilfsfunktion: Prüft ob Benutzer Team-Mitglied ist
const isTeamMember = async (userId, teamId) => {
  const result = await pool.query(
    'SELECT id FROM team_memberships WHERE team_id = $1 AND user_id = $2',
    [teamId, userId]
  );
  return result.rows.length > 0;
};

// Alle Teams abrufen (für Admin) oder Teams des Benutzers
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query, params;
    
    if (req.user.role === 'admin') {
      // Admin sieht alle Teams
      query = `
        SELECT t.*, 
               u.username as leader_username,
               COUNT(tm.user_id) as member_count
        FROM teams t
        LEFT JOIN users u ON u.id = t.team_leader_id
        LEFT JOIN team_memberships tm ON tm.team_id = t.id
        WHERE t.is_active = true
        GROUP BY t.id, u.username
        ORDER BY t.created_at DESC
      `;
      params = [];
    } else {
      // Benutzer sieht nur seine Teams
      query = `
        SELECT t.*, 
               u.username as leader_username,
               COUNT(tm.user_id) as member_count,
               tm.role as user_role
        FROM teams t
        LEFT JOIN users u ON u.id = t.team_leader_id
        LEFT JOIN team_memberships tm ON tm.team_id = t.id
        INNER JOIN team_memberships user_membership ON user_membership.team_id = t.id AND user_membership.user_id = $1
        WHERE t.is_active = true
        GROUP BY t.id, u.username, tm.role
        ORDER BY t.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json({ teams: result.rows });
  } catch (error) {
    console.error('Fehler beim Abrufen der Teams:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Einzelnes Team abrufen
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;
    
    // Prüfe ob Benutzer Zugriff auf das Team hat
    if (req.user.role !== 'admin' && !(await isTeamMember(req.user.id, teamId))) {
      return res.status(403).json({ error: 'Keine Berechtigung für dieses Team' });
    }

    // Team-Details abrufen
    const teamResult = await pool.query(`
      SELECT t.*, u.username as leader_username
      FROM teams t
      LEFT JOIN users u ON u.id = t.team_leader_id
      WHERE t.id = $1 AND t.is_active = true
    `, [teamId]);

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team nicht gefunden' });
    }

    // Team-Mitglieder abrufen
    const membersResult = await pool.query(`
      SELECT u.id, u.username, u.email, u.role as user_role, tm.role as team_role, tm.joined_at
      FROM team_memberships tm
      JOIN users u ON u.id = tm.user_id
      WHERE tm.team_id = $1
      ORDER BY tm.role DESC, tm.joined_at ASC
    `, [teamId]);

    // Team-Projekte abrufen
    const projectsResult = await pool.query(`
      SELECT p.*, u.username as owner_username
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_id
      WHERE p.team_id = $1
      ORDER BY p.created_at DESC
    `, [teamId]);

    res.json({
      team: teamResult.rows[0],
      members: membersResult.rows,
      projects: projectsResult.rows
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Teams:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neues Team erstellen
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team-Name ist erforderlich' });
    }

    // Team erstellen
    const teamResult = await pool.query(`
      INSERT INTO teams (name, description, team_leader_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, req.user.id]);

    const team = teamResult.rows[0];

    // Ersteller als Team-Leader hinzufügen
    await pool.query(`
      INSERT INTO team_memberships (team_id, user_id, role)
      VALUES ($1, $2, 'leader')
    `, [team.id, req.user.id]);

    res.status(201).json({
      message: 'Team erfolgreich erstellt',
      team
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Teams:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Team aktualisieren
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;
    const { name, description, team_leader_id } = req.body;

    // Prüfe Berechtigung
    if (!(await isTeamLeaderOrAdmin(req.user.id, teamId))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten des Teams' });
    }

    // Team aktualisieren
    const result = await pool.query(`
      UPDATE teams 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          team_leader_id = COALESCE($3, team_leader_id),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [name, description, team_leader_id, teamId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team nicht gefunden' });
    }

    // Falls Team-Leader geändert wurde, Rollen aktualisieren
    if (team_leader_id) {
      await pool.query(`
        UPDATE team_memberships 
        SET role = CASE 
          WHEN user_id = $1 THEN 'leader'
          WHEN role = 'leader' THEN 'member'
          ELSE role
        END
        WHERE team_id = $2
      `, [team_leader_id, teamId]);
    }

    res.json({
      message: 'Team erfolgreich aktualisiert',
      team: result.rows[0]
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Teams:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Team-Mitglied hinzufügen
router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;
    const { user_id, role = 'member' } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Benutzer-ID ist erforderlich' });
    }

    // Prüfe Berechtigung
    if (!(await isTeamLeaderOrAdmin(req.user.id, teamId))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Hinzufügen von Mitgliedern' });
    }

    // Prüfe ob Benutzer existiert
    const userResult = await pool.query('SELECT id, username FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Mitglied hinzufügen
    const result = await pool.query(`
      INSERT INTO team_memberships (team_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [teamId, user_id, role]);

    res.status(201).json({
      message: 'Mitglied erfolgreich hinzugefügt',
      membership: result.rows[0],
      user: userResult.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Benutzer ist bereits Mitglied des Teams' });
    }
    console.error('Fehler beim Hinzufügen des Mitglieds:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Team-Mitglied entfernen
router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.params.userId;

    // Prüfe Berechtigung
    if (!(await isTeamLeaderOrAdmin(req.user.id, teamId))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Entfernen von Mitgliedern' });
    }

    // Prüfe ob es sich um den Team-Leader handelt
    const leaderResult = await pool.query(
      'SELECT team_leader_id FROM teams WHERE id = $1',
      [teamId]
    );
    
    if (leaderResult.rows.length > 0 && leaderResult.rows[0].team_leader_id == userId) {
      return res.status(400).json({ error: 'Team-Leader kann nicht entfernt werden' });
    }

    // Mitglied entfernen
    const result = await pool.query(`
      DELETE FROM team_memberships 
      WHERE team_id = $1 AND user_id = $2
      RETURNING *
    `, [teamId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mitgliedschaft nicht gefunden' });
    }

    res.json({ message: 'Mitglied erfolgreich entfernt' });
  } catch (error) {
    console.error('Fehler beim Entfernen des Mitglieds:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Team-Mitgliedschaft verlassen
router.delete('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;

    // Prüfe ob es sich um den Team-Leader handelt
    const leaderResult = await pool.query(
      'SELECT team_leader_id FROM teams WHERE id = $1',
      [teamId]
    );
    
    if (leaderResult.rows.length > 0 && leaderResult.rows[0].team_leader_id == req.user.id) {
      return res.status(400).json({ error: 'Team-Leader kann das Team nicht verlassen' });
    }

    // Mitgliedschaft entfernen
    const result = await pool.query(`
      DELETE FROM team_memberships 
      WHERE team_id = $1 AND user_id = $2
      RETURNING *
    `, [teamId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sie sind kein Mitglied dieses Teams' });
    }

    res.json({ message: 'Team erfolgreich verlassen' });
  } catch (error) {
    console.error('Fehler beim Verlassen des Teams:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Team löschen (nur für Admin oder Team-Leader)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;

    // Prüfe Berechtigung
    if (req.user.role !== 'admin' && !(await isTeamLeaderOrAdmin(req.user.id, teamId))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Löschen des Teams' });
    }

    // Team deaktivieren (soft delete)
    const result = await pool.query(`
      UPDATE teams 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [teamId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team nicht gefunden' });
    }

    res.json({ message: 'Team erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Teams:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;
