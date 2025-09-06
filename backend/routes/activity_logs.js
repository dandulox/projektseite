const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Hilfsfunktion: Prüft Berechtigung für Aktivitätslog-Zugriff
const checkActivityLogPermission = async (userId, resourceId, resourceType) => {
  try {
    // Admin hat immer Zugriff
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
      return true;
    }

    if (resourceType === 'project') {
      // Prüfe Projekt-Berechtigung
      const projectResult = await pool.query(`
        SELECT p.*, t.id as team_id
        FROM projects p
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE p.id = $1
      `, [resourceId]);

      if (projectResult.rows.length === 0) return false;
      const project = projectResult.rows[0];

      // Eigentümer hat Zugriff
      if (project.owner_id === userId) return true;

      // Prüfe Team-Berechtigung
      if (project.team_id) {
        const teamMembership = await pool.query(`
          SELECT tm.role FROM team_memberships tm
          WHERE tm.team_id = $1 AND tm.user_id = $2
        `, [project.team_id, userId]);

        if (teamMembership.rows.length > 0) return true;
      }

      // Prüfe explizite Projekt-Berechtigungen
      const permissionResult = await pool.query(`
        SELECT permission_type FROM project_permissions
        WHERE project_id = $1 AND user_id = $2
      `, [resourceId, userId]);

      if (permissionResult.rows.length > 0) return true;

      // Prüfe Sichtbarkeit
      if (project.visibility === 'public') return true;

    } else if (resourceType === 'module') {
      // Prüfe Modul-Berechtigung
      const moduleResult = await pool.query(`
        SELECT pm.*, p.owner_id as project_owner_id, p.visibility as project_visibility
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        WHERE pm.id = $1
      `, [resourceId]);

      if (moduleResult.rows.length === 0) return false;
      const module = moduleResult.rows[0];

      // Projekt-Eigentümer hat Zugriff
      if (module.project_owner_id === userId) return true;

      // Prüfe Team-Berechtigung
      if (module.team_id) {
        const teamMembership = await pool.query(`
          SELECT tm.role FROM team_memberships tm
          WHERE tm.team_id = $1 AND tm.user_id = $2
        `, [module.team_id, userId]);

        if (teamMembership.rows.length > 0) return true;
      }

      // Prüfe explizite Modul-Berechtigungen
      const permissionResult = await pool.query(`
        SELECT permission_type FROM module_permissions
        WHERE module_id = $1 AND module_type = 'project' AND user_id = $2
      `, [resourceId, userId]);

      if (permissionResult.rows.length > 0) return true;

      // Prüfe Sichtbarkeit
      if (module.visibility === 'public' || module.project_visibility === 'public') return true;
    }

    return false;
  } catch (error) {
    console.error('Fehler bei der Aktivitätslog-Berechtigungsprüfung:', error);
    return false;
  }
};

// Projekt-Aktivitätslogs abrufen
router.get('/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { limit = 50, offset = 0, action_type } = req.query;

    // Prüfe Berechtigung
    if (!(await checkActivityLogPermission(req.user.id, projectId, 'project'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für dieses Projekt' });
    }

    let query = `
      SELECT 
        pal.id,
        pal.project_id,
        p.name as project_name,
        pal.user_id,
        u.username,
        pal.action_type,
        pal.action_details,
        pal.old_values,
        pal.new_values,
        pal.affected_user_id,
        au.username as affected_username,
        pal.created_at
      FROM project_activity_logs pal
      JOIN projects p ON p.id = pal.project_id
      LEFT JOIN users u ON u.id = pal.user_id
      LEFT JOIN users au ON au.id = pal.affected_user_id
      WHERE pal.project_id = $1
    `;
    
    const params = [projectId];
    let paramCount = 1;

    if (action_type) {
      query += ` AND pal.action_type = $${++paramCount}`;
      params.push(action_type);
    }

    query += ` ORDER BY pal.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      logs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Projekt-Aktivitätslogs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Modul-Aktivitätslogs abrufen
router.get('/modules/:moduleId', authenticateToken, async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const { module_type = 'project', limit = 50, offset = 0, action_type } = req.query;

    // Prüfe Berechtigung
    if (!(await checkActivityLogPermission(req.user.id, moduleId, 'module'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für dieses Modul' });
    }

    let query = `
      SELECT 
        mal.id,
        mal.module_id,
        mal.module_type,
        CASE 
          WHEN mal.module_type = 'project' THEN pm.name
          ELSE sm.name
        END as module_name,
        mal.user_id,
        u.username,
        mal.action_type,
        mal.action_details,
        mal.old_values,
        mal.new_values,
        mal.affected_user_id,
        au.username as affected_username,
        mal.project_id,
        p.name as project_name,
        mal.created_at
      FROM module_activity_logs mal
      LEFT JOIN project_modules pm ON pm.id = mal.module_id AND mal.module_type = 'project'
      LEFT JOIN standalone_modules sm ON sm.id = mal.module_id AND mal.module_type = 'standalone'
      LEFT JOIN projects p ON p.id = mal.project_id
      LEFT JOIN users u ON u.id = mal.user_id
      LEFT JOIN users au ON au.id = mal.affected_user_id
      WHERE mal.module_id = $1 AND mal.module_type = $2
    `;
    
    const params = [moduleId, module_type];
    let paramCount = 2;

    if (action_type) {
      query += ` AND mal.action_type = $${++paramCount}`;
      params.push(action_type);
    }

    query += ` ORDER BY mal.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      logs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Modul-Aktivitätslogs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzer-Aktivitätslogs abrufen (alle Aktivitäten des Benutzers)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { limit = 50, offset = 0, resource_type } = req.query;

    // Prüfe Berechtigung (nur eigene Aktivitäten oder Admin)
    if (parseInt(userId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Keine Berechtigung für diese Aktivitäten' });
    }

    // Prüfe ob Aktivitätslog-Tabellen existieren
    const tableCheck = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name IN ('project_activity_logs', 'module_activity_logs')
      AND table_schema = 'public'
    `);

    if (tableCheck.rows[0].count === '0') {
      // Aktivitätslog-Tabellen existieren nicht, gebe leere Liste zurück
      return res.json({
        activities: [],
        total: 0,
        message: 'Aktivitätslog-System ist noch nicht installiert'
      });
    }

    let query = `
      (
        SELECT 
          'project' as resource_type,
          pal.id,
          pal.project_id as resource_id,
          p.name as resource_name,
          pal.user_id,
          u.username,
          pal.action_type,
          pal.action_details,
          pal.old_values,
          pal.new_values,
          pal.affected_user_id,
          au.username as affected_username,
          pal.created_at
        FROM project_activity_logs pal
        JOIN projects p ON p.id = pal.project_id
        LEFT JOIN users u ON u.id = pal.user_id
        LEFT JOIN users au ON au.id = pal.affected_user_id
        WHERE pal.user_id = $1
      )
      UNION ALL
      (
        SELECT 
          'module' as resource_type,
          mal.id,
          mal.module_id as resource_id,
          CASE 
            WHEN mal.module_type = 'project' THEN pm.name
            ELSE sm.name
          END as resource_name,
          mal.user_id,
          u.username,
          mal.action_type,
          mal.action_details,
          mal.old_values,
          mal.new_values,
          mal.affected_user_id,
          au.username as affected_username,
          mal.created_at
        FROM module_activity_logs mal
        LEFT JOIN project_modules pm ON pm.id = mal.module_id AND mal.module_type = 'project'
        LEFT JOIN standalone_modules sm ON sm.id = mal.module_id AND mal.module_type = 'standalone'
        LEFT JOIN users u ON u.id = mal.user_id
        LEFT JOIN users au ON au.id = mal.affected_user_id
        WHERE mal.user_id = $1
      )
    `;
    
    const params = [userId];
    let paramCount = 1;

    if (resource_type) {
      if (resource_type === 'project') {
        query = query.split('UNION ALL')[0] + ')';
      } else if (resource_type === 'module') {
        query = query.split('UNION ALL')[1].replace('(', '');
      }
    }

    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      logs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer-Aktivitätslogs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Team-Aktivitätslogs abrufen (alle Aktivitäten in Team-Projekten)
router.get('/team/:teamId', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { limit = 50, offset = 0, resource_type } = req.query;

    // Prüfe Team-Mitgliedschaft
    const teamMembership = await pool.query(`
      SELECT tm.role FROM team_memberships tm
      WHERE tm.team_id = $1 AND tm.user_id = $2
    `, [teamId, req.user.id]);

    if (teamMembership.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Keine Berechtigung für dieses Team' });
    }

    let query = `
      (
        SELECT 
          'project' as resource_type,
          pal.id,
          pal.project_id as resource_id,
          p.name as resource_name,
          pal.user_id,
          u.username,
          pal.action_type,
          pal.action_details,
          pal.old_values,
          pal.new_values,
          pal.affected_user_id,
          au.username as affected_username,
          pal.created_at
        FROM project_activity_logs pal
        JOIN projects p ON p.id = pal.project_id
        LEFT JOIN users u ON u.id = pal.user_id
        LEFT JOIN users au ON au.id = pal.affected_user_id
        WHERE p.team_id = $1
      )
      UNION ALL
      (
        SELECT 
          'module' as resource_type,
          mal.id,
          mal.module_id as resource_id,
          CASE 
            WHEN mal.module_type = 'project' THEN pm.name
            ELSE sm.name
          END as resource_name,
          mal.user_id,
          u.username,
          mal.action_type,
          mal.action_details,
          mal.old_values,
          mal.new_values,
          mal.affected_user_id,
          au.username as affected_username,
          mal.created_at
        FROM module_activity_logs mal
        LEFT JOIN project_modules pm ON pm.id = mal.module_id AND mal.module_type = 'project'
        LEFT JOIN standalone_modules sm ON sm.id = mal.module_id AND mal.module_type = 'standalone'
        LEFT JOIN projects p ON p.id = mal.project_id
        LEFT JOIN users u ON u.id = mal.user_id
        LEFT JOIN users au ON au.id = mal.affected_user_id
        WHERE (mal.project_id IN (SELECT id FROM projects WHERE team_id = $1) OR sm.team_id = $1)
      )
    `;
    
    const params = [teamId];
    let paramCount = 1;

    if (resource_type) {
      if (resource_type === 'project') {
        query = query.split('UNION ALL')[0] + ')';
      } else if (resource_type === 'module') {
        query = query.split('UNION ALL')[1].replace('(', '');
      }
    }

    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      logs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Team-Aktivitätslogs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Aktivitätslog-Statistiken abrufen
router.get('/stats/:resourceType/:resourceId', authenticateToken, async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;

    // Prüfe Berechtigung
    if (!(await checkActivityLogPermission(req.user.id, resourceId, resourceType))) {
      return res.status(403).json({ error: 'Keine Berechtigung für diese Ressource' });
    }

    let query;
    if (resourceType === 'project') {
      query = `
        SELECT 
          action_type,
          COUNT(*) as count,
          MAX(created_at) as last_activity
        FROM project_activity_logs
        WHERE project_id = $1
        GROUP BY action_type
        ORDER BY count DESC
      `;
    } else if (resourceType === 'module') {
      query = `
        SELECT 
          action_type,
          COUNT(*) as count,
          MAX(created_at) as last_activity
        FROM module_activity_logs
        WHERE module_id = $1
        GROUP BY action_type
        ORDER BY count DESC
      `;
    } else {
      return res.status(400).json({ error: 'Ungültiger Ressourcentyp' });
    }

    const result = await pool.query(query, [resourceId]);

    // Gesamtstatistiken
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total_activities
      FROM ${resourceType === 'project' ? 'project_activity_logs' : 'module_activity_logs'}
      WHERE ${resourceType === 'project' ? 'project_id' : 'module_id'} = $1
    `, [resourceId]);

    res.json({
      success: true,
      stats: result.rows,
      total_activities: parseInt(totalResult.rows[0].total_activities)
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Aktivitätslog-Statistiken:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Manueller Aktivitätslog-Eintrag erstellen (für spezielle Aktionen)
router.post('/log', authenticateToken, async (req, res) => {
  try {
    const { 
      resource_type, 
      resource_id, 
      action_type, 
      action_details, 
      old_values, 
      new_values, 
      affected_user_id 
    } = req.body;

    if (!resource_type || !resource_id || !action_type) {
      return res.status(400).json({ error: 'Ressourcentyp, Ressourcen-ID und Aktionstyp sind erforderlich' });
    }

    // Prüfe Berechtigung
    if (!(await checkActivityLogPermission(req.user.id, resource_id, resource_type))) {
      return res.status(403).json({ error: 'Keine Berechtigung für diese Ressource' });
    }

    let logId;
    if (resource_type === 'project') {
      logId = await pool.query(`
        SELECT log_project_activity($1, $2, $3, $4, $5, $6, $7) as log_id
      `, [resource_id, req.user.id, action_type, action_details, old_values, new_values, affected_user_id]);
    } else if (resource_type === 'module') {
      const { module_type = 'project' } = req.body;
      logId = await pool.query(`
        SELECT log_module_activity($1, $2, $3, $4, $5, $6, $7, $8, $9) as log_id
      `, [resource_id, module_type, req.user.id, action_type, action_details, old_values, new_values, affected_user_id, null]);
    } else {
      return res.status(400).json({ error: 'Ungültiger Ressourcentyp' });
    }

    res.status(201).json({
      success: true,
      message: 'Aktivitätslog erfolgreich erstellt',
      log_id: logId.rows[0].log_id
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Aktivitätslogs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;
