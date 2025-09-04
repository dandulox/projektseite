const { Pool } = require('pg');

// Zentrale Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'projektseite',
  password: process.env.DB_PASSWORD || 'secure_password_123',
  port: process.env.DB_PORT || 5432,
});

// Event-Handler für Verbindungsfehler
pool.on('error', (err) => {
  console.error('Unerwarteter Fehler bei inaktiver Client-Verbindung:', err);
  process.exit(-1);
});

module.exports = pool;
