const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Datenbank-Initialisierung
const { initializeDatabase } = require('./scripts/init-database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true, // Erlaubt alle Origins für Flexibilität
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100 // max 100 Anfragen pro IP
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Statische Dateien für Live-Edit
app.use('/shared', express.static(path.join(__dirname, '../shared')));

// Modulare Routen
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const greetingsRoutes = require('./routes/greetings');
const teamsRoutes = require('./routes/teams');
const projectsRoutes = require('./routes/projects');
const modulesRoutes = require('./routes/modules');
const notificationsRoutes = require('./routes/notifications');

console.log('🔧 Lade API-Routen...');

// API Routen
app.use('/api/auth', authRoutes.router);
app.use('/api/admin', adminRoutes);
app.use('/api/greetings', greetingsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/notifications', notificationsRoutes.router);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug Route - Tabellen-Status überprüfen
app.get('/debug/tables', async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = result.rows.map(row => row.table_name);
    res.json({ 
      tables,
      count: tables.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Fehler beim Abrufen der Tabellen',
      message: error.message 
    });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Etwas ist schiefgelaufen!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Interner Serverfehler'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route nicht gefunden' });
});

// Server starten mit Datenbank-Initialisierung
async function startServer() {
  try {
    // Datenbank initialisieren
    await initializeDatabase();
    
    // Server starten
    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf Port ${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔧 Admin API: http://localhost:${PORT}/api/admin`);
      console.log(`🔐 Standard-Zugangsdaten:`);
      console.log(`   👑 Admin: admin / admin`);
      console.log(`   👤 User: user / user123`);
    });
  } catch (error) {
    console.error('❌ Fehler beim Starten des Servers:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
