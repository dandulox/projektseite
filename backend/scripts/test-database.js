const pool = require('../config/database');

async function testDatabase() {
  try {
    console.log('🔍 Teste Datenbankverbindung...');
    
    // Teste grundlegende Verbindung
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Datenbankverbindung erfolgreich:', result.rows[0].current_time);
    
    // Prüfe wichtige Tabellen
    const tables = ['users', 'projects', 'tasks', 'teams', 'project_modules'];
    
    for (const table of tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ Tabelle '${table}': ${countResult.rows[0].count} Einträge`);
      } catch (error) {
        console.log(`❌ Tabelle '${table}': ${error.message}`);
      }
    }
    
    // Teste Benutzer-Tabelle
    try {
      const usersResult = await pool.query('SELECT id, username, role FROM users LIMIT 5');
      console.log('👥 Benutzer in der Datenbank:');
      usersResult.rows.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`);
      });
    } catch (error) {
      console.log('❌ Fehler beim Abrufen der Benutzer:', error.message);
    }
    
    // Teste Tasks-Tabelle
    try {
      const tasksResult = await pool.query('SELECT COUNT(*) as count FROM tasks');
      console.log(`📋 Tasks in der Datenbank: ${tasksResult.rows[0].count}`);
    } catch (error) {
      console.log('❌ Fehler beim Abrufen der Tasks:', error.message);
    }
    
    // Teste Projekte-Tabelle
    try {
      const projectsResult = await pool.query('SELECT COUNT(*) as count FROM projects');
      console.log(`📁 Projekte in der Datenbank: ${projectsResult.rows[0].count}`);
    } catch (error) {
      console.log('❌ Fehler beim Abrufen der Projekte:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Datenbanktest fehlgeschlagen:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    console.log('🔚 Datenbankverbindung geschlossen');
  }
}

// Führe Test aus
testDatabase();
