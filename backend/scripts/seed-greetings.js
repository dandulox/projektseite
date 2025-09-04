const { Pool } = require('pg');

// Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'projektseite',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Standard-Begrüßungen
const defaultGreetings = [
  // Morgen (5-12 Uhr)
  { text: 'Guten Morgen! Ein neuer Tag voller Möglichkeiten beginnt! 🌅', time_period: 'morning' },
  { text: 'Schönen guten Morgen! Bereit für neue Abenteuer? ☀️', time_period: 'morning' },
  { text: 'Morgen! Lass uns heute etwas Großartiges schaffen! 🚀', time_period: 'morning' },
  { text: 'Guten Morgen! Die Sonne scheint und die Projekte warten! ☀️', time_period: 'morning' },
  { text: 'Schönen Morgen! Zeit für produktive Stunden! 💪', time_period: 'morning' },
  
  // Nachmittag (12-17 Uhr)
  { text: 'Guten Tag! Wie läuft dein Tag bisher? 😊', time_period: 'afternoon' },
  { text: 'Hallo! Bereit für den produktiven Nachmittag? 🎯', time_period: 'afternoon' },
  { text: 'Schönen Tag! Lass uns die Aufgaben angehen! ⚡', time_period: 'afternoon' },
  { text: 'Guten Tag! Zeit für neue Ideen und Projekte! 💡', time_period: 'afternoon' },
  { text: 'Hallo! Der Nachmittag wartet mit spannenden Aufgaben! 🔥', time_period: 'afternoon' },
  
  // Abend (17-22 Uhr)
  { text: 'Guten Abend! Zeit für die letzten Aufgaben des Tages! 🌆', time_period: 'evening' },
  { text: 'Schönen Abend! Wie war dein produktiver Tag? 🌅', time_period: 'evening' },
  { text: 'Abend! Lass uns den Tag erfolgreich abschließen! ✨', time_period: 'evening' },
  { text: 'Guten Abend! Zeit für eine entspannte Arbeitsphase! 🌙', time_period: 'evening' },
  { text: 'Schönen Abend! Bereit für die Abend-Session? 🌟', time_period: 'evening' },
  
  // Nacht (22-5 Uhr)
  { text: 'Gute Nacht! Oder arbeitest du noch? 🌙', time_period: 'night' },
  { text: 'Schöne Nacht! Zeit für kreative Nachtschichten! 🌃', time_period: 'night' },
  { text: 'Nacht! Die besten Ideen kommen oft spät! 💫', time_period: 'night' },
  { text: 'Gute Nacht! Oder lass uns die Nacht zum Tag machen! 🌌', time_period: 'night' },
  { text: 'Schöne Nacht! Perfekt für konzentrierte Arbeit! 🌠', time_period: 'night' }
];

async function seedGreetings() {
  try {
    console.log('🌱 Starte das Einfügen der Standard-Begrüßungen...');
    
    // Prüfen ob bereits Begrüßungen vorhanden sind
    const existingGreetings = await pool.query('SELECT COUNT(*) FROM greetings');
    const count = parseInt(existingGreetings.rows[0].count);
    
    if (count > 0) {
      console.log(`✅ Bereits ${count} Begrüßungen in der Datenbank vorhanden.`);
      console.log('💡 Verwende "npm run seed-greetings -- --force" um alle Begrüßungen zu ersetzen.');
      return;
    }
    
    // Begrüßungen einfügen
    for (const greeting of defaultGreetings) {
      await pool.query(
        'INSERT INTO greetings (text, time_period) VALUES ($1, $2)',
        [greeting.text, greeting.time_period]
      );
    }
    
    console.log(`✅ ${defaultGreetings.length} Standard-Begrüßungen erfolgreich eingefügt!`);
    console.log('📊 Aufgeteilt nach Tageszeiten:');
    console.log(`   🌅 Morgen: ${defaultGreetings.filter(g => g.time_period === 'morning').length} Begrüßungen`);
    console.log(`   ☀️ Nachmittag: ${defaultGreetings.filter(g => g.time_period === 'afternoon').length} Begrüßungen`);
    console.log(`   🌆 Abend: ${defaultGreetings.filter(g => g.time_period === 'evening').length} Begrüßungen`);
    console.log(`   🌙 Nacht: ${defaultGreetings.filter(g => g.time_period === 'night').length} Begrüßungen`);
    
  } catch (error) {
    console.error('❌ Fehler beim Einfügen der Begrüßungen:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Force-Modus für das Ersetzen aller Begrüßungen
async function forceSeedGreetings() {
  try {
    console.log('🔄 Ersetze alle vorhandenen Begrüßungen...');
    
    // Alle vorhandenen Begrüßungen löschen
    await pool.query('DELETE FROM greetings');
    console.log('🗑️ Vorhandene Begrüßungen gelöscht.');
    
    // Neue Begrüßungen einfügen
    for (const greeting of defaultGreetings) {
      await pool.query(
        'INSERT INTO greetings (text, time_period) VALUES ($1, $2)',
        [greeting.text, greeting.time_period]
      );
    }
    
    console.log(`✅ ${defaultGreetings.length} neue Begrüßungen erfolgreich eingefügt!`);
    
  } catch (error) {
    console.error('❌ Fehler beim Ersetzen der Begrüßungen:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Script ausführen
if (require.main === module) {
  const args = process.argv.slice(2);
  const forceMode = args.includes('--force');
  
  if (forceMode) {
    forceSeedGreetings()
      .then(() => {
        console.log('🎉 Begrüßungen erfolgreich ersetzt!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Fehler:', error);
        process.exit(1);
      });
  } else {
    seedGreetings()
      .then(() => {
        console.log('🎉 Begrüßungen erfolgreich eingefügt!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Fehler:', error);
        process.exit(1);
      });
  }
}

module.exports = { seedGreetings, forceSeedGreetings };
