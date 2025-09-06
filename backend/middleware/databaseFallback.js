// Fallback-System für fehlende Datenbanktabellen
const pool = require('../config/database');

// Prüft ob eine Tabelle existiert
const tableExists = async (tableName) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = $1
    `, [tableName]);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.warn(`Fehler beim Prüfen der Tabelle ${tableName}:`, error.message);
    return false;
  }
};

// Prüft ob eine Funktion existiert
const functionExists = async (functionName) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.routines 
      WHERE routine_name = $1 AND routine_schema = 'public'
    `, [functionName]);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.warn(`Fehler beim Prüfen der Funktion ${functionName}:`, error.message);
    return false;
  }
};

// Sichere Query-Ausführung mit Fallback
const safeQuery = async (query, params = [], fallbackData = []) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.warn('Query fehlgeschlagen, verwende Fallback-Daten:', error.message);
    return fallbackData;
  }
};

// Vereinfachte Tasks-Query ohne komplexe Joins
const getTasksSimple = async (userId, limit = 20) => {
  const tasksExist = await tableExists('tasks');
  if (!tasksExist) {
    return [];
  }
  
  return await safeQuery(`
    SELECT 
      id,
      title,
      description,
      status,
      priority,
      due_date,
      estimated_hours,
      actual_hours,
      created_at,
      updated_at
    FROM tasks 
    WHERE assignee_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2
  `, [userId, limit], []);
};

// Vereinfachte Projects-Query
const getProjectsSimple = async (userId, limit = 20) => {
  const projectsExist = await tableExists('projects');
  if (!projectsExist) {
    return [];
  }
  
  return await safeQuery(`
    SELECT 
      id,
      name,
      description,
      status,
      priority,
      completion_percentage,
      created_at,
      updated_at
    FROM projects 
    WHERE owner_id = $1 OR visibility = 'public'
    ORDER BY created_at DESC 
    LIMIT $2
  `, [userId, limit], []);
};

// Vereinfachte Task-Statistiken
const getTaskStatsSimple = async (userId) => {
  const tasksExist = await tableExists('tasks');
  if (!tasksExist) {
    return {
      total_tasks: 0,
      todo_count: 0,
      in_progress_count: 0,
      review_count: 0,
      completed_count: 0,
      overdue_count: 0,
      due_soon_count: 0,
      avg_completion_hours: 0
    };
  }
  
    const stats = await safeQuery(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'not_started' THEN 1 END) as todo_count,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'testing' THEN 1 END) as review_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status NOT IN ('completed') THEN 1 END) as overdue_count,
        COUNT(CASE WHEN due_date <= CURRENT_DATE + INTERVAL '3 days' AND status NOT IN ('completed') THEN 1 END) as due_soon_count,
        AVG(CASE WHEN status = 'completed' AND actual_hours IS NOT NULL THEN actual_hours END) as avg_completion_hours
      FROM tasks
      WHERE assignee_id = $1
    `, [userId], [{
      total_tasks: 0,
      todo_count: 0,
      in_progress_count: 0,
      review_count: 0,
      completed_count: 0,
      overdue_count: 0,
      due_soon_count: 0,
      avg_completion_hours: 0
    }]);
  
  return stats[0] || {
    total_tasks: 0,
    todo_count: 0,
    in_progress_count: 0,
    review_count: 0,
    completed_count: 0,
    overdue_count: 0,
    due_soon_count: 0,
    avg_completion_hours: 0
  };
};

// Vereinfachte Dashboard-Daten
const getDashboardSimple = async (userId) => {
  const [tasks, projects, taskStats] = await Promise.all([
    getTasksSimple(userId, 10),
    getProjectsSimple(userId, 10),
    getTaskStatsSimple(userId)
  ]);
  
  // Offene Tasks (verwende die Status-Werte, die das Frontend erwartet)
  const openTasks = tasks.filter(t => ['not_started', 'in_progress', 'testing'].includes(t.status));
  
  // Nächste Deadlines (Tasks mit due_date in den nächsten 7 Tagen)
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = tasks.filter(t => {
    if (!t.due_date || ['completed'].includes(t.status)) return false;
    const dueDate = new Date(t.due_date);
    return dueDate >= now && dueDate <= nextWeek;
  });
  
  // Aktive Projekte
  const activeProjects = projects.filter(p => ['planning', 'active', 'in_progress'].includes(p.status));
  
  return {
    widgets: {
      openTasks: {
        title: 'Meine offenen Aufgaben',
        count: openTasks.length,
        items: openTasks.map(task => ({
          id: task.id,
          name: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date,
          estimatedHours: task.estimated_hours,
          actualHours: task.actual_hours,
          completionPercentage: 0,
          projectName: 'Unbekannt',
          projectId: task.project_id || null,
          assignedUsername: 'Unbekannt'
        }))
      },
      upcomingDeadlines: {
        title: 'Nächste Deadlines (7 Tage)',
        count: upcomingDeadlines.length,
        items: upcomingDeadlines.map(task => ({
          id: task.id,
          name: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date,
          completionPercentage: 0,
          projectName: 'Unbekannt',
          projectId: task.project_id || null,
          assignedUsername: 'Unbekannt',
          daysUntilDue: task.due_date ? 
            Math.ceil((new Date(task.due_date) - now) / (1000 * 60 * 60 * 24)) : null
        }))
      },
      recentProjects: {
        title: 'Zuletzt aktualisierte Projekte',
        count: projects.length,
        items: projects.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          completionPercentage: project.completion_percentage || 0,
          updatedAt: project.updated_at,
          targetDate: project.target_date,
          ownerUsername: 'Unbekannt',
          teamName: null,
          moduleCount: 0
        }))
      },
      projectProgress: {
        title: 'Projektfortschritt',
        count: activeProjects.length,
        items: activeProjects.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          completionPercentage: project.completion_percentage || 0,
          targetDate: project.target_date,
          ownerUsername: 'Unbekannt',
          teamName: null,
          totalModules: 0,
          completedModules: 0,
          avgModuleProgress: 0
        }))
      }
    },
    summary: {
      totalOpenTasks: (taskStats.todo_count || 0) + (taskStats.in_progress_count || 0) + (taskStats.review_count || 0),
      totalUpcomingDeadlines: taskStats.due_soon_count || 0,
      totalActiveProjects: activeProjects.length,
      averageProjectProgress: projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / projects.length)
        : 0
    },
    timezone: 'Europe/Berlin',
    lastUpdated: new Date().toISOString()
  };
};

module.exports = {
  tableExists,
  functionExists,
  safeQuery,
  getTasksSimple,
  getProjectsSimple,
  getTaskStatsSimple,
  getDashboardSimple
};
