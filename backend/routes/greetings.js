const express = require('express');
const pool = require('../config/database');
const router = express.Router();

console.log('🔧 Greetings-Route wird geladen...');

// Hilfsfunktion zur Bestimmung der Tageszeit
function getTimePeriod() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

// Hilfsfunktion zur Bestimmung der aktuellen Stunde
function getCurrentHour() {
  return new Date().getHours();
}

// GET /api/greetings/random - Stündliche Begrüßung für aktuelle Stunde
router.get('/random', async (req, res) => {
  try {
    const currentHour = getCurrentHour();
    const timePeriod = getTimePeriod();
    
    // Versuche zuerst die exakte Stunde zu finden
    const exactResult = await pool.query(
      'SELECT text, hour FROM greetings WHERE hour = $1 AND is_active = true LIMIT 1',
      [currentHour]
    );

    if (exactResult.rows.length > 0) {
      return res.json({ 
        text: exactResult.rows[0].text, 
        timePeriod,
        hour: exactResult.rows[0].hour,
        isFallback: false 
      });
    }

    // Fallback: Zufällige Begrüßung für die aktuelle Tageszeit
    const fallbackResult = await pool.query(
      'SELECT text, hour FROM greetings WHERE time_period = $1 AND is_active = true ORDER BY RANDOM() LIMIT 1',
      [timePeriod]
    );

    if (fallbackResult.rows.length > 0) {
      return res.json({ 
        text: fallbackResult.rows[0].text, 
        timePeriod,
        hour: fallbackResult.rows[0].hour,
        isFallback: false 
      });
    }

    // Letzter Fallback: Statische Begrüßungen
    const fallbackGreetings = {
      morning: ['Guten Morgen! ☀️', 'Schönen guten Morgen! 🌅', 'Morgen! ☕'],
      afternoon: ['Guten Tag! ☀️', 'Hallo! 😊', 'Schönen Tag! ⚡'],
      evening: ['Guten Abend! 🌆', 'Schönen Abend! 🌅', 'Abend! ✨'],
      night: ['Gute Nacht! 🌙', 'Schöne Nacht! 🌃', 'Nacht! 💫']
    };
    
    const fallbackText = fallbackGreetings[timePeriod][Math.floor(Math.random() * fallbackGreetings[timePeriod].length)];
    return res.json({ 
      text: fallbackText, 
      timePeriod,
      hour: currentHour,
      isFallback: true 
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Begrüßung:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Begrüßung' });
  }
});

// GET /api/greetings - Alle Begrüßungen (Admin)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM greetings ORDER BY hour ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Begrüßungen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Begrüßungen' });
  }
});

// POST /api/greetings - Neue Begrüßung erstellen (Admin)
router.post('/', async (req, res) => {
  try {
    const { text, time_period, hour } = req.body;
    
    if (!text || !time_period) {
      return res.status(400).json({ error: 'Text und Tageszeit sind erforderlich' });
    }

    const validPeriods = ['morning', 'afternoon', 'evening', 'night'];
    if (!validPeriods.includes(time_period)) {
      return res.status(400).json({ error: 'Ungültige Tageszeit' });
    }

    if (hour !== undefined && (hour < 0 || hour > 23)) {
      return res.status(400).json({ error: 'Stunde muss zwischen 0 und 23 liegen' });
    }

    const result = await pool.query(
      'INSERT INTO greetings (text, time_period, hour) VALUES ($1, $2, $3) RETURNING *',
      [text, time_period, hour || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Erstellen der Begrüßung:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Begrüßung' });
  }
});

// PUT /api/greetings/:id - Begrüßung aktualisieren (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, time_period, hour, is_active } = req.body;
    
    const validPeriods = ['morning', 'afternoon', 'evening', 'night'];
    if (time_period && !validPeriods.includes(time_period)) {
      return res.status(400).json({ error: 'Ungültige Tageszeit' });
    }

    if (hour !== undefined && (hour < 0 || hour > 23)) {
      return res.status(400).json({ error: 'Stunde muss zwischen 0 und 23 liegen' });
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (text !== undefined) {
      updateFields.push(`text = $${paramCount++}`);
      values.push(text);
    }
    if (time_period !== undefined) {
      updateFields.push(`time_period = $${paramCount++}`);
      values.push(time_period);
    }
    if (hour !== undefined) {
      updateFields.push(`hour = $${paramCount++}`);
      values.push(hour);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Keine Felder zum Aktualisieren' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE greetings SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Begrüßung nicht gefunden' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Begrüßung:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Begrüßung' });
  }
});

// DELETE /api/greetings/:id - Begrüßung löschen (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM greetings WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Begrüßung nicht gefunden' });
    }

    res.json({ message: 'Begrüßung erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Begrüßung:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Begrüßung' });
  }
});

module.exports = router;
