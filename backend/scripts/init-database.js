const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { createDefaultUsers } = require('./create-default-users');
const { initGreetings } = require('./init-greetings');

async function initializeDatabase() {
  try {
    console.log('🚀 Initialisiere Datenbank...');

    // Prüfe ob Datenbank erreichbar ist
    await pool.query('SELECT 1');
    console.log('✅ Datenbankverbindung erfolgreich');

    // Prüfe ob users Tabelle existiert
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;

    if (!tableExists) {
      console.log('📋 Erstelle Datenbankschema...');
      
      // Lade und führe das Schema aus
      const schemaPath = path.join(__dirname, '../../database/init/01_schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Führe das Schema aus
      await pool.query(schemaSQL);
      console.log('✅ Datenbankschema erfolgreich erstellt');
    } else {
      console.log('✅ Datenbankschema bereits vorhanden');
    }

    // Prüfe ob Benutzer bereits existieren
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const count = parseInt(userCount.rows[0].count);

    if (count === 0) {
      console.log('📝 Erstelle Standard-Benutzer...');
      await createDefaultUsers();
    } else {
      console.log(`✅ ${count} Benutzer bereits in der Datenbank vorhanden`);
    }

    // Initialisiere Begrüßungen
    console.log('📝 Initialisiere Begrüßungen...');
    await initGreetings();

    console.log('🎉 Datenbank-Initialisierung abgeschlossen');

  } catch (error) {
    console.error('❌ Fehler bei der Datenbank-Initialisierung:', error);
    throw error;
  }
}

// Skript ausführen
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Initialisierung erfolgreich abgeschlossen');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialisierung fehlgeschlagen:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
