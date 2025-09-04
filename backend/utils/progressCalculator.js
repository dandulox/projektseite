const { Pool } = require('pg');

// Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'projektseite',
  password: process.env.DB_PASSWORD || 'secure_password_123',
  port: process.env.DB_PORT || 5432,
});

// Hilfsfunktion: Berechnet Projektfortschritt basierend auf Modulen
const calculateProjectProgress = async (projectId) => {
  try {
    // Zähle alle Module des Projekts
    const totalModulesResult = await pool.query(
      'SELECT COUNT(*) as total FROM project_modules WHERE project_id = $1',
      [projectId]
    );
    
    const totalModules = parseInt(totalModulesResult.rows[0].total);
    
    if (totalModules === 0) {
      return 0; // Keine Module = 0% Fortschritt
    }
    
    // Zähle abgeschlossene Module (Status = 'completed')
    const completedModulesResult = await pool.query(
      'SELECT COUNT(*) as completed FROM project_modules WHERE project_id = $1 AND status = $2',
      [projectId, 'completed']
    );
    
    const completedModules = parseInt(completedModulesResult.rows[0].completed);
    
    // Berechne Fortschritt in Prozent
    const progress = Math.round((completedModules / totalModules) * 100);
    
    return progress;
  } catch (error) {
    console.error('Fehler bei der Fortschrittsberechnung:', error);
    return 0;
  }
};

// Hilfsfunktion: Aktualisiert Projektfortschritt
const updateProjectProgress = async (projectId) => {
  try {
    const progress = await calculateProjectProgress(projectId);
    
    // Aktualisiere den Fortschritt in der Datenbank
    await pool.query(
      'UPDATE projects SET completion_percentage = $1, updated_at = NOW() WHERE id = $2',
      [progress, projectId]
    );
    
    console.log(`Projekt ${projectId} Fortschritt aktualisiert: ${progress}%`);
    return progress;
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Projektfortschritts:', error);
    return 0;
  }
};

module.exports = {
  calculateProjectProgress,
  updateProjectProgress
};
