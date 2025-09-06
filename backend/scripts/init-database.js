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
      const possibleSchemaPaths = [
        '/app/database/init/01_schema.sql',                          // Absoluter Pfad im Container (Volume-Mount)
        path.join(__dirname, '../../database/init/01_schema.sql'),  // Volume-Mount
        path.join(__dirname, '../database/init/01_schema.sql'),     // Im Backend-Verzeichnis
        path.join(process.cwd(), 'database/init/01_schema.sql'),    // Arbeitsverzeichnis
      ];
      
      let schemaPath = null;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Warte auf das Volume-Mount mit Retry-Logik
      while (!schemaPath && attempts < maxAttempts) {
        for (const schemaFilePath of possibleSchemaPaths) {
          if (fs.existsSync(schemaFilePath)) {
            schemaPath = schemaFilePath;
            console.log(`📁 Schema-Datei gefunden: ${schemaPath}`);
            break;
          }
        }
        
        if (!schemaPath) {
          attempts++;
          console.log(`⏳ Warte auf Schema-Datei... (Versuch ${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 Sekunden warten
        }
      }
      
      if (!schemaPath) {
        console.log('📁 Schema-Datei nicht gefunden in folgenden Pfaden:');
        possibleSchemaPaths.forEach(p => console.log(`   - ${p}`));
        throw new Error('Schema-Datei 01_schema.sql nicht gefunden - Volume-Mount möglicherweise nicht verfügbar');
      }
      
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Führe das Schema aus
      await pool.query(schemaSQL);
      console.log('✅ Datenbankschema erfolgreich erstellt');
    } else {
      console.log('✅ Datenbankschema bereits vorhanden');
    }

    // Patches sind jetzt in 01_schema.sql integriert
    console.log('✅ Datenbank-Patches bereits in Schema integriert');

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

// Funktion zum Anwenden aller Datenbank-Patches (DEPRECATED - Patches sind jetzt in 01_schema.sql integriert)
async function applyDatabasePatches() {
  console.log('ℹ️ Patch-System ist deprecated - alle Patches sind jetzt in 01_schema.sql integriert');
  return;
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
