const pool = require('../config/database');

// Stündliche Begrüßungen (24 Stunden)
const hourlyGreetings = [
  { hour: 0, text: 'Mitternacht! Zeit, produktiv zu wirken… oder YouTube-Katzenvideos zu schauen.' },
  { hour: 1, text: '1 Uhr. Wow. Motivation oder Existenzkrise?' },
  { hour: 2, text: '2 Uhr. Nenn es Nachtschicht. Nenn es Prokrastination. Wir verurteilen beides.' },
  { hour: 3, text: '3 Uhr… auch bekannt als: ‚Vielleicht sollte ich mein Leben überdenken‘.' },
  { hour: 4, text: '4 Uhr. Falls du gerade arbeitest: Respekt. Falls nicht: Warum bist du hier?' },
  { hour: 5, text: '5 Uhr. Frühaufsteher oder einfach spät dran? Fühl dich nicht ertappt.' },
  { hour: 6, text: '6 Uhr. Kaffee, Motivation, Hoffnung – alles drei bitte doppelt.' },
  { hour: 7, text: '7 Uhr. Willkommen zum Level ‚Ich tue so, als wäre ich wach‘.' },
  { hour: 8, text: '8 Uhr. Statistisch gesehen sind 78 % der Leute jetzt produktiver als du.' },
  { hour: 9, text: '9 Uhr. Zeit, die ersten To-Dos nicht zu erledigen.' },
  { hour: 10, text: '10 Uhr. Willkommen im Bermuda-Dreieck der Produktivität: To-Do, Kaffee, Ausreden.' },
  { hour: 11, text: '11 Uhr. Du hast schon viel geschafft… zumindest auf Instagram.' },
  { hour: 12, text: '12 Uhr. Mittagspause. Die einzige Deadline, die jeder einhält.' },
  { hour: 13, text: '13 Uhr. Willkommen im Mittagskoma. Gehirn lädt… bitte warten.' },
  { hour: 14, text: '14 Uhr. Die Motivation ist offiziell offline. Der Kühlschrank ist online.' },
  { hour: 15, text: '15 Uhr. Höchste Zeit für Kaffee Nr. 4. Wir zählen nicht mit.' },
  { hour: 16, text: '16 Uhr. Projekte im Griff? Nein? Wir auch nicht.' },
  { hour: 17, text: '17 Uhr. Nur noch kurz Mails checken… und schwupps ist\'s 22 Uhr.' },
  { hour: 18, text: '18 Uhr. Feierabend? Lustig. Deine Projekte lachen dich aus.' },
  { hour: 19, text: '19 Uhr. Der Tag ist gelaufen. Deine To-Do-Liste nicht.' },
  { hour: 20, text: '20 Uhr. Motivation tot, Snacks voll geladen.' },
  { hour: 21, text: '21 Uhr. Offiziell zu spät für echte Arbeit, zu früh fürs Bett. Willkommen in der Hölle.' },
  { hour: 22, text: '22 Uhr. Hier entscheiden sich Champions, ob sie noch ein Projekt oder Netflix starten.' },
  { hour: 23, text: '23 Uhr. Letzte Chance, produktiv zu wirken. Oder einfach so tun.' }
];

// Emojis für jede Stunde
const hourlyEmojis = [
  '🐱', '🤔', '😴', '🌌', '👀', '😏', '☕', '🛌', '📊', '✅❌', '🌀', '📸', '🥪', '💤', '🧃', '☕☕☕☕', '🫠', '📩', '😬', '📜', '🍫', '🔥', '📺', '😎'
];

async function initGreetings() {
  try {
    console.log('🌱 Initialisiere Begrüßungen...');
    
    // Prüfe ob bereits Begrüßungen vorhanden sind
    const existingGreetings = await pool.query('SELECT COUNT(*) FROM greetings');
    const count = parseInt(existingGreetings.rows[0].count);
    
    if (count > 0) {
      console.log(`✅ Bereits ${count} Begrüßungen vorhanden`);
      return;
    }
    
    // Begrüßungen einfügen
    for (const greeting of defaultGreetings) {
      await pool.query(
        'INSERT INTO greetings (text, time_period) VALUES ($1, $2)',
        [greeting.text, greeting.time_period]
      );
    }
    
    console.log(`✅ ${defaultGreetings.length} Begrüßungen erfolgreich eingefügt!`);
    
  } catch (error) {
    console.error('❌ Fehler beim Initialisieren der Begrüßungen:', error);
    throw error;
  }
}

// Script ausführen
if (require.main === module) {
  initGreetings()
    .then(() => {
      console.log('🎉 Begrüßungen erfolgreich initialisiert!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fehler:', error);
      process.exit(1);
    });
}

module.exports = { initGreetings };
