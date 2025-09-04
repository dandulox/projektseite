const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'projektseite',
  password: process.env.DB_PASSWORD || 'secure_password_123',
  port: process.env.DB_PORT || 5432,
});

async function createDefaultUsers() {
  try {
    console.log('🔐 Erstelle Standard-Benutzer...');

    // Passwörter hashen
    const adminPasswordHash = await bcrypt.hash('admin', 12);
    const userPasswordHash = await bcrypt.hash('user123', 12);

    // Admin-Benutzer erstellen
    const adminResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, role, is_active) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (username) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, username, email, role
    `, ['admin', 'admin@projektseite.local', adminPasswordHash, 'admin', true]);

    // Standard-Benutzer erstellen
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, role, is_active) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (username) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, username, email, role
    `, ['user', 'user@projektseite.local', userPasswordHash, 'user', true]);

    console.log('✅ Standard-Benutzer erfolgreich erstellt:');
    console.log('   👑 Admin: admin / admin');
    console.log('   👤 User: user / user123');
    console.log('   📧 Admin E-Mail: admin@projektseite.local');
    console.log('   📧 User E-Mail: user@projektseite.local');

  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Standard-Benutzer:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Skript ausführen
if (require.main === module) {
  createDefaultUsers();
}

module.exports = { createDefaultUsers };
