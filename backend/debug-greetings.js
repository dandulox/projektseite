const pool = require('./config/database');

async function debugGreetings() {
  try {
    console.log('🔍 Debug: Greetings API...');
    
    // 1. Teste Datenbankverbindung
    console.log('1. Teste Datenbankverbindung...');
    const connectionTest = await pool.query('SELECT 1 as test');
    console.log('✅ Datenbankverbindung OK:', connectionTest.rows[0]);
    
    // 2. Prüfe ob greetings Tabelle existiert
    console.log('2. Prüfe greetings Tabelle...');
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'greetings'
      );
    `);
    console.log('✅ greetings Tabelle existiert:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // 3. Prüfe Tabellenstruktur
      console.log('3. Prüfe Tabellenstruktur...');
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'greetings' 
        ORDER BY ordinal_position;
      `);
      console.log('📋 Spalten:');
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // 4. Prüfe Anzahl der Begrüßungen
      console.log('4. Prüfe Anzahl der Begrüßungen...');
      const count = await pool.query('SELECT COUNT(*) FROM greetings');
      console.log(`📊 Anzahl Begrüßungen: ${count.rows[0].count}`);
      
      // 5. Zeige erste 3 Begrüßungen
      if (parseInt(count.rows[0].count) > 0) {
        console.log('5. Erste 3 Begrüßungen:');
        const sample = await pool.query('SELECT * FROM greetings ORDER BY hour ASC LIMIT 3');
        sample.rows.forEach((greeting, i) => {
          console.log(`   ${i+1}. Stunde ${greeting.hour}: ${greeting.text}`);
        });
      } else {
        console.log('⚠️ Keine Begrüßungen in der Datenbank!');
        console.log('💡 Führe aus: node scripts/init-greetings.js');
      }
    } else {
      console.log('❌ greetings Tabelle existiert nicht!');
      console.log('💡 Führe aus: node scripts/init-database.js');
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Debug:', error);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

debugGreetings();
