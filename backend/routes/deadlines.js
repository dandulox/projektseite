const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { createErrorResponse, createSuccessResponse, ERROR_CODES } = require('../utils/errorContract');
const router = express.Router();

// ==============================================
// DEADLINES API
// ==============================================

// Nächste Deadlines abrufen (Standard: 7 Tage)
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const {
      days = 7,
      status = 'active', // active, all, overdue
      project_id,
      priority,
      sort_by = 'due_date',
      sort_order = 'ASC',
      page = 1,
      limit = 50
    } = req.query;

    const daysInt = parseInt(days);
    const limitInt = parseInt(limit);
    const pageInt = parseInt(page);
    const offset = (pageInt - 1) * limitInt;

    // Basis-Query für Deadlines
    let query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.estimated_hours,
        t.actual_hours,
        t.tags,
        t.created_at,
        t.updated_at,
        p.name as project_name,
        p.id as project_id,
        pm.name as module_name,
        pm.id as module_id,
        u.username as assignee_username,
        u.email as assignee_email,
        CASE 
          WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN true
          ELSE false
        END as is_overdue,
        CASE 
          WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' AND t.status NOT IN ('completed', 'cancelled') THEN true
          ELSE false
        END as is_due_soon,
        EXTRACT(EPOCH FROM (t.due_date - CURRENT_DATE)) / 86400 as days_until_due
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN project_modules pm ON pm.id = t.module_id
      LEFT JOIN users u ON u.id = t.assignee_id
      WHERE t.assignee_id = $1
        AND t.due_date IS NOT NULL
    `;

    const params = [req.user.id];
    let paramCount = 1;

    // Status-Filter
    if (status === 'active') {
      query += ` AND t.status NOT IN ('completed', 'cancelled')`;
    } else if (status === 'overdue') {
      query += ` AND t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled')`;
    }

    // Zeitraum-Filter
    if (status !== 'overdue') {
      query += ` AND t.due_date <= CURRENT_DATE + INTERVAL '${daysInt} days'`;
    }

    // Zusätzliche Filter
    if (project_id) {
      query += ` AND t.project_id = $${++paramCount}`;
      params.push(parseInt(project_id));
    }
    if (priority) {
      query += ` AND t.priority = $${++paramCount}`;
      params.push(priority);
    }

    // Sortierung
    const validSortFields = ['due_date', 'priority', 'created_at', 'title'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'due_date';
    const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    if (sortField === 'due_date') {
      query += ` ORDER BY t.due_date ${sortDirection}, t.priority DESC`;
    } else {
      query += ` ORDER BY t.${sortField} ${sortDirection}`;
    }

    // Pagination
    query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limitInt, offset);

    // Gesamtanzahl für Pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM tasks t
      WHERE t.assignee_id = $1
        AND t.due_date IS NOT NULL
    `;
    const countParams = [req.user.id];
    let countParamCount = 1;

    if (status === 'active') {
      countQuery += ` AND t.status NOT IN ('completed', 'cancelled')`;
    } else if (status === 'overdue') {
      countQuery += ` AND t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled')`;
    }

    if (status !== 'overdue') {
      countQuery += ` AND t.due_date <= CURRENT_DATE + INTERVAL '${daysInt} days'`;
    }

    if (project_id) {
      countQuery += ` AND t.project_id = $${++countParamCount}`;
      countParams.push(parseInt(project_id));
    }
    if (priority) {
      countQuery += ` AND t.priority = $${++countParamCount}`;
      countParams.push(priority);
    }

    // Queries ausführen
    const [deadlinesResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    const deadlines = deadlinesResult.rows;
    const total = parseInt(countResult.rows[0].total);

    // Statistiken berechnen
    const stats = {
      total_deadlines: total,
      overdue_count: deadlines.filter(d => d.is_overdue).length,
      due_soon_count: deadlines.filter(d => d.is_due_soon && !d.is_overdue).length,
      completed_count: 0, // Wird separat berechnet falls nötig
      avg_days_until_due: deadlines.length > 0 
        ? Math.round(deadlines.reduce((sum, d) => sum + (d.days_until_due || 0), 0) / deadlines.length)
        : 0
    };

    res.json(createSuccessResponse({
      deadlines,
      stats,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total,
        pages: Math.ceil(total / limitInt)
      },
      filters: {
        days: daysInt,
        status,
        project_id: project_id ? parseInt(project_id) : null,
        priority
      }
    }));

  } catch (error) {
    console.error('Fehler beim Abrufen der Deadlines:', error);
    res.status(500).json(createErrorResponse(error, ERROR_CODES.INTERNAL_ERROR));
  }
}));

// Deadline-Statistiken abrufen
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysInt = parseInt(days);

    const statsQuery = `
      SELECT 
        COUNT(*) as total_deadlines,
        COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_count,
        COUNT(CASE WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' AND t.status NOT IN ('completed', 'cancelled') THEN 1 END) as due_soon_count,
        COUNT(CASE WHEN t.due_date <= CURRENT_DATE + INTERVAL '7 days' AND t.status NOT IN ('completed', 'cancelled') THEN 1 END) as due_this_week_count,
        COUNT(CASE WHEN t.due_date <= CURRENT_DATE + INTERVAL '${daysInt} days' AND t.status NOT IN ('completed', 'cancelled') THEN 1 END) as due_in_period_count,
        COUNT(CASE WHEN t.status = 'completed' AND t.completed_at >= CURRENT_DATE - INTERVAL '${daysInt} days' THEN 1 END) as completed_recently_count,
        AVG(CASE WHEN t.status = 'completed' AND t.actual_hours IS NOT NULL THEN t.actual_hours END) as avg_completion_hours,
        MIN(CASE WHEN t.due_date >= CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN t.due_date END) as next_deadline,
        MAX(CASE WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN t.due_date END) as oldest_overdue
      FROM tasks t
      WHERE t.assignee_id = $1
        AND t.due_date IS NOT NULL
    `;

    const result = await pool.query(statsQuery, [req.user.id]);
    const stats = result.rows[0];

    // Zusätzliche Berechnungen
    const completionRate = stats.total_deadlines > 0 
      ? Math.round((stats.completed_recently_count / stats.total_deadlines) * 100)
      : 0;

    const response = {
      ...stats,
      completion_rate_percent: completionRate,
      period_days: daysInt,
      generated_at: new Date().toISOString()
    };

    res.json(createSuccessResponse(response));

  } catch (error) {
    console.error('Fehler beim Abrufen der Deadline-Statistiken:', error);
    res.status(500).json(createErrorResponse(error, ERROR_CODES.INTERNAL_ERROR));
  }
}));

// Deadline-Kalender-Ansicht (für Kalender-Widget)
router.get('/calendar', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      project_id,
      priority
    } = req.query;

    // Standard: Aktueller Monat
    const start = start_date || new Date().toISOString().split('T')[0];
    const end = end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.estimated_hours,
        p.name as project_name,
        p.id as project_id,
        u.username as assignee_username,
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
      LEFT JOIN users u ON u.id = t.assignee_id
      WHERE t.assignee_id = $1
        AND t.due_date IS NOT NULL
        AND t.due_date >= $2
        AND t.due_date <= $3
    `;

    const params = [req.user.id, start, end];
    let paramCount = 3;

    if (project_id) {
      query += ` AND t.project_id = $${++paramCount}`;
      params.push(parseInt(project_id));
    }
    if (priority) {
      query += ` AND t.priority = $${++paramCount}`;
      params.push(priority);
    }

    query += ` ORDER BY t.due_date ASC, t.priority DESC`;

    const result = await pool.query(query, params);
    const deadlines = result.rows;

    // Nach Datum gruppieren für Kalender-Ansicht
    const calendarData = {};
    deadlines.forEach(deadline => {
      const date = deadline.due_date.toISOString().split('T')[0];
      if (!calendarData[date]) {
        calendarData[date] = [];
      }
      calendarData[date].push(deadline);
    });

    res.json(createSuccessResponse({
      calendar_data: calendarData,
      total_deadlines: deadlines.length,
      date_range: { start, end },
      generated_at: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Fehler beim Abrufen der Kalender-Daten:', error);
    res.status(500).json(createErrorResponse(error, ERROR_CODES.INTERNAL_ERROR));
  }
}));

// Deadline-Erinnerungen (für Benachrichtigungen)
router.get('/reminders', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { hours_ahead = 24 } = req.query;
    const hoursInt = parseInt(hours_ahead);

    const query = `
      SELECT 
        t.id,
        t.title,
        t.due_date,
        t.priority,
        p.name as project_name,
        u.username as assignee_username,
        u.email as assignee_email,
        EXTRACT(EPOCH FROM (t.due_date - CURRENT_TIMESTAMP)) / 3600 as hours_until_due
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN users u ON u.id = t.assignee_id
      WHERE t.assignee_id = $1
        AND t.due_date IS NOT NULL
        AND t.due_date > CURRENT_TIMESTAMP
        AND t.due_date <= CURRENT_TIMESTAMP + INTERVAL '${hoursInt} hours'
        AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC
    `;

    const result = await pool.query(query, [req.user.id]);
    const reminders = result.rows;

    res.json(createSuccessResponse({
      reminders,
      total_reminders: reminders.length,
      hours_ahead: hoursInt,
      generated_at: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Fehler beim Abrufen der Erinnerungen:', error);
    res.status(500).json(createErrorResponse(error, ERROR_CODES.INTERNAL_ERROR));
  }
}));

module.exports = router;
