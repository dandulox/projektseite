const express = require('express');
const { Pool } = require('pg');
const { authenticateToken } = require('./auth');
const { createNotification, createTeamNotification } = require('./notifications');
const router = express.Router();

// Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'projektseite',
  password: process.env.DB_PASSWORD || 'secure_password_123',
  port: process.env.DB_PORT || 5432,
});

// Hilfsfunktion: Prüft Berechtigung für Ziel (Projekt/Modul)
const checkTargetPermission = async (userId, targetType, targetId, requiredPermission = 'view') => {
  try {
    // Admin hat immer Zugriff
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
      return true;
    }

    if (targetType === 'project') {
      // Prüfe Projekt-Berechtigung
      const projectResult = await pool.query(`
        SELECT p.*, t.id as team_id
        FROM projects p
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE p.id = $1
      `, [targetId]);

      if (projectResult.rows.length === 0) return false;
      const project = projectResult.rows[0];

      // Eigentümer hat immer Zugriff
      if (project.owner_id === userId) return true;

      // Prüfe Team-Berechtigung
      if (project.team_id) {
        try {
          const teamMembership = await pool.query(`
            SELECT tm.role as team_role
            FROM team_memberships tm
            WHERE tm.team_id = $1 AND tm.user_id = $2
          `, [project.team_id, userId]);

          if (teamMembership.rows.length > 0) {
            const teamRole = teamMembership.rows[0].team_role;
            if (teamRole === 'leader' && requiredPermission !== 'admin') return true;
            if (teamRole === 'member' && ['view', 'edit'].includes(requiredPermission)) return true;
            if (teamRole === 'viewer' && requiredPermission === 'view') return true;
          }
        } catch (teamError) {
          console.warn('Team-Berechtigung konnte nicht geprüft werden:', teamError.message);
        }
      }

      // Prüfe Sichtbarkeit
      if (project.visibility === 'public' && requiredPermission === 'view') return true;

    } else if (targetType === 'module') {
      // Prüfe Modul-Berechtigung (Projekt-Modul)
      const moduleResult = await pool.query(`
        SELECT pm.*, p.owner_id, p.visibility as project_visibility, p.team_id
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        WHERE pm.id = $1
      `, [targetId]);

      if (moduleResult.rows.length === 0) return false;
      const module = moduleResult.rows[0];

      // Eigentümer hat immer Zugriff
      if (module.owner_id === userId) return true;

      // Prüfe Team-Berechtigung
      if (module.team_id) {
        try {
          const teamMembership = await pool.query(`
            SELECT tm.role as team_role
            FROM team_memberships tm
            WHERE tm.team_id = $1 AND tm.user_id = $2
          `, [module.team_id, userId]);

          if (teamMembership.rows.length > 0) {
            const teamRole = teamMembership.rows[0].team_role;
            if (teamRole === 'leader' && requiredPermission !== 'admin') return true;
            if (teamRole === 'member' && ['view', 'edit'].includes(requiredPermission)) return true;
            if (teamRole === 'viewer' && requiredPermission === 'view') return true;
          }
        } catch (teamError) {
          console.warn('Team-Berechtigung konnte nicht geprüft werden:', teamError.message);
        }
      }

      // Prüfe Sichtbarkeit
      if (module.visibility === 'public' && requiredPermission === 'view') return true;
      if (module.project_visibility === 'public' && requiredPermission === 'view') return true;

    } else if (targetType === 'standalone_module') {
      // Prüfe eigenständiges Modul-Berechtigung
      const moduleResult = await pool.query(`
        SELECT * FROM standalone_modules WHERE id = $1
      `, [targetId]);

      if (moduleResult.rows.length === 0) return false;
      const module = moduleResult.rows[0];

      // Eigentümer hat immer Zugriff
      if (module.owner_id === userId) return true;

      // Prüfe Team-Berechtigung
      if (module.team_id) {
        try {
          const teamMembership = await pool.query(`
            SELECT tm.role as team_role
            FROM team_memberships tm
            WHERE tm.team_id = $1 AND tm.user_id = $2
          `, [module.team_id, userId]);

          if (teamMembership.rows.length > 0) {
            const teamRole = teamMembership.rows[0].team_role;
            if (teamRole === 'leader' && requiredPermission !== 'admin') return true;
            if (teamRole === 'member' && ['view', 'edit'].includes(requiredPermission)) return true;
            if (teamRole === 'viewer' && requiredPermission === 'view') return true;
          }
        } catch (teamError) {
          console.warn('Team-Berechtigung konnte nicht geprüft werden:', teamError.message);
        }
      }

      // Prüfe Sichtbarkeit
      if (module.visibility === 'public' && requiredPermission === 'view') return true;
    }

    return false;
  } catch (error) {
    console.error('Fehler bei der Berechtigungsprüfung:', error);
    return false;
  }
};

// Kommentare für ein Ziel abrufen
router.get('/:targetType/:targetId', authenticateToken, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { include_private = false } = req.query;

    // Prüfe Berechtigung
    if (!(await checkTargetPermission(req.user.id, targetType, targetId, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für dieses Ziel' });
    }

    // Kommentare mit Details abrufen
    const result = await pool.query(`
      SELECT * FROM get_comments_with_details($1, $2, $3, $4)
    `, [targetType, targetId, req.user.id, include_private === 'true']);

    res.json({ comments: result.rows });
  } catch (error) {
    console.error('Fehler beim Abrufen der Kommentare:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neuen Kommentar erstellen
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      content, 
      target_type, 
      target_id, 
      parent_comment_id = null, 
      is_private = false 
    } = req.body;

    if (!content || !target_type || !target_id) {
      return res.status(400).json({ 
        error: 'Inhalt, Ziel-Typ und Ziel-ID sind erforderlich' 
      });
    }

    // Prüfe Berechtigung
    if (!(await checkTargetPermission(req.user.id, target_type, target_id, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Kommentieren' });
    }

    // Kommentar erstellen
    const result = await pool.query(`
      SELECT create_comment($1, $2, $3, $4, $5, $6) as comment_id
    `, [content, req.user.id, target_type, target_id, parent_comment_id, is_private]);

    const commentId = result.rows[0].comment_id;

    // Kommentar-Details abrufen
    const commentResult = await pool.query(`
      SELECT * FROM get_comments_with_details($1, $2, $3, $4)
      WHERE comment_id = $5
    `, [target_type, target_id, req.user.id, true, commentId]);

    // Benachrichtigungen erstellen
    try {
      // Benachrichtigung für Team-Mitglieder (falls es ein Team-Projekt/Modul ist)
      let teamId = null;
      if (target_type === 'project') {
        const projectResult = await pool.query('SELECT team_id FROM projects WHERE id = $1', [target_id]);
        if (projectResult.rows.length > 0) {
          teamId = projectResult.rows[0].team_id;
        }
      } else if (target_type === 'module') {
        const moduleResult = await pool.query(`
          SELECT p.team_id FROM project_modules pm
          JOIN projects p ON p.id = pm.project_id
          WHERE pm.id = $1
        `, [target_id]);
        if (moduleResult.rows.length > 0) {
          teamId = moduleResult.rows[0].team_id;
        }
      } else if (target_type === 'standalone_module') {
        const moduleResult = await pool.query('SELECT team_id FROM standalone_modules WHERE id = $1', [target_id]);
        if (moduleResult.rows.length > 0) {
          teamId = moduleResult.rows[0].team_id;
        }
      }

      if (teamId) {
        await createTeamNotification(teamId, {
          type: 'comment_added',
          title: 'Neuer Kommentar',
          message: `Ein neuer Kommentar wurde hinzugefügt.`,
          fromUserId: req.user.id,
          targetType: target_type,
          targetId: target_id,
          actionUrl: `/${target_type}s/${target_id}`
        });
      }
    } catch (notificationError) {
      console.error('Fehler beim Erstellen der Benachrichtigungen:', notificationError);
      // Benachrichtigungsfehler sollten das Kommentar-Erstellen nicht blockieren
    }

    res.status(201).json({
      message: 'Kommentar erfolgreich erstellt',
      comment: commentResult.rows[0]
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Kommentars:', error);
    if (error.message.includes('Keine Berechtigung zum Kommentieren')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Kommentar bearbeiten
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Inhalt ist erforderlich' });
    }

    // Kommentar bearbeiten
    const result = await pool.query(`
      SELECT edit_comment($1, $2, $3) as success
    `, [commentId, req.user.id, content]);

    if (!result.rows[0].success) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten' });
    }

    // Aktualisierten Kommentar abrufen
    const commentResult = await pool.query(`
      SELECT c.*, u.username, u.email
      FROM comments c
      LEFT JOIN users u ON u.id = c.author_id
      WHERE c.id = $1
    `, [commentId]);

    res.json({
      message: 'Kommentar erfolgreich bearbeitet',
      comment: commentResult.rows[0]
    });
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Kommentars:', error);
    if (error.message.includes('Keine Berechtigung')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Kommentar löschen
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;

    // Kommentar löschen
    const result = await pool.query(`
      SELECT delete_comment($1, $2) as success
    `, [commentId, req.user.id]);

    if (!result.rows[0].success) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Löschen' });
    }

    res.json({ message: 'Kommentar erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Kommentars:', error);
    if (error.message.includes('Keine Berechtigung')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Kommentar anheften/abheften
router.post('/:id/toggle-pin', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;

    // Pin-Status umkehren
    const result = await pool.query(`
      SELECT toggle_comment_pin($1, $2) as success
    `, [commentId, req.user.id]);

    if (!result.rows[0].success) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Anheften' });
    }

    // Aktualisierten Kommentar abrufen
    const commentResult = await pool.query(`
      SELECT c.*, u.username, u.email
      FROM comments c
      LEFT JOIN users u ON u.id = c.author_id
      WHERE c.id = $1
    `, [commentId]);

    res.json({
      message: 'Pin-Status erfolgreich geändert',
      comment: commentResult.rows[0]
    });
  } catch (error) {
    console.error('Fehler beim Ändern des Pin-Status:', error);
    if (error.message.includes('Keine Berechtigung')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Kommentar-Reaktion hinzufügen/entfernen
router.post('/:id/reactions', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const { reaction_type } = req.body;

    if (!reaction_type || !['like', 'dislike', 'helpful', 'confused', 'celebrate'].includes(reaction_type)) {
      return res.status(400).json({ error: 'Ungültiger Reaktionstyp' });
    }

    // Prüfe ob Kommentar existiert und Benutzer Berechtigung hat
    const commentResult = await pool.query(`
      SELECT c.* FROM comments c
      WHERE c.id = $1
    `, [commentId]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Kommentar nicht gefunden' });
    }

    const comment = commentResult.rows[0];

    if (!(await checkTargetPermission(req.user.id, comment.target_type, comment.target_id, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für diesen Kommentar' });
    }

    // Reaktion hinzufügen oder entfernen (UPSERT)
    const result = await pool.query(`
      INSERT INTO comment_reactions (comment_id, user_id, reaction_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (comment_id, user_id, reaction_type)
      DO DELETE
      RETURNING *
    `, [commentId, req.user.id, reaction_type]);

    const action = result.rows.length > 0 ? 'hinzugefügt' : 'entfernt';

    res.json({
      message: `Reaktion erfolgreich ${action}`,
      reaction: result.rows[0] || null
    });
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Reaktion:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Kommentar-Mentions verarbeiten
router.post('/:id/mentions', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const { mentioned_user_ids = [] } = req.body;

    // Prüfe ob Kommentar existiert und Benutzer ist der Autor
    const commentResult = await pool.query(`
      SELECT * FROM comments WHERE id = $1 AND author_id = $2
    `, [commentId, req.user.id]);

    if (commentResult.rows.length === 0) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Hinzufügen von Mentions' });
    }

    // Lösche bestehende Mentions
    await pool.query('DELETE FROM comment_mentions WHERE comment_id = $1', [commentId]);

    // Füge neue Mentions hinzu
    if (mentioned_user_ids.length > 0) {
      const mentionValues = mentioned_user_ids.map(userId => `(${commentId}, ${userId})`).join(',');
      await pool.query(`
        INSERT INTO comment_mentions (comment_id, mentioned_user_id)
        VALUES ${mentionValues}
      `);

      // Benachrichtigungen für erwähnte Benutzer erstellen
      for (const userId of mentioned_user_ids) {
        try {
          await createNotification(userId, {
            type: 'comment_mention',
            title: 'Sie wurden in einem Kommentar erwähnt',
            message: `Sie wurden in einem Kommentar erwähnt.`,
            fromUserId: req.user.id,
            targetType: commentResult.rows[0].target_type,
            targetId: commentResult.rows[0].target_id,
            actionUrl: `/${commentResult.rows[0].target_type}s/${commentResult.rows[0].target_id}`
          });
        } catch (notificationError) {
          console.error('Fehler beim Erstellen der Mention-Benachrichtigung:', notificationError);
        }
      }
    }

    res.json({ message: 'Mentions erfolgreich aktualisiert' });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Mentions:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;
