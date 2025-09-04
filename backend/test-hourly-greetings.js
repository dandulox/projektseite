const pool = require('./config/database');

async function testHourlyGreetings() {
  try {
    console.log('🧪 Teste stündliche Begrüßungen...');
    
    // Teste alle Begrüßungen
    const result = await pool.query('SELECT * FROM greetings ORDER BY hour ASC');
    
    console.log(`📊 ${result.rows.length} Begrüßungen gefunden:`);
    console.log('');
    
    result.rows.forEach(greeting => {
      const hour = greeting.hour !== null ? `${greeting.hour}:00` : 'Keine Stunde';
      const status = greeting.is_active ? '✅' : '❌';
      console.log(`${status} ${hour} - ${greeting.text}`);
    });
    
    console.log('');
    console.log('🕐 Teste aktuelle Stunde...');
    
    const currentHour = new Date().getHours();
    const currentGreeting = await pool.query(
      'SELECT * FROM greetings WHERE hour = $1 AND is_active = true',
      [currentHour]
    );
    
    if (currentGreeting.rows.length > 0) {
      console.log(`✅ Aktuelle Begrüßung (${currentHour}:00): ${currentGreeting.rows[0].text}`);
    } else {
      console.log(`⚠️ Keine Begrüßung für ${currentHour}:00 gefunden`);
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Testen:', error);
  } finally {
    await pool.end();
  }
}

testHourlyGreetings();
