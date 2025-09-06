const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getDashboardSimple } = require('../middleware/databaseFallback');
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
    
    // Echte DB-Abfrage für Dashboard-Statistiken
    const statsQuery = `
      WITH user_projects AS (
        SELECT p.id, p.name, p.status, p.priority, p.target_date
        FROM projects p
        WHERE p.owner_id = $1 OR p.visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM team_memberships tm 
          WHERE tm.team_id = p.team_id AND tm.user_id = $1
        )
      ),
      user_tasks AS (
        SELECT t.id, t.status, t.priority, t.due_date, t.project_id
        FROM tasks t
        WHERE t.assignee_id = $1
      ),
      user_teams AS (
        SELECT t.id, t.name, tm.role
        FROM teams t
        INNER JOIN team_memberships tm ON tm.team_id = t.id
        WHERE tm.user_id = $1 AND t.is_active = true
      )
      SELECT 
        (SELECT COUNT(*) FROM user_projects) as total_projects,
        (SELECT COUNT(*) FROM user_projects WHERE status = 'active') as active_projects,
        (SELECT COUNT(*) FROM user_projects WHERE status = 'completed') as completed_projects,
        (SELECT COUNT(*) FROM user_tasks) as total_tasks,
        (SELECT COUNT(*) FROM user_tasks WHERE status = 'todo') as todo_tasks,
        (SELECT COUNT(*) FROM user_tasks WHERE status = 'in_progress') as in_progress_tasks,
        (SELECT COUNT(*) FROM user_tasks WHERE status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM user_tasks WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')) as overdue_tasks,
        (SELECT COUNT(*) FROM user_tasks WHERE due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND status NOT IN ('completed', 'cancelled')) as upcoming_deadlines,
        (SELECT COUNT(*) FROM user_teams) as team_count,
        (SELECT COUNT(*) FROM user_teams WHERE role = 'leader') as leading_teams,
        CASE 
          WHEN (SELECT COUNT(*) FROM user_tasks) > 0 THEN
            ROUND((SELECT COUNT(*) FROM user_tasks WHERE status = 'completed')::DECIMAL / (SELECT COUNT(*) FROM user_tasks) * 100, 2)
          ELSE 0
        END as task_completion_rate,
        CASE 
          WHEN (SELECT COUNT(*) FROM user_projects) > 0 THEN
            ROUND((SELECT COUNT(*) FROM user_projects WHERE status = 'completed')::DECIMAL / (SELECT COUNT(*) FROM user_projects) * 100, 2)
          ELSE 0
        END as project_completion_rate
    `;

    const statsResult = await pool.query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    // Zusätzliche Daten für Dashboard
    const recentActivityQuery = `
      SELECT 
        al.activity_type,
        al.description,
        al.created_at,
        p.name as project_name,
        t.title as task_title
      FROM activity_logs al
      LEFT JOIN projects p ON p.id = al.project_id
      LEFT JOIN tasks t ON t.id = al.task_id
      WHERE al.user_id = $1
      ORDER BY al.created_at DESC
      LIMIT 10
    `;

    const upcomingDeadlinesQuery = `
      SELECT 
        t.id,
        t.title,
        t.due_date,
        t.priority,
        p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      WHERE t.assignee_id = $1
        AND t.due_date IS NOT NULL
        AND t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC
      LIMIT 5
    `;

    const [recentActivityResult, upcomingDeadlinesResult] = await Promise.all([
      pool.query(recentActivityQuery, [userId]).catch(() => ({ rows: [] })),
      pool.query(upcomingDeadlinesQuery, [userId])
    ]);

    const dashboardData = {
      stats: {
        projects: {
          total: parseInt(stats.total_projects) || 0,
          active: parseInt(stats.active_projects) || 0,
          completed: parseInt(stats.completed_projects) || 0,
          completion_rate: parseFloat(stats.project_completion_rate) || 0
        },
        tasks: {
          total: parseInt(stats.total_tasks) || 0,
          todo: parseInt(stats.todo_tasks) || 0,
          in_progress: parseInt(stats.in_progress_tasks) || 0,
          completed: parseInt(stats.completed_tasks) || 0,
          overdue: parseInt(stats.overdue_tasks) || 0,
          completion_rate: parseFloat(stats.task_completion_rate) || 0
        },
        deadlines: {
          upcoming: parseInt(stats.upcoming_deadlines) || 0
        },
        teams: {
          total: parseInt(stats.team_count) || 0,
          leading: parseInt(stats.leading_teams) || 0
        }
      },
      recent_activity: recentActivityResult.rows,
      upcoming_deadlines: upcomingDeadlinesResult.rows,
      generated_at: new Date().toISOString()
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
