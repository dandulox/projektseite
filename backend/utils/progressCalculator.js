const pool = require('../config/database');

// Status-zu-Prozent-Mapping
const statusProgressMapping = {
  'not_started': 0,
  'in_progress': 30,
  'testing': 80,
  'completed': 100
};

// Hilfsfunktion: Berechnet Projektfortschritt basierend auf Modulen
const calculateProjectProgress = async (projectId) => {
  try {
    // Hole alle Module des Projekts mit ihren Status
    const modulesResult = await pool.query(
      'SELECT status FROM project_modules WHERE project_id = $1',
      [projectId]
    );
    
    const modules = modulesResult.rows;
    
    if (modules.length === 0) {
      return 0; // Keine Module = 0% Fortschritt
    }
    
    // Berechne Gesamtfortschritt basierend auf Status-Werten
    let totalProgress = 0;
    
    modules.forEach(module => {
      const status = module.status;
      const progressValue = statusProgressMapping[status] || 0;
      totalProgress += progressValue;
    });
    
    // Berechne Durchschnittsfortschritt in Prozent
    const averageProgress = Math.round(totalProgress / modules.length);
    
    return averageProgress;
  } catch (error) {
    console.error('Fehler bei der Fortschrittsberechnung:', error);
    return 0;
  }
};

// Hilfsfunktion: Berechnet Modul-Fortschritt basierend auf Status
const calculateModuleProgress = (status) => {
  return statusProgressMapping[status] || 0;
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
  updateProjectProgress,
  calculateModuleProgress,
  statusProgressMapping
};
