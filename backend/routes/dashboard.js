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
    
    // Verwende Fallback-System für Dashboard-Daten
    const dashboardData = await getDashboardSimple(userId);
    
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
