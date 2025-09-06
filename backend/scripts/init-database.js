const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { createDefaultUsers } = require('./create-default-users');
const { initGreetings } = require('./init-greetings');
const { createMinimalSchema } = require('./create-minimal-schema');

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
        console.log('📁 Schema-Datei nicht gefunden, verwende minimales Schema');
        await createMinimalSchema();
        return; // Beende hier, da minimales Schema bereits erstellt wurde
      }
      
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Teile das Schema in ausführbare Blöcke auf
      console.log('📋 Teile Schema in ausführbare Blöcke auf...');
      
      // Entferne Kommentare und teile nach CREATE TABLE/INSERT/etc.
      const cleanSQL = schemaSQL
        .replace(/--.*$/gm, '') // Entferne Zeilenkommentare
        .replace(/\/\*[\s\S]*?\*\//g, '') // Entferne Blockkommentare
        .trim();
      
      // Teile nach Semikolons, aber berücksichtige mehrzeilige Statements
      const statements = [];
      let currentStatement = '';
      let inString = false;
      let stringChar = '';
      
      for (let i = 0; i < cleanSQL.length; i++) {
        const char = cleanSQL[i];
        const prevChar = i > 0 ? cleanSQL[i - 1] : '';
        
        if (!inString && (char === "'" || char === '"')) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && prevChar !== '\\') {
          inString = false;
        } else if (!inString && char === ';') {
          if (currentStatement.trim()) {
            statements.push(currentStatement.trim());
          }
          currentStatement = '';
          continue;
        }
        
        currentStatement += char;
      }
      
      // Füge den letzten Statement hinzu, falls vorhanden
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      
      console.log(`📋 Gefundene ${statements.length} SQL-Statements`);
      
      // Führe die Statements aus
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.length === 0) continue;
        
        try {
          await pool.query(statement);
          successCount++;
          if (i % 10 === 0) {
            console.log(`✅ Statement ${i + 1}/${statements.length} erfolgreich`);
          }
        } catch (error) {
          errorCount++;
          // Einige Fehler sind normal (z.B. IF NOT EXISTS)
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist') &&
              !error.message.includes('duplicate key')) {
            console.log(`⚠️ Statement ${i + 1} Fehler: ${error.message}`);
          }
        }
      }
      
      console.log(`✅ Schema-Ausführung abgeschlossen: ${successCount} erfolgreich, ${errorCount} Fehler`);
      
      // Prüfe, ob das Schema funktioniert
      try {
        await pool.query('SELECT 1 FROM users LIMIT 1');
        console.log('✅ Vollständiges Schema funktioniert');
      } catch (error) {
        console.log('⚠️ Vollständiges Schema funktioniert nicht, verwende minimales Schema');
        try {
          await createMinimalSchema();
          console.log('✅ Minimales Schema erfolgreich erstellt');
        } catch (minimalError) {
          console.error('❌ Auch minimales Schema fehlgeschlagen:', minimalError.message);
          throw minimalError;
        }
      }
    } else {
      console.log('✅ Datenbankschema bereits vorhanden');
    }

    // Patches sind jetzt in 01_schema.sql integriert
    console.log('✅ Datenbank-Patches bereits in Schema integriert');

    // Warte auf Schema-Vollständigkeit mit Retry-Logik
    console.log('⏳ Warte auf Schema-Vollständigkeit...');
    let schemaReady = false;
    let attempts = 0;
    const maxAttempts = 20; // Mehr Versuche, da Schema-Ausführung länger dauert

    while (!schemaReady && attempts < maxAttempts) {
      try {
        // Teste, ob die users-Tabelle existiert
        await pool.query('SELECT 1 FROM users LIMIT 1');
        schemaReady = true;
        console.log('✅ Schema ist vollständig geladen');
      } catch (error) {
        attempts++;
        console.log(`⏳ Schema noch nicht bereit... (Versuch ${attempts}/${maxAttempts})`);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 Sekunden warten
        }
      }
    }

    if (!schemaReady) {
      console.log('⚠️ Schema konnte nicht vollständig geladen werden, versuche minimales Schema');
      try {
        await createMinimalSchema();
        console.log('✅ Minimales Schema als Fallback erstellt');
      } catch (error) {
        console.log('❌ Auch minimales Schema fehlgeschlagen, überspringe weitere Initialisierung');
        return;
      }
    }

    // Prüfe ob Benutzer bereits existieren
    try {
      const userCount = await pool.query('SELECT COUNT(*) FROM users');
      const count = parseInt(userCount.rows[0].count);

      if (count === 0) {
        console.log('📝 Erstelle Standard-Benutzer...');
        await createDefaultUsers();
      } else {
        console.log(`✅ ${count} Benutzer bereits in der Datenbank vorhanden`);
      }
    } catch (error) {
      console.log('⚠️ Benutzer-Tabelle noch nicht verfügbar, überspringe Benutzer-Erstellung');
      console.log(`   Fehler: ${error.message}`);
    }

    // Initialisiere Begrüßungen
    try {
      console.log('📝 Initialisiere Begrüßungen...');
      await initGreetings();
    } catch (error) {
      console.log('⚠️ Begrüßungen konnten nicht initialisiert werden');
      console.log(`   Fehler: ${error.message}`);
      // Versuche, mindestens eine Standard-Begrüßung zu erstellen
      try {
        await pool.query(`
          INSERT INTO greetings (text, category, is_active) 
          VALUES ('Willkommen bei der Projektseite!', 'general', true)
          ON CONFLICT DO NOTHING
        `);
        console.log('✅ Standard-Begrüßung erstellt');
      } catch (greetingError) {
        console.log('⚠️ Auch Standard-Begrüßung fehlgeschlagen');
      }
    }

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
