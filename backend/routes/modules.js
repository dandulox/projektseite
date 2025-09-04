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
  const result = await pool.query(
    'SELECT check_module_permission($1, $2, $3, $4) as has_permission',
    [userId, moduleId, moduleType, requiredPermission]
  );
  return result.rows[0].has_permission;
};

// Hilfsfunktion: Erstellt Modul-Log
const createModuleLog = async (moduleId, moduleType, userId, action, details) => {
  await pool.query(`
    INSERT INTO module_logs (module_id, module_type, user_id, action, details)
    VALUES ($1, $2, $3, $4, $5)
  `, [moduleId, moduleType, userId, action, details]);
};

// Alle Module abrufen (Projekt-Module und eigenständige Module)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, team_id, status, visibility, project_id } = req.query;
    
    let modules = [];

    // Projekt-Module abrufen
    if (!type || type === 'project') {
      let projectModulesQuery = `
        SELECT pm.*, 
               p.name as project_name,
               u.username as owner_username,
               u2.username as assigned_username,
               t.name as team_name,
               'project' as module_type
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        LEFT JOIN users u ON u.id = p.owner_id
        LEFT JOIN users u2 ON u2.id = pm.assigned_to
        LEFT JOIN teams t ON t.id = pm.team_id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;

      // Filter basierend auf Benutzer-Berechtigung
      if (req.user.role !== 'admin') {
        projectModulesQuery += `
          AND (
            p.owner_id = $${++paramCount} OR
            pm.visibility = 'public' OR
            (pm.team_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM team_memberships tm 
              WHERE tm.team_id = pm.team_id AND tm.user_id = $${paramCount}
            )) OR
            EXISTS (
              SELECT 1 FROM module_permissions mp 
              WHERE mp.module_id = pm.id AND mp.module_type = 'project' AND mp.user_id = $${paramCount}
            )
          )
        `;
        params.push(req.user.id);
      }

      // Zusätzliche Filter
      if (project_id) {
        projectModulesQuery += ` AND pm.project_id = $${++paramCount}`;
        params.push(project_id);
      }
      
      if (team_id) {
        projectModulesQuery += ` AND pm.team_id = $${++paramCount}`;
        params.push(team_id);
      }
      
      if (status) {
        projectModulesQuery += ` AND pm.status = $${++paramCount}`;
        params.push(status);
      }
      
      if (visibility) {
        projectModulesQuery += ` AND pm.visibility = $${++paramCount}`;
        params.push(visibility);
      }

      projectModulesQuery += ` ORDER BY pm.created_at DESC`;

      const projectModulesResult = await pool.query(projectModulesQuery, params);
      modules = modules.concat(projectModulesResult.rows);
    }

    // Eigenständige Module abrufen
    if (!type || type === 'standalone') {
      let standaloneModulesQuery = `
        SELECT sm.*, 
               u.username as owner_username,
               u2.username as assigned_username,
               t.name as team_name,
               'standalone' as module_type
        FROM standalone_modules sm
        LEFT JOIN users u ON u.id = sm.owner_id
        LEFT JOIN users u2 ON u2.id = sm.assigned_to
        LEFT JOIN teams t ON t.id = sm.team_id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;

      // Filter basierend auf Benutzer-Berechtigung
      if (req.user.role !== 'admin') {
        standaloneModulesQuery += `
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

      // Zusätzliche Filter
      if (team_id) {
        standaloneModulesQuery += ` AND sm.team_id = $${++paramCount}`;
        params.push(team_id);
      }
      
      if (status) {
        standaloneModulesQuery += ` AND sm.status = $${++paramCount}`;
        params.push(status);
      }
      
      if (visibility) {
        standaloneModulesQuery += ` AND sm.visibility = $${++paramCount}`;
        params.push(visibility);
      }

      standaloneModulesQuery += ` ORDER BY sm.created_at DESC`;

      const standaloneModulesResult = await pool.query(standaloneModulesQuery, params);
      modules = modules.concat(standaloneModulesResult.rows);
    }

    res.json({ modules });
  } catch (error) {
    console.error('Fehler beim Abrufen der Module:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Einzelnes Modul abrufen
router.get('/:type/:id', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const moduleType = type === 'project' ? 'project' : 'standalone';

    // Prüfe Berechtigung
    if (!(await checkModulePermission(req.user.id, id, moduleType, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für dieses Modul' });
    }

    let moduleQuery, connectionsQuery, logsQuery;

    if (moduleType === 'project') {
      moduleQuery = `
        SELECT pm.*, 
               p.name as project_name,
               u.username as owner_username,
               u2.username as assigned_username,
               t.name as team_name,
               'project' as module_type
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        LEFT JOIN users u ON u.id = p.owner_id
        LEFT JOIN users u2 ON u2.id = pm.assigned_to
        LEFT JOIN teams t ON t.id = pm.team_id
        WHERE pm.id = $1
      `;
    } else {
      moduleQuery = `
        SELECT sm.*, 
               u.username as owner_username,
               u2.username as assigned_username,
               t.name as team_name,
               'standalone' as module_type
        FROM standalone_modules sm
        LEFT JOIN users u ON u.id = sm.owner_id
        LEFT JOIN users u2 ON u2.id = sm.assigned_to
        LEFT JOIN teams t ON t.id = sm.team_id
        WHERE sm.id = $1
      `;
    }

    // Modul-Details abrufen
    const moduleResult = await pool.query(moduleQuery, [id]);

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Modul nicht gefunden' });
    }

    const module = moduleResult.rows[0];

    // Modul-Verbindungen abrufen
    connectionsQuery = `
      SELECT mc.*, 
             CASE 
               WHEN mc.target_module_type = 'project' THEN pm.name
               ELSE sm.name
             END as target_module_name,
             CASE 
               WHEN mc.target_module_type = 'project' THEN pm.status
               ELSE sm.status
             END as target_module_status
      FROM module_connections mc
      LEFT JOIN project_modules pm ON pm.id = mc.target_module_id AND mc.target_module_type = 'project'
      LEFT JOIN standalone_modules sm ON sm.id = mc.target_module_id AND mc.target_module_type = 'standalone'
      WHERE mc.source_module_id = $1 AND mc.source_module_type = $2
      ORDER BY mc.created_at DESC
    `;

    const connectionsResult = await pool.query(connectionsQuery, [id, moduleType]);

    // Modul-Logs abrufen
    logsQuery = `
      SELECT ml.*, u.username
      FROM module_logs ml
      LEFT JOIN users u ON u.id = ml.user_id
      WHERE ml.module_id = $1 AND ml.module_type = $2
      ORDER BY ml.timestamp DESC
      LIMIT 50
    `;

    const logsResult = await pool.query(logsQuery, [id, moduleType]);

    // Abhängigkeiten prüfen
    const dependenciesResult = await pool.query(
      'SELECT * FROM check_module_dependencies($1, $2)',
      [id, moduleType]
    );

    res.json({
      module,
      connections: connectionsResult.rows,
      logs: logsResult.rows,
      dependencies: dependenciesResult.rows
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Moduls:', error);
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
      team_id,
      visibility = 'private',
      estimated_hours,
      assigned_to,
      tags,
      dependencies
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
        owner_id, team_id, visibility, estimated_hours, assigned_to, tags, dependencies
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [name, description, status, priority, start_date, target_date, req.user.id, team_id, visibility, estimated_hours, assigned_to, tags, dependencies]);

    const module = result.rows[0];

    // Log-Eintrag erstellen
    await createModuleLog(module.id, 'standalone', req.user.id, 'created', 'Modul erstellt');

    // Benachrichtigungen erstellen
    try {
      if (team_id) {
        // Team-Benachrichtigung für alle Team-Mitglieder
        await createTeamNotification(team_id, {
          type: 'module_created',
          title: 'Neues Modul erstellt',
          message: `"${name}" wurde in Ihrem Team erstellt.`,
          fromUserId: req.user.id,
          moduleId: module.id,
          moduleType: 'standalone',
          actionUrl: `/modules/standalone/${module.id}`
        });
      }

      if (assigned_to && assigned_to !== req.user.id) {
        // Benachrichtigung für den zugewiesenen Benutzer
        await createNotification({
          userId: assigned_to,
          type: 'module_assigned',
          title: 'Modul zugewiesen',
          message: `Das Modul "${name}" wurde Ihnen zugewiesen.`,
          fromUserId: req.user.id,
          moduleId: module.id,
          moduleType: 'standalone',
          actionUrl: `/modules/standalone/${module.id}`
        });
      }
    } catch (notificationError) {
      console.error('Fehler beim Erstellen der Benachrichtigungen:', notificationError);
    }

    res.status(201).json({
      message: 'Modul erfolgreich erstellt',
      module
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Moduls:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neues Projekt-Modul erstellen
router.post('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { 
      name, 
      description, 
      status = 'not_started', 
      priority = 'medium',
      estimated_hours,
      assigned_to,
      due_date,
      team_id,
      visibility = 'private',
      tags,
      dependencies
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Modul-Name ist erforderlich' });
    }

    // Prüfe Projekt-Berechtigung
    const projectCheck = await pool.query(`
      SELECT p.*, t.id as team_id
      FROM projects p
      LEFT JOIN teams t ON t.id = p.team_id
      WHERE p.id = $1
    `, [projectId]);

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt nicht gefunden' });
    }

    const project = projectCheck.rows[0];

    // Prüfe Berechtigung für das Projekt
    if (req.user.role !== 'admin' && project.owner_id !== req.user.id) {
      if (project.team_id) {
        const teamMembership = await pool.query(`
          SELECT tm.role FROM team_memberships tm
          WHERE tm.team_id = $1 AND tm.user_id = $2
        `, [project.team_id, req.user.id]);

        if (teamMembership.rows.length === 0) {
          return res.status(403).json({ error: 'Keine Berechtigung für dieses Projekt' });
        }
      } else {
        return res.status(403).json({ error: 'Keine Berechtigung für dieses Projekt' });
      }
    }

    // Modul erstellen
    const result = await pool.query(`
      INSERT INTO project_modules (
        project_id, name, description, status, priority, estimated_hours, 
        assigned_to, due_date, team_id, visibility, tags, dependencies
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [projectId, name, description, status, priority, estimated_hours, assigned_to, due_date, team_id, visibility, tags, dependencies]);

    const module = result.rows[0];

    // Log-Eintrag erstellen
    await createModuleLog(module.id, 'project', req.user.id, 'created', 'Projekt-Modul erstellt');

    // Benachrichtigungen erstellen
    try {
      if (team_id) {
        // Team-Benachrichtigung für alle Team-Mitglieder
        await createTeamNotification(team_id, {
          type: 'module_created',
          title: 'Neues Projekt-Modul erstellt',
          message: `"${name}" wurde im Projekt "${project.name}" erstellt.`,
          fromUserId: req.user.id,
          moduleId: module.id,
          moduleType: 'project',
          projectId: projectId,
          actionUrl: `/projects/${projectId}`
        });
      }

      if (assigned_to && assigned_to !== req.user.id) {
        // Benachrichtigung für den zugewiesenen Benutzer
        await createNotification({
          userId: assigned_to,
          type: 'module_assigned',
          title: 'Projekt-Modul zugewiesen',
          message: `Das Modul "${name}" im Projekt "${project.name}" wurde Ihnen zugewiesen.`,
          fromUserId: req.user.id,
          moduleId: module.id,
          moduleType: 'project',
          projectId: projectId,
          actionUrl: `/projects/${projectId}`
        });
      }
    } catch (notificationError) {
      console.error('Fehler beim Erstellen der Benachrichtigungen:', notificationError);
    }

    res.status(201).json({
      message: 'Projekt-Modul erfolgreich erstellt',
      module
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Projekt-Moduls:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Modul aktualisieren
router.put('/:type/:id', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const moduleType = type === 'project' ? 'project' : 'standalone';
    const updateData = req.body;

    // Prüfe Berechtigung
    if (!(await checkModulePermission(req.user.id, id, moduleType, 'edit'))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten des Moduls' });
    }

    // Erlaubte Felder für Update
    const allowedFields = [
      'name', 'description', 'status', 'priority', 'start_date', 
      'target_date', 'completion_percentage', 'visibility', 'estimated_hours',
      'actual_hours', 'assigned_to', 'due_date', 'tags', 'dependencies'
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
    values.push(id);

    const tableName = moduleType === 'project' ? 'project_modules' : 'standalone_modules';
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
    await createModuleLog(id, moduleType, req.user.id, 'updated', 'Modul aktualisiert');

    // Benachrichtigungen erstellen
    try {
      const module = result.rows[0];
      if (module.team_id) {
        // Team-Benachrichtigung für alle Team-Mitglieder (außer dem Aktualisierer)
        await createTeamNotification(module.team_id, {
          type: 'module_updated',
          title: 'Modul aktualisiert',
          message: `"${module.name}" wurde aktualisiert.`,
          fromUserId: req.user.id,
          moduleId: module.id,
          moduleType: moduleType,
          actionUrl: `/modules/${type}/${module.id}`
        });
      }
    } catch (notificationError) {
      console.error('Fehler beim Erstellen der Benachrichtigungen:', notificationError);
    }

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
router.delete('/:type/:id', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const moduleType = type === 'project' ? 'project' : 'standalone';

    // Prüfe Berechtigung (nur Eigentümer oder Admin)
    let ownerCheck;
    if (moduleType === 'project') {
      ownerCheck = await pool.query(`
        SELECT p.owner_id, pm.name
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        WHERE pm.id = $1
      `, [id]);
    } else {
      ownerCheck = await pool.query(`
        SELECT owner_id, name
        FROM standalone_modules
        WHERE id = $1
      `, [id]);
    }

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Modul nicht gefunden' });
    }

    const { owner_id, name } = ownerCheck.rows[0];

    if (owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Keine Berechtigung zum Löschen des Moduls' });
    }

    // Modul löschen (CASCADE löscht auch Verbindungen, Logs, etc.)
    const tableName = moduleType === 'project' ? 'project_modules' : 'standalone_modules';
    await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);

    res.json({ message: 'Modul erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Moduls:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Modul-Verbindung erstellen
router.post('/:type/:id/connections', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const sourceModuleType = type === 'project' ? 'project' : 'standalone';
    const { target_module_id, target_module_type, connection_type, description } = req.body;

    if (!target_module_id || !target_module_type || !connection_type) {
      return res.status(400).json({ error: 'Ziel-Modul, Modul-Typ und Verbindungstyp sind erforderlich' });
    }

    // Prüfe Berechtigung für beide Module
    if (!(await checkModulePermission(req.user.id, id, sourceModuleType, 'edit'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für das Quell-Modul' });
    }

    if (!(await checkModulePermission(req.user.id, target_module_id, target_module_type, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für das Ziel-Modul' });
    }

    // Verbindung erstellen
    const result = await pool.query(`
      INSERT INTO module_connections (
        source_module_id, source_module_type, target_module_id, target_module_type,
        connection_type, description, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [id, sourceModuleType, target_module_id, target_module_type, connection_type, description, req.user.id]);

    // Log-Einträge erstellen
    await createModuleLog(id, sourceModuleType, req.user.id, 'connection_created', `Verbindung zu ${target_module_type}-Modul ${target_module_id} erstellt`);
    await createModuleLog(target_module_id, target_module_type, req.user.id, 'connection_created', `Verbindung von ${sourceModuleType}-Modul ${id} erstellt`);

    res.status(201).json({
      message: 'Modul-Verbindung erfolgreich erstellt',
      connection: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Diese Verbindung existiert bereits' });
    }
    console.error('Fehler beim Erstellen der Modul-Verbindung:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Modul-Verbindung löschen
router.delete('/:type/:id/connections/:connectionId', authenticateToken, async (req, res) => {
  try {
    const { type, id, connectionId } = req.params;
    const moduleType = type === 'project' ? 'project' : 'standalone';

    // Prüfe Berechtigung
    if (!(await checkModulePermission(req.user.id, id, moduleType, 'edit'))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Löschen der Verbindung' });
    }

    // Verbindung löschen
    const result = await pool.query(`
      DELETE FROM module_connections 
      WHERE id = $1 AND source_module_id = $2 AND source_module_type = $3
      RETURNING *
    `, [connectionId, id, moduleType]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Verbindung nicht gefunden' });
    }

    // Log-Eintrag erstellen
    await createModuleLog(id, moduleType, req.user.id, 'connection_deleted', 'Modul-Verbindung gelöscht');

    res.json({ message: 'Modul-Verbindung erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Modul-Verbindung:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Modul-Berechtigung vergeben
router.post('/:type/:id/permissions', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const moduleType = type === 'project' ? 'project' : 'standalone';
    const { user_id, permission_type } = req.body;

    if (!user_id || !permission_type) {
      return res.status(400).json({ error: 'Benutzer-ID und Berechtigungstyp sind erforderlich' });
    }

    // Prüfe Berechtigung (nur Eigentümer oder Admin)
    if (!(await checkModulePermission(req.user.id, id, moduleType, 'admin'))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Vergeben von Modul-Berechtigungen' });
    }

    // Prüfe ob Benutzer existiert
    const userResult = await pool.query('SELECT id, username FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Berechtigung vergeben
    const result = await pool.query(`
      INSERT INTO module_permissions (module_id, module_type, user_id, permission_type, granted_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (module_id, module_type, user_id) 
      DO UPDATE SET permission_type = $4, granted_by = $5, granted_at = NOW()
      RETURNING *
    `, [id, moduleType, user_id, permission_type, req.user.id]);

    res.status(201).json({
      message: 'Berechtigung erfolgreich vergeben',
      permission: result.rows[0],
      user: userResult.rows[0]
    });
  } catch (error) {
    console.error('Fehler beim Vergeben der Berechtigung:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Modul-Team zuweisen
router.post('/:type/:id/teams', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const moduleType = type === 'project' ? 'project' : 'standalone';
    const { team_id, role = 'member' } = req.body;

    if (!team_id) {
      return res.status(400).json({ error: 'Team-ID ist erforderlich' });
    }

    // Prüfe Berechtigung
    if (!(await checkModulePermission(req.user.id, id, moduleType, 'edit'))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Zuweisen von Teams' });
    }

    // Prüfe ob Team existiert
    const teamResult = await pool.query('SELECT id, name FROM teams WHERE id = $1', [team_id]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team nicht gefunden' });
    }

    // Team zuweisen
    const result = await pool.query(`
      INSERT INTO module_team_assignments (module_id, module_type, team_id, role, assigned_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (module_id, module_type, team_id) 
      DO UPDATE SET role = $4, assigned_by = $5, assigned_at = NOW()
      RETURNING *
    `, [id, moduleType, team_id, role, req.user.id]);

    // Log-Eintrag erstellen
    await createModuleLog(id, moduleType, req.user.id, 'team_assigned', `Team "${teamResult.rows[0].name}" zugewiesen`);

    // Benachrichtigungen erstellen
    try {
      await createTeamNotification(team_id, {
        type: 'module_assigned',
        title: 'Modul zugewiesen',
        message: `Ein Modul wurde Ihrem Team zugewiesen.`,
        fromUserId: req.user.id,
        moduleId: id,
        moduleType: moduleType,
        actionUrl: `/modules/${type}/${id}`
      });
    } catch (notificationError) {
      console.error('Fehler beim Erstellen der Benachrichtigungen:', notificationError);
    }

    res.status(201).json({
      message: 'Team erfolgreich zugewiesen',
      assignment: result.rows[0],
      team: teamResult.rows[0]
    });
  } catch (error) {
    console.error('Fehler beim Zuweisen des Teams:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;
