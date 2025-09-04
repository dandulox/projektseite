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

// Hilfsfunktion: Prüft Modul-Berechtigung
const checkModulePermission = async (userId, moduleId, moduleType, requiredPermission = 'view') => {
  // Admin hat immer Zugriff
  const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
  if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
    return true;
  }

  let moduleResult;
  if (moduleType === 'project') {
    // Für Projekt-Module: Prüfe Projekt-Berechtigung
    moduleResult = await pool.query(`
      SELECT pm.*, p.owner_id, p.team_id, p.visibility as project_visibility
      FROM project_modules pm
      JOIN projects p ON p.id = pm.project_id
      WHERE pm.id = $1
    `, [moduleId]);
  } else {
    // Für eigenständige Module
    moduleResult = await pool.query(`
      SELECT * FROM standalone_modules WHERE id = $1
    `, [moduleId]);
  }

  if (moduleResult.rows.length === 0) return false;
  const module = moduleResult.rows[0];

  // Eigentümer hat immer Zugriff
  if (module.owner_id === userId) return true;

  // Prüfe Team-Berechtigung
  if (module.team_id) {
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
  }

  // Prüfe explizite Modul-Berechtigungen
  const permissionResult = await pool.query(`
    SELECT permission_type
    FROM module_permissions
    WHERE module_id = $1 AND module_type = $2 AND user_id = $3
  `, [moduleId, moduleType, userId]);

  if (permissionResult.rows.length > 0) {
    const permission = permissionResult.rows[0].permission_type;
    if (permission === 'admin') return true;
    if (permission === 'edit' && ['view', 'edit'].includes(requiredPermission)) return true;
    if (permission === 'view' && requiredPermission === 'view') return true;
  }

  // Prüfe Sichtbarkeit
  if (module.visibility === 'public' && requiredPermission === 'view') return true;
  if (moduleType === 'project' && module.project_visibility === 'public' && requiredPermission === 'view') return true;

  return false;
};

// Alle Module abrufen (basierend auf Berechtigung)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { project_id, status, priority, assigned_to, module_type = 'project' } = req.query;
    
    let query, params = [];
    let paramCount = 0;

    if (module_type === 'project') {
      query = `
        SELECT pm.*, 
               p.name as project_name,
               u.username as assigned_username,
               t.name as team_name
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        LEFT JOIN users u ON u.id = pm.assigned_to
        LEFT JOIN teams t ON t.id = pm.team_id
        WHERE 1=1
      `;
      
      // Filter basierend auf Benutzer-Berechtigung
      if (req.user.role !== 'admin') {
        query += `
          AND (
            p.owner_id = $${++paramCount} OR
            p.visibility = 'public' OR
            (p.team_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM team_memberships tm 
              WHERE tm.team_id = p.team_id AND tm.user_id = $${paramCount}
            )) OR
            EXISTS (
              SELECT 1 FROM project_permissions pp 
              WHERE pp.project_id = p.id AND pp.user_id = $${paramCount}
            ) OR
            EXISTS (
              SELECT 1 FROM module_permissions mp 
              WHERE mp.module_id = pm.id AND mp.module_type = 'project' AND mp.user_id = $${paramCount}
            )
          )
        `;
        params.push(req.user.id);
      }
    } else {
      query = `
        SELECT sm.*, 
               u.username as assigned_username,
               t.name as team_name
        FROM standalone_modules sm
        LEFT JOIN users u ON u.id = sm.assigned_to
        LEFT JOIN teams t ON t.id = sm.team_id
        WHERE 1=1
      `;
      
      // Filter basierend auf Benutzer-Berechtigung
      if (req.user.role !== 'admin') {
        query += `
          AND (
            sm.owner_id = $${++paramCount} OR
            sm.visibility = 'public' OR
            (sm.team_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM team_memberships tm 
              WHERE tm.team_id = sm.team_id AND tm.user_id = $${paramCount}
            )) OR
            EXISTS (
              SELECT 1 FROM module_permissions mp 
              WHERE mp.module_id = sm.id AND mp.module_type = 'standalone' AND mp.user_id = $${paramCount}
            )
          )
        `;
        params.push(req.user.id);
      }
    }

    // Zusätzliche Filter
    if (project_id) {
      query += ` AND pm.project_id = $${++paramCount}`;
      params.push(project_id);
    }
    
    if (status) {
      const statusColumn = module_type === 'project' ? 'pm.status' : 'sm.status';
      query += ` AND ${statusColumn} = $${++paramCount}`;
      params.push(status);
    }
    
    if (priority) {
      const priorityColumn = module_type === 'project' ? 'pm.priority' : 'sm.priority';
      query += ` AND ${priorityColumn} = $${++paramCount}`;
      params.push(priority);
    }

    if (assigned_to) {
      const assignedColumn = module_type === 'project' ? 'pm.assigned_to' : 'sm.assigned_to';
      query += ` AND ${assignedColumn} = $${++paramCount}`;
      params.push(assigned_to);
    }

    query += ` ORDER BY pm.created_at DESC, sm.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ modules: result.rows });
  } catch (error) {
    console.error('Fehler beim Abrufen der Module:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Einzelnes Modul abrufen
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const moduleId = req.params.id;
    const { module_type = 'project' } = req.query;

    // Prüfe Berechtigung
    if (!(await checkModulePermission(req.user.id, moduleId, module_type, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für dieses Modul' });
    }

    let moduleResult;
    if (module_type === 'project') {
      moduleResult = await pool.query(`
        SELECT pm.*, 
               p.name as project_name,
               p.owner_id as project_owner_id,
               u.username as assigned_username,
               t.name as team_name
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        LEFT JOIN users u ON u.id = pm.assigned_to
        LEFT JOIN teams t ON t.id = pm.team_id
        WHERE pm.id = $1
      `, [moduleId]);
    } else {
      moduleResult = await pool.query(`
        SELECT sm.*, 
               u.username as assigned_username,
               t.name as team_name
        FROM standalone_modules sm
        LEFT JOIN users u ON u.id = sm.assigned_to
        LEFT JOIN teams t ON t.id = sm.team_id
        WHERE sm.id = $1
      `, [moduleId]);
    }

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Modul nicht gefunden' });
    }

    // Modul-Logs abrufen
    const logsResult = await pool.query(`
      SELECT ml.*, u.username
      FROM module_logs ml
      LEFT JOIN users u ON u.id = ml.user_id
      WHERE ml.module_id = $1 AND ml.module_type = $2
      ORDER BY ml.timestamp DESC
      LIMIT 50
    `, [moduleId, module_type]);

    res.json({
      module: moduleResult.rows[0],
      logs: logsResult.rows
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Moduls:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neues Projekt-Modul erstellen
router.post('/project', authenticateToken, async (req, res) => {
  try {
    const { 
      project_id,
      name, 
      description, 
      status = 'not_started', 
      priority = 'medium',
      estimated_hours,
      assigned_to,
      due_date,
      visibility = 'private',
      team_id,
      tags = [],
      dependencies = []
    } = req.body;

    if (!name || !project_id) {
      return res.status(400).json({ error: 'Modul-Name und Projekt-ID sind erforderlich' });
    }

    // Prüfe Projekt-Berechtigung
    const projectResult = await pool.query(`
      SELECT p.*, t.id as team_id
      FROM projects p
      LEFT JOIN teams t ON t.id = p.team_id
      WHERE p.id = $1
    `, [project_id]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt nicht gefunden' });
    }

    const project = projectResult.rows[0];
    
    // Prüfe Berechtigung zum Erstellen von Modulen in diesem Projekt
    if (req.user.role !== 'admin' && project.owner_id !== req.user.id) {
      // Prüfe Team-Berechtigung
      if (project.team_id) {
        const teamMembership = await pool.query(`
          SELECT tm.role FROM team_memberships tm
          WHERE tm.team_id = $1 AND tm.user_id = $2
        `, [project.team_id, req.user.id]);
        
        if (teamMembership.rows.length === 0 || !['leader', 'member'].includes(teamMembership.rows[0].role)) {
          return res.status(403).json({ error: 'Keine Berechtigung zum Erstellen von Modulen in diesem Projekt' });
        }
      } else {
        return res.status(403).json({ error: 'Keine Berechtigung zum Erstellen von Modulen in diesem Projekt' });
      }
    }

    // Modul erstellen
    const result = await pool.query(`
      INSERT INTO project_modules (
        project_id, name, description, status, priority, estimated_hours, 
        assigned_to, due_date, visibility, team_id, tags, dependencies
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [project_id, name, description, status, priority, estimated_hours, assigned_to, due_date, visibility, team_id, tags, dependencies]);

    const module = result.rows[0];

    // Log-Eintrag erstellen
    await pool.query(`
      INSERT INTO module_logs (module_id, module_type, user_id, action, details)
      VALUES ($1, 'project', $2, 'created', 'Modul erstellt')
    `, [module.id, req.user.id]);

    res.status(201).json({
      message: 'Modul erfolgreich erstellt',
      module
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Moduls:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neues eigenständiges Modul erstellen
router.post('/standalone', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      status = 'planning', 
      priority = 'medium',
      start_date,
      target_date,
      estimated_hours,
      assigned_to,
      team_id,
      visibility = 'private',
      tags = [],
      dependencies = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Modul-Name ist erforderlich' });
    }

    // Prüfe Team-Berechtigung falls team_id angegeben
    if (team_id) {
      const teamCheck = await pool.query(`
        SELECT id FROM team_memberships 
        WHERE team_id = $1 AND user_id = $2
      `, [team_id, req.user.id]);
      
      if (teamCheck.rows.length === 0 && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Keine Berechtigung für das angegebene Team' });
      }
    }

    // Modul erstellen
    const result = await pool.query(`
      INSERT INTO standalone_modules (
        name, description, status, priority, start_date, target_date,
        estimated_hours, assigned_to, team_id, visibility, tags, dependencies,
        owner_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [name, description, status, priority, start_date, target_date, estimated_hours, assigned_to, team_id, visibility, tags, dependencies, req.user.id]);

    const module = result.rows[0];

    // Log-Eintrag erstellen
    await pool.query(`
      INSERT INTO module_logs (module_id, module_type, user_id, action, details)
      VALUES ($1, 'standalone', $2, 'created', 'Eigenständiges Modul erstellt')
    `, [module.id, req.user.id]);

    res.status(201).json({
      message: 'Eigenständiges Modul erfolgreich erstellt',
      module
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des eigenständigen Moduls:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Modul aktualisieren
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const moduleId = req.params.id;
    const { module_type = 'project' } = req.query;
    const updateData = req.body;

    // Prüfe Berechtigung
    if (!(await checkModulePermission(req.user.id, moduleId, module_type, 'edit'))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten des Moduls' });
    }

    // Erlaubte Felder für Update
    const allowedFields = [
      'name', 'description', 'status', 'priority', 'estimated_hours', 
      'actual_hours', 'assigned_to', 'due_date', 'visibility', 'team_id',
      'completion_percentage', 'start_date', 'target_date', 'tags', 'dependencies'
    ];
    
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${++paramCount}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Keine gültigen Felder zum Aktualisieren' });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(moduleId);

    const tableName = module_type === 'project' ? 'project_modules' : 'standalone_modules';
    const query = `
      UPDATE ${tableName} 
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Modul nicht gefunden' });
    }

    // Log-Eintrag erstellen
    await pool.query(`
      INSERT INTO module_logs (module_id, module_type, user_id, action, details)
      VALUES ($1, $2, $3, 'updated', 'Modul aktualisiert')
    `, [moduleId, module_type, req.user.id]);

    res.json({
      message: 'Modul erfolgreich aktualisiert',
      module: result.rows[0]
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Moduls:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Modul löschen
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const moduleId = req.params.id;
    const { module_type = 'project' } = req.query;

    // Prüfe Berechtigung (nur Eigentümer oder Admin)
    let moduleResult;
    if (module_type === 'project') {
      moduleResult = await pool.query(`
        SELECT pm.*, p.owner_id
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        WHERE pm.id = $1
      `, [moduleId]);
    } else {
      moduleResult = await pool.query(`
        SELECT * FROM standalone_modules WHERE id = $1
      `, [moduleId]);
    }

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Modul nicht gefunden' });
    }

    const module = moduleResult.rows[0];
    const ownerId = module_type === 'project' ? module.owner_id : module.owner_id;

    if (ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Keine Berechtigung zum Löschen des Moduls' });
    }

    // Modul löschen (CASCADE löscht auch Logs und Verbindungen)
    const tableName = module_type === 'project' ? 'project_modules' : 'standalone_modules';
    await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [moduleId]);

    res.json({ message: 'Modul erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Moduls:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;