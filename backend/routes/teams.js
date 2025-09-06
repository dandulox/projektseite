const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const { createNotification, createTeamNotification } = require('./notifications');
const { asyncHandler } = require('../middleware/errorHandler');
const { getTeamsSimple, getTeamSimple } = require('../middleware/databaseFallback');
const router = express.Router();

// Hilfsfunktion: Prüft ob Benutzer Team-Leader oder Admin ist
const isTeamLeaderOrAdmin = async (userId, teamId) => {
  try {
    const result = await pool.query(`
      SELECT tm.role, u.role as user_role
      FROM team_memberships tm
      JOIN users u ON u.id = tm.user_id
      WHERE tm.team_id = $1 AND tm.user_id = $2
    `, [teamId, userId]);
    
    if (result.rows.length === 0) return false;
    const { role, user_role } = result.rows[0];
    return role === 'leader' || user_role === 'admin';
  } catch (error) {
    if (error.message.includes('relation "team_memberships" does not exist')) {
      console.warn('Team-Mitgliedschaften-Tabelle existiert nicht');
      return false;
    }
    throw error;
  }
};

// Hilfsfunktion: Prüft ob Benutzer Team-Mitglied ist
const isTeamMember = async (userId, teamId) => {
  try {
    const result = await pool.query(
      'SELECT id FROM team_memberships WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );
    return result.rows.length > 0;
  } catch (error) {
    if (error.message.includes('relation "team_memberships" does not exist')) {
      console.warn('Team-Mitgliedschaften-Tabelle existiert nicht');
      return false;
    }
    throw error;
  }
};

// Alle Teams abrufen (für Admin) oder Teams des Benutzers
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
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
    if (error.message.includes('relation "teams" does not exist') || 
        error.message.includes('relation "team_memberships" does not exist')) {
      console.warn('Teams-Tabellen existieren nicht, verwende Fallback');
      // Verwende Fallback-System
      const teams = await getTeamsSimple(req.user.id, 50);
      res.json({ teams });
    } else {
      console.error('Fehler beim Abrufen der Teams:', error);
      console.error('Fehler-Details:', error.message);
      res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }
}));

// Einzelnes Team abrufen
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const teamId = req.params.id;
    
    // Prüfe ob Benutzer Zugriff auf das Team hat
    if (req.user.role !== 'admin') {
      try {
        if (!(await isTeamMember(req.user.id, teamId))) {
          return res.status(403).json({ error: 'Keine Berechtigung für dieses Team' });
        }
      } catch (memberError) {
        console.warn('Team-Mitgliedschaft konnte nicht geprüft werden:', memberError.message);
        // Wenn Team-Mitgliedschaften nicht geprüft werden können, erlaube Zugriff für Admin
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Keine Berechtigung für dieses Team' });
        }
      }
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

    // Team-Mitglieder abrufen (falls Tabelle existiert)
    let membersResult = { rows: [] };
    try {
      membersResult = await pool.query(`
        SELECT u.id, u.username, u.email, u.role as user_role, tm.role as team_role, tm.joined_at
        FROM team_memberships tm
        JOIN users u ON u.id = tm.user_id
        WHERE tm.team_id = $1
        ORDER BY tm.role DESC, tm.joined_at ASC
      `, [teamId]);
    } catch (membersError) {
      console.warn('Konnte Team-Mitglieder nicht laden:', membersError.message);
    }

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
    if (error.message.includes('relation "teams" does not exist')) {
      console.warn('Teams-Tabelle existiert nicht, verwende Fallback');
      // Verwende Fallback-System
      const teamData = await getTeamSimple(req.params.id);
      if (!teamData) {
        return res.status(404).json({ error: 'Team nicht gefunden' });
      }
      res.json(teamData);
    } else {
      console.error('Fehler beim Abrufen des Teams:', error);
      console.error('Fehler-Details:', error.message);
      res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }
}));

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

    // Ersteller als Team-Leader hinzufügen (falls Tabelle existiert)
    try {
      await pool.query(`
        INSERT INTO team_memberships (team_id, user_id, role)
        VALUES ($1, $2, 'leader')
      `, [team.id, req.user.id]);
    } catch (membershipError) {
      console.warn('Konnte Team-Mitgliedschaft nicht erstellen:', membershipError.message);
      // Team-Mitgliedschafts-Fehler sollten das Team-Erstellen nicht blockieren
    }

    res.status(201).json({
      message: 'Team erfolgreich erstellt',
      team
    });
  } catch (error) {
    if (error.message.includes('relation "teams" does not exist')) {
      console.warn('Teams-Tabelle existiert nicht');
      res.status(503).json({ error: 'Team-Funktionalität nicht verfügbar' });
    } else {
      console.error('Fehler beim Erstellen des Teams:', error);
      console.error('Fehler-Details:', error.message);
      res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }
});

// Team aktualisieren
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;
    const { name, description, team_leader_id } = req.body;

    // Prüfe Berechtigung
    if (req.user.role !== 'admin') {
      try {
        if (!(await isTeamLeaderOrAdmin(req.user.id, teamId))) {
          return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten des Teams' });
        }
      } catch (leaderError) {
        console.warn('Team-Leader-Berechtigung konnte nicht geprüft werden:', leaderError.message);
        return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten des Teams' });
      }
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

    // Falls Team-Leader geändert wurde, Rollen aktualisieren (falls Tabelle existiert)
    if (team_leader_id) {
      try {
        await pool.query(`
          UPDATE team_memberships 
          SET role = CASE 
            WHEN user_id = $1 THEN 'leader'
            WHEN role = 'leader' THEN 'member'
            ELSE role
          END
          WHERE team_id = $2
        `, [team_leader_id, teamId]);
      } catch (membershipError) {
        console.warn('Konnte Team-Mitgliedschaften nicht aktualisieren:', membershipError.message);
        // Team-Mitgliedschafts-Fehler sollten das Team-Update nicht blockieren
      }
    }

    res.json({
      message: 'Team erfolgreich aktualisiert',
      team: result.rows[0]
    });
  } catch (error) {
    if (error.message.includes('relation "teams" does not exist')) {
      console.warn('Teams-Tabelle existiert nicht');
      res.status(503).json({ error: 'Team-Funktionalität nicht verfügbar' });
    } else {
      console.error('Fehler beim Aktualisieren des Teams:', error);
      console.error('Fehler-Details:', error.message);
      res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
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
    if (req.user.role !== 'admin') {
      try {
        if (!(await isTeamLeaderOrAdmin(req.user.id, teamId))) {
          return res.status(403).json({ error: 'Keine Berechtigung zum Hinzufügen von Mitgliedern' });
        }
      } catch (leaderError) {
        console.warn('Team-Leader-Berechtigung konnte nicht geprüft werden:', leaderError.message);
        return res.status(403).json({ error: 'Keine Berechtigung zum Hinzufügen von Mitgliedern' });
      }
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

    // Team-Informationen für Benachrichtigung abrufen
    let teamName = 'Unbekanntes Team';
    try {
      const teamResult = await pool.query('SELECT name FROM teams WHERE id = $1', [teamId]);
      teamName = teamResult.rows[0]?.name || 'Unbekanntes Team';
    } catch (teamError) {
      console.warn('Team-Information konnte nicht abgerufen werden:', teamError.message);
    }

    // Benachrichtigungen erstellen
    try {
      // Benachrichtigung für das neue Mitglied
      await createNotification({
        userId: user_id,
        type: 'team_invite',
        title: 'Team-Einladung',
        message: `Sie wurden zu dem Team "${teamName}" hinzugefügt.`,
        fromUserId: req.user.id,
        teamId: teamId,
        actionUrl: `/teams/${teamId}`
      });

      // Benachrichtigung für andere Team-Mitglieder
      await createTeamNotification(teamId, {
        type: 'team_join',
        title: 'Neues Team-Mitglied',
        message: `${userResult.rows[0].username} ist dem Team "${teamName}" beigetreten.`,
        fromUserId: req.user.id,
        teamId: teamId,
        actionUrl: `/teams/${teamId}`
      });
    } catch (notificationError) {
      console.error('Fehler beim Erstellen der Benachrichtigungen:', notificationError);
      // Benachrichtigungsfehler sollten das Hinzufügen nicht blockieren
    }

    res.status(201).json({
      message: 'Mitglied erfolgreich hinzugefügt',
      membership: result.rows[0],
      user: userResult.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Benutzer ist bereits Mitglied des Teams' });
    }
    if (error.message.includes('relation "team_memberships" does not exist')) {
      console.warn('Team-Mitgliedschaften-Tabelle existiert nicht');
      res.status(503).json({ error: 'Team-Funktionalität nicht verfügbar' });
    } else {
      console.error('Fehler beim Hinzufügen des Mitglieds:', error);
      console.error('Fehler-Details:', error.message);
      res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }
});

// Team-Mitglied entfernen
router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.params.userId;

    // Prüfe Berechtigung
    if (req.user.role !== 'admin') {
      try {
        if (!(await isTeamLeaderOrAdmin(req.user.id, teamId))) {
          return res.status(403).json({ error: 'Keine Berechtigung zum Entfernen von Mitgliedern' });
        }
      } catch (leaderError) {
        console.warn('Team-Leader-Berechtigung konnte nicht geprüft werden:', leaderError.message);
        return res.status(403).json({ error: 'Keine Berechtigung zum Entfernen von Mitgliedern' });
      }
    }

    // Prüfe ob es sich um den Team-Leader handelt
    try {
      const leaderResult = await pool.query(
        'SELECT team_leader_id FROM teams WHERE id = $1',
        [teamId]
      );
      
      if (leaderResult.rows.length > 0 && leaderResult.rows[0].team_leader_id == userId) {
        return res.status(400).json({ error: 'Team-Leader kann nicht entfernt werden' });
      }
    } catch (leaderError) {
      console.warn('Team-Leader-Information konnte nicht abgerufen werden:', leaderError.message);
      // Ignoriere Fehler bei Team-Leader-Prüfung
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
    if (error.message.includes('relation "team_memberships" does not exist')) {
      console.warn('Team-Mitgliedschaften-Tabelle existiert nicht');
      res.status(503).json({ error: 'Team-Funktionalität nicht verfügbar' });
    } else {
      console.error('Fehler beim Entfernen des Mitglieds:', error);
      console.error('Fehler-Details:', error.message);
      res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }
});

// Team-Mitgliedschaft verlassen
router.delete('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;

    // Prüfe ob es sich um den Team-Leader handelt
    try {
      const leaderResult = await pool.query(
        'SELECT team_leader_id FROM teams WHERE id = $1',
        [teamId]
      );
      
      if (leaderResult.rows.length > 0 && leaderResult.rows[0].team_leader_id == req.user.id) {
        return res.status(400).json({ error: 'Team-Leader kann das Team nicht verlassen' });
      }
    } catch (leaderError) {
      console.warn('Team-Leader-Information konnte nicht abgerufen werden:', leaderError.message);
      // Ignoriere Fehler bei Team-Leader-Prüfung
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

    // Team-Informationen für Benachrichtigung abrufen
    let teamName = 'Unbekanntes Team';
    try {
      const teamResult = await pool.query('SELECT name FROM teams WHERE id = $1', [teamId]);
      teamName = teamResult.rows[0]?.name || 'Unbekanntes Team';
    } catch (teamError) {
      console.warn('Team-Information konnte nicht abgerufen werden:', teamError.message);
    }

    // Benachrichtigung für andere Team-Mitglieder
    try {
      await createTeamNotification(teamId, {
        type: 'team_leave',
        title: 'Mitglied hat Team verlassen',
        message: `${req.user.username} hat das Team "${teamName}" verlassen.`,
        fromUserId: req.user.id,
        teamId: teamId,
        actionUrl: `/teams/${teamId}`
      });
    } catch (notificationError) {
      console.error('Fehler beim Erstellen der Benachrichtigungen:', notificationError);
      // Benachrichtigungsfehler sollten das Verlassen nicht blockieren
    }

    res.json({ message: 'Team erfolgreich verlassen' });
  } catch (error) {
    if (error.message.includes('relation "team_memberships" does not exist')) {
      console.warn('Team-Mitgliedschaften-Tabelle existiert nicht');
      res.status(503).json({ error: 'Team-Funktionalität nicht verfügbar' });
    } else {
      console.error('Fehler beim Verlassen des Teams:', error);
      console.error('Fehler-Details:', error.message);
      res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }
});

// Team löschen (nur für Admin oder Team-Leader)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;

    // Prüfe Berechtigung
    if (req.user.role !== 'admin') {
      try {
        if (!(await isTeamLeaderOrAdmin(req.user.id, teamId))) {
          return res.status(403).json({ error: 'Keine Berechtigung zum Löschen des Teams' });
        }
      } catch (leaderError) {
        console.warn('Team-Leader-Berechtigung konnte nicht geprüft werden:', leaderError.message);
        return res.status(403).json({ error: 'Keine Berechtigung zum Löschen des Teams' });
      }
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
    if (error.message.includes('relation "teams" does not exist')) {
      console.warn('Teams-Tabelle existiert nicht');
      res.status(503).json({ error: 'Team-Funktionalität nicht verfügbar' });
    } else {
      console.error('Fehler beim Löschen des Teams:', error);
      console.error('Fehler-Details:', error.message);
      res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
  }
});

module.exports = router;
