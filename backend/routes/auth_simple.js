const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware für Token-Authentifizierung
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Zugriff verweigert' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Ungültiger Token' });
    }
    req.user = user;
    next();
  });
};

// Einfache Benutzerstatistiken - funktioniert auch ohne vollständige Datenbank
router.get('/profile/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Standard-Werte
    const stats = {
      projects: {
        total_projects: 0,
        active_projects: 0,
        completed_projects: 0,
        on_hold_projects: 0,
        avg_completion: 0
      },
      modules: {
        total_modules: 0,
        completed_modules: 0,
        in_progress_modules: 0,
        total_hours: 0,
        estimated_hours: 0
      },
      teams: {
        total_teams: 0,
        leading_teams: 0,
        member_teams: 0
      },
      activity: {
        recent_activities: 0,
        last_activity: null
      }
    };

    // Versuche Projekte zu laden (falls Tabelle existiert)
    try {
      const projectStats = await pool.query(`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
          COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_projects,
          COALESCE(AVG(completion_percentage), 0) as avg_completion
        FROM projects 
        WHERE owner_id = $1
      `, [userId]);
      
      if (projectStats.rows.length > 0) {
        stats.projects = projectStats.rows[0];
      }
    } catch (err) {
      console.log('Projekte-Tabelle noch nicht verfügbar:', err.message);
    }

    res.json(stats);

  } catch (error) {
    console.error('Statistik-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Einfache Benutzerstatistiken für andere Benutzer
router.get('/user/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validiere userId
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Ungültige Benutzer-ID' });
    }

    // Standard-Werte
    const stats = {
      projects: {
        total_projects: 0,
        active_projects: 0,
        completed_projects: 0,
        on_hold_projects: 0,
        avg_completion: 0
      },
      modules: {
        total_modules: 0,
        completed_modules: 0,
        in_progress_modules: 0,
        total_hours: 0,
        estimated_hours: 0
      },
      teams: {
        total_teams: 0,
        leading_teams: 0,
        member_teams: 0
      },
      activity: {
        recent_activities: 0,
        last_activity: null
      }
    };

    // Versuche Projekte zu laden (falls Tabelle existiert)
    try {
      const projectStats = await pool.query(`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
          COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_projects,
          COALESCE(AVG(completion_percentage), 0) as avg_completion
        FROM projects 
        WHERE owner_id = $1
      `, [userId]);
      
      if (projectStats.rows.length > 0) {
        stats.projects = projectStats.rows[0];
      }
    } catch (err) {
      console.log('Projekte-Tabelle noch nicht verfügbar:', err.message);
    }

    res.json(stats);

  } catch (error) {
    console.error('Statistik-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

module.exports = router;
