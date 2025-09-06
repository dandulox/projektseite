const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const { asyncHandler } = require('../middleware/errorHandler');
const router = express.Router();

// Hilfsfunktion: Timezone-spezifische Datumsberechnung
const getTimezoneDate = (date, timezone = 'Europe/Berlin') => {
  if (!date) return null;
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
};

// Hilfsfunktion: Nächste 7 Tage berechnen
const getNext7Days = (timezone = 'Europe/Berlin') => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return {
    start: getTimezoneDate(now, timezone),
    end: getTimezoneDate(nextWeek, timezone)
  };
};

// Dashboard-Daten für eingeloggten Benutzer abrufen
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const timezone = 'Europe/Berlin';
    const next7Days = getNext7Days(timezone);
    
    // Cache-Key für Benutzer-spezifische Daten
    const cacheKey = `dashboard:${userId}:${Math.floor(Date.now() / 60000)}`; // 1-Minute Cache

    // 1. Meine offenen Aufgaben (Top 5) - Tasks statt project_modules
    const openTasksQuery = `
      SELECT 
        t.id,
        t.title as name,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.estimated_hours,
        t.actual_hours,
        0 as completion_percentage,
        p.name as project_name,
        p.id as project_id,
        p.owner_id as project_owner_id,
        u.username as assigned_username
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      LEFT JOIN users u ON u.id = t.assignee_id
      WHERE t.assignee_id = $1 
        AND t.status IN ('todo', 'in_progress', 'review')
      ORDER BY 
        CASE t.priority 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        t.due_date ASC NULLS LAST,
        t.updated_at DESC
      LIMIT 5
    `;

    // 2. Nächste Deadlines (7 Tage) - Tasks statt project_modules
    const upcomingDeadlinesQuery = `
      SELECT 
        t.id,
        t.title as name,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        0 as completion_percentage,
        p.name as project_name,
        p.id as project_id,
        u.username as assigned_username
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      LEFT JOIN users u ON u.id = t.assignee_id
      WHERE t.assignee_id = $1 
        AND t.due_date IS NOT NULL
        AND t.due_date >= $2
        AND t.due_date <= $3
        AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC
      LIMIT 10
    `;

    // 3. Zuletzt aktualisierte Projekte (5)
    const recentProjectsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.priority,
        p.completion_percentage,
        p.updated_at,
        p.target_date,
        u.username as owner_username,
        t.name as team_name,
        COUNT(pm.id) as module_count
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_id
      LEFT JOIN teams t ON t.id = p.team_id
      LEFT JOIN project_modules pm ON pm.project_id = p.id
      WHERE (p.owner_id = $1 OR p.visibility = 'public')
      GROUP BY p.id, u.username, t.name
      ORDER BY p.updated_at DESC
      LIMIT 5
    `;

    // 4. Gesamtfortschritt je Projekt
    const projectProgressQuery = `
      SELECT 
        p.id,
        p.name,
        p.status,
        p.completion_percentage,
        p.target_date,
        u.username as owner_username,
        t.name as team_name,
        COUNT(pm.id) as total_modules,
        COUNT(CASE WHEN pm.status = 'completed' THEN 1 END) as completed_modules,
        COALESCE(AVG(pm.completion_percentage), 0) as avg_module_progress
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_id
      LEFT JOIN teams t ON t.id = p.team_id
      LEFT JOIN project_modules pm ON pm.project_id = p.id
      WHERE (p.owner_id = $1 OR p.visibility = 'public')
        AND p.status IN ('planning', 'active', 'in_progress')
      GROUP BY p.id, u.username, t.name
      ORDER BY p.completion_percentage DESC, p.updated_at DESC
    `;

    // Alle Queries parallel ausführen
    const [openTasksResult, deadlinesResult, recentProjectsResult, projectProgressResult] = await Promise.all([
      pool.query(openTasksQuery, [userId]),
      pool.query(upcomingDeadlinesQuery, [userId, next7Days.start, next7Days.end]),
      pool.query(recentProjectsQuery, [userId]),
      pool.query(projectProgressQuery, [userId])
    ]);

    // Daten formatieren
    const dashboardData = {
      widgets: {
        openTasks: {
          title: 'Meine offenen Aufgaben',
          count: openTasksResult.rows.length,
          items: openTasksResult.rows.map(task => ({
            id: task.id,
            name: task.name,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.due_date,
            estimatedHours: task.estimated_hours,
            actualHours: task.actual_hours,
            completionPercentage: task.completion_percentage || 0,
            projectName: task.project_name,
            projectId: task.project_id,
            assignedUsername: task.assigned_username
          }))
        },
        upcomingDeadlines: {
          title: 'Nächste Deadlines (7 Tage)',
          count: deadlinesResult.rows.length,
          items: deadlinesResult.rows.map(deadline => ({
            id: deadline.id,
            name: deadline.name,
            description: deadline.description,
            status: deadline.status,
            priority: deadline.priority,
            dueDate: deadline.due_date,
            completionPercentage: deadline.completion_percentage || 0,
            projectName: deadline.project_name,
            projectId: deadline.project_id,
            assignedUsername: deadline.assigned_username,
            daysUntilDue: deadline.due_date ? 
              Math.ceil((new Date(deadline.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null
          }))
        },
        recentProjects: {
          title: 'Zuletzt aktualisierte Projekte',
          count: recentProjectsResult.rows.length,
          items: recentProjectsResult.rows.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            priority: project.priority,
            completionPercentage: project.completion_percentage || 0,
            updatedAt: project.updated_at,
            targetDate: project.target_date,
            ownerUsername: project.owner_username,
            teamName: project.team_name,
            moduleCount: parseInt(project.module_count) || 0
          }))
        },
        projectProgress: {
          title: 'Projektfortschritt',
          count: projectProgressResult.rows.length,
          items: projectProgressResult.rows.map(project => ({
            id: project.id,
            name: project.name,
            status: project.status,
            completionPercentage: project.completion_percentage || 0,
            targetDate: project.target_date,
            ownerUsername: project.owner_username,
            teamName: project.team_name,
            totalModules: parseInt(project.total_modules) || 0,
            completedModules: parseInt(project.completed_modules) || 0,
            avgModuleProgress: Math.round(parseFloat(project.avg_module_progress) || 0)
          }))
        }
      },
      summary: {
        totalOpenTasks: openTasksResult.rows.length,
        totalUpcomingDeadlines: deadlinesResult.rows.length,
        totalActiveProjects: projectProgressResult.rows.length,
        averageProjectProgress: projectProgressResult.rows.length > 0 
          ? Math.round(projectProgressResult.rows.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / projectProgressResult.rows.length)
          : 0
      },
      timezone: timezone,
      lastUpdated: new Date().toISOString()
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Fehler beim Laden der Dashboard-Daten:', error);
    
    // Strukturierte Fehlerbehandlung
    const errorResponse = {
      error: 'Fehler beim Laden der Dashboard-Daten',
      timestamp: new Date().toISOString(),
      userId: req.user?.id || 'unknown'
    };
    
    // Entwicklungsdetails nur in Development-Modus
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.message;
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
}));

// Dashboard-Statistiken für erweiterte Ansicht
router.get('/me/stats', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const timezone = 'Europe/Berlin';

    // Erweiterte Statistiken
    const statsQuery = `
      WITH user_projects AS (
        SELECT p.*, u.username as owner_username, t.name as team_name
        FROM projects p
        LEFT JOIN users u ON u.id = p.owner_id
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE (p.owner_id = $1 OR p.visibility = 'public')
      ),
      user_modules AS (
        SELECT pm.*, p.name as project_name, u.username as assigned_username
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        LEFT JOIN users u ON u.id = pm.assigned_to
        WHERE pm.assigned_to = $1
      )
      SELECT 
        (SELECT COUNT(*) FROM user_projects) as total_projects,
        (SELECT COUNT(*) FROM user_projects WHERE status IN ('planning', 'active', 'in_progress')) as active_projects,
        (SELECT COUNT(*) FROM user_projects WHERE status = 'completed') as completed_projects,
        (SELECT COUNT(*) FROM user_projects WHERE target_date < NOW() AND status != 'completed') as overdue_projects,
        (SELECT COALESCE(AVG(completion_percentage), 0) FROM user_projects) as avg_project_progress,
        (SELECT COUNT(*) FROM tasks WHERE assignee_id = $1 AND status IN ('todo', 'in_progress', 'review')) as open_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assignee_id = $1 AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assignee_id = $1 AND due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days' AND status NOT IN ('completed', 'cancelled')) as upcoming_deadlines,
        0 as avg_task_progress
    `;

    const statsResult = await pool.query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    res.json({
      stats: {
        projects: {
          total: parseInt(stats.total_projects) || 0,
          active: parseInt(stats.active_projects) || 0,
          completed: parseInt(stats.completed_projects) || 0,
          overdue: parseInt(stats.overdue_projects) || 0,
          averageProgress: Math.round(parseFloat(stats.avg_project_progress) || 0)
        },
        tasks: {
          open: parseInt(stats.open_tasks) || 0,
          completed: parseInt(stats.completed_tasks) || 0,
          upcomingDeadlines: parseInt(stats.upcoming_deadlines) || 0,
          averageProgress: Math.round(parseFloat(stats.avg_task_progress) || 0)
        }
      },
      timezone: timezone,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fehler beim Laden der Dashboard-Statistiken:', error);
    res.status(500).json({ 
      error: 'Interner Serverfehler beim Laden der Dashboard-Statistiken',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

module.exports = router;
