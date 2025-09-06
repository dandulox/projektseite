const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Hilfsfunktion: Prüft Task-Berechtigung
const checkTaskPermission = async (userId, taskId, requiredPermission = 'view') => {
  try {
    // Admin hat immer Zugriff
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
      return true;
    }

    // Task-Details abrufen
    const taskResult = await pool.query(`
      SELECT t.*, p.owner_id as project_owner, p.visibility as project_visibility
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      WHERE t.id = $1
    `, [taskId]);

    if (taskResult.rows.length === 0) return false;
    const task = taskResult.rows[0];

    // Assignee hat immer Zugriff
    if (task.assignee_id === userId) return true;

    // Ersteller hat Zugriff
    if (task.created_by === userId) return true;

    // Projekt-Eigentümer hat Zugriff
    if (task.project_owner === userId) return true;

    // Prüfe explizite Task-Berechtigungen
    const permissionResult = await pool.query(`
      SELECT permission_type FROM task_permissions
      WHERE task_id = $1 AND user_id = $2
    `, [taskId, userId]);

    if (permissionResult.rows.length > 0) {
      const permission = permissionResult.rows[0].permission_type;
      if (requiredPermission === 'view') return true;
      if (requiredPermission === 'edit' && ['edit', 'admin'].includes(permission)) return true;
      if (requiredPermission === 'admin' && permission === 'admin') return true;
    }

    // Prüfe Projekt-Berechtigungen
    if (task.project_id) {
      const projectPermissionResult = await pool.query(`
        SELECT permission_type FROM project_permissions
        WHERE project_id = $1 AND user_id = $2
      `, [task.project_id, userId]);

      if (projectPermissionResult.rows.length > 0) {
        const permission = projectPermissionResult.rows[0].permission_type;
        if (requiredPermission === 'view') return true;
        if (requiredPermission === 'edit' && ['edit', 'admin'].includes(permission)) return true;
        if (requiredPermission === 'admin' && permission === 'admin') return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Fehler bei Task-Berechtigungsprüfung:', error);
    return false;
  }
};

// Hilfsfunktion: Task-Aktivität loggen
const logTaskActivity = async (taskId, userId, action, details, oldValues = null, newValues = null) => {
  try {
    await pool.query(`
      INSERT INTO task_activities (task_id, user_id, action, details, old_values, new_values)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [taskId, userId, action, details, oldValues, newValues]);
  } catch (error) {
    console.error('Fehler beim Loggen der Task-Aktivität:', error);
  }
};

// ==============================================
// ROUTEN
// ==============================================

// Meine Aufgaben abrufen
router.get('/my-tasks', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      priority,
      project_id,
      search,
      sort_by = 'due_date',
      sort_order = 'ASC',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = search ? `%${search}%` : null;

    // Einfache Abfrage ohne Datenbankfunktion
    let query = `
      SELECT 
        t.*,
        p.name as project_name,
        pm.name as module_name,
        u.username as assignee_username,
        u.email as assignee_email,
        creator.username as created_by_username,
        CASE 
          WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN true
          ELSE false
        END as is_overdue,
        CASE 
          WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' AND t.status NOT IN ('completed', 'cancelled') THEN true
          ELSE false
        END as is_due_soon
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN project_modules pm ON pm.id = t.module_id
      LEFT JOIN users u ON u.id = t.assignee_id
      LEFT JOIN users creator ON creator.id = t.created_by
      WHERE t.assignee_id = $1
    `;
    
    const params = [req.user.id];
    let paramCount = 1;

    // Filter hinzufügen
    if (status) {
      query += ` AND t.status = $${++paramCount}`;
      params.push(status);
    }
    if (priority) {
      query += ` AND t.priority = $${++paramCount}`;
      params.push(priority);
    }
    if (project_id) {
      query += ` AND t.project_id = $${++paramCount}`;
      params.push(project_id);
    }
    if (searchTerm) {
      query += ` AND (t.title ILIKE $${++paramCount} OR t.description ILIKE $${++paramCount})`;
      params.push(searchTerm, searchTerm);
    }

    // Sortierung
    query += ` ORDER BY t.${sort_by} ${sort_order}`;
    
    // Pagination
    query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    // Gesamtanzahl für Pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM tasks t
      WHERE t.assignee_id = $1
    `;
    const countParams = [req.user.id];
    paramCount = 1;

    if (status) {
      countQuery += ` AND t.status = $${++paramCount}`;
      countParams.push(status);
    }
    if (priority) {
      countQuery += ` AND t.priority = $${++paramCount}`;
      countParams.push(priority);
    }
    if (project_id) {
      countQuery += ` AND t.project_id = $${++paramCount}`;
      countParams.push(project_id);
    }
    if (searchTerm) {
      countQuery += ` AND (t.title ILIKE $${++paramCount} OR t.description ILIKE $${++paramCount})`;
      countParams.push(searchTerm, searchTerm);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      tasks: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Aufgaben:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

// Task-Statistiken für Benutzer
router.get('/my-tasks/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_count,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_count,
        COUNT(CASE WHEN due_date <= CURRENT_DATE + INTERVAL '3 days' AND status NOT IN ('completed', 'cancelled') THEN 1 END) as due_soon_count,
        AVG(CASE WHEN status = 'completed' AND actual_hours IS NOT NULL THEN actual_hours END) as avg_completion_hours
      FROM tasks
      WHERE assignee_id = $1
    `, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.json({
        total_tasks: 0,
        todo_count: 0,
        in_progress_count: 0,
        review_count: 0,
        completed_count: 0,
        overdue_count: 0,
        due_soon_count: 0,
        avg_completion_hours: 0
      });
    }

    const stats = result.rows[0];
    res.json({
      total_tasks: parseInt(stats.total_tasks) || 0,
      todo_count: parseInt(stats.todo_count) || 0,
      in_progress_count: parseInt(stats.in_progress_count) || 0,
      review_count: parseInt(stats.review_count) || 0,
      completed_count: parseInt(stats.completed_count) || 0,
      overdue_count: parseInt(stats.overdue_count) || 0,
      due_soon_count: parseInt(stats.due_soon_count) || 0,
      avg_completion_hours: parseFloat(stats.avg_completion_hours) || 0
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Task-Statistiken:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Interner Serverfehler', details: error.message });
  }
});

// Einzelnen Task abrufen
router.get('/:taskId', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Berechtigung prüfen
    if (!(await checkTaskPermission(req.user.id, taskId, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für diese Aufgabe' });
    }

    const result = await pool.query(`
      SELECT 
        t.*,
        p.name as project_name,
        pm.name as module_name,
        u.username as assignee_username,
        u.email as assignee_email,
        creator.username as created_by_username,
        CASE 
          WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN true
          ELSE false
        END as is_overdue,
        CASE 
          WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' AND t.status NOT IN ('completed', 'cancelled') THEN true
          ELSE false
        END as is_due_soon
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN project_modules pm ON pm.id = t.module_id
      LEFT JOIN users u ON u.id = t.assignee_id
      LEFT JOIN users creator ON creator.id = t.created_by
      WHERE t.id = $1
    `, [taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Abrufen der Aufgabe:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Task erstellen
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      assignee_id,
      project_id,
      module_id,
      due_date,
      estimated_hours,
      tags = []
    } = req.body;

    // Validierung
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Titel ist erforderlich' });
    }

    // Projekt-Berechtigung prüfen (falls project_id angegeben)
    if (project_id) {
      const projectResult = await pool.query(`
        SELECT p.*, pp.permission_type
        FROM projects p
        LEFT JOIN project_permissions pp ON pp.project_id = p.id AND pp.user_id = $1
        WHERE p.id = $2
      `, [req.user.id, project_id]);

      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Projekt nicht gefunden' });
      }

      const project = projectResult.rows[0];
      if (project.owner_id !== req.user.id && 
          !['edit', 'admin'].includes(project.permission_type) && 
          req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Keine Berechtigung, Tasks in diesem Projekt zu erstellen' });
      }
    }

    const result = await pool.query(`
      INSERT INTO tasks (
        title, description, status, priority, assignee_id, project_id, module_id,
        due_date, estimated_hours, tags, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      title.trim(),
      description,
      status,
      priority,
      assignee_id,
      project_id,
      module_id,
      due_date,
      estimated_hours,
      tags,
      req.user.id
    ]);

    const task = result.rows[0];

    // Aktivität loggen
    await logTaskActivity(task.id, req.user.id, 'created', 'Task erstellt', null, {
      title: task.title,
      status: task.status,
      priority: task.priority
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Fehler beim Erstellen der Aufgabe:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Task-Status aktualisieren (PATCH für Kanban Board)
router.patch('/:taskId', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { status } = req.body;

    // Validierung
    if (!status) {
      return res.status(400).json({ error: 'Status ist erforderlich' });
    }

    const validStatuses = ['todo', 'in_progress', 'review', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Ungültiger Status' });
    }

    // Berechtigung prüfen
    if (!(await checkTaskPermission(req.user.id, taskId, 'edit'))) {
      return res.status(403).json({ error: 'Keine Berechtigung, diese Aufgabe zu bearbeiten' });
    }

    // Aktuelle Werte abrufen
    const currentResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
    }

    const currentTask = currentResult.rows[0];
    const oldStatus = currentTask.status;

    // Status aktualisieren
    const result = await pool.query(`
      UPDATE tasks 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, taskId]);

    const updatedTask = result.rows[0];

    // Aktivität loggen
    await logTaskActivity(taskId, req.user.id, 'status_changed', 
      `Status von ${oldStatus} auf ${status} geändert`, 
      { status: oldStatus }, 
      { status: status }
    );

    res.json(updatedTask);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Task-Status:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Task aktualisieren
router.put('/:taskId', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const {
      title,
      description,
      status,
      priority,
      assignee_id,
      project_id,
      module_id,
      due_date,
      estimated_hours,
      actual_hours,
      tags
    } = req.body;

    // Berechtigung prüfen
    if (!(await checkTaskPermission(req.user.id, taskId, 'edit'))) {
      return res.status(403).json({ error: 'Keine Berechtigung, diese Aufgabe zu bearbeiten' });
    }

    // Aktuelle Werte abrufen
    const currentResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
    }

    const currentTask = currentResult.rows[0];
    const oldValues = {
      title: currentTask.title,
      status: currentTask.status,
      priority: currentTask.priority,
      assignee_id: currentTask.assignee_id,
      due_date: currentTask.due_date
    };

    // Update-Query aufbauen
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (title !== undefined) {
      updateFields.push(`title = $${++paramCount}`);
      updateValues.push(title.trim());
    }
    if (description !== undefined) {
      updateFields.push(`description = $${++paramCount}`);
      updateValues.push(description);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${++paramCount}`);
      updateValues.push(status);
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${++paramCount}`);
      updateValues.push(priority);
    }
    if (assignee_id !== undefined) {
      updateFields.push(`assignee_id = $${++paramCount}`);
      updateValues.push(assignee_id);
    }
    if (project_id !== undefined) {
      updateFields.push(`project_id = $${++paramCount}`);
      updateValues.push(project_id);
    }
    if (module_id !== undefined) {
      updateFields.push(`module_id = $${++paramCount}`);
      updateValues.push(module_id);
    }
    if (due_date !== undefined) {
      updateFields.push(`due_date = $${++paramCount}`);
      updateValues.push(due_date);
    }
    if (estimated_hours !== undefined) {
      updateFields.push(`estimated_hours = $${++paramCount}`);
      updateValues.push(estimated_hours);
    }
    if (actual_hours !== undefined) {
      updateFields.push(`actual_hours = $${++paramCount}`);
      updateValues.push(actual_hours);
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${++paramCount}`);
      updateValues.push(tags);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Keine Felder zum Aktualisieren angegeben' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(taskId);

    const result = await pool.query(`
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING *
    `, updateValues);

    const updatedTask = result.rows[0];

    // Aktivität loggen
    const newValues = {
      title: updatedTask.title,
      status: updatedTask.status,
      priority: updatedTask.priority,
      assignee_id: updatedTask.assignee_id,
      due_date: updatedTask.due_date
    };

    await logTaskActivity(taskId, req.user.id, 'updated', 'Task aktualisiert', oldValues, newValues);

    res.json(updatedTask);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Aufgabe:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Bulk-Update für Tasks
router.put('/bulk-update', authenticateToken, async (req, res) => {
  try {
    const { task_ids, updates } = req.body;

    if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
      return res.status(400).json({ error: 'Task-IDs sind erforderlich' });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Updates sind erforderlich' });
    }

    // Berechtigung für alle Tasks prüfen
    for (const taskId of task_ids) {
      if (!(await checkTaskPermission(req.user.id, taskId, 'edit'))) {
        return res.status(403).json({ 
          error: `Keine Berechtigung, Task ${taskId} zu bearbeiten` 
        });
      }
    }

    // Update-Query aufbauen
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        updateFields.push(`${key} = $${++paramCount}`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Keine gültigen Felder zum Aktualisieren' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(task_ids);

    const result = await pool.query(`
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = ANY($${++paramCount})
      RETURNING *
    `, updateValues);

    // Aktivitäten loggen
    for (const task of result.rows) {
      await logTaskActivity(task.id, req.user.id, 'bulk_updated', 
        `Bulk-Update: ${Object.keys(updates).join(', ')}`, null, updates);
    }

    res.json({
      message: `${result.rows.length} Tasks erfolgreich aktualisiert`,
      updated_tasks: result.rows
    });
  } catch (error) {
    console.error('Fehler beim Bulk-Update der Tasks:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Task löschen
router.delete('/:taskId', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Berechtigung prüfen
    if (!(await checkTaskPermission(req.user.id, taskId, 'admin'))) {
      return res.status(403).json({ error: 'Keine Berechtigung, diese Aufgabe zu löschen' });
    }

    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
    }

    res.json({ message: 'Aufgabe erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Aufgabe:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Task-Kommentare abrufen
router.get('/:taskId/comments', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Berechtigung prüfen
    if (!(await checkTaskPermission(req.user.id, taskId, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für diese Aufgabe' });
    }

    const result = await pool.query(`
      SELECT tc.*, u.username, u.email
      FROM task_comments tc
      JOIN users u ON u.id = tc.user_id
      WHERE tc.task_id = $1
      ORDER BY tc.created_at ASC
    `, [taskId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kommentare:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Task-Kommentar hinzufügen
router.post('/:taskId/comments', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Kommentar ist erforderlich' });
    }

    // Berechtigung prüfen
    if (!(await checkTaskPermission(req.user.id, taskId, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für diese Aufgabe' });
    }

    const result = await pool.query(`
      INSERT INTO task_comments (task_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [taskId, req.user.id, comment.trim()]);

    // Aktivität loggen
    await logTaskActivity(taskId, req.user.id, 'comment_added', 'Kommentar hinzugefügt');

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Kommentars:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Task-Aktivitäten abrufen
router.get('/:taskId/activities', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Berechtigung prüfen
    if (!(await checkTaskPermission(req.user.id, taskId, 'view'))) {
      return res.status(403).json({ error: 'Keine Berechtigung für diese Aufgabe' });
    }

    const result = await pool.query(`
      SELECT ta.*, u.username, u.email
      FROM task_activities ta
      JOIN users u ON u.id = ta.user_id
      WHERE ta.task_id = $1
      ORDER BY ta.created_at DESC
    `, [taskId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Aktivitäten:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;
