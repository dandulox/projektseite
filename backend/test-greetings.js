const pool = require('./config/database');

async function testGreetingsAPI() {
  try {
    console.log('🧪 Teste Greetings API...');
    
    // Teste Datenbankverbindung
    console.log('1. Teste Datenbankverbindung...');
    const result = await pool.query('SELECT 1');
    console.log('✅ Datenbankverbindung OK');
    
    // Teste ob greetings Tabelle existiert
    console.log('2. Teste greetings Tabelle...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'greetings'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ greetings Tabelle existiert');
      
      // Teste Anzahl der Begrüßungen
      const countResult = await pool.query('SELECT COUNT(*) FROM greetings');
      const count = parseInt(countResult.rows[0].count);
      console.log(`📊 ${count} Begrüßungen in der Datenbank`);
      
      // Teste zufällige Begrüßung
      console.log('3. Teste zufällige Begrüßung...');
      const randomResult = await pool.query(
        'SELECT text, time_period FROM greetings WHERE is_active = true ORDER BY RANDOM() LIMIT 1'
      );
      
      if (randomResult.rows.length > 0) {
        console.log('✅ Zufällige Begrüßung:', randomResult.rows[0]);
      } else {
        console.log('⚠️ Keine aktiven Begrüßungen gefunden');
      }
      
    } else {
      console.log('❌ greetings Tabelle existiert nicht');
      console.log('💡 Führe das Datenbankschema aus oder starte den Server neu');
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Testen:', error);
  } finally {
    await pool.end();
  }
}

testGreetingsAPI();
