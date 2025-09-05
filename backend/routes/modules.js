const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const { createNotification, createTeamNotification } = require('./notifications');
const { updateProjectProgress, calculateModuleProgress } = require('../utils/progressCalculator');
const router = express.Router();

// Hilfsfunktion: Prüft Modul-Berechtigung
const checkModulePermission = async (userId, moduleId, moduleType, requiredPermission = 'view') => {
  try {
    // Admin hat immer Zugriff
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
      return true;
    }

    let moduleResult;
    if (moduleType === 'project') {
      // Für Projekt-Module: Prüfe Projekt-Berechtigung
      moduleResult = await pool.query(`
        SELECT pm.*, p.owner_id, p.visibility as project_visibility
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

    // Prüfe Team-Berechtigung (falls teams-Tabelle existiert)
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
        // Ignoriere Team-Fehler, falls Tabelle nicht existiert
      }
    }

    // Prüfe explizite Modul-Berechtigungen (falls Tabelle existiert)
    try {
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
    } catch (permissionError) {
      console.warn('Modul-Berechtigungen konnten nicht geprüft werden:', permissionError.message);
      // Ignoriere Berechtigungs-Fehler, falls Tabelle nicht existiert
    }

    // Prüfe Sichtbarkeit
    if (module.visibility === 'public' && requiredPermission === 'view') return true;
    if (moduleType === 'project' && module.project_visibility === 'public' && requiredPermission === 'view') return true;

    return false;
  } catch (error) {
    console.error('Fehler bei der Berechtigungsprüfung:', error);
    // Bei Fehlern: Sicherheitshalber Zugriff verweigern
    return false;
  }
};

// Alle Module abrufen (basierend auf Berechtigung)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { project_id, status, priority, assigned_to, module_type = 'project' } = req.query;
    
    let query, params = [];
    let paramCount = 0;

    if (module_type === 'project') {
      // Einfache Abfrage ohne komplexe Joins
      query = `
        SELECT pm.*, 
               p.name as project_name
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        WHERE 1=1
      `;
      
      // Filter basierend auf Benutzer-Berechtigung
      if (req.user.role !== 'admin') {
        query += ` AND (p.owner_id = $${++paramCount} OR p.visibility = 'public')`;
        params.push(req.user.id);
      }
    } else {
      // Einfache Abfrage für eigenständige Module
      query = `
        SELECT sm.*
        FROM standalone_modules sm
        WHERE 1=1
      `;
      
      // Filter basierend auf Benutzer-Berechtigung
      if (req.user.role !== 'admin') {
        query += ` AND (sm.owner_id = $${++paramCount} OR sm.visibility = 'public')`;
        params.push(req.user.id);
      }
    }

    // Zusätzliche Filter
    if (project_id && module_type === 'project') {
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

    query += ` ORDER BY ${module_type === 'project' ? 'pm.created_at' : 'sm.created_at'} DESC`;

    const result = await pool.query(query, params);
    
    // Versuche, zusätzliche Details hinzuzufügen (falls Tabellen existieren)
    const modulesWithDetails = await Promise.all(result.rows.map(async (module) => {
      const moduleWithDetails = { 
        ...module, 
        assigned_username: null, 
        team_name: null,
        completion_percentage: calculateModuleProgress(module.status)
      };
      
      try {
        // Zugewiesenen Benutzer-Namen hinzufügen
        if (module.assigned_to) {
          const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [module.assigned_to]);
          if (userResult.rows.length > 0) {
            moduleWithDetails.assigned_username = userResult.rows[0].username;
          }
        }
        
        // Team-Name hinzufügen
        if (module.team_id) {
          const teamResult = await pool.query('SELECT name FROM teams WHERE id = $1', [module.team_id]);
          if (teamResult.rows.length > 0) {
            moduleWithDetails.team_name = teamResult.rows[0].name;
          }
        }
      } catch (detailError) {
        console.warn('Konnte Modul-Details nicht laden:', detailError.message);
        // Ignoriere Fehler bei optionalen Details
      }
      
      return moduleWithDetails;
    }));

    res.json({ modules: modulesWithDetails });
  } catch (error) {
    console.error('Fehler beim Abrufen der Module:', error);
    console.error('Fehler-Details:', error.message);
    res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
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

    const module = moduleResult.rows[0];
    module.completion_percentage = calculateModuleProgress(module.status);
    
    res.json({
      module: module,
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
        try {
          const teamMembership = await pool.query(`
            SELECT tm.role FROM team_memberships tm
            WHERE tm.team_id = $1 AND tm.user_id = $2
          `, [project.team_id, req.user.id]);
          
          if (teamMembership.rows.length === 0 || !['leader', 'member'].includes(teamMembership.rows[0].role)) {
            return res.status(403).json({ error: 'Keine Berechtigung zum Erstellen von Modulen in diesem Projekt' });
          }
        } catch (teamError) {
          console.warn('Team-Berechtigung konnte nicht geprüft werden:', teamError.message);
          // Wenn teams-Tabelle nicht existiert, verweigere Zugriff
          if (teamError.message.includes('relation "team_memberships" does not exist')) {
            return res.status(403).json({ error: 'Keine Berechtigung zum Erstellen von Modulen in diesem Projekt' });
          } else {
            throw teamError;
          }
        }
      } else {
        return res.status(403).json({ error: 'Keine Berechtigung zum Erstellen von Modulen in diesem Projekt' });
      }
    }

    // Modul erstellen - konvertiere leere Strings zu null für Datum-Felder
    const result = await pool.query(`
      INSERT INTO project_modules (
        project_id, name, description, status, priority, estimated_hours, 
        assigned_to, due_date, visibility, team_id, tags, dependencies
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      project_id, 
      name, 
      description, 
      status, 
      priority, 
      estimated_hours, 
      assigned_to, 
      due_date && due_date.trim() !== '' ? due_date : null, 
      visibility, 
      project.team_id, 
      tags, 
      dependencies
    ]);

    const module = result.rows[0];

    // Log-Eintrag erstellen (falls Tabelle existiert)
    try {
      await pool.query(`
        INSERT INTO module_logs (module_id, module_type, user_id, action, details)
        VALUES ($1, 'project', $2, 'created', 'Modul erstellt')
      `, [module.id, req.user.id]);
    } catch (logError) {
      console.warn('Konnte Modul-Log nicht erstellen:', logError.message);
      // Log-Fehler sollten das Modul-Erstellen nicht blockieren
    }

    // Automatische Team-Mitglieder-Zuordnung für Modul
    try {
      if (project.team_id) {
        // Alle Team-Mitglieder automatisch dem Modul zuweisen
        const teamMembers = await pool.query(`
          SELECT tm.user_id, tm.role as team_role
          FROM team_memberships tm
          WHERE tm.team_id = $1
        `, [project.team_id]);

        // Erstelle Modul-Berechtigungen für alle Team-Mitglieder
        for (const member of teamMembers.rows) {
          let permissionType = 'view'; // Standard-Berechtigung
          
          // Team-Leader bekommt Admin-Rechte, Mitglieder bekommen Edit-Rechte
          if (member.team_role === 'leader') {
            permissionType = 'admin';
          } else if (member.team_role === 'member') {
            permissionType = 'edit';
          }

          try {
            await pool.query(`
              INSERT INTO module_permissions (module_id, module_type, user_id, permission_type, granted_by)
              VALUES ($1, 'project', $2, $3, $4)
              ON CONFLICT (module_id, module_type, user_id) 
              DO UPDATE SET permission_type = $3, granted_by = $4, granted_at = NOW()
            `, [module.id, member.user_id, permissionType, req.user.id]);
          } catch (permissionError) {
            console.warn(`Konnte Modul-Berechtigung für Benutzer ${member.user_id} nicht erstellen:`, permissionError.message);
          }
        }
      } else {
        // Wenn kein Team zugewiesen, automatisch dem Ersteller zuweisen
        try {
          await pool.query(`
            INSERT INTO module_permissions (module_id, module_type, user_id, permission_type, granted_by)
            VALUES ($1, 'project', $2, 'admin', $2)
            ON CONFLICT (module_id, module_type, user_id) 
            DO UPDATE SET permission_type = 'admin', granted_by = $2, granted_at = NOW()
          `, [module.id, req.user.id]);
        } catch (permissionError) {
          console.warn('Konnte automatische Ersteller-Modul-Berechtigung nicht erstellen:', permissionError.message);
        }
      }
    } catch (assignmentError) {
      console.error('Fehler bei der automatischen Modul-Team-Zuordnung:', assignmentError);
      // Zuordnungsfehler sollten das Modul-Erstellen nicht blockieren
    }

    // Aktualisiere Projektfortschritt
    try {
      await updateProjectProgress(project_id);
    } catch (progressError) {
      console.warn('Konnte Projektfortschritt nicht aktualisieren:', progressError.message);
      // Fortschrittsfehler sollten das Modul-Erstellen nicht blockieren
    }

    res.status(201).json({
      message: 'Modul erfolgreich erstellt',
      module
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Moduls:', error);
    console.error('Fehler-Details:', error.message);
    console.error('Fehler-Stack:', error.stack);
    res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
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

    // Automatische Team-Mitglieder-Zuordnung für eigenständiges Modul
    try {
      if (team_id) {
        // Alle Team-Mitglieder automatisch dem Modul zuweisen
        const teamMembers = await pool.query(`
          SELECT tm.user_id, tm.role as team_role
          FROM team_memberships tm
          WHERE tm.team_id = $1
        `, [team_id]);

        // Erstelle Modul-Berechtigungen für alle Team-Mitglieder
        for (const member of teamMembers.rows) {
          let permissionType = 'view'; // Standard-Berechtigung
          
          // Team-Leader bekommt Admin-Rechte, Mitglieder bekommen Edit-Rechte
          if (member.team_role === 'leader') {
            permissionType = 'admin';
          } else if (member.team_role === 'member') {
            permissionType = 'edit';
          }

          try {
            await pool.query(`
              INSERT INTO module_permissions (module_id, module_type, user_id, permission_type, granted_by)
              VALUES ($1, 'standalone', $2, $3, $4)
              ON CONFLICT (module_id, module_type, user_id) 
              DO UPDATE SET permission_type = $3, granted_by = $4, granted_at = NOW()
            `, [module.id, member.user_id, permissionType, req.user.id]);
          } catch (permissionError) {
            console.warn(`Konnte Modul-Berechtigung für Benutzer ${member.user_id} nicht erstellen:`, permissionError.message);
          }
        }
      } else {
        // Wenn kein Team zugewiesen, automatisch dem Ersteller zuweisen
        try {
          await pool.query(`
            INSERT INTO module_permissions (module_id, module_type, user_id, permission_type, granted_by)
            VALUES ($1, 'standalone', $2, 'admin', $2)
            ON CONFLICT (module_id, module_type, user_id) 
            DO UPDATE SET permission_type = 'admin', granted_by = $2, granted_at = NOW()
          `, [module.id, req.user.id]);
        } catch (permissionError) {
          console.warn('Konnte automatische Ersteller-Modul-Berechtigung nicht erstellen:', permissionError.message);
        }
      }
    } catch (assignmentError) {
      console.error('Fehler bei der automatischen Modul-Team-Zuordnung:', assignmentError);
      // Zuordnungsfehler sollten das Modul-Erstellen nicht blockieren
    }

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
        
        // Parse values based on field type
        let parsedValue = value;
        if (key === 'due_date' || key === 'start_date' || key === 'target_date') {
          // Convert empty strings to null for date fields
          parsedValue = value && value.trim() !== '' ? value : null;
        } else if (key === 'team_id' || key === 'assigned_to' || key === 'completion_percentage') {
          // Convert empty strings to null for integer fields
          parsedValue = value && value !== '' ? parseInt(value) : null;
        } else if (key === 'estimated_hours' || key === 'actual_hours') {
          // Convert empty strings to null for decimal fields
          parsedValue = value && value !== '' ? parseFloat(value) : null;
        }
        
        values.push(parsedValue);
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

    // Aktualisiere Projektfortschritt, wenn es sich um ein Projekt-Modul handelt
    if (module_type === 'project') {
      try {
        const module = result.rows[0];
        await updateProjectProgress(module.project_id);
      } catch (progressError) {
        console.warn('Konnte Projektfortschritt nicht aktualisieren:', progressError.message);
        // Fortschrittsfehler sollten das Modul-Update nicht blockieren
      }
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
    if (module_type === 'project') {
      await pool.query('DELETE FROM project_modules WHERE id = $1', [moduleId]);
    } else {
      await pool.query('DELETE FROM standalone_modules WHERE id = $1', [moduleId]);
    }

    // Aktualisiere Projektfortschritt, wenn es sich um ein Projekt-Modul handelt
    if (module_type === 'project') {
      try {
        await updateProjectProgress(module.project_id);
      } catch (progressError) {
        console.warn('Konnte Projektfortschritt nicht aktualisieren:', progressError.message);
        // Fortschrittsfehler sollten das Modul-Löschen nicht blockieren
      }
    }

    res.json({ message: 'Modul erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Moduls:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;