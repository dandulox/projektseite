const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const { createNotification, createTeamNotification } = require('./notifications');
const { calculateProjectProgress, updateProjectProgress, calculateModuleProgress } = require('../utils/progressCalculator');
const { asyncHandler } = require('../middleware/errorHandler');
const { getProjectsSimple } = require('../middleware/databaseFallback');
const router = express.Router();

// Hilfsfunktion: Prüft Projekt-Berechtigung
const checkProjectPermission = async (userId, projectId, requiredPermission = 'view') => {
  try {
    // Admin hat immer Zugriff
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
      return true;
    }

    // Projekt-Details abrufen
    const projectResult = await pool.query(`
      SELECT p.*
      FROM projects p
      WHERE p.id = $1
    `, [projectId]);

    if (projectResult.rows.length === 0) return false;
    const project = projectResult.rows[0];

    // Eigentümer hat immer Zugriff
    if (project.owner_id === userId) return true;

    // Prüfe Team-Berechtigung (falls teams-Tabelle existiert)
    if (project.team_id) {
      try {
        const teamMembership = await pool.query(`
          SELECT tm.role as team_role
          FROM team_memberships tm
          WHERE tm.team_id = $1 AND tm.user_id = $2
        `, [project.team_id, userId]);

        if (teamMembership.rows.length > 0) {
          const teamRole = teamMembership.rows[0].team_role;
          // Team-Leader hat Admin-Rechte, Mitglieder haben Edit-Rechte
          if (teamRole === 'leader' && requiredPermission !== 'admin') return true;
          if (teamRole === 'member' && ['view', 'edit'].includes(requiredPermission)) return true;
          if (teamRole === 'viewer' && requiredPermission === 'view') return true;
        }
      } catch (teamError) {
        console.warn('Team-Berechtigung konnte nicht geprüft werden:', teamError.message);
        // Ignoriere Team-Fehler, falls Tabelle nicht existiert
      }
    }

    // Prüfe explizite Projekt-Berechtigungen (falls Tabelle existiert)
    try {
      const permissionResult = await pool.query(`
        SELECT permission_type
        FROM project_permissions
        WHERE project_id = $1 AND user_id = $2
      `, [projectId, userId]);

      if (permissionResult.rows.length > 0) {
        const permission = permissionResult.rows[0].permission_type;
        if (permission === 'admin') return true;
        if (permission === 'edit' && ['view', 'edit'].includes(requiredPermission)) return true;
        if (permission === 'view' && requiredPermission === 'view') return true;
      }
    } catch (permissionError) {
      console.warn('Projekt-Berechtigungen konnten nicht geprüft werden:', permissionError.message);
      // Ignoriere Berechtigungs-Fehler, falls Tabelle nicht existiert
    }

    // Prüfe Sichtbarkeit
    if (project.visibility === 'public' && requiredPermission === 'view') return true;

    return false;
  } catch (error) {
    console.error('Fehler bei der Projekt-Berechtigungsprüfung:', error);
    // Bei Fehlern: Sicherheitshalber Zugriff verweigern
    return false;
  }
};

// Alle Projekte abrufen (basierend auf Berechtigung)
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { team_id, status, visibility } = req.query;
    
    // Verwende Fallback-System für einfache Abfrage
    const projects = await getProjectsSimple(req.user.id, 100);
    
    // Filtere Projekte basierend auf Parametern
    let filteredProjects = projects;
    
    if (status) {
      filteredProjects = filteredProjects.filter(project => project.status === status);
    }
    if (visibility) {
      filteredProjects = filteredProjects.filter(project => project.visibility === visibility);
    }
    if (team_id) {
      filteredProjects = filteredProjects.filter(project => project.team_id === parseInt(team_id));
    }

    // Erweitere Projekte mit zusätzlichen Informationen
    const projectsWithDetails = filteredProjects.map(project => ({
      ...project,
      owner_username: 'Unbekannt',
      team_name: null,
      module_count: 0
    }));

    res.json({ projects: projectsWithDetails });
  } catch (error) {
    console.error('Fehler beim Abrufen der Projekte:', error);
    console.error('Fehler-Details:', error.message);
    res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}));

// Einzelnes Projekt abrufen
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;

    // Prüfe Berechtigung
    if (!(await checkProjectPermission(req.user.id, projectId, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für dieses Projekt' });
    }

    // Projekt-Details abrufen
    const projectResult = await pool.query(`
      SELECT p.*, 
             u.username as owner_username,
             t.name as team_name,
             t.id as team_id
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_id
      LEFT JOIN teams t ON t.id = p.team_id
      WHERE p.id = $1
    `, [projectId]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt nicht gefunden' });
    }

    // Projekt-Module abrufen
    const modulesResult = await pool.query(`
      SELECT pm.*, u.username as assigned_username
      FROM project_modules pm
      LEFT JOIN users u ON u.id = pm.assigned_to
      WHERE pm.project_id = $1
      ORDER BY pm.created_at ASC
    `, [projectId]);
    
    // Berechne Fortschritt für jedes Modul basierend auf Status
    const modulesWithProgress = modulesResult.rows.map(module => ({
      ...module,
      completion_percentage: calculateModuleProgress(module.status)
    }));

    // Projekt-Logs abrufen
    const logsResult = await pool.query(`
      SELECT pl.*, u.username
      FROM project_logs pl
      LEFT JOIN users u ON u.id = pl.user_id
      WHERE pl.project_id = $1
      ORDER BY pl.timestamp DESC
      LIMIT 50
    `, [projectId]);

    res.json({
      project: projectResult.rows[0],
      modules: modulesWithProgress,
      logs: logsResult.rows
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Projekts:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neues Projekt erstellen
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      status = 'planning', 
      priority = 'medium',
      start_date,
      target_date,
      team_id,
      visibility = 'private'
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Projekt-Name ist erforderlich' });
    }

    // Prüfe Team-Berechtigung falls team_id angegeben
    if (team_id && team_id !== '') {
      try {
        const teamCheck = await pool.query(`
          SELECT id FROM team_memberships 
          WHERE team_id = $1 AND user_id = $2
        `, [parseInt(team_id), req.user.id]);
        
        if (teamCheck.rows.length === 0 && req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Keine Berechtigung für das angegebene Team' });
        }
      } catch (teamError) {
        console.warn('Team-Berechtigung konnte nicht geprüft werden:', teamError.message);
        // Wenn teams-Tabelle nicht existiert, ignoriere team_id
        if (teamError.message.includes('relation "team_memberships" does not exist')) {
          console.log('Team-Mitgliedschaften-Tabelle existiert nicht, ignoriere team_id');
        } else {
          throw teamError;
        }
      }
    }

    // Projekt erstellen - konvertiere leere Strings zu null für Datum-Felder
    const result = await pool.query(`
      INSERT INTO projects (
        name, description, status, priority, start_date, target_date, 
        owner_id, team_id, visibility
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      name, 
      description, 
      status, 
      priority, 
      start_date && start_date.trim() !== '' ? start_date : null, 
      target_date && target_date.trim() !== '' ? target_date : null, 
      req.user.id, 
      team_id && team_id !== '' ? parseInt(team_id) : null, 
      visibility
    ]);

    const project = result.rows[0];

    // Log-Eintrag erstellen (falls Tabelle existiert)
    try {
      await pool.query(`
        INSERT INTO project_logs (project_id, user_id, action, details)
        VALUES ($1, $2, 'created', 'Projekt erstellt')
      `, [project.id, req.user.id]);
    } catch (logError) {
      console.warn('Konnte Projekt-Log nicht erstellen:', logError.message);
      // Log-Fehler sollten das Projekt-Erstellen nicht blockieren
    }

    // Erweiterte Aktivitätslog erstellen (falls Funktion existiert)
    try {
      // Prüfe ob Aktivitätslog-Funktion existiert
      const functionCheck = await pool.query(`
        SELECT COUNT(*) as count FROM information_schema.routines 
        WHERE routine_name = 'log_project_activity'
        AND routine_schema = 'public'
      `);
      
      if (functionCheck.rows[0].count > 0) {
        await pool.query(`
          SELECT log_project_activity($1, $2, 'created', $3, NULL, $4, NULL)
        `, [
          project.id, 
          req.user.id, 
          JSON.stringify({ project_name: name, description: description }),
          JSON.stringify(project)
        ]);
        console.log('Aktivitätslog für Projekt-Erstellung erstellt');
      } else {
        console.log('Aktivitätslog-Funktion existiert nicht, überspringe Log-Erstellung');
      }
    } catch (activityLogError) {
      console.warn('Konnte erweiterten Aktivitätslog nicht erstellen:', activityLogError.message);
    }

    // Nur Ersteller automatisch zuweisen (keine automatische Team-Zuordnung)
    try {
      await pool.query(`
        INSERT INTO project_permissions (project_id, user_id, permission_type, granted_by)
        VALUES ($1, $2, 'admin', $2)
        ON CONFLICT (project_id, user_id) 
        DO UPDATE SET permission_type = 'admin', granted_by = $2, granted_at = NOW()
      `, [project.id, req.user.id]);
    } catch (permissionError) {
      console.warn('Konnte automatische Ersteller-Berechtigung nicht erstellen:', permissionError.message);
    }

    // Team-Benachrichtigung (ohne automatische Zuordnung)
    try {
      if (team_id) {
        // Prüfe ob Benachrichtigungstyp existiert
        const notificationTypeCheck = await pool.query(`
          SELECT COUNT(*) as count FROM notification_types 
          WHERE name = 'project_created'
        `);
        
        if (notificationTypeCheck.rows[0].count > 0) {
          await createTeamNotification(team_id, {
            type: 'project_created',
            title: 'Neues Projekt erstellt',
            message: `"${name}" wurde in Ihrem Team erstellt.`,
            fromUserId: req.user.id,
            projectId: project.id,
            actionUrl: `/projects/${project.id}`
          });
          console.log('Team-Benachrichtigung für Projekt-Erstellung gesendet');
        } else {
          console.log('Benachrichtigungstyp "project_created" existiert nicht, überspringe Benachrichtigung');
        }
      }
    } catch (notificationError) {
      console.error('Fehler beim Erstellen der Benachrichtigungen:', notificationError);
      // Benachrichtigungsfehler sollten das Projekt-Erstellen nicht blockieren
    }

    res.status(201).json({
      message: 'Projekt erfolgreich erstellt',
      project
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Projekts:', error);
    console.error('Fehler-Details:', error.message);
    console.error('Fehler-Stack:', error.stack);
    res.status(500).json({ error: 'Interner Serverfehler', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// Projekt aktualisieren
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const updateData = req.body;

    // Prüfe Berechtigung
    if (!(await checkProjectPermission(req.user.id, projectId, 'edit'))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten des Projekts' });
    }

    // Erlaubte Felder für Update
    const allowedFields = [
      'name', 'description', 'status', 'priority', 'start_date', 
      'target_date', 'completion_percentage', 'visibility'
    ];
    
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${++paramCount}`);
        
        // Parse values based on field type
        let parsedValue = value;
        if (key === 'start_date' || key === 'target_date') {
          // Convert empty strings to null for date fields
          parsedValue = value && value.trim() !== '' ? value : null;
        } else if (key === 'completion_percentage') {
          // Convert empty strings to null for integer fields
          parsedValue = value && value !== '' ? parseInt(value) : null;
        }
        
        values.push(parsedValue);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Keine gültigen Felder zum Aktualisieren' });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(projectId);

    const query = `
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt nicht gefunden' });
    }

    // Log-Eintrag erstellen
    await pool.query(`
      INSERT INTO project_logs (project_id, user_id, action, details)
      VALUES ($1, $2, 'updated', 'Projekt aktualisiert')
    `, [projectId, req.user.id]);

    // Erweiterte Aktivitätslog erstellen
    try {
      await pool.query(`
        SELECT log_project_activity($1, $2, 'updated', $3, $4, $5, NULL)
      `, [
        projectId, 
        req.user.id, 
        JSON.stringify({ project_name: result.rows[0].name }),
        JSON.stringify(updateData),
        JSON.stringify(result.rows[0])
      ]);
    } catch (activityLogError) {
      console.warn('Konnte erweiterten Aktivitätslog nicht erstellen:', activityLogError.message);
    }

    // Benachrichtigungen erstellen
    try {
      const project = result.rows[0];
      if (project.team_id) {
        // Team-Benachrichtigung für alle Team-Mitglieder (außer dem Aktualisierer)
        await createTeamNotification(project.team_id, {
          type: 'project_updated',
          title: 'Projekt aktualisiert',
          message: `"${project.name}" wurde aktualisiert.`,
          fromUserId: req.user.id,
          projectId: project.id,
          actionUrl: `/projects/${project.id}`
        });
      }
    } catch (notificationError) {
      console.error('Fehler beim Erstellen der Benachrichtigungen:', notificationError);
      // Benachrichtigungsfehler sollten das Projekt-Update nicht blockieren
    }

    res.json({
      message: 'Projekt erfolgreich aktualisiert',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Projekts:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Projekt löschen
router.delete('/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const projectId = req.params.id;

    // Prüfe Berechtigung (nur Eigentümer oder Admin)
    const projectResult = await client.query(
      'SELECT owner_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Projekt nicht gefunden' });
    }

    if (projectResult.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Keine Berechtigung zum Löschen des Projekts' });
    }

    // 1. Activity-Logs manuell löschen (vor dem Projekt-Löschen)
    await client.query('DELETE FROM project_activity_logs WHERE project_id = $1', [projectId]);
    await client.query('DELETE FROM module_activity_logs WHERE project_id = $1', [projectId]);
    
    // 2. Projekt-Module löschen (falls CASCADE nicht funktioniert)
    await client.query('DELETE FROM project_modules WHERE project_id = $1', [projectId]);
    
    // 3. Projekt-Berechtigungen löschen
    await client.query('DELETE FROM project_permissions WHERE project_id = $1', [projectId]);
    
    // 4. Projekt-Logs löschen
    await client.query('DELETE FROM project_logs WHERE project_id = $1', [projectId]);
    
    // 5. Tasks löschen (falls vorhanden)
    await client.query('DELETE FROM tasks WHERE project_id = $1', [projectId]);
    
    // 6. Projekt löschen
    await client.query('DELETE FROM projects WHERE id = $1', [projectId]);

    await client.query('COMMIT');
    res.json({ message: 'Projekt erfolgreich gelöscht' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fehler beim Löschen des Projekts:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  } finally {
    client.release();
  }
});

// Projekt-Berechtigungen abrufen
router.get('/:id/permissions', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;

    // Prüfe Berechtigung
    if (!(await checkProjectPermission(req.user.id, projectId, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für dieses Projekt' });
    }

    // Berechtigungen abrufen
    const result = await pool.query(`
      SELECT pp.*, u.username, u.email, u.role as user_role
      FROM project_permissions pp
      JOIN users u ON u.id = pp.user_id
      WHERE pp.project_id = $1
      ORDER BY pp.granted_at DESC
    `, [projectId]);

    res.json({ permissions: result.rows });
  } catch (error) {
    console.error('Fehler beim Abrufen der Projekt-Berechtigungen:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Projekt-Berechtigung vergeben
router.post('/:id/permissions', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { user_id, permission_type } = req.body;

    if (!user_id || !permission_type) {
      return res.status(400).json({ error: 'Benutzer-ID und Berechtigungstyp sind erforderlich' });
    }

    // Prüfe Berechtigung (nur Eigentümer oder Admin)
    if (!(await checkProjectPermission(req.user.id, projectId, 'admin'))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Vergeben von Projekt-Berechtigungen' });
    }

    // Prüfe ob Benutzer existiert
    const userResult = await pool.query('SELECT id, username FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Berechtigung vergeben
    const result = await pool.query(`
      INSERT INTO project_permissions (project_id, user_id, permission_type, granted_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (project_id, user_id) 
      DO UPDATE SET permission_type = $3, granted_by = $4, granted_at = NOW()
      RETURNING *
    `, [projectId, user_id, permission_type, req.user.id]);

    // Aktivitätslog für Berechtigung erstellen
    try {
      await pool.query(`
        SELECT log_project_activity($1, $2, 'permission_granted', $3, NULL, NULL, $4)
      `, [
        projectId, 
        req.user.id, 
        JSON.stringify({ 
          permission_type: permission_type, 
          granted_to: userResult.rows[0].username,
          project_name: (await pool.query('SELECT name FROM projects WHERE id = $1', [projectId])).rows[0].name
        }),
        user_id
      ]);
    } catch (activityLogError) {
      console.warn('Konnte Aktivitätslog für Berechtigung nicht erstellen:', activityLogError.message);
    }

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

// Projekt-Berechtigung entfernen
router.delete('/:id/permissions/:userId', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.params.userId;

    // Prüfe Berechtigung
    if (!(await checkProjectPermission(req.user.id, projectId, 'admin'))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Entfernen von Projekt-Berechtigungen' });
    }

    // Berechtigung entfernen
    const result = await pool.query(`
      DELETE FROM project_permissions 
      WHERE project_id = $1 AND user_id = $2
      RETURNING *
    `, [projectId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Berechtigung nicht gefunden' });
    }

    res.json({ message: 'Berechtigung erfolgreich entfernt' });
  } catch (error) {
    console.error('Fehler beim Entfernen der Berechtigung:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Projektfortschritt aktualisieren
router.post('/:id/update-progress', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;

    // Prüfe Berechtigung
    if (!(await checkProjectPermission(req.user.id, projectId, 'edit'))) {
      return res.status(403).json({ error: 'Keine Berechtigung zum Aktualisieren des Projektfortschritts' });
    }

    // Prüfe ob Projekt existiert
    const projectResult = await pool.query('SELECT id FROM projects WHERE id = $1', [projectId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt nicht gefunden' });
    }

    // Berechne und aktualisiere Fortschritt
    const progress = await updateProjectProgress(projectId);

    res.json({
      message: 'Projektfortschritt erfolgreich aktualisiert',
      progress: progress
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Projektfortschritts:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Kanban Board für Projekt abrufen
router.get('/:id/board', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;

    // Prüfe Berechtigung
    if (!(await checkProjectPermission(req.user.id, projectId, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für dieses Projekt' });
    }

    // Projekt-Details abrufen
    const projectResult = await pool.query(`
      SELECT p.*, u.username as owner_username
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_id
      WHERE p.id = $1
    `, [projectId]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt nicht gefunden' });
    }

    const project = projectResult.rows[0];

    // Tasks für Kanban Board abrufen (gruppiert nach Status)
    const tasksResult = await pool.query(`
      SELECT 
        t.*,
        u.username as assignee_username,
        u.email as assignee_email,
        pm.name as module_name,
        CASE 
          WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN true
          ELSE false
        END as is_overdue,
        CASE 
          WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' AND t.status NOT IN ('completed', 'cancelled') THEN true
          ELSE false
        END as is_due_soon
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assignee_id
      LEFT JOIN project_modules pm ON pm.id = t.module_id
      WHERE t.project_id = $1
      ORDER BY t.priority DESC, t.created_at ASC
    `, [projectId]);

    // Tasks nach Status gruppieren - mit zentralen Status-Konstanten
    const { KANBAN_COLUMNS } = require('../utils/statusConstants');
    const kanbanColumns = {};
    
    KANBAN_COLUMNS.forEach(column => {
      kanbanColumns[column.id] = {
        id: column.id,
        title: column.title,
        tasks: []
      };
    });

    // Tasks in entsprechende Spalten einteilen
    tasksResult.rows.forEach(task => {
      if (kanbanColumns[task.status]) {
        kanbanColumns[task.status].tasks.push(task);
      }
    });

    // Spalten in Array umwandeln (ohne leere Spalten)
    const columns = Object.values(kanbanColumns).filter(column => 
      column.tasks.length > 0 || ['todo', 'in_progress', 'review', 'completed'].includes(column.id)
    );

    res.json({
      project,
      columns,
      totalTasks: tasksResult.rows.length
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Kanban Boards:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;
