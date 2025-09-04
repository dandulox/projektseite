const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'projektseite',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Hilfsfunktion zur Bestimmung der Tageszeit
function getTimePeriod() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

// GET /api/greetings/random - Zufällige Begrüßung für aktuelle Tageszeit
router.get('/random', async (req, res) => {
  try {
    const timePeriod = getTimePeriod();
    
    const result = await pool.query(
      'SELECT text FROM greetings WHERE time_period = $1 AND is_active = true ORDER BY RANDOM() LIMIT 1',
      [timePeriod]
    );

    if (result.rows.length === 0) {
      // Fallback-Begrüßungen falls keine in der Datenbank
      const fallbackGreetings = {
        morning: ['Guten Morgen!', 'Schönen guten Morgen!', 'Morgen!'],
        afternoon: ['Guten Tag!', 'Hallo!', 'Schönen Tag!'],
        evening: ['Guten Abend!', 'Schönen Abend!', 'Abend!'],
        night: ['Gute Nacht!', 'Schöne Nacht!', 'Nacht!']
      };
      
      const fallbackText = fallbackGreetings[timePeriod][Math.floor(Math.random() * fallbackGreetings[timePeriod].length)];
      return res.json({ 
        text: fallbackText, 
        timePeriod,
        isFallback: true 
      });
    }

    res.json({ 
      text: result.rows[0].text, 
      timePeriod,
      isFallback: false 
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
      'SELECT * FROM greetings ORDER BY time_period, created_at DESC'
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
    const { text, time_period } = req.body;
    
    if (!text || !time_period) {
      return res.status(400).json({ error: 'Text und Tageszeit sind erforderlich' });
    }

    const validPeriods = ['morning', 'afternoon', 'evening', 'night'];
    if (!validPeriods.includes(time_period)) {
      return res.status(400).json({ error: 'Ungültige Tageszeit' });
    }

    const result = await pool.query(
      'INSERT INTO greetings (text, time_period) VALUES ($1, $2) RETURNING *',
      [text, time_period]
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
    const { text, time_period, is_active } = req.body;
    
    const validPeriods = ['morning', 'afternoon', 'evening', 'night'];
    if (time_period && !validPeriods.includes(time_period)) {
      return res.status(400).json({ error: 'Ungültige Tageszeit' });
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
