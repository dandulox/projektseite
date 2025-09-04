const { Pool } = require('pg');

// Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'projektseite',
  password: process.env.DB_PASSWORD || 'secure_password_123',
  port: process.env.DB_PORT || 5432,
});

/**
 * Initialisiert die Greetings-Tabelle mit Standard-Begrüßungen
 * Diese Funktion wird vom db-patch.sh Skript aufgerufen
 */
async function initGreetings() {
  try {
    console.log('🎭 Initialisiere Greetings...');
    
    // Prüfe ob die greetings-Tabelle existiert
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'greetings'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('⚠️ Greetings-Tabelle existiert nicht. Verwende db-patch.sh um die Datenbank zu reparieren.');
      return;
    }
    
    // Prüfe ob bereits Greetings vorhanden sind
    const countResult = await pool.query('SELECT COUNT(*) FROM greetings');
    const count = parseInt(countResult.rows[0].count);
    
    if (count > 0) {
      console.log(`✅ ${count} Greetings bereits vorhanden.`);
      return;
    }
    
    console.log('📝 Keine Greetings gefunden. Das db-patch.sh Skript wird die Standard-Greetings laden.');
    
  } catch (error) {
    console.error('❌ Fehler bei der Greetings-Initialisierung:', error.message);
    throw error;
  }
}

/**
 * Lädt die Greetings aus der Datenbank und zeigt sie an
 */
async function showGreetings() {
  try {
    const result = await pool.query(`
      SELECT time_period, text, is_active 
      FROM greetings 
      ORDER BY time_period, id
    `);
    
    console.log('\n🎭 Aktuelle Greetings:');
    console.log('====================');
    
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.time_period]) {
        grouped[row.time_period] = [];
      }
      grouped[row.time_period].push(row.text);
    });
    
    Object.keys(grouped).forEach(period => {
      const emoji = {
        'morning': '🌅',
        'afternoon': '🥪', 
        'evening': '🌇',
        'night': '🌙'
      }[period] || '⏰';
      
      console.log(`\n${emoji} ${period.toUpperCase()}:`);
      grouped[period].forEach(text => {
        console.log(`  • ${text}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Anzeigen der Greetings:', error.message);
  }
}

// Hauptfunktion
async function main() {
  try {
    await initGreetings();
    await showGreetings();
  } catch (error) {
    console.error('❌ Fehler:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Skript ausführen wenn direkt aufgerufen
if (require.main === module) {
  main();
}

module.exports = { initGreetings, showGreetings };
