const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('./auth');

// Benachrichtigungen für einen Benutzer abrufen
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, limit = 20, offset = 0 } = req.query;

    // Prüfe ob notifications-Tabelle existiert
    try {
      let query = `
        SELECT n.*, 
               u.username as from_username
        FROM notifications n
        LEFT JOIN users u ON n.from_user_id = u.id
        WHERE n.user_id = $1 AND n.is_read = false
      `;
      
      const params = [userId];
      let paramCount = 1;

      if (type && (type === 'private' || type === 'team')) {
        if (type === 'private') {
          query += ` AND n.team_id IS NULL`;
        } else {
          query += ` AND n.team_id IS NOT NULL`;
        }
      }

      query += ` ORDER BY n.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      params.push(parseInt(limit), parseInt(offset));

      const result = await db.query(query, params);
      
      // Versuche, Team- und Projekt-Namen hinzuzufügen (falls Tabellen existieren)
      const notificationsWithDetails = await Promise.all(result.rows.map(async (notification) => {
        const notificationWithDetails = { ...notification, team_name: null, project_title: null };
        
        try {
          // Team-Name hinzufügen
          if (notification.team_id) {
            const teamResult = await db.query('SELECT name FROM teams WHERE id = $1', [notification.team_id]);
            if (teamResult.rows.length > 0) {
              notificationWithDetails.team_name = teamResult.rows[0].name;
            }
          }
          
          // Projekt-Titel hinzufügen
          if (notification.project_id) {
            const projectResult = await db.query('SELECT name FROM projects WHERE id = $1', [notification.project_id]);
            if (projectResult.rows.length > 0) {
              notificationWithDetails.project_title = projectResult.rows[0].name;
            }
          }
        } catch (detailError) {
          console.warn('Konnte Benachrichtigungs-Details nicht laden:', detailError.message);
          // Ignoriere Fehler bei optionalen Details
        }
        
        return notificationWithDetails;
      }));

      res.json({
        success: true,
        notifications: notificationsWithDetails,
        total: notificationsWithDetails.length
      });
    } catch (tableError) {
      if (tableError.message.includes('relation "notifications" does not exist')) {
        console.warn('Benachrichtigungen-Tabelle existiert nicht');
        res.json({
          success: true,
          notifications: [],
          total: 0
        });
      } else {
        throw tableError;
      }
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Benachrichtigungen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Benachrichtigungen' });
  }
});

// Benachrichtigung als gelesen markieren
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    try {
      const result = await db.query(
        'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Benachrichtigung nicht gefunden' });
      }

      res.json({ success: true, message: 'Benachrichtigung als gelesen markiert' });
    } catch (tableError) {
      if (tableError.message.includes('relation "notifications" does not exist')) {
        console.warn('Benachrichtigungen-Tabelle existiert nicht');
        res.status(404).json({ error: 'Benachrichtigung nicht gefunden' });
      } else {
        throw tableError;
      }
    }
  } catch (error) {
    console.error('Fehler beim Markieren der Benachrichtigung:', error);
    res.status(500).json({ error: 'Fehler beim Markieren der Benachrichtigung' });
  }
});

// Alle Benachrichtigungen als gelesen markieren
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.body;

    try {
      let query = 'UPDATE notifications SET is_read = true WHERE user_id = $1';
      const params = [userId];

      if (type && (type === 'private' || type === 'team')) {
        if (type === 'private') {
          query += ' AND team_id IS NULL';
        } else {
          query += ' AND team_id IS NOT NULL';
        }
      }

      await db.query(query, params);

      res.json({ success: true, message: 'Alle Benachrichtigungen als gelesen markiert' });
    } catch (tableError) {
      if (tableError.message.includes('relation "notifications" does not exist')) {
        console.warn('Benachrichtigungen-Tabelle existiert nicht');
        res.json({ success: true, message: 'Alle Benachrichtigungen als gelesen markiert' });
      } else {
        throw tableError;
      }
    }
  } catch (error) {
    console.error('Fehler beim Markieren aller Benachrichtigungen:', error);
    res.status(500).json({ error: 'Fehler beim Markieren aller Benachrichtigungen' });
  }
});

// Benachrichtigung löschen
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    try {
      const result = await db.query(
        'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Benachrichtigung nicht gefunden' });
      }

      res.json({ success: true, message: 'Benachrichtigung gelöscht' });
    } catch (tableError) {
      if (tableError.message.includes('relation "notifications" does not exist')) {
        console.warn('Benachrichtigungen-Tabelle existiert nicht');
        res.status(404).json({ error: 'Benachrichtigung nicht gefunden' });
      } else {
        throw tableError;
      }
    }
  } catch (error) {
    console.error('Fehler beim Löschen der Benachrichtigung:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Benachrichtigung' });
  }
});

// Anzahl ungelesener Benachrichtigungen abrufen
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      const privateResult = await db.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false AND team_id IS NULL',
        [userId]
      );

      const teamResult = await db.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false AND team_id IS NOT NULL',
        [userId]
      );

      const privateCount = privateResult.rows[0];
      const teamCount = teamResult.rows[0];

      res.json({
        success: true,
        counts: {
          private: parseInt(privateCount.count),
          team: parseInt(teamCount.count),
          total: parseInt(privateCount.count) + parseInt(teamCount.count)
        }
      });
    } catch (tableError) {
      if (tableError.message.includes('relation "notifications" does not exist')) {
        console.warn('Benachrichtigungen-Tabelle existiert nicht');
        res.json({
          success: true,
          counts: {
            private: 0,
            team: 0,
            total: 0
          }
        });
      } else {
        throw tableError;
      }
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Benachrichtigungsanzahl:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Benachrichtigungsanzahl' });
  }
});

// Hilfsfunktion zum Erstellen von Benachrichtigungen (für andere Module)
const createNotification = async (data) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      fromUserId = null,
      teamId = null,
      projectId = null,
      actionUrl = null
    } = data;

    const result = await db.query(
      `INSERT INTO notifications 
       (user_id, type, title, message, from_user_id, team_id, project_id, action_url, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id`,
      [userId, type, title, message, fromUserId, teamId, projectId, actionUrl]
    );

    return result.rows[0].id;
  } catch (error) {
    if (error.message.includes('relation "notifications" does not exist')) {
      console.warn('Benachrichtigungen-Tabelle existiert nicht, ignoriere Benachrichtigung');
      return null;
    }
    console.error('Fehler beim Erstellen der Benachrichtigung:', error);
    // Benachrichtigungsfehler sollten das Haupt-Feature nicht blockieren
    return null;
  }
};

// Benachrichtigungen für Team-Mitglieder erstellen
const createTeamNotification = async (teamId, notificationData) => {
  try {
    // Prüfe ob team_memberships-Tabelle existiert
    try {
      // Alle Team-Mitglieder abrufen
      const teamMembers = await db.query(
        'SELECT user_id FROM team_memberships WHERE team_id = $1',
        [teamId]
      );

      // Benachrichtigung für jedes Team-Mitglied erstellen
      const notifications = [];
      for (const member of teamMembers.rows) {
        const notificationId = await createNotification({
          ...notificationData,
          userId: member.user_id,
          teamId: teamId
        });
        notifications.push(notificationId);
      }

      return notifications;
    } catch (tableError) {
      if (tableError.message.includes('relation "team_memberships" does not exist')) {
        console.warn('Team-Mitgliedschaften-Tabelle existiert nicht, ignoriere Team-Benachrichtigung');
        return [];
      } else {
        throw tableError;
      }
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der Team-Benachrichtigungen:', error);
    // Team-Benachrichtigungsfehler sollten das Haupt-Feature nicht blockieren
    return [];
  }
};

module.exports = { router, createNotification, createTeamNotification };
