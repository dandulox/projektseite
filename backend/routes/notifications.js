const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware für Authentifizierung
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Zugriffstoken erforderlich' });
  }

  // Hier würde normalerweise JWT-Verifikation stattfinden
  // Für diese Implementierung verwenden wir eine vereinfachte Version
  try {
    // Vereinfachte Token-Verifikation - in Produktion sollte JWT verwendet werden
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Ungültiger Token' });
  }
};

// Benachrichtigungen für einen Benutzer abrufen
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT n.*, 
             u.username as from_username,
             t.name as team_name,
             p.title as project_title
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      LEFT JOIN teams t ON n.team_id = t.id
      LEFT JOIN projects p ON n.project_id = p.id
      WHERE n.user_id = ? AND n.is_read = 0
    `;
    
    const params = [userId];

    if (type && (type === 'private' || type === 'team')) {
      if (type === 'private') {
        query += ' AND n.team_id IS NULL';
      } else {
        query += ' AND n.team_id IS NOT NULL';
      }
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const notifications = await db.query(query, params);

    res.json({
      success: true,
      notifications: notifications,
      total: notifications.length
    });
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

    const result = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Benachrichtigung nicht gefunden' });
    }

    res.json({ success: true, message: 'Benachrichtigung als gelesen markiert' });
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

    let query = 'UPDATE notifications SET is_read = 1 WHERE user_id = ?';
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

    const result = await db.query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Benachrichtigung nicht gefunden' });
    }

    res.json({ success: true, message: 'Benachrichtigung gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Benachrichtigung:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Benachrichtigung' });
  }
});

// Anzahl ungelesener Benachrichtigungen abrufen
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [privateCount] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0 AND team_id IS NULL',
      [userId]
    );

    const [teamCount] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0 AND team_id IS NOT NULL',
      [userId]
    );

    res.json({
      success: true,
      counts: {
        private: privateCount.count,
        team: teamCount.count,
        total: privateCount.count + teamCount.count
      }
    });
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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, type, title, message, fromUserId, teamId, projectId, actionUrl]
    );

    return result.insertId;
  } catch (error) {
    console.error('Fehler beim Erstellen der Benachrichtigung:', error);
    throw error;
  }
};

// Benachrichtigungen für Team-Mitglieder erstellen
const createTeamNotification = async (teamId, notificationData) => {
  try {
    // Alle Team-Mitglieder abrufen
    const teamMembers = await db.query(
      'SELECT user_id FROM team_members WHERE team_id = ?',
      [teamId]
    );

    // Benachrichtigung für jedes Team-Mitglied erstellen
    const notifications = [];
    for (const member of teamMembers) {
      const notificationId = await createNotification({
        ...notificationData,
        userId: member.user_id,
        teamId: teamId
      });
      notifications.push(notificationId);
    }

    return notifications;
  } catch (error) {
    console.error('Fehler beim Erstellen der Team-Benachrichtigungen:', error);
    throw error;
  }
};

module.exports = { router, createNotification, createTeamNotification };
