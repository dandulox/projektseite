const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const router = express.Router();

// Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'projektseite',
  password: process.env.DB_PASSWORD || 'secure_password_123',
  port: process.env.DB_PORT || 5432,
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware für JWT-Verifizierung
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Zugriffstoken erforderlich' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, username, email, role, is_active FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Ungültiger Token' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Ungültiger Token' });
  }
};

// Registrierung
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Validierung
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Benutzername, E-Mail und Passwort sind erforderlich' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' });
    }

    // Prüfe ob Benutzer bereits existiert
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
    }

    // Passwort hashen
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Benutzer erstellen
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, passwordHash, role]
    );

    const user = result.rows[0];

    // JWT Token erstellen
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Benutzer erfolgreich erstellt',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registrierungsfehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich' });
    }

    // Benutzer suchen
    const result = await pool.query(
      'SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const user = result.rows[0];

    // Prüfe ob Benutzer aktiv ist
    if (!user.is_active) {
      return res.status(401).json({ error: 'Benutzerkonto ist deaktiviert' });
    }

    // Passwort prüfen
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // JWT Token erstellen
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Erfolgreich angemeldet',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzerprofil abrufen
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Profil-Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Passwort ändern
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Aktuelles und neues Passwort sind erforderlich' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Neues Passwort muss mindestens 6 Zeichen lang sein' });
    }

    // Aktuelles Passwort prüfen
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Aktuelles Passwort ist falsch' });
    }

    // Neues Passwort hashen
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Passwort aktualisieren
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, req.user.id]);

    res.json({ message: 'Passwort erfolgreich geändert' });

  } catch (error) {
    console.error('Passwort-Änderungsfehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Token validieren
router.get('/validate', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Logout (Client-seitig - Token wird gelöscht)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Erfolgreich abgemeldet' });
});

module.exports = { router, authenticateToken };
